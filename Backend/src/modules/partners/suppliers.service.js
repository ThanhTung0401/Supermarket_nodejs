import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export class SuppliersService {
    async getAllSuppliers(query) {
        const { search } = query;
        const filter = {};

        if (search) {
            filter.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        return prisma.supplier.findMany({
            where: filter,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async getSupplierById(id) {
        const supplier = await prisma.supplier.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true,
                importReceipts: {
                    select: {
                        id: true,
                        code: true,
                        totalCost: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10 // 10 phiếu nhập gần nhất
                }
            }
        });

        if (!supplier) {
            throw new ApiError(404, 'Supplier not found');
        }

        return supplier;
    }

    async createSupplier(data) {
        const { name, phone, email, address } = data;

        // Validate dữ liệu bắt buộc
        if (!name) {
            throw new ApiError(400, 'Supplier name is required');
        }

        // Kiểm tra email trùng nếu có
        if (email) {
            const existingSupplier = await prisma.supplier.findFirst({
                where: { email }
            });

            if (existingSupplier) {
                throw new ApiError(400, 'Email already exists');
            }
        }

        return prisma.supplier.create({
            data: {
                name,
                phone,
                email,
                address
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true
            }
        });
    }

    async updateSupplier(id, data) {
        // Kiểm tra supplier tồn tại
        await this.getSupplierById(id);

        const { name, phone, email, address } = data;

        // Kiểm tra email trùng nếu đổi email
        if (email) {
            const existingSupplier = await prisma.supplier.findFirst({
                where: {
                    email,
                    NOT: {
                        id: parseInt(id)
                    }
                }
            });

            if (existingSupplier) {
                throw new ApiError(400, 'Email already exists');
            }
        }

        return prisma.supplier.update({
            where: { id: parseInt(id) },
            data: {
                name,
                phone,
                email,
                address
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true
            }
        });
    }

    async deleteSupplier(id) {
        // Kiểm tra supplier tồn tại
        await this.getSupplierById(id);

        // Kiểm tra xem supplier có phiếu nhập nào không
        const importReceiptsCount = await prisma.importReceipt.count({
            where: { supplierId: parseInt(id) }
        });

        if (importReceiptsCount > 0) {
            throw new ApiError(400, `Không thể xóa nhà cung cấp này vì đã có ${importReceiptsCount} phiếu nhập hàng.`);
        }

        await prisma.supplier.delete({
            where: { id: parseInt(id) }
        });

        return {
            message: 'Supplier deleted successfully'
        };
    }
}
