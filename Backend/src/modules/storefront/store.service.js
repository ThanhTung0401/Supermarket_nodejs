import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export class StoreService {

    // 1. Lấy danh sách sản phẩm (Public View)
    async getPublicProducts(query) {
        const { search, categoryId, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        // Tạm thời bỏ filter isActive để debug
        const filter = {}; 
        // const filter = { isActive: true };

        if (search) {
            filter.name = { contains: search, mode: 'insensitive' };
        }
        if (categoryId) {
            filter.categoryId = parseInt(categoryId);
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: filter,
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    name: true,
                    barcode: true,
                    retailPrice: true,
                    imageUrl: true,
                    unit: true,
                    packingQuantity: true,
                    stockQuantity: true,
                    category: { select: { name: true } },
                    isActive: true // Lấy thêm isActive để check
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where: filter })
        ]);

        return { products, total, page, totalPages: Math.ceil(total / limit) };
    }

    // 2. Chi tiết sản phẩm
    async getProductDetail(id) {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true, name: true, barcode: true, retailPrice: true,
                imageUrl: true, unit: true, description: true,
                stockQuantity: true, category: { select: { name: true } }
            }
        });
        if (!product) throw new ApiError(404, 'Sản phẩm không tồn tại');
        return product;
    }

    // 3. Đặt hàng Online (Checkout)
    async createOnlineOrder(customerId, data) {
        const { items, voucherCode, deliveryAddress, paymentMethod } = data;

        return prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const invoiceItemsData = [];

            for (const item of items) {
                const product = await tx.product.findUnique({where: {id: item.productId}});

                if (!product) { // Bỏ check isActive tạm thời
                    throw new ApiError(400, `Sản phẩm ID ${item.productId} không khả dụng`);
                }

                if (product.stockQuantity < item.quantity) {
                    throw new ApiError(400, `Sản phẩm ${product.name} tạm hết hàng`);
                }

                const unitPrice = Number(product.retailPrice);
                const totalPrice = unitPrice * item.quantity;
                totalAmount += totalPrice;

                invoiceItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice
                });
            }

            let discountAmount = 0;
            let voucherId = null;

            if (voucherCode) {
                const voucher = await tx.voucher.findUnique({where: {code: voucherCode}});
                if (voucher && voucher.isActive) {
                    if (voucher.type === 'PERCENTAGE') {
                        discountAmount = totalAmount * (Number(voucher.value) / 100);
                        if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
                            discountAmount = Number(voucher.maxDiscount);
                        }
                    } else {
                        discountAmount = Number(voucher.value);
                    }
                    voucherId = voucher.id;

                    await tx.voucher.update({
                        where: {id: voucher.id},
                        data: {usedCount: {increment: 1}}
                    });
                }
            }

            const finalAmount = totalAmount - discountAmount;

            const invoice = await tx.invoice.create({
                data: {
                    code: `WEB-${Date.now()}`,
                    customerId: parseInt(customerId), // Ép kiểu int
                    voucherId,
                    totalAmount: finalAmount,
                    discountAmount,
                    paymentMethod: paymentMethod || 'COD',
                    status: 'PENDING',
                    source: 'ONLINE',
                    deliveryAddress,
                    items: {
                        create: invoiceItemsData
                    }
                }
            });

            return invoice;
        });
    }

    // 4. Lịch sử đơn hàng của tôi
    async getMyOrders(customerId) {
        console.log("Service getMyOrders called with ID:", customerId); // Log ID nhận được
        
        const orders = await prisma.invoice.findMany({
            where: { customerId: parseInt(customerId) }, 
            include: {
                items: {
                    select: {
                        quantity: true,
                        unitPrice: true,
                        totalPrice: true, 
                        product: {select: {name: true, imageUrl: true}}
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        });
        
        console.log("Service found orders:", orders.length); // Log kết quả tìm thấy
        return orders;
    }
}
