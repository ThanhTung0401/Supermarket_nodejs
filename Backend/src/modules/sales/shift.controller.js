import {SalesService} from "./sales.service.js";

export class SalesController {
    constructor() {
        this.salesService = new SalesService();
    }

    async starShift(req, res, next){
        try{
            const shift = await this.salesService.starShift(req.user.id, req.body.initialCash);
            res.status(201).json({status: "success", data: shift});
        }catch (e){
            next(e);
        }
    }

    async endShift(req, res, next){
        try{
            const shift = await this.salesService.endShift(req.user.id, req.body.actualCash, req.body.note);
            res.status(200).json({status: "success", data: shift});
        }catch (e){
            next(e);
        }
    }

    async getAllShift(req, res, next){
        try {
            const shifts = await this.salesService.getAllShift(req.user.id);
            res.status(200).json({status: "success", results: shifts.length, data: shifts});
        }
        catch (e){
            next(e);
        }
    }

    async getCurrentShift(req, res, next){
        try{
            const shift = await this.salesService.getCurrentShift(req.user.id);
            res.status(200).json({status: "success", data: shift});
        }catch (e){
            next(e);
        }
    }
}