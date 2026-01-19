import prisma from '../../config/prisma.js'
import ApiError from "../../utils/ApiError.js";
import bcrypt from 'bcryptjs'

export class ProductsService{
    //CATEGORY
    async createCategory(name){
        return prisma.category.create({data: {name}});
    }

    async getAllCategory(){
        return prisma.category.findMany();
    }
    //PRODUCT
    async getAllProduct(query){
        const {categoryId, search, lowStock} = query;
        const filter = {isActive: true};

        if(categoryId){
            filter.categoryId = parseInt(categoryId);
        }
        if(search){
            filter.OR=[
                {name: {contains: search, mode: 'insensitive'}},
                {barcode: {contains: search, mode: 'insensitive'}}
            ];
        }
        if(lowStock===true){
            filter.stockQuantity = {lt: 10};
        }
        return prisma.product.findMany({
            where: filter,
            include: {category: true},
            orderBy: {createdAt: 'desc'}
        });
    }

    async getProductByBarcode(barcode){
        const product = await prisma.product.findUnique({
            where: {barcode},
            include: {category: true}
        });
        if(!product){
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
                importPrice: data.importPrice || 0,
                retailPrice: data.retailPrice,
                stockQuantity: 0,
                categoryId: parseInt(data.categoryId),
                unit: data.unit,
                packingQuantity: data.packingQuantity || 1,
                imageUrl: data.imageUrl
            }
        });
    }

    async updateProduct(id, data) {
        // Không cho phép sửa stockQuantity trực tiếp ở đây (phải qua quy trình kho)
        delete data.stockQuantity;
        delete data.importPrice; // Giá vốn cũng không nên sửa tay tùy tiện

        return prisma.product.update({
            where: {id: parseInt(id)},
            data: data
        });
    }

    async deleteProduct(id) {
        return prisma.product.update({
            where: {id: parseInt(id)},
            data: {isActive: false}
        });
    }
}