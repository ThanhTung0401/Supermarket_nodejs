export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
};