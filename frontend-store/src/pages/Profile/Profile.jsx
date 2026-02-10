import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storeApi from '../../api/storeApi';
import authApi from '../../api/authApi';
import './Profile.css';

// Định nghĩa Rank (Bỏ icon)
const RANKS = {
    BRONZE: { name: 'Đồng', minPoints: 0, color: '#CD7F32' },
    SILVER: { name: 'Bạc', minPoints: 100, color: '#C0C0C0' },
    GOLD: { name: 'Vàng', minPoints: 500, color: '#FFD700' },
    PLATINUM: { name: 'Bạch Kim', minPoints: 1000, color: '#E5E4E2' },
    EMERALD: { name: 'Lục Bảo', minPoints: 2000, color: '#50C878' },
    RUBY: { name: 'Ruby', minPoints: 5000, color: '#E0115F' },
    DIAMOND: { name: 'Kim Cương', minPoints: 10000, color: '#B9F2FF' }
};

const getRankInfo = (points) => {
    const ranks = Object.values(RANKS).sort((a, b) => b.minPoints - a.minPoints);
    const currentRank = ranks.find(rank => points >= rank.minPoints) || RANKS.BRONZE;
    const ranksAsc = Object.values(RANKS).sort((a, b) => a.minPoints - b.minPoints);
    const nextRank = ranksAsc.find(rank => rank.minPoints > points);
    return { currentRank, nextRank };
};

const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="order-card">
            <div className="order-header" onClick={toggleExpand}>
                <div className="order-summary-left">
                    <span className="order-code">#{order.code}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="order-summary-right">
                    <span className="order-total">{Number(order.totalAmount).toLocaleString()} đ</span>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                    <span className={`expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                </div>
            </div>
            {isExpanded && (
                <div className="order-details">
                    <div className="order-items-list">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                                <div className="item-info">
                                    <img src={item.product?.imageUrl || 'https://via.placeholder.com/50'} alt={item.product?.name} className="item-thumb" />
                                    <div className="item-text">
                                        <span className="item-name">{item.product?.name}</span>
                                        <span className="item-meta">x {item.quantity}</span>
                                    </div>
                                </div>
                                <span className="item-price">{Number(item.unitPrice * item.quantity).toLocaleString()} đ</span>
                            </div>
                        ))}
                    </div>
                    <div className="order-footer-info">
                        <div className="info-row"><span>PTTT:</span><span>{order.paymentMethod}</span></div>
                        <div className="info-row"><span>Địa chỉ:</span><span>{order.deliveryAddress}</span></div>
                        {order.discountAmount > 0 && (
                            <div className="info-row discount"><span>Giảm giá:</span><span>-{Number(order.discountAmount).toLocaleString()} đ</span></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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
                const userRes = await authApi.getMe();
                if (userRes?.status === 'success') {
                    setUser(userRes.data);
                    localStorage.setItem('customer_info', JSON.stringify(userRes.data));
                }
                const orderRes = await storeApi.getMyOrders();
                if (orderRes?.status === 'success') {
                    setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
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

    const { currentRank, nextRank } = getRankInfo(user.points || 0);
    let progress = 100;
    if (nextRank) {
        const pointsNeeded = nextRank.minPoints - currentRank.minPoints;
        const pointsEarned = user.points - currentRank.minPoints;
        progress = (pointsEarned / pointsNeeded) * 100;
    }

    return (
        <div className="container profile-container">
            <div className="rank-card" style={{ background: `linear-gradient(135deg, ${currentRank.color}, #333)` }}>
                <div className="rank-header">
                    {/* Thay icon bằng Avatar chữ cái */}
                    <div className="user-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="rank-info">
                        <h2>{user.name}</h2>
                        <p className="rank-name">Thành viên {currentRank.name}</p>
                    </div>
                    <div className="rank-points">
                        <span>{user.points || 0}</span>
                        <small>điểm</small>
                    </div>
                </div>
                
                <div className="rank-progress-container">
                    <div className="progress-labels">
                        <span>{currentRank.name}</span>
                        {nextRank && <span>{nextRank.name} ({nextRank.minPoints} điểm)</span>}
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: nextRank ? nextRank.color : '#fff' }}></div>
                    </div>
                    {nextRank ? (
                        <p className="rank-message">Bạn cần thêm <strong>{nextRank.minPoints - user.points}</strong> điểm để thăng hạng {nextRank.name}!</p>
                    ) : (
                        <p className="rank-message">Chúc mừng! Bạn đã đạt cấp bậc cao nhất!</p>
                    )}
                </div>
            </div>

            <div className="order-history">
                <h3>Lịch sử đơn hàng ({orders.length})</h3>
                {loading ? <p className="loading-text">Đang tải...</p> : (
                    orders.length > 0 ? (
                        <div className="order-list">
                            {orders.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Bạn chưa có đơn hàng nào.</p>
                            <button onClick={() => navigate('/')} className="btn-shop-now">Mua sắm ngay</button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Profile;