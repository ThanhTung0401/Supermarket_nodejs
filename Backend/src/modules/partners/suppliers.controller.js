import { SuppliersService } from './suppliers.service.js';

export class SuppliersController {
    constructor() {
        this.suppliersService = new SuppliersService();
    }

    getAll = async (req, res, next) => {
        try {
            const suppliers = await this.suppliersService.getAllSuppliers(req.query);
            res.status(200).json({
                status: 'success',
                data: {
                    suppliers
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getOne = async (req, res, next) => {
        try {
            const supplier = await this.suppliersService.getSupplierById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: {
                    supplier
                }
            });
        } catch (error) {
            next(error);
        }
    };

    create = async (req, res, next) => {
        try {
            const supplier = await this.suppliersService.createSupplier(req.body);
            res.status(201).json({
                status: 'success',
                data: {
                    supplier
                }
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const supplier = await this.suppliersService.updateSupplier(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: {
                    supplier
                }
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req, res, next) => {
        try {
            const result = await this.suppliersService.deleteSupplier(req.params.id);
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };
}