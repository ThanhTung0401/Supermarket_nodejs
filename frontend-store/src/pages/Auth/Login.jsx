import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authApi.login({ phone, password });
            if (res?.status === 'success') {
                // Backend trả về data: { user: ... } chứ không phải customer
                const userData = res.data.user || res.data.customer; 
                
                localStorage.setItem('customer_token', res.token);
                localStorage.setItem('customer_info', JSON.stringify(userData));
                
                alert('Đăng nhập thành công!');
                navigate('/'); 
                window.location.reload(); // Reload để Header cập nhật state user
            } else {
                setError('Đăng nhập thất bại');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Số điện thoại hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Đăng nhập</h2>
                <p>Chào mừng bạn quay trở lại!</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input 
                            type="text" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0901234567"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="auth-footer">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;