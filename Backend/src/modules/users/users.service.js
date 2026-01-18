import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export class UsersService {
    async getAllUsers(query) {
        const { role, search } = query;
        const filter = {};

        if (role) {
            filter.role = role;
        }

        if (search) {
            filter.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        return prisma.user.findMany({
            where: filter,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
    }

    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user;
    }

    async updateUser(id, data) {
        // Nếu có đổi mật khẩu thì phải hash lại
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 12);
        }

        return prisma.user.update({
            where: {id: parseInt(id)},
            data: data,
            select: {
                id: true,
                fullName: true,
                role: true}
        });
    }

    async toggleActive(id) {
        const user = await this.getUserById(id);
        
        return prisma.user.update({
            where: { id: parseInt(id) },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                isActive: true
            }
        });
    }
}
