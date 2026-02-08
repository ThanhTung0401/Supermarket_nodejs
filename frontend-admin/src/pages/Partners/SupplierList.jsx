import React, { useState, useEffect } from 'react';
import partnerApi from '../../api/partnerApi';
import './SupplierList.css';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await partnerApi.getAll({ search: searchTerm });
            if (res?.status === 'success') {
                setSuppliers(res.data.suppliers || []);
            }
        } catch (error) {
            console.error("Lỗi tải nhà cung cấp:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchSuppliers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAdd = () => {
        setCurrentSupplier(null);
        setFormData({ name: '', phone: '', email: '', address: '' });
        setShowModal(true);
    };

    const handleEdit = (supplier) => {
        setCurrentSupplier(supplier);
        setFormData({
            name: supplier.name,
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
            try {
                await partnerApi.remove(id);
                fetchSuppliers();
                alert('Xóa thành công');
            } catch (err) {
                alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa.'));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentSupplier) {
                await partnerApi.update(currentSupplier.id, formData);
            } else {
                await partnerApi.add(formData);
            }
            fetchSuppliers();
            setShowModal(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="supplier-list-container">
            <div className="page-header">
                <h2>Nhà cung cấp</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm mới</button>
            </div>

            <div className="toolbar">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm nhà cung cấp..." 
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
                                <th>Tên nhà cung cấp</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Địa chỉ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length > 0 ? (
                                suppliers.map(sup => (
                                    <tr key={sup.id}>
                                        <td>{sup.id}</td>
                                        <td>{sup.name}</td>
                                        <td>{sup.phone}</td>
                                        <td>{sup.email}</td>
                                        <td>{sup.address}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(sup)}>Sửa</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(sup.id)}>Xóa</button>
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

            {/* Modal Form */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{currentSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tên nhà cung cấp <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
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

export default SupplierList;