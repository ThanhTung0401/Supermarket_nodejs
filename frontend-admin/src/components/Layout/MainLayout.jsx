import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    const role = user.role || 'GUEST';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const allMenuItems = [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: '📊',
            roles: ['ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER']
        },
        {
            path: '/sales/shifts',
            label: 'Ca làm việc',
            icon: '⏱️',
            roles: ['ADMIN', 'MANAGER', 'CASHIER']
        },
        {
            path: '/products',
            label: 'Sản phẩm',
            icon: '📦',
            roles: ['ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER']
        },
        {
            path: '/categories',
            label: 'Danh mục',
            icon: '🏷️',
            roles: ['ADMIN', 'MANAGER', 'WAREHOUSE']
        },
        {
            path: '/suppliers',
            label: 'Nhà cung cấp',
            icon: '🤝',
            roles: ['ADMIN', 'MANAGER', 'WAREHOUSE']
        },
        {
            path: '/inventory',
            label: 'Kho hàng',
            icon: '🏭',
            roles: ['ADMIN', 'MANAGER', 'WAREHOUSE']
        },
        {
            path: '/orders',
            label: 'Đơn hàng',
            icon: '🚚',
            roles: ['ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER']
        },
        {
            path: '/customers',
            label: 'Khách hàng',
            icon: '👥',
            roles: ['ADMIN', 'MANAGER', 'CASHIER']
        },
        {
            path: '/marketing/vouchers',
            label: 'Khuyến mãi',
            icon: '🎁',
            roles: ['ADMIN', 'MANAGER']
        },
        {
            path: '/users',
            label: 'Nhân viên',
            icon: '🧑‍💼',
            roles: ['ADMIN', 'MANAGER']
        }
        // Đã xóa mục Báo cáo
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(role));

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Fresh Nodejs Mart</h2>
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

            <div className="main-area">
                <header className="top-header">
                    <div className="header-left">
                        <h3>Quản trị hệ thống</h3>
                    </div>
                    <div className="header-right">
                        <span className="user-name">
                            Xin chào, <strong>{user.fullName || 'User'}</strong> 
                            <span className="role-tag">({role})</span>
                        </span>
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </header>

                <main className="content-wrapper">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;