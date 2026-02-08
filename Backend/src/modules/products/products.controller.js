import {ProductsService} from "./products.service.js";

export class ProductsController{
    constructor(){
        this.productsService = new ProductsService();
    }
    getAll = async (req, res, next)=>{
        try{
            const products = await this.productsService.getAllProduct(req.query);
           res.status(200).json({ status: "success", results: products.length, data: products});
}
        catch (error){
            next(error);
        }
    }

    getBarcode = async (req, res, next)=>{
        try{
            const product = await this.productsService.getProductByBarcode(req.params.barcode);
            res.status(200).json({ status: "success", data: product});
        }
        catch (error){
            next(error);
        }
    }

    create = async (req, res, next)=> {
        try {
            const newProduct = await this.productsService.createProduct(req.body);
            res.status(201).json({ status: 'success', data: newProduct });
        } catch (e) { next(e); }
    }

    update = async (req, res, next)=> {
        try {
            const updated = await this.productsService.updateProduct(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: updated });
        } catch (e) { next(e); }
    }

    delete = async (req, res, next)=> {
        try {
            const deleted = await this.productsService.deleteProduct(req.params.id);
            res.status(200).json({ status: 'success', data: deleted });
        } catch (e) { next(e); }
    }

    restore = async (req, res, next)=> {
        try {
            const restored = await this.productsService.restoreProduct(req.params.id);
            res.status(200).json({ status: 'success', data: restored });
        } catch (e) { next(e); }
    }

    hardDelete = async (req, res, next)=> {
        try {
            await this.productsService.hardDeleteProduct(req.params.id);
            res.status(204).json({ status: 'success', data: null });
        } catch (e) { next(e); }
    }
}