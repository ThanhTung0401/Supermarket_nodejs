import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Tạo mới voucher
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createVoucher = async (data) => {
    const existing = await prisma.voucher.findUnique({
        where: { code: data.code }
    });
    if (existing) {
        throw new ApiError(400, 'Mã voucher đã tồn tại');
    }

    // Chuyển đổi chuỗi ngày tháng sang Date object
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Ngày bắt đầu hoặc ngày kết thúc không hợp lệ');
    }

    if (startDate >= endDate) {
        throw new ApiError(400, 'Ngày bắt đầu phải trước ngày kết thúc');
    }

    return await prisma.voucher.create({
        data: {
            code: data.code,
            type: data.type,
            value: data.value,
            minOrderValue: data.minOrderValue || null,
            maxDiscount: data.maxDiscount || null,
            startDate,
            endDate,
            isActive: data.isActive !== undefined ? data.isActive : true,
        }
    });
};

/**
 * Lấy danh sách vouchers với phân trang và lọc
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export const getAllVouchers = async (query) => {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
        where.code = { contains: search, mode: 'insensitive' };
    }
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }

    const [vouchers, total] = await Promise.all([
        prisma.voucher.findMany({
            where,
            skip: Number(skip),
            take: Number(limit),
            orderBy: { id: 'desc' }
        }),
        prisma.voucher.count({ where })
    ]);

    return {
        vouchers,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Lấy voucher theo ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getVoucherById = async (id) => {
    const voucher = await prisma.voucher.findUnique({ where: { id: Number(id) } });
    if (!voucher) throw new ApiError(404, 'Voucher không tồn tại');
    return voucher;
};

/**
 * Cập nhật voucher
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const updateVoucher = async (id, data) => {
    // Kiểm tra tồn tại
    await getVoucherById(id);

    if (data.code) {
        const existing = await prisma.voucher.findFirst({
            where: {
                code: data.code,
                id: { not: Number(id) }
            }
        });
        if (existing) throw new ApiError(400, 'Mã voucher đã tồn tại');
    }

    if (data.startDate && data.endDate) {
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            throw new ApiError(400, 'Ngày bắt đầu phải trước ngày kết thúc');
        }
    }

    // Prepare update data (convert dates if present)
    const updateData = { ...data };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    return await prisma.voucher.update({
        where: { id: Number(id) },
        data: updateData
    });
};

/**
 * Xóa voucher
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const deleteVoucher = async (id) => {
    const voucher = await getVoucherById(id);
    if (voucher.usedCount > 0) {
        throw new ApiError(400, 'Không thể xóa voucher đã được sử dụng. Hãy vô hiệu hóa nó.');
    }
    return await prisma.voucher.delete({ where: { id: Number(id) } });
};

/**
 * Kiểm tra voucher hợp lệ
 * @param {string} code
 * @param {number} orderValue
 * @returns {Promise<Object>}
 */
export const verifyVoucher = async (code, orderValue) => {
    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher) throw new ApiError(404, 'Mã voucher không hợp lệ');

    if (!voucher.isActive) throw new ApiError(400, 'Voucher đang bị khóa');

    const now = new Date();
    if (now < voucher.startDate) throw new ApiError(400, 'Voucher chưa đến thời gian hiệu lực');
    if (now > voucher.endDate) throw new ApiError(400, 'Voucher đã hết hạn');

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (voucher.minOrderValue && Number(orderValue) < Number(voucher.minOrderValue)) {
        throw new ApiError(400, `Đơn hàng tối thiểu để áp dụng là ${Number(voucher.minOrderValue).toLocaleString('vi-VN')} đ`);
    }

    // Tính toán giảm giá
    let discount = 0;
    if (voucher.type === 'FIXED_AMOUNT') {
        discount = Number(voucher.value);
    } else if (voucher.type === 'PERCENTAGE') {
        discount = (Number(orderValue) * Number(voucher.value)) / 100;
        if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
            discount = Number(voucher.maxDiscount);
        }
    }

    // Không để giảm giá lớn hơn giá trị đơn hàng
    if (discount > Number(orderValue)) {
        discount = Number(orderValue);
    }

    return {
        valid: true,
        discountAmount: discount,
        voucher
    };
}
