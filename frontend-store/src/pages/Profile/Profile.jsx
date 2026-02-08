import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storeApi from '../../api/storeApi';
import authApi from '../../api/authApi'; // Import authApi để lấy info user mới nhất
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('customer_info') || 'null'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Lấy thông tin user mới nhất (để cập nhật điểm)
                const userRes = await authApi.getMe();
                if (userRes?.status === 'success') {
                    setUser(userRes.data);
                    // Cập nhật lại localStorage
                    localStorage.setItem('customer_info', JSON.stringify(userRes.data));
                }

                // 2. Lấy lịch sử đơn hàng
                const orderRes = await storeApi.getMyOrders();
                console.log("My Orders Response:", orderRes);

                if (orderRes?.status === 'success') {
                    if (Array.isArray(orderRes.data)) {
                        setOrders(orderRes.data);
                    } else {
                        setOrders([]);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="container profile-container">
            <div className="profile-header">
                <div className="avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                    <h2>{user.name}</h2>
                    <p>SĐT: {user.phone}</p>
                    <p>Điểm tích lũy: <span className="points">{user.points || 0} điểm</span></p>
                </div>
            </div>

            <div className="order-history">
                <h3>Lịch sử đơn hàng</h3>
                
                {loading ? <p>Đang tải...</p> : (
                    orders.length > 0 ? (
                        <div className="order-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-code">#{order.code}</span>
                                        <span className={`order-status ${order.status}`}>{order.status}</span>
                                    </div>
                                    <div className="order-date">
                                        Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <span>{item.product?.name} x {item.quantity}</span>
                                                <span>{Number(item.unitPrice * item.quantity).toLocaleString()} đ</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-footer">
                                        <span>Tổng tiền:</span>
                                        <span className="order-total">{Number(order.totalAmount).toLocaleString()} đ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text">Bạn chưa có đơn hàng nào.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default Profile;