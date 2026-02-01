import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export class StoreService {

    // 1. Lấy danh sách sản phẩm (Public View)
    // Chỉ lấy hàng đang bán (isActive=true) và ẩn giá vốn
    async getPublicProducts(query) {
        const { search, categoryId, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };

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
                    retailPrice: true, // Chỉ lấy giá bán
                    imageUrl: true,
                    unit: true,
                    packingQuantity: true,
                    stockQuantity: true, // Hiển thị tồn kho để khách biết còn hàng không
                    category: { select: { name: true } }
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
        // items: [{ productId, quantity }]

        return prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const invoiceItemsData = [];

            // Tính toán tiền hàng
            for (const item of items) {
                const product = await tx.product.findUnique({where: {id: item.productId}});

                if (!product || !product.isActive) {
                    throw new ApiError(400, `Sản phẩm ID ${item.productId} không khả dụng`);
                }

                // Lưu ý: Đặt online vẫn cho đặt dù hết hàng (để nhân viên gọi confirm sau)
                // hoặc chặn luôn tùy policy. Ở đây ta chặn nếu kho = 0.
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

            // Xử lý Voucher (Copy logic từ Sales Service nhưng áp dụng cho đơn online)
            let discountAmount = 0;
            let voucherId = null;

            if (voucherCode) {
                const voucher = await tx.voucher.findUnique({where: {code: voucherCode}});
                if (voucher && voucher.isActive) {
                    // Check hạn sử dụng...
                    if (voucher.type === 'PERCENTAGE') {
                        discountAmount = totalAmount * (Number(voucher.value) / 100);
                        if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
                            discountAmount = Number(voucher.maxDiscount);
                        }
                    } else {
                        discountAmount = Number(voucher.value);
                    }
                    voucherId = voucher.id;

                    // Tăng lượt dùng
                    await tx.voucher.update({
                        where: {id: voucher.id},
                        data: {usedCount: {increment: 1}}
                    });
                }
            }

            const finalAmount = totalAmount - discountAmount;

            // Tạo đơn hàng (Trạng thái PENDING)
            // Lưu ý: Chưa trừ kho ngay lúc này (để Admin duyệt mới trừ - xem logic module Orders)
            const invoice = await tx.invoice.create({
                data: {
                    code: `WEB-${Date.now()}`,
                    customerId: customerId,
                    voucherId,
                    totalAmount: finalAmount,
                    discountAmount,
                    paymentMethod: paymentMethod || 'COD',
                    status: 'PENDING', // Chờ duyệt
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
        return prisma.invoice.findMany({
            where: {customerId: customerId},
            include: {
                items: {
                    select: {
                        quantity: true,
                        unitPrice: true,
                        product: {select: {name: true, imageUrl: true}}
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        });
    }
}

