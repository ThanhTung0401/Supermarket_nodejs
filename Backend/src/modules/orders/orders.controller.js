import { OrdersService } from './orders.service.js';

export class OrdersController {
    constructor() {
        this.ordersService = new OrdersService();
    }

    getAll = async (req, res, next) => {
        try {
            const result = await this.ordersService.getAllOrders(req.query);
            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    };

    getOne = async (req, res, next) => {
        try {
            const order = await this.ordersService.getOrderById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    };

    updateStatus = async (req, res, next) => {
        try {
            const { status } = req.body;
            // req.user.id lấy từ middleware protect (nhân viên đang đăng nhập)
            const order = await this.ordersService.updateOrderStatus(req.params.id, status, req.user.id);
            res.status(200).json({
                status: 'success',
                message: 'Cập nhật trạng thái đơn hàng thành công',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    };
}
