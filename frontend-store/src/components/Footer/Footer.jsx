import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="store-footer">
            <div className="container footer-content">
                {/* Cột 1: Thông tin Đồ án */}
                <div className="footer-col project-info">
                    <h3 className="footer-title">Đồ án Học phần</h3>
                    <h4 className="subject-name">Phân tích & Thiết kế Hệ thống</h4>
                    <p className="university">Đại học Sài Gòn (SGU)</p>
                    <p className="desc">
                        Hệ thống quản lý siêu thị mini với đầy đủ các module: 
                        Bán hàng, Kho, Nhân sự, Khách hàng và Báo cáo.
                    </p>
                </div>

                {/* Cột 2: Liên kết */}
                <div className="footer-col links">
                    <h3 className="footer-title">Liên kết</h3>
                    <ul>
                        <li><a href="/">Trang chủ</a></li>
                        <li><a href="/cart">Giỏ hàng</a></li>
                        <li><a href="/profile">Tra cứu đơn hàng</a></li>
                        <li><a href="/login">Đăng nhập thành viên</a></li>
                    </ul>
                </div>

                {/* Cột 3: Nhóm thực hiện */}
                <div className="footer-col contact">
                    <h3 className="footer-title">Nhóm thực hiện</h3>
                    <p><strong>GV:</strong> ThS. Phan Nguyệt Minh</p>
                    <p><strong>Sinh viên:</strong></p>
                    <ul className="student-list">
                        <li>Trần Tô Thanh Tùng - 3124560096</li>
                        <li>Lương Kiện Minh - 3124560069</li>
                        <li>Nguyễn Minh Tú - 3124560094</li>
                        <li>Đoàn Huỳnh Đăng Khoa - 3124560041</li>
                        <li>Nguyễn Hữu Thắng - 3124560084</li>

                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; 2026 Supermarket System - SGU Project. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;