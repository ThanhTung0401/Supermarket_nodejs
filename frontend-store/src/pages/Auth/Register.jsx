import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        email: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        setLoading(true);
        try {
            const { confirmPassword, ...dataToSend } = formData;
            const res = await authApi.register(dataToSend);
            
            if (res?.status === 'success') {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box" style={{maxWidth: '500px'}}>
                <h2>Đăng ký tài khoản</h2>
                <p>Tạo tài khoản để mua sắm dễ dàng hơn</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email (Tùy chọn)</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Địa chỉ giao hàng</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    
                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;