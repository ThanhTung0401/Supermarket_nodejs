import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/products', label: 'Sản phẩm', icon: '📦' },
        { path: '/categories', label: 'Danh mục', icon: '🏷️' }, // Thêm mục Danh mục
        { path: '/orders', label: 'Đơn hàng', icon: '🚚' },
        { path: '/customers', label: 'Khách hàng', icon: '👥' },
        { path: '/users', label: 'Nhân viên', icon: '🧑‍💼' },
        { path: '/inventory', label: 'Kho hàng', icon: '🏭' },
        { path: '/reports', label: 'Báo cáo', icon: '📈' },
    ];

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Supermarket</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <button 
                                    className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                >
                                    <span className="icon">{item.icon}</span>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Area */}
            <div className="main-area">
                {/* Header */}
                <header className="top-header">
                    <div className="header-left">
                        <h3>Quản trị hệ thống</h3>
                    </div>
                    <div className="header-right">
                        <span className="user-name">Xin chào, <strong>{user.fullName || 'Admin'}</strong></span>
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </header>

                {/* Content */}
                <main className="content-wrapper">
                    <Outlet /> {/* Nơi render các trang con */}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;