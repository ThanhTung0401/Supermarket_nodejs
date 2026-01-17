import ApiError from '../utils/ApiError.js';

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user được gán từ middleware 'protect'
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Bạn không có quyền thực hiện hành động này.'));
        }
        next();
    };
};