import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

export class OrdersService{
    async getAllOrders(query){
        const { status, page = 1, limit = 20} = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const filter = { source: 'ONLINE'}
        if(status){
            filter.status = status;
        }

        const [orders, total] = await Promise.all([
            prisma.invoice.findMany({
                where: filter,
                skip: skip,
                take: limitNum,
                include: {
                    customer: { select: { name: true, phone: true, address: true } },
                    items: { include: { product: { select: { name: true, imageUrl: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.invoice.count({ where: filter })
        ]);

        return { orders, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
    }

    async getOrderById(id) {
        const order = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: true, 
                items: { include: { product: true } }
            }
        });
        if (!order) throw new ApiError(404, 'Đơn hàng không tồn tại');
        return order;
    }

    async updateOrderStatus(id, status, staffId) {
        const order = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: { items: true }
        });

        if (!order) throw new ApiError(404, 'Đơn hàng không tồn tại');

        // Không được quay ngược trạng thái (Ví dụ: Đã xong không được quay về Chờ duyệt)
        // Logic đơn giản: Check map trạng thái (Tuỳ chọn)

        return prisma.$transaction(async (tx) => {

            // LOGIC 1: DUYỆT ĐƠN (PENDING -> CONFIRMED)
            // Lúc này mới thực sự trừ kho
            if (order.status === 'PENDING' && status === 'CONFIRMED') {
                for (const item of order.items) {
                    const product = await tx.product.findUnique({where: {id: item.productId}});

                    if (product.stockQuantity < item.quantity) {
                        throw new ApiError(400, `Sản phẩm ID ${item.productId} không đủ hàng để duyệt đơn!`);
                    }

                    // Trừ kho
                    await tx.product.update({
                        where: {id: item.productId},
                        data: {stockQuantity: {decrement: item.quantity}}
                    });

                    // Ghi Log
                    await tx.stockLog.create({
                        data: {
                            productId: item.productId,
                            staffId: staffId,
                            changeType: 'SELL',
                            changeQuantity: -item.quantity,
                            currentStock: product.stockQuantity - item.quantity,
                            invoiceId: order.id,
                            note: `Duyệt đơn Online #${order.code}`
                        }
                    });
                }
            }

            // LOGIC 2: HOÀN TẤT (SHIPPING -> COMPLETED)
            // Lúc này mới cộng điểm cho khách
            if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
                if (order.customerId) {
                    const pointsEarned = Math.floor(Number(order.totalAmount) / 10000); // 10k = 1 điểm
                    await tx.customer.update({
                        where: {id: order.customerId},
                        data: {points: {increment: pointsEarned}}
                    });
                }
            }

            // LOGIC 3: HỦY ĐƠN (CANCELLED)
            // Nếu đơn đã trừ kho (đã Confirm/Shipping) mà hủy -> Phải hoàn kho
            if (status === 'CANCELLED' && ['CONFIRMED', 'SHIPPING'].includes(order.status)) {
                for (const item of order.items) {
                    // Lấy thông tin sản phẩm hiện tại để tính currentStock chính xác
                    const currentProduct = await tx.product.findUnique({where: {id: item.productId}});
                    
                    // Cộng lại kho
                    await tx.product.update({
                        where: {id: item.productId},
                        data: {stockQuantity: {increment: item.quantity}}
                    });

                    // Ghi Log Hoàn tác
                    await tx.stockLog.create({
                        data: {
                            productId: item.productId,
                            staffId: staffId,
                            changeType: 'RETURN', // Hoặc nhập lại
                            changeQuantity: item.quantity,
                            currentStock: currentProduct.stockQuantity + item.quantity,
                            invoiceId: order.id,
                            note: `Hủy đơn Online #${order.code}`
                        }
                    });
                }
            }

            // Cập nhật trạng thái và người duyệt
            return tx.invoice.update({
                where: {id: order.id},
                data: {
                    status,
                    staffId: staffId // Gán nhân viên chịu trách nhiệm đơn này
                }
            });
        });
    }
}
