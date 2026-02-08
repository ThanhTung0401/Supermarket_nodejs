import React, { useState, useEffect } from 'react';
import customerApi from '../../api/customerApi';
import './CustomerDetail.css';

const CustomerDetail = ({ customer, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!customer?.id) return;
            setLoading(true);
            try {
                const res = await customerApi.getHistory(customer.id);
                if (res?.status === 'success') {
                    setHistory(res.data || []);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [customer]);

    if (!customer) return null;

    const totalSpent = history.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalOrders = history.length;
    const calculatePoints = (amount) => Math.floor(Number(amount) / 10000);

    return (
        <div className="modal-overlay">
            <div className="modal-content detail-modal-wide">
                <div className="modal-header">
                    <h3>Hồ sơ khách hàng</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="detail-layout">
                        {/* Top Section: Thông tin & Thống kê */}
                        <div className="left-column">
                            <div className="profile-card">
                                <div className="avatar-large">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-details">
                                    <h2 className="profile-name">{customer.name}</h2>
                                    <p className="profile-role">Khách hàng thân thiết</p>
                                    <div className="profile-info-list">
                                        <div className="info-row">
                                            <span className="label">SĐT:</span>
                                            <span className="value">{customer.phone}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Email:</span>
                                            <span className="value">{customer.email || '---'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Địa chỉ:</span>
                                            <span className="value">{customer.address || '---'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="stats-summary">
                                <div className="stat-box">
                                    <span className="stat-title">Điểm tích lũy</span>
                                    <span className="stat-number highlight">{customer.points}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-title">Tổng chi tiêu</span>
                                    <span className="stat-number">{totalSpent.toLocaleString()} đ</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-title">Đơn hàng</span>
                                    <span className="stat-number">{totalOrders}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Lịch sử mua hàng */}
                        <div className="right-column">
                            <h4 className="section-heading">Lịch sử mua hàng</h4>
                            <div className="history-table-wrapper">
                                {loading ? <p className="loading-text">Đang tải dữ liệu...</p> : (
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày mua</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Điểm</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.length > 0 ? (
                                                history.map(inv => (
                                                    <tr key={inv.id}>
                                                        <td className="order-code">#{inv.code}</td>
                                                        <td>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                                                        <td>
                                                            <span className={`status-badge ${inv.status}`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                        <td className="amount">
                                                            {Number(inv.totalAmount).toLocaleString()} đ
                                                        </td>
                                                        <td className="points">
                                                            +{calculatePoints(inv.totalAmount)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" className="empty-text">Chưa có đơn hàng nào</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;