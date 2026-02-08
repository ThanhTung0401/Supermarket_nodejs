import prisma from '../../config/prisma.js'
import ApiError from "../../utils/ApiError.js";

export class ProductsService {
    //CATEGORY
    async createCategory(name) {
        return prisma.category.create({ data: { name } });
    }

    async getAllCategory() {
        return prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { id: 'asc' }
        });
    }

    async getCategoryById(id) {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: { products: true }
        });
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }
        return category;
    }

    async updateCategory(id, name) {
        return prisma.category.update({
            where: { id: parseInt(id) },
            data: { name }
        });
    }

    async deleteCategory(id) {
        const count = await prisma.product.count({
            where: { categoryId: parseInt(id), isActive: true }
        });

        if (count > 0) {
            throw new ApiError(400, `Không thể xóa danh mục này vì đang chứa ${count} sản phẩm.`);
        }

        return prisma.category.delete({
            where: { id: parseInt(id) }
        });
    }

    //PRODUCT
    async getAllProduct(query) {
        const { categoryId, search, lowStock, isActive } = query;
        const filter = {};

        if (isActive === 'false') {
            filter.isActive = false;
        } else if (isActive === 'all') {
            // Không filter isActive
        } else {
            filter.isActive = true;
        }

        if (categoryId) {
            filter.categoryId = parseInt(categoryId);
        }
        if (search) {
            filter.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (lowStock === 'true') {
            filter.stockQuantity = { lte: 10 };
        }
        return prisma.product.findMany({
            where: filter,
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getProductByBarcode(barcode) {
        const product = await prisma.product.findUnique({
            where: { barcode },
            include: { category: true }
        });
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        return product;
    }

    async createProduct(data) {
        const exist = await prisma.product.findUnique({ where: { barcode: data.barcode } });
        if (exist) throw new ApiError(400, 'Mã vạch đã tồn tại!');

        return prisma.product.create({
            data: {
                name: data.name,
                barcode: data.barcode,
                retailPrice: data.retailPrice,
                stockQuantity: 0,
                importPrice: data.importPrice || 0, // Thêm importPrice mặc định là 0
                categoryId: parseInt(data.categoryId),
                unit: data.unit,
                packingQuantity: Number(data.packingQuantity) || 1,
                imageUrl: data.imageUrl,
                minStockLevel: Number(data.minStockLevel) || 10,
                description: data.description
            }
        });
    }

    async updateProduct(id, data) {
        const productId = Number(id);
        
        if (data.barcode) {
            const exist = await prisma.product.findFirst({
                where: { 
                    barcode: data.barcode,
                    id: { not: productId } 
                }
            });
            if (exist) throw new ApiError(400, 'Mã vạch đã tồn tại ở sản phẩm khác!');
        }

        delete data.stockQuantity;
        // delete data.importPrice; // Cho phép update importPrice nếu cần (ví dụ sửa sai)

        const updateData = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.barcode !== undefined) updateData.barcode = data.barcode;

        if (data.categoryId !== undefined) {
            updateData.categoryId = Number(data.categoryId);
        }

        if (data.packingQuantity !== undefined) {
            updateData.packingQuantity = Number(data.packingQuantity);
        }

        if (data.retailPrice !== undefined) {
            updateData.retailPrice = data.retailPrice;
        }
        
        if (data.importPrice !== undefined) { // Cho phép sửa giá nhập tham khảo
            updateData.importPrice = data.importPrice;
        }
        
        if (data.minStockLevel !== undefined) {
            updateData.minStockLevel = Number(data.minStockLevel);
        }

        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
        if (data.description !== undefined) updateData.description = data.description;

        return prisma.product.update({
            where: { id: productId },
            data: updateData
        });
    }

    async deleteProduct(id) {
        return prisma.product.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
    }

    async restoreProduct(id) {
        return prisma.product.update({
            where: { id: parseInt(id) },
            data: { isActive: true }
        });
    }

    async hardDeleteProduct(id) {
        const productId = parseInt(id);

        const invoiceCount = await prisma.invoiceItem.count({
            where: { productId }
        });

        if (invoiceCount > 0) {
            throw new ApiError(400, `Không thể xóa vĩnh viễn vì sản phẩm này đã có ${invoiceCount} giao dịch lịch sử. Chỉ có thể xóa mềm.`);
        }

        const importCount = await prisma.importItem.count({
            where: { productId }
        });

        if (importCount > 0) {
            throw new ApiError(400, `Không thể xóa vĩnh viễn vì sản phẩm này đã có lịch sử nhập hàng.`);
        }

        await prisma.stockLog.deleteMany({ where: { productId } });

        return prisma.product.delete({
            where: { id: productId }
        });
    }
}
