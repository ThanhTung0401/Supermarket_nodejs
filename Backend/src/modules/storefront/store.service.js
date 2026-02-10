import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';
import { getRankByPoints } from '../../utils/constants.js';

export class StoreService {

    // 1. Lấy danh sách sản phẩm (Public View)
    async getPublicProducts(query) {
        const { search, categoryId, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };

        if (search) {
            filter.name = { contains: search, mode: 'insensitive' };
        }
        if (categoryId) {
            filter.categoryId = parseInt(categoryId);
        }
        if (minPrice || maxPrice) {
            filter.retailPrice = {};
            if (minPrice) filter.retailPrice.gte = Number(minPrice);
            if (maxPrice) filter.retailPrice.lte = Number(maxPrice);
        }

        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'price_asc') {
            orderBy = { retailPrice: 'asc' };
        } else if (sortBy === 'price_desc') {
            orderBy = { retailPrice: 'desc' };
        } else if (sortBy === 'name_asc') {
            orderBy = { name: 'asc' };
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
                    isActive: true
                },
                orderBy
            }),
            prisma.product.count({ where: filter })
        ]);

        return { products, total, page, totalPages: Math.ceil(total / limit) };
    }

    // 1.5 Lấy danh mục public
    async getPublicCategories() {
        return prisma.category.findMany({
            select: { id: true, name: true }
        });
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
            // Lấy thông tin khách hàng để tính Rank
            const customer = await tx.customer.findUnique({ where: { id: parseInt(customerId) } });
            if (!customer) throw new ApiError(404, 'Khách hàng không tồn tại');

            const rank = getRankByPoints(customer.points);
            const rankDiscountPercent = rank.discount; // % giảm giá theo rank

            let totalAmount = 0;
            const invoiceItemsData = [];

            for (const item of items) {
                const product = await tx.product.findUnique({where: {id: item.productId}});

                if (!product || !product.isActive) {
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

            // Tính giảm giá
            let discountAmount = 0;
            let voucherId = null;

            // 1. Giảm giá theo Rank (Ưu tiên tính trước hoặc cộng dồn tùy chính sách, ở đây ta tính trên tổng tiền)
            const rankDiscountAmount = totalAmount * (rankDiscountPercent / 100);
            discountAmount += rankDiscountAmount;

            // 2. Giảm giá theo Voucher
            if (voucherCode) {
                const voucher = await tx.voucher.findUnique({where: {code: voucherCode}});
                if (voucher && voucher.isActive) {
                    let voucherDiscount = 0;
                    if (voucher.type === 'PERCENTAGE') {
                        voucherDiscount = totalAmount * (Number(voucher.value) / 100);
                        if (voucher.maxDiscount && voucherDiscount > Number(voucher.maxDiscount)) {
                            voucherDiscount = Number(voucher.maxDiscount);
                        }
                    } else {
                        voucherDiscount = Number(voucher.value);
                    }

                    // Kiểm tra điều kiện đơn tối thiểu
                    if (totalAmount >= (voucher.minOrderValue || 0)) {
                        discountAmount += voucherDiscount;
                        voucherId = voucher.id;

                        await tx.voucher.update({
                            where: {id: voucher.id},
                            data: {usedCount: {increment: 1}}
                        });
                    }
                }
            }

            // Đảm bảo không giảm quá tổng tiền
            if (discountAmount > totalAmount) discountAmount = totalAmount;
            const finalAmount = totalAmount - discountAmount;

            const invoice = await tx.invoice.create({
                data: {
                    code: `WEB-${Date.now()}`,
                    customerId: parseInt(customerId),
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
        return prisma.invoice.findMany({
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
    }
}
