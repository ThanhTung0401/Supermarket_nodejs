import {SalesService} from "./sales.service.js";

export class PosController{
    constructor(){
        this.salesService = new SalesService();
    }
    async createPOSInvoice(req, res, next){
        try{
            const invoice = await this.salesService.createPOSInvoice(req.user.id, req.body);
            res.status(201).json({status: "success", data: invoice});
        }catch (e){
            next(e);
        }
    }
}