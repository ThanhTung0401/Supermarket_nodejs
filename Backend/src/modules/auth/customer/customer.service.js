import bcrypt from 'bcryptjs';
import prisma from '../../../config/prisma.js';
import ApiError from '../../../utils/ApiError.js';

class CustomerAuthService {
    async register(data) {
        // 1. Kiểm tra số điện thoại tồn tại
        const existingCustomer = await prisma.customer.findUnique({
            where: { phone: data.phone },
        });
        if (existingCustomer) throw new ApiError(400, 'Số điện thoại này đã được đăng ký!');

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // 3. Tạo customer mới (khách hàng online)
        const newCustomer = await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                password: hashedPassword,
                email: data.email,
                address: data.address,
            },
        });

        return newCustomer;
    }

    async login(phone, password) {
        // 1. Kiểm tra input
        if (!phone || !password) {
            throw new ApiError(400, 'Vui lòng cung cấp số điện thoại và mật khẩu!');
        }

        // 2. Tìm customer theo số điện thoại
        const customer = await prisma.customer.findUnique({
            where: { phone },
        });

        // 3. So sánh mật khẩu
        if (!customer || !(await bcrypt.compare(password, customer.password))) {
            throw new ApiError(401, 'Số điện thoại hoặc mật khẩu không chính xác!');
        }

        return customer;
    }
}

export default new CustomerAuthService();
