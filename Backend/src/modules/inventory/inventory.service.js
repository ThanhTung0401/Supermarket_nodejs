import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Tạo phiếu nhập hàng (Import Receipt)
 * - Tạo ImportReceipt
 * - Tạo ImportItem
 * - Cập nhật Product: stockQuantity, importPrice (Bình quân gia quyền)
 * - Tạo StockLog
 */
export const createImportReceipt = async (data, staffId) => {
    const { supplierId, note, items } = data; // items: [{ productId, quantity, unitCost }]

    if (!items || items.length === 0) {
        throw new ApiError(400, 'Danh sách sản phẩm nhập không được để trống');
    }

    // Tính tổng tiền phiếu nhập
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    // Tạo mã phiếu nhập (VD: PN_TIMESTAMP)
    const code = `PN_${Date.now()}`;

    return await prisma.$transaction(async (tx) => {
        // 1. Tạo ImportReceipt
        const receipt = await tx.importReceipt.create({
            data: {
                code,
                supplierId,
                staffId,
                totalCost,
                note,
            },
        });

        // 2. Xử lý từng item
        for (const item of items) {
            const { productId, quantity, unitCost } = item;

            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) {
                throw new ApiError(404, `Sản phẩm ID ${productId} không tồn tại`);
            }

            // 3. Tạo ImportItem
            await tx.importItem.create({
                data: {
                    importReceiptId: receipt.id,
                    productId,
                    quantity,
                    unitCost,
                    totalCost: quantity * unitCost,
                },
            });

            // 4. Tính giá vốn bình quân (Weighted Average Cost)
            // Công thức: ((Tồn cũ * Giá cũ) + (Nhập mới * Giá nhập)) / (Tồn cũ + Nhập mới)
            // Lưu ý: stockQuantity hiện tại có thể âm nếu bán âm (tùy logic), nhưng thường nên check >= 0
            const currentStock = product.stockQuantity;
            // importPrice is Decimal, handle with Number() for calculation, but beware of precision. 
            // For simple weighted average, float might suffice or use Decimal library if critical. 
            // Here using Number() as in previous thought, but acknowledging Decimal type from Prisma.
            const currentImportPrice = Number(product.importPrice);
            const newStock = currentStock + quantity;

            let newImportPrice = currentImportPrice;
            if (newStock > 0) {
                // Chỉ tính lại nếu tổng tồn > 0
                const oldValue = currentStock * currentImportPrice;
                const newValue = quantity * unitCost;
                newImportPrice = (oldValue + newValue) / newStock;
            }
            // Nếu newStock <= 0, giữ giá cũ hoặc set theo giá nhập mới.
            if (currentStock === 0 && quantity > 0) {
                newImportPrice = unitCost;
            }

            // 5. Cập nhật Product
            await tx.product.update({
                where: { id: productId },
                data: {
                    stockQuantity: { increment: quantity },
                    importPrice: newImportPrice,
                },
            });

            // 6. Tạo StockLog
            await tx.stockLog.create({
                data: {
                    productId,
                    staffId,
                    changeType: 'IMPORT',
                    changeQuantity: quantity,
                    currentStock: newStock,
                    importReceiptId: receipt.id,
                    note: `Nhập hàng theo phiếu ${code}`,
                },
            });
        }

        return receipt;
    });
};

/**
 * Lấy danh sách phiếu nhập
 */
export const getImportReceipts = async (query) => {
    const { page = 1, limit = 10, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [total, receipts] = await Promise.all([
        prisma.importReceipt.count({ where }),
        prisma.importReceipt.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                supplier: { select: { name: true } },
                staff: { select: { fullName: true } },
            },
        }),
    ]);

    return {
        items: receipts,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Chi tiết phiếu nhập
 */
export const getImportReceiptById = async (id) => {
    const receipt = await prisma.importReceipt.findUnique({
        where: { id: Number(id) },
        include: {
            details: {
                include: {
                    product: { select: { name: true, barcode: true, unit: true } },
                },
            },
            supplier: true,
            staff: { select: { id: true, fullName: true, email: true } },
        },
    });

    if (!receipt) {
        throw new ApiError(404, 'Phiếu nhập không tồn tại');
    }
    return receipt;
};

/**
 * Lấy trạng thái kho (Danh sách tồn kho)
 * Có thể filter: low_stock (Sắp hết hàng)
 */
export const getInventoryStatus = async (query) => {
    const { page = 1, limit = 10, lowStock, search } = query;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search } },
        ];
    }

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                name: true,
                barcode: true,
                stockQuantity: true,
                minStockLevel: true,
                unit: true,
                importPrice: true,
                retailPrice: true,
                category: { select: { name: true } },
            },
            orderBy: { stockQuantity: 'asc' },
        }),
    ]);

    const productsWithStatus = products.map(p => ({
        ...p,
        status: p.stockQuantity <= p.minStockLevel ? 'LOW_STOCK' : 'AVAILABLE',
    }));

    let resultItems = productsWithStatus;
    if (lowStock === 'true') {
        resultItems = resultItems.filter(p => p.status === 'LOW_STOCK');
    }

    return {
        items: resultItems,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Điều chỉnh kho (Kiểm kê, Hư hỏng)
 * changeType: DAMAGE | AUDIT
 */
export const adjustStock = async (data, staffId) => {
    const { productId, changeType, quantity, note } = data;

    if (!['DAMAGE', 'AUDIT'].includes(changeType)) {
        throw new ApiError(400, 'Loại điều chỉnh không hợp lệ (DAMAGE, AUDIT)');
    }

    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new ApiError(404, 'Sản phẩm không tồn tại');

        let changeQuantity = 0;
        let newStock = product.stockQuantity;

        if (changeType === 'DAMAGE') {
            if (quantity <= 0) throw new ApiError(400, 'Số lượng hư hỏng phải > 0');
            changeQuantity = -quantity;
            newStock = product.stockQuantity - quantity;
        } else if (changeType === 'AUDIT') {
            if (quantity < 0) throw new ApiError(400, 'Số lượng kiểm kê không thể âm');
            changeQuantity = quantity - product.stockQuantity;
            newStock = quantity;
        }

        await tx.product.update({
            where: { id: productId },
            data: { stockQuantity: newStock },
        });

        const log = await tx.stockLog.create({
            data: {
                productId,
                staffId,
                changeType,
                changeQuantity,
                currentStock: newStock,
                note: note || (changeType === 'DAMAGE' ? 'Xuất hủy hàng hỏng' : 'Kiểm kê cân bằng kho'),
            },
        });

        return log;
    });
};

/**
 * Lấy lịch sử kho
 */
export const getStockLogs = async (query) => {
    const { page = 1, limit = 20, productId, type, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (productId) where.productId = Number(productId);
    if (type) where.changeType = type;
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [total, logs] = await Promise.all([
        prisma.stockLog.count({ where }),
        prisma.stockLog.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                product: { select: { name: true, barcode: true } },
                staff: { select: { fullName: true } },
            },
        }),
    ]);

    return {
        items: logs,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};
