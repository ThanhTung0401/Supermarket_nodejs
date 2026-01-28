import {CustomersService} from "./customers.service.js";

export class CustomersController {
    constructor() {
        this.customersService = new CustomersService();
    }

    create = async (req, res, next) => {
        try {
            const customer = await this.customersService.createCustomer(req.body);
            res.status(201).json({ status: 'success', data: customer });
        } catch (e) { next(e); }
    };

    getAll = async (req, res, next) => {
        try {
            const result = await this.customersService.getAllCustomers(req.query);
            res.status(200).json({ status: 'success', ...result });
        } catch (e) { next(e); }
    };

    getOne = async (req, res, next) => {
        try {
            const customer = await this.customersService.getCustomerById(req.params.id);
            res.status(200).json({ status: 'success', data: customer });
        } catch (e) { next(e); }
    };

    update = async (req, res, next) => {
        try {
            const updated = await this.customersService.updateCustomer(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: updated });
        } catch (e) { next(e); }
    };

    delete = async (req, res, next) => {
        try {
            await this.customersService.deleteCustomer(req.params.id);
            res.status(204).json({ status: 'success', data: null });
        } catch (e) { next(e); }
    };

    getStaffViewHistory = async (req, res, next) => {
        try {
            const history = await this.customersService.getPurchaseHistory(req.params.id);
            res.status(200).json({ status: 'success', results: history.length, data: history });
        } catch (e) { next(e); }
    };

    // --- DÀNH CHO KHÁCH HÀNG (END-USER) ---

    getMe = async (req, res, next) => {
        try {
            // req.customer có được từ middleware protectCustomer
            res.status(200).json({ status: 'success', data: req.customer });
        } catch (e) { next(e); }
    };

    updateMe = async (req, res, next) => {
        try {
            const updated = await this.customersService.updateCustomer(req.customer.id, req.body);
            res.status(200).json({ status: 'success', data: updated });
        } catch (e) { next(e); }
    };

    getMyHistory = async (req, res, next) => {
        try {
            const history = await this.customersService.getPurchaseHistory(req.customer.id);
            res.status(200).json({ status: 'success', results: history.length, data: history });
        } catch (e) { next(e); }
    };
}
