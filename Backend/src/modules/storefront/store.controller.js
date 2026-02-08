import { StoreService } from './store.service.js';

export class StoreController {
    constructor() {
        this.storeService = new StoreService();
    }

    getProducts = async (req, res, next) => {
        try {
            const result = await this.storeService.getPublicProducts(req.query);
            res.status(200).json({ status: 'success', ...result });
        } catch (e) { next(e); }
    };

    getProductDetail = async (req, res, next) => {
        try {
            const product = await this.storeService.getProductDetail(req.params.id);
            res.status(200).json({ status: 'success', data: product });
        } catch (e) { next(e); }
    };

    createOrder = async (req, res, next) => {
        try {
            console.log("Creating order for customer:", req.customer.id); // Debug
            const order = await this.storeService.createOnlineOrder(req.customer.id, req.body);
            res.status(201).json({ status: 'success', data: order });
        } catch (e) { next(e); }
    };

    getMyOrders = async (req, res, next) => {
        try {
            console.log("Getting orders for customer:", req.customer.id); // Debug
            const orders = await this.storeService.getMyOrders(req.customer.id);
            console.log("Found orders:", orders.length); // Debug
            res.status(200).json({ status: 'success', data: orders });
        } catch (e) { next(e); }
    };
}
