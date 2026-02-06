import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Login.css'; // Tạo file CSS riêng nếu cần

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login({ email, password });
            
            // Backend trả về: { status: 'success', token: '...', data: { user: {...} } }
            if (response.status === 'success') {
                localStorage.setItem('access_token', response.token);
                localStorage.setItem('user_info', JSON.stringify(response.data.user));
                
                // Chuyển hướng dựa trên role (nếu cần)
                navigate('/dashboard');
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error("Login error:", err);
            // Lấy message lỗi từ backend nếu có
            const message = err.response?.data?.message || 'Email hoặc mật khẩu không đúng!';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Supermarket Admin</h2>
                <p>Đăng nhập hệ thống quản lý</p>
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
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

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;