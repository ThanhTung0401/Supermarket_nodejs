import React, { useState, useEffect } from 'react';
import customerApi from '../../api/customerApi';
import CustomerDetail from './CustomerDetail'; // Import Modal chi tiết
import './CustomerList.css';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal Form (Thêm/Sửa)
    const [showFormModal, setShowFormModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

    // Modal Detail (Xem chi tiết)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await customerApi.getAll({ search: searchTerm });
            if (res?.status === 'success') {
                if (res.customers) {
                    setCustomers(res.customers);
                } else if (res.data && res.data.customers) {
                    setCustomers(res.data.customers);
                } else {
                    setCustomers([]);
                }
            }
        } catch (error) {
            console.error("Lỗi tải khách hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Logic Form ---
    const handleAdd = () => {
        setCurrentCustomer(null);
        setFormData({ name: '', phone: '', email: '', address: '' });
        setShowFormModal(true);
    };

    const handleEdit = (customer) => {
        setCurrentCustomer(customer);
        setFormData({
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || ''
        });
        setShowFormModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            try {
                await customerApi.remove(id);
                fetchCustomers();
                alert('Xóa thành công');
            } catch (err) {
                alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa khách hàng này (có thể do đã có lịch sử mua hàng).'));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCustomer) {
                await customerApi.update(currentCustomer.id, formData);
            } else {
                await customerApi.add(formData);
            }
            fetchCustomers();
            setShowFormModal(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Logic Detail ---
    const handleViewDetail = (customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
    };

    return (
        <div className="customer-list-container">
            <div className="page-header">
                <h2>Khách hàng</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm mới</button>
            </div>

            <div className="toolbar">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên hoặc SĐT..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Điểm tích lũy</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? (
                                customers.map(cus => (
                                    <tr key={cus.id}>
                                        <td>{cus.id}</td>
                                        <td 
                                            style={{cursor: 'pointer', color: '#6366f1', fontWeight: '500'}}
                                            onClick={() => handleViewDetail(cus)}
                                            title="Xem chi tiết"
                                        >
                                            {cus.name}
                                        </td>
                                        <td>{cus.phone}</td>
                                        <td>{cus.email}</td>
                                        <td>
                                            <span className="points-badge">{cus.points} điểm</span>
                                        </td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(cus)}>Sửa</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(cus.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>Không tìm thấy dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form (Thêm/Sửa) */}
            {showFormModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{currentCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}</h3>
                            <button className="close-btn" onClick={() => setShowFormModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tên khách hàng</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows="3"></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowFormModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail (Xem chi tiết) */}
            {showDetailModal && (
                <CustomerDetail 
                    customer={selectedCustomer} 
                    onClose={() => setShowDetailModal(false)} 
                />
            )}
        </div>
    );
};

export default CustomerList;