import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Tạo phiếu nhập hàng (Import Receipt)
 * - Hỗ trợ nhập hàng cho sản phẩm đã có HOẶC sản phẩm mới hoàn toàn
 * - Tạo ImportReceipt
 * - Tạo Product (nếu mới)
 * - Tạo ImportItem
 * - Cập nhật Product: stockQuantity, importPrice (Bình quân gia quyền)
 * - Tạo StockLog
 */
export const createImportReceipt = async (data, staffId) => {
    const { supplierId, note, items } = data; 
    // items structure:
    // Case 1 (Existing Product): { productId: 1, quantity: 10, unitCost: 50000 }
    // Case 2 (New Product): { 
    //    isNewProduct: true, 
    //    quantity: 10, 
    //    unitCost: 50000,
    //    productData: { name, barcode, categoryId, retailPrice, unit, ... } 
    // }

    if (!items || items.length === 0) {
        throw new ApiError(400, 'Danh sách sản phẩm nhập không được để trống');
    }

    // Tính tổng tiền phiếu nhập
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    // Tạo mã phiếu nhập (VD: PN_TIMESTAMP)
    const code = `PN_${Date.now()}`;

    return prisma.$transaction(async (tx) => {
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
            let productId = item.productId;
            const { quantity, unitCost, isNewProduct, productData } = item;

            let currentStock = 0;
            let currentImportPrice = 0;

            // --- TRƯỜNG HỢP 1: SẢN PHẨM MỚI ---
            if (isNewProduct && productData) {
                // Validate dữ liệu sản phẩm mới
                if (!productData.name || !productData.barcode || !productData.categoryId || !productData.retailPrice) {
                    throw new ApiError(400, 'Thông tin sản phẩm mới không đầy đủ (name, barcode, categoryId, retailPrice)');
                }

                // Kiểm tra barcode trùng
                const existingProduct = await tx.product.findUnique({ where: { barcode: productData.barcode } });
                if (existingProduct) {
                    throw new ApiError(400, `Mã vạch ${productData.barcode} đã tồn tại cho sản phẩm ${existingProduct.name}`);
                }

                // Tạo sản phẩm mới (stockQuantity ban đầu = 0, sẽ được cộng ở bước update/log)
                const newProduct = await tx.product.create({
                    data: {
                        name: productData.name,
                        barcode: productData.barcode,
                        categoryId: productData.categoryId,
                        retailPrice: productData.retailPrice,
                        importPrice: unitCost, // Giá nhập lần đầu chính là giá vốn
                        unit: productData.unit || 'cái',
                        description: productData.description,
                        imageUrl: productData.imageUrl,
                        minStockLevel: productData.minStockLevel || 10,
                        stockQuantity: 0 
                    }
                });
                
                productId = newProduct.id;
                currentStock = 0;
                currentImportPrice = Number(unitCost); // Với sp mới, giá vốn cũ coi như bằng giá nhập này (hoặc 0)
            } 
            // --- TRƯỜNG HỢP 2: SẢN PHẨM CŨ ---
            else {
                if (!productId) throw new ApiError(400, 'Thiếu productId cho sản phẩm cũ');
                
                const product = await tx.product.findUnique({ where: { id: productId } });
                if (!product) {
                    throw new ApiError(404, `Sản phẩm ID ${productId} không tồn tại`);
                }
                currentStock = product.stockQuantity;
                currentImportPrice = Number(product.importPrice);
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
            const newStock = currentStock + quantity;
            let newImportPrice = currentImportPrice;

            if (newStock > 0) {
                // Nếu là sản phẩm mới tinh thì currentStock=0, logic này vẫn đúng (0 + quantity*unitCost)/quantity = unitCost
                const oldValue = currentStock * currentImportPrice;
                const newValue = quantity * unitCost;
                newImportPrice = (oldValue + newValue) / newStock;
            }
            
            // 5. Cập nhật Product (Cộng tồn kho & cập nhật giá vốn)
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

    return prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({where: {id: productId}});
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
            where: {id: productId},
            data: {stockQuantity: newStock},
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
