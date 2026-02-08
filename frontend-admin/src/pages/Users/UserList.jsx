import React, { useState, useEffect } from 'react';
import userApi from '../../api/userApi';
import './UserList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Form Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'CASHIER'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll({ search: searchTerm });
            if (res?.status === 'success') {
                // Backend trả về { status: 'success', data: { users: [...] } }
                setUsers(res.data.users || []);
            }
        } catch (error) {
            console.error("Lỗi tải nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAdd = () => {
        setCurrentUser(null);
        setFormData({ fullName: '', email: '', password: '', phone: '', role: 'CASHIER' });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '', // Không hiện password cũ
            phone: user.phone || '',
            role: user.role
        });
        setShowModal(true);
    };

    const handleToggleActive = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn khóa/mở khóa tài khoản này?')) {
            try {
                await userApi.toggleActive(id);
                fetchUsers();
            } catch (err) {
                alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('CẢNH BÁO: Xóa nhân viên sẽ xóa vĩnh viễn. Bạn nên dùng chức năng Khóa tài khoản thay thế. Bạn vẫn muốn xóa?')) {
            try {
                await userApi.remove(id);
                fetchUsers();
                alert('Xóa thành công');
            } catch (err) {
                alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa.'));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                // Update (không gửi password nếu trống)
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                // Không cho sửa email (thường là định danh)
                delete payload.email; 
                
                await userApi.update(currentUser.id, payload);
            } else {
                // Create
                await userApi.create(formData);
            }
            fetchUsers();
            setShowModal(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="user-list-container">
            <div className="page-header">
                <h2>Quản lý Nhân viên</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm nhân viên</button>
            </div>

            <div className="toolbar">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm nhân viên..." 
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
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.id} className={!user.isActive ? 'row-inactive' : ''}>
                                        <td>{user.id}</td>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                                        </td>
                                        <td>
                                            {user.isActive ? 
                                                <span className="status-active">Hoạt động</span> : 
                                                <span className="status-inactive">Đã khóa</span>
                                            }
                                        </td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(user)}>Sửa</button>
                                            <button 
                                                className={`btn-action ${user.isActive ? 'lock' : 'unlock'}`} 
                                                onClick={() => handleToggleActive(user.id)}
                                            >
                                                {user.isActive ? 'Khóa' : 'Mở'}
                                            </button>
                                            {/* Nút xóa chỉ hiện cho Admin và không xóa chính mình */}
                                            <button className="btn-action delete" onClick={() => handleDelete(user.id)}>Xóa</button>
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
                            <h3>{currentUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Họ tên <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email <span style={{color:'red'}}>*</span></label>
                                    <input 
                                        type="email" name="email" 
                                        value={formData.email} onChange={handleChange} 
                                        required 
                                        disabled={!!currentUser} // Không cho sửa email
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu {currentUser && <small>(Để trống nếu không đổi)</small>}</label>
                                    <input 
                                        type="password" name="password" 
                                        value={formData.password} onChange={handleChange} 
                                        required={!currentUser} // Bắt buộc khi tạo mới
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Vai trò</label>
                                    <select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="CASHIER">Thu ngân (CASHIER)</option>
                                        <option value="WAREHOUSE">Thủ kho (WAREHOUSE)</option>
                                        <option value="MANAGER">Quản lý (MANAGER)</option>
                                        <option value="ADMIN">Quản trị viên (ADMIN)</option>
                                    </select>
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

export default UserList;