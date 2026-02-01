import prisma from '../../config/prisma.js';
import ApiError from "../../utils/ApiError.js";

export class ReportsService {

    // 1. Thống kê tổng quan cho Dashboard
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt về đầu ngày

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            todayRevenue,
            monthRevenue,
            totalOrders,
            totalCustomers,
            lowStockCount
        ] = await Promise.all([
            // Doanh thu hôm nay (Chỉ tính đơn đã hoàn thành)
            prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                where: {
                    createdAt: { gte: today },
                    status: 'COMPLETED'
                }
            }),
            // Doanh thu tháng này
            prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                where: {
                    createdAt: { gte: startOfMonth },
                    status: 'COMPLETED'
                }
            }),
            // Tổng số đơn hàng (Tất cả trạng thái)
            prisma.invoice.count(),
            // Tổng số khách hàng
            prisma.customer.count(),
            // Số sản phẩm sắp hết hàng (<= 10)
            prisma.product.count({ where: { stockQuantity: { lte: 10 } } })
        ]);

        return {
            todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
            monthRevenue: Number(monthRevenue._sum.totalAmount || 0),
            totalOrders,
            totalCustomers,
            lowStockCount
        };
    }

    // 2. Biểu đồ doanh thu 7 ngày gần nhất
    // (Lưu ý: Để đơn giản và tương thích mọi DB, ta xử lý gom nhóm bằng JS thay vì Raw Query phức tạp)
    async getRevenueChart() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const invoices = await prisma.invoice.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo },
                status: 'COMPLETED'
            },
            select: { createdAt: true, totalAmount: true }
        });

        // Gom nhóm theo ngày (Format YYYY-MM-DD)
        const revenueMap = {};
        invoices.forEach(inv => {
            const date = inv.createdAt.toISOString().split('T')[0];
            if (!revenueMap[date]) revenueMap[date] = 0;
            revenueMap[date] += Number(inv.totalAmount);
        });

        // Chuyển về dạng mảng cho Frontend vẽ biểu đồ
        return Object.keys(revenueMap).map(date => ({
            date,
            revenue: revenueMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // 3. Top 5 Sản phẩm bán chạy nhất
    async getTopSelling() {
        const topProducts = await prisma.invoiceItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        // Lấy thêm tên sản phẩm
        const productIds = topProducts.map(p => p.productId);
        const productsInfo = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stockQuantity: true }
        });

        return topProducts.map(item => {
            const product = productsInfo.find(p => p.id === item.productId);
            return {
                id: item.productId,
                name: product ? product.name : 'Unknown',
                sold: item._sum.quantity,
                stock: product ? product.stockQuantity : 0
            };
        });
    }

    // 4. Danh sách sản phẩm sắp hết hàng
    async getLowStockProducts() {
        return prisma.product.findMany({
            where: {
                stockQuantity: {lte: 10},
                isActive: true
            },
            take: 10,
            orderBy: {stockQuantity: 'asc'},
            select: {id: true, name: true, stockQuantity: true, minStockLevel: true}
        });
    }
}
