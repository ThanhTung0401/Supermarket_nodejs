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

    // 2. Biểu đồ doanh thu theo tháng
    async getRevenueChart(query) {
        const { month, year } = query || {};

        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // JS Month 0-11
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59); // Cuối tháng

        const invoices = await prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'COMPLETED'
            },
            select: { createdAt: true, totalAmount: true }
        });

        // Gom nhóm theo ngày (Format YYYY-MM-DD)
        const revenueMap = {};

        // Khởi tạo tất cả các ngày trong tháng với giá trị 0
        const daysInMonth = endDate.getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            revenueMap[dayStr] = 0;
        }

        invoices.forEach(inv => {
            const date = inv.createdAt.toISOString().split('T')[0];
            if (revenueMap[date] !== undefined) {
                revenueMap[date] += Number(inv.totalAmount);
            }
        });

        // Chuyển về dạng mảng
        return Object.keys(revenueMap).map(date => ({
            date,
            day: date.split('-')[2], // Lấy ngày để hiển thị trục X cho gọn
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
