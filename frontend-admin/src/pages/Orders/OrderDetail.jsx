import React, { useState } from 'react';
import orderApi from '../../api/orderApi';
import './OrderDetail.css';

const OrderDetail = ({ order, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    if (!order) return null;

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang ${newStatus}?`)) return;
        
        setLoading(true);
        try {
            await orderApi.updateStatus(order.id, newStatus);
            alert("Cập nhật thành công!");
            onUpdate();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Cập nhật thất bại"));
        } finally {
            setLoading(false);
        }
    };

    // Logic hiển thị nút bấm dựa trên trạng thái hiện tại
    const renderActions = () => {
        switch (order.status) {
            case 'PENDING':
                return (
                    <>
                        <button className="btn-action confirm" onClick={() => handleUpdateStatus('CONFIRMED')}>Duyệt đơn</button>
                        <button className="btn-action cancel" onClick={() => handleUpdateStatus('CANCELLED')}>Hủy đơn</button>
                    </>
                );
            case 'CONFIRMED':
                return (
                    <>
                        <button className="btn-action ship" onClick={() => handleUpdateStatus('SHIPPING')}>Giao hàng</button>
                        <button className="btn-action cancel" onClick={() => handleUpdateStatus('CANCELLED')}>Hủy đơn</button>
                    </>
                );
            case 'SHIPPING':
                return (
                    <>
                        <button className="btn-action complete" onClick={() => handleUpdateStatus('COMPLETED')}>Hoàn thành</button>
                        <button className="btn-action cancel" onClick={() => handleUpdateStatus('CANCELLED')}>Hủy đơn</button>
                    </>
                );
            default:
                return null; // COMPLETED hoặc CANCELLED không có hành động tiếp theo
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content detail-modal">
                <div className="modal-header">
                    <h3>Đơn hàng #{order.code}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Thông tin khách hàng */}
                    <div className="info-section">
                        <h4>Thông tin khách hàng</h4>
                        <div className="info-grid">
                            <div><label>Tên:</label> {order.customer?.name}</div>
                            <div><label>SĐT:</label> {order.customer?.phone}</div>
                            <div className="full-width"><label>Địa chỉ:</label> {order.deliveryAddress || order.customer?.address}</div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="info-section">
                        <h4>Sản phẩm</h4>
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Đơn giá</th>
                                    <th>SL</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <img src={item.product?.imageUrl || 'https://via.placeholder.com/40'} alt="" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                                <span>{item.product?.name}</span>
                                            </div>
                                        </td>
                                        <td>{Number(item.unitPrice).toLocaleString()}</td>
                                        <td>{item.quantity}</td>
                                        <td>{Number(item.totalPrice).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{textAlign: 'right', fontWeight: 'bold'}}>Tổng tiền:</td>
                                    <td style={{fontWeight: 'bold', color: '#059669', fontSize: '1.1rem'}}>
                                        {Number(order.totalAmount).toLocaleString()} đ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="modal-footer">
                    {loading ? <span>Đang xử lý...</span> : renderActions()}
                    <button className="btn-cancel" onClick={onClose} style={{marginLeft: '10px'}}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;