import jwt from 'jsonwebtoken';

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token hết hạn sau 1 ngày
    });
};

export const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.role);

    // Ẩn mật khẩu khi trả về client
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};