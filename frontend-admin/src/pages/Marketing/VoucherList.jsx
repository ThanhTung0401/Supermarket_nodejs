import React, { useState, useEffect } from 'react';
import voucherApi from '../../api/voucherApi';
import './VoucherList.css';

const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentVoucher, setCurrentVoucher] = useState(null);
    
    // Form Data
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE', // PERCENTAGE, FIXED_AMOUNT
        value: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        startDate: '',
        endDate: '',
        isActive: true
    });

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await voucherApi.getAll();
            if (res?.status === 'success') {
                setVouchers(res.data.vouchers || []);
            }
        } catch (error) {
            console.error("Lỗi tải voucher:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleAdd = () => {
        setCurrentVoucher(null);
        setFormData({
            code: '',
            type: 'PERCENTAGE',
            value: 0,
            minOrderValue: 0,
            maxDiscount: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            isActive: true
        });
        setShowModal(true);
    };

    const handleEdit = (voucher) => {
        setCurrentVoucher(voucher);
        setFormData({
            code: voucher.code,
            type: voucher.type,
            value: voucher.value,
            minOrderValue: voucher.minOrderValue || 0,
            maxDiscount: voucher.maxDiscount || 0,
            startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '',
            endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',
            isActive: voucher.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
            try {
                await voucherApi.delete(id);
                fetchVouchers();
                alert('Xóa thành công');
            } catch (err) {
                alert('Lỗi xóa voucher');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                minOrderValue: Number(formData.minOrderValue),
                maxDiscount: Number(formData.maxDiscount),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString()
            };

            if (currentVoucher) {
                await voucherApi.update(currentVoucher.id, payload);
            } else {
                await voucherApi.create(payload);
            }
            fetchVouchers();
            setShowModal(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="voucher-list-container">
            <div className="page-header">
                <h2>Quản lý Voucher</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm Voucher</button>
            </div>

            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                                <th>Đơn tối thiểu</th>
                                <th>Hạn dùng</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.length > 0 ? (
                                vouchers.map(v => (
                                    <tr key={v.id}>
                                        <td style={{fontWeight: 'bold', color: '#4f46e5'}}>{v.code}</td>
                                        <td>{v.type === 'PERCENTAGE' ? 'Phần trăm' : 'Tiền mặt'}</td>
                                        <td>
                                            {v.type === 'PERCENTAGE' ? `${v.value}%` : `${Number(v.value).toLocaleString()} đ`}
                                        </td>
                                        <td>{Number(v.minOrderValue).toLocaleString()} đ</td>
                                        <td>{new Date(v.endDate).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`status-badge ${v.isActive ? 'active' : 'inactive'}`}>
                                                {v.isActive ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(v)}>Sửa</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(v.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{textAlign: 'center'}}>Chưa có voucher nào</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{currentVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Mã Voucher <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="VD: SALE50" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Loại giảm giá</label>
                                        <select name="type" value={formData.type} onChange={handleChange}>
                                            <option value="PERCENTAGE">Phần trăm (%)</option>
                                            <option value="FIXED_AMOUNT">Số tiền cố định</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Giá trị <span style={{color:'red'}}>*</span></label>
                                        <input type="number" name="value" value={formData.value} onChange={handleChange} required min="0" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Đơn tối thiểu</label>
                                        <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Giảm tối đa (nếu là %)</label>
                                        <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} min="0" disabled={formData.type !== 'PERCENTAGE'} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ngày bắt đầu</label>
                                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày kết thúc</label>
                                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                                        Kích hoạt ngay
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherList;