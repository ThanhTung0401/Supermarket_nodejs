import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

export class SalesService{

    //WORKSHIFT
    async starShift(userId, InitialCash){
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
        if(openShift){
            throw new ApiError(400,"Bạn vẫn còn một ca làm việc chưa kết thúc!")
        }

        const invoice = await prisma.invoice.findMany({
            where:{
                workShiftId: openShift.id,
                paymentMethod: "CASH",
                status: "COMPLETED"
            },
            select: {totalAmount: true}
        });

        const systemRevenue = invoice.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
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
                staffId: userId,
                endTime: null
            }
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
        const {items, customerid, voucherCode, paymentMethod} = data;

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

            for (const item of items){
                const product = await tx.product.findUnique({
                    where:{
                        id: item.productId
                    }
                })
                if(!product){
                    throw new ApiError(404, "Sản phẩm ID ${item.productId} không tồn tại!")
                }
                if(item.quantity > product.stockQuantity){
                    throw new ApiError(400,"Sản phẩm có ID ${item.productId} không đủ số lượng để bán!")
                }

            }
        })
    }
}