import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { getRankByPoints } from "../../utils/constants.js";

export class SalesService{

    //WORKSHIFT
    async starShift(userId, initialCash){
        const openShift = await prisma.workShift.findFirst({
            where: {
                staffId: userId,
                endTime: null
            }
        });
        if (openShift) {
            throw new ApiError(400, 'Bạn vẫn còn một ca làm việc chưa kết thúc!')
        }

        return prisma.workShift.create({
            data:{
                staffId: userId,
                initialCash: parseFloat(initialCash),
                startTime: new Date()
            }
        });
    }

    async endShift(userId, actualCash, note){
        const openShift = await prisma.workShift.findFirst({
            where: {
                staffId: userId,
                endTime: null
            }
        });
        if(!openShift){
            throw new ApiError(400,"Bạn không có ca làm việc nào đang mở!")
        }

        const invoices = await prisma.invoice.findMany({
            where:{
                workShiftId: openShift.id,
                paymentMethod: "CASH",
                status: "COMPLETED"
            },
            select: {totalAmount: true}
        });

        const systemRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const initialCash = Number(openShift.initialCash);
        const actual = Number(actualCash);

        const difference = actual - (initialCash + systemRevenue);

        return prisma.workShift.update({
            where: { id: openShift.id},
            data:{
                endTime: new Date(),
                systemRevenue,
                actualCash: actual,
                difference,
                note
            }
        });
    }

    async getAllShift(userId){
        return prisma.workShift.findMany({
            where:{
                staffId: userId
            },
            orderBy: { startTime: 'desc' }
        });
    }

    async getCurrentShift(userId){
        return prisma.workShift.findFirst({
            where:{
                staffId: userId,
                endTime: null
            }
        });
    }

    //POS
    async createPOSInvoice(userId, data){
        const {items, customerId, voucherCode, paymentMethod} = data;

        const shift = await prisma.workShift.findFirst({
            where:{
                staffId: userId,
                endTime: null
            }
        });
        if(!shift){
            throw new ApiError(400, "Bạn chưa mở ca làm việc để bán hàng!")
        }

        return prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const invoiceItemsData =[];
            const stockLogData = [];

            // 1. Tính toán và chuẩn bị dữ liệu
            for (const item of items){
                const product = await tx.product.findUnique({
                    where:{
                        id: item.productId
                    }
                })
                if(!product){
                    throw new ApiError(404, `Sản phẩm ID ${item.productId} không tồn tại!`)
                }
                if(item.quantity > product.stockQuantity){
                    throw new ApiError(400,`Sản phẩm ${product.name} không đủ số lượng để bán!`)
                }
                const unitPrice = Number(product.retailPrice)
                const totalPrice = unitPrice * item.quantity
                totalAmount += totalPrice;

                invoiceItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice
                });

                // Trừ kho
                await tx.product.update({
                    where:{
                        id: item.productId
                    },
                    data:{
                        stockQuantity: product.stockQuantity - item.quantity
                    }
                });

                // Chuẩn bị log kho (chưa có invoiceId)
                stockLogData.push({
                    productId: item.productId,
                    staffId: userId,
                    changeType: "SELL",
                    changeQuantity: -item.quantity,
                    currentStock: product.stockQuantity - item.quantity,
                    note: 'Bán tại quầy'
                });
            }

            // 2. Xử lý Giảm giá (Rank + Voucher)
            let discountAmount = 0;
            let voucherId = null;

            // 2.1 Giảm giá theo Rank
            if (customerId) {
                const customer = await tx.customer.findUnique({ where: { id: parseInt(customerId) } });
                if (customer) {
                    const rank = getRankByPoints(customer.points);
                    const rankDiscount = totalAmount * (rank.discount / 100);
                    discountAmount += rankDiscount;
                }
            }

            // 2.2 Giảm giá theo Voucher
            if (voucherCode) {
                const voucher = await tx.voucher.findUnique({ where: { code: voucherCode } });
                if (voucher && voucher.isActive) {
                    // Check hạn sử dụng
                    const now = new Date();
                    if (now < voucher.startDate || now > voucher.endDate) {
                        throw new ApiError(400, 'Voucher đã hết hạn hoặc chưa có hiệu lực!');
                    }

                    let voucherDiscount = 0;
                    if (voucher.type === 'PERCENTAGE') {
                        voucherDiscount = totalAmount * (Number(voucher.value) / 100);
                        if (voucher.maxDiscount && voucherDiscount > Number(voucher.maxDiscount)) {
                            voucherDiscount = Number(voucher.maxDiscount);
                        }
                    } else {
                        voucherDiscount = Number(voucher.value);
                    }

                    // Kiểm tra đơn tối thiểu
                    if (totalAmount >= (voucher.minOrderValue || 0)) {
                        discountAmount += voucherDiscount;
                        voucherId = voucher.id;

                        // Tăng lượt dùng voucher
                        await tx.voucher.update({
                            where: { id: voucher.id },
                            data: { usedCount: { increment: 1 } }
                        });
                    }
                }
            }

            // Đảm bảo không giảm quá tổng tiền
            if (discountAmount > totalAmount) discountAmount = totalAmount;
            const finalAmount = totalAmount - discountAmount;
            const code = `HD-${Date.now()}`;

            // 3. Tạo Invoice
            const invoice = await tx.invoice.create({
                data: {
                    code,
                    staffId: userId,
                    customerId: customerId ? parseInt(customerId) : null,
                    workShiftId: shift.id,
                    voucherId,
                    totalAmount: finalAmount,
                    discountAmount,
                    paymentMethod,
                    status: 'COMPLETED',
                    source: 'POS',
                    items: {
                        create: invoiceItemsData
                    }
                }
            });

            // 4. Tạo Stock Logs (Gắn invoiceId)
            for (const log of stockLogData) {
                await tx.stockLog.create({
                    data: {
                        ...log,
                        invoiceId: invoice.id
                    }
                });
            }

            // 5. Tích điểm khách hàng
            if (customerId) {
                const pointsEarned = Math.floor(finalAmount / 10000); // 10k = 1 điểm
                await tx.customer.update({
                    where: { id: parseInt(customerId) },
                    data: { points: { increment: pointsEarned } }
                });
            }

            return invoice;
        })
    }

    //Return
    async returnInvoice(userId, data){
        const {invoiceId, reason, items} = data;

        return prisma.$transaction(async (tx) => {
            let refundTotal = 0;

            // Tạo ReturnInvoice trước với refundAmount = 0
            const refundInv = await tx.returnInvoice.create({
                data: {
                    invoiceId: parseInt(invoiceId),
                    refundAmount: 0,
                    reason
                }
            });

            for(const item of items){
                const originalItem = await tx.invoiceItem.findFirst({
                    where: {
                        invoiceId: parseInt(invoiceId),
                        productId: item.productId
                    }
                });
                
                if(!originalItem){
                    throw new ApiError(400, `Sản phẩm ID ${item.productId} không có trong hóa đơn gốc.`);
                }

                // Kiểm tra số lượng trả không được lớn hơn số lượng mua
                if (item.quantity > originalItem.quantity) {
                    throw new ApiError(400, `Số lượng trả của sản phẩm ID ${item.productId} vượt quá số lượng mua.`);
                }

                const refundPrice = Number(originalItem.unitPrice) * item.quantity;
                refundTotal += refundPrice;

                await tx.returnItem.create({
                    data:{
                        returnInvoiceId: refundInv.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        isRestocked: item.isRestocked
                    }
                })

                let changeType = 'DAMAGE'; // Mặc định là hàng hỏng (không nhập lại kho bán)
                let currentStock = 0;

                const product = await tx.product.findUnique({ where: { id: item.productId } });
                currentStock = product.stockQuantity;

                if (item.isRestocked) {
                    // Nếu hàng còn tốt -> Cộng lại vào kho bán
                    changeType = 'RETURN';
                    currentStock += item.quantity;

                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stockQuantity: { increment: item.quantity } }
                    });
                }

                // Ghi Log
                await tx.stockLog.create({
                    data: {
                        productId: item.productId,
                        staffId: userId,
                        changeType,
                        changeQuantity: item.isRestocked ? item.quantity : 0, 
                        currentStock,
                        returnInvoiceId: refundInv.id,
                        note: `Khách trả hàng: ${reason}`
                    }
                });
            }
            
            // Update tổng tiền hoàn
            await tx.returnInvoice.update({
                where: { id: refundInv.id },
                data: { refundAmount: refundTotal }
            });

            // Trừ điểm khách hàng (Rollback points)
            const invoice = await tx.invoice.findUnique({ where: { id: parseInt(invoiceId) } });
            if (invoice.customerId) {
                const pointsRollback = Math.floor(refundTotal / 10000);
                // Đảm bảo không trừ âm điểm (tùy chính sách)
                await tx.customer.update({
                    where: { id: invoice.customerId },
                    data: { points: { decrement: pointsRollback } }
                });
            }
            return refundInv;
        })
    }
}
