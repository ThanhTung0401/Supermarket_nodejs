import * as voucherService from './vouchers.service.js';

export const createVoucher = async (req, res, next) => {
    try {
        const voucher = await voucherService.createVoucher(req.body);
        res.status(201).json({
            status: 'success',
            data: voucher
        });
    } catch (error) {
        next(error);
    }
};

export const getAllVouchers = async (req, res, next) => {
    try {
        const result = await voucherService.getAllVouchers(req.query);
        res.status(200).json({
            status: 'success',
            data: result.vouchers,
            meta: result.meta
        });
    } catch (error) {
        next(error);
    }
};

export const getVoucherById = async (req, res, next) => {
    try {
        const voucher = await voucherService.getVoucherById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: voucher
        });
    } catch (error) {
        next(error);
    }
};

export const updateVoucher = async (req, res, next) => {
    try {
        const voucher = await voucherService.updateVoucher(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: voucher
        });
    } catch (error) {
        next(error);
    }
};

export const deleteVoucher = async (req, res, next) => {
    try {
        await voucherService.deleteVoucher(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Xóa voucher thành công'
        });
    } catch (error) {
        next(error);
    }
};

export const verifyVoucher = async (req, res, next) => {
    try {
        const { code, orderValue } = req.body;
        const result = await voucherService.verifyVoucher(code, orderValue);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
