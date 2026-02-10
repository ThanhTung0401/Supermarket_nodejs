import React, { useState, useEffect } from 'react';
import customerApi from '../../api/customerApi';
import CustomerDetail from './CustomerDetail';
import './CustomerList.css';

// Định nghĩa Rank (nên tách ra file constants dùng chung nếu có thể)
const RANKS = {
    BRONZE: { name: 'Đồng', color: '#CD7F32' },
    SILVER: { name: 'Bạc', color: '#C0C0C0' },
    GOLD: { name: 'Vàng', color: '#FFD700' },
    PLATINUM: { name: 'Bạch Kim', color: '#E5E4E2' },
    EMERALD: { name: 'Lục Bảo', color: '#50C878' },
    RUBY: { name: 'Ruby', color: '#E0115F' },
    DIAMOND: { name: 'Kim Cương', color: '#B9F2FF' }
};

const getRankByPoints = (points) => {
    // Logic này phải khớp với Backend
    if (points >= 10000) return 'DIAMOND';
    if (points >= 5000) return 'RUBY';
    if (points >= 2000) return 'EMERALD';
    if (points >= 1000) return 'PLATINUM';
    if (points >= 500) return 'GOLD';
    if (points >= 100) return 'SILVER';
    return 'BRONZE';
};

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRank, setSelectedRank] = useState(''); // Filter Rank
    
    const [showFormModal, setShowFormModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                rank: selectedRank || undefined
            };
            const res = await customerApi.getAll(params);
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
    }, [searchTerm, selectedRank]); // Thêm selectedRank vào dependency

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
                alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa khách hàng này.'));
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
                
                <select 
                    className="rank-select" 
                    value={selectedRank} 
                    onChange={(e) => setSelectedRank(e.target.value)}
                >
                    <option value="">Tất cả hạng</option>
                    {Object.entries(RANKS).map(([key, rank]) => (
                        <option key={key} value={key}>{rank.name}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Hạng thành viên</th>
                                <th>Điểm tích lũy</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? (
                                customers.map(cus => {
                                    const rankCode = getRankByPoints(cus.points);
                                    const rank = RANKS[rankCode];
                                    return (
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
                                            <td>
                                                <span 
                                                    className="rank-badge"
                                                    style={{
                                                        backgroundColor: rank.color + '20', // Thêm độ trong suốt
                                                        color: rank.color === '#E5E4E2' ? '#333' : rank.color, // Xử lý màu bạch kim hơi sáng
                                                        border: `1px solid ${rank.color}`
                                                    }}
                                                >
                                                    {rank.name}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="points-badge">{cus.points} điểm</span>
                                            </td>
                                            <td>
                                                <button className="btn-action edit" onClick={() => handleEdit(cus)}>Sửa</button>
                                                <button className="btn-action delete" onClick={() => handleDelete(cus.id)}>Xóa</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>Không tìm thấy dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

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