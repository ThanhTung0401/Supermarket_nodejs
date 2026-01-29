import {SalesService} from "./sales.service.js";

export class ReturnsController{
    constructor(){
        this.salesService = new SalesService();
    }

    returnInvoice = async (req, res, next) => {
        try{
            const returnInvoice = await this.salesService.returnInvoice(req.user.id, req.body);
            res.status(200).json({status:'success', data: returnInvoice})
        }
        catch(error){
            next(error);
        }
    }
}