import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError.js";

export class CustomersService{
    // 1. Tạo khách hàng (Dùng cho cả POS tạo nhanh và Khách tự đăng ký)
    async createCustomer(data) {
        const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
        if (existing) throw new ApiError(400, 'Số điện thoại đã tồn tại!');

        let password = null;
        if (data.password) {
            password = await bcrypt.hash(data.password, 12);
        }

        return prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                password: password, // Có thể null nếu tạo tại quầy
                points: 0
            }
        });
    }

    // 2. Lấy danh sách (Cho nhân viên tìm kiếm tại POS)
    async getAllCustomers(query) {
        const { search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (search) {
            filter.OR = [
                { phone: { contains: search } }, // Tìm theo SĐT (Quan trọng nhất)
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where: filter,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { id: 'desc' }
            }),
            prisma.customer.count({ where: filter })
        ]);

        return { customers, total, page, totalPages: Math.ceil(total / limit) };
    }

    // 3. Lấy chi tiết khách hàng
    async getCustomerById(id) {
        const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
        if (!customer) throw new ApiError(404, 'Khách hàng không tồn tại');
        return customer;
    }

    // 4. Cập nhật thông tin
    async updateCustomer(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 12);
        }
        // Không cho phép sửa điểm thủ công ở đây (phải qua quy trình bán hàng/đổi quà)
        delete data.points;

        return prisma.customer.update({
            where: {id: parseInt(id)},
            data: data
        });
    }

    // 5. Xóa khách hàng (Cẩn thận: Chỉ xóa nếu chưa mua hàng bao giờ)
    async deleteCustomer(id) {
        const hasInvoices = await prisma.invoice.findFirst({ where: { customerId: parseInt(id) } });
        if (hasInvoices) {
            throw new ApiError(400, 'Không thể xóa khách hàng đã có lịch sử mua hàng!');
        }
        return prisma.customer.delete({where: {id: parseInt(id)}});
    }

    // 6. Lấy lịch sử mua hàng (Invoices)
    async getPurchaseHistory(customerId) {
        return prisma.invoice.findMany({
            where: {customerId: parseInt(customerId)},
            include: {
                items: {
                    include: {product: {select: {name: true, barcode: true}}}
                }
            },
            orderBy: {createdAt: 'desc'}
        });
    }
}