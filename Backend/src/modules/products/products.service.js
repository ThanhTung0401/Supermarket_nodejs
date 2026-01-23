import prisma from '../../config/prisma.js'
import ApiError from "../../utils/ApiError.js";
import bcrypt from 'bcryptjs'

export class ProductsService {
    //CATEGORY
    async createCategory(name) {
        return prisma.category.create({ data: { name } });
    }

    async getAllCategory() {
        return prisma.category.findMany();
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

    //PRODUCT
    async getAllProduct(query) {
        const { categoryId, search, lowStock } = query;
        const filter = { isActive: true };

        if (categoryId) {
            filter.categoryId = parseInt(categoryId);
        }
        if (search) {
            filter.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (lowStock === true) {
            filter.stockQuantity = { lt: 10 };
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
        // Check trùng barcode
        const exist = await prisma.product.findUnique({ where: { barcode: data.barcode } });
        if (exist) throw new ApiError(400, 'Mã vạch đã tồn tại!');

        return prisma.product.create({
            data: {
                name: data.name,
                barcode: data.barcode,
                retailPrice: data.retailPrice,
                stockQuantity: 0,
                categoryId: parseInt(data.categoryId),
                unit: data.unit,
                packingQuantity: Number(data.packingQuantity) || 1,
                imageUrl: data.imageUrl
            }
        });
    }

    async updateProduct(id, data) {
        delete data.stockQuantity;
        delete data.importPrice;

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

        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

        return prisma.product.update({
            where: { id: Number(id) },
            data: updateData
        });
    }


    async deleteProduct(id) {
        return prisma.product.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
    }
}