import { ProductsService } from "./products.service.js";

export class CategoriesController {
    constructor() {
        this.productsService = new ProductsService();
    }

    create = async (req, res, next) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ status: 'fail', message: 'Category name is required' });
            }
            const category = await this.productsService.createCategory(name);
            res.status(201).json({ status: 'success', data: category });
        } catch (error) {
            next(error);
        }
    }

    getAll = async (req, res, next) => {
        try {
            const categories = await this.productsService.getAllCategory();
            res.status(200).json({ status: 'success', results: categories.length, data: categories });
        } catch (error) {
            next(error);
        }
    }

    getOne = async (req, res, next) => {
        try {
            const { id } = req.params;
            const category = await this.productsService.getCategoryById(id);
            res.status(200).json({ status: 'success', data: category });
        } catch (error) {
            next(error);
        }
    }

    update = async (req, res, next) => {
        try {
            const { name } = req.body;
            const category = await this.productsService.updateCategory(req.params.id, name);
            res.status(200).json({ status: 'success', data: category });
        } catch (error) {
            next(error);
        }
    }

    delete = async (req, res, next) => {
        try {
            await this.productsService.deleteCategory(req.params.id);
            res.status(204).json({ status: 'success', data: null });
        } catch (error) {
            next(error);
        }
    }
}