import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { totalItems } = useCart();
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State cho ô tìm kiếm

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('customer_info');
            if (storedUser && storedUser !== "undefined") {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Lỗi đọc user info:", e);
            localStorage.removeItem('customer_info');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        setUser(null);
        navigate('/login');
    };

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault(); // Ngăn reload form nếu dùng form
        if (searchTerm.trim()) {
            // Chuyển hướng về trang chủ với query param search
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            // Nếu rỗng thì về trang chủ mặc định
            navigate('/');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <header className="store-header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    FRESH NODEJS MART
                </Link>

                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm sản phẩm..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={handleSearch}>🔍</button>
                </div>

                <div className="header-actions">
                    <Link to="/cart" className="action-item action-item-cart">
                        🛒 Giỏ hàng
                        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </Link>
                    
                    {user ? (
                        <div className="user-menu">
                            <span>Chào, {user.name || user.fullName}</span>
                            <div className="dropdown">
                                <Link to="/profile">Đơn hàng của tôi</Link>
                                <button onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login">Đăng nhập</Link>
                            <span>/</span>
                            <Link to="/register">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;