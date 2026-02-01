import { ReportsService } from './reports.service.js';

export class ReportsController {
    constructor() {
        this.reportsService = new ReportsService();
    }

    getDashboardStats = async (req, res, next) => {
        try {
            const stats = await this.reportsService.getDashboardStats();
            res.status(200).json({
                status: 'success',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    };

    getRevenueChart = async (req, res, next) => {
        try {
            const chartData = await this.reportsService.getRevenueChart();
            res.status(200).json({
                status: 'success',
                data: chartData
            });
        } catch (error) {
            next(error);
        }
    };

    getTopSelling = async (req, res, next) => {
        try {
            const topProducts = await this.reportsService.getTopSelling();
            res.status(200).json({
                status: 'success',
                data: topProducts
            });
        } catch (error) {
            next(error);
        }
    };

    getLowStock = async (req, res, next) => {
        try {
            const lowStockProducts = await this.reportsService.getLowStockProducts();
            res.status(200).json({
                status: 'success',
                data: lowStockProducts
            });
        } catch (error) {
            next(error);
        }
    };
}
