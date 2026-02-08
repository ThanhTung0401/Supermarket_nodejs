import React, { useState, useEffect } from 'react';
import orderApi from '../../api/orderApi';
import OrderDetail from './OrderDetail';
import { formatCurrency, formatDate } from '../../utils/format'; // Import helper
import './OrderList.css';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter === 'ALL' ? undefined : statusFilter
            };
            const res = await orderApi.getAll(params);
            
            if (res?.status === 'success') {
                setOrders(res.orders || []);
                setPagination({
                    page: res.page || 1,
                    limit: 10,
                    total: res.total || 0
                });
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, pagination.page]);

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await orderApi.get(id);
            if (res?.status === 'success') {
                setSelectedOrder(res.data.order);
                setShowModal(true);
            }
        } catch (error) {
            alert("Không thể tải chi tiết đơn hàng");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const handleUpdateSuccess = () => {
        fetchOrders();
        setShowModal(false);
    };

    const renderStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Chờ duyệt' },
            CONFIRMED: { bg: '#dbeafe', color: '#2563eb', label: 'Đã duyệt' },
            SHIPPING: { bg: '#e0e7ff', color: '#4f46e5', label: 'Đang giao' },
            COMPLETED: { bg: '#d1fae5', color: '#059669', label: 'Hoàn thành' },
            CANCELLED: { bg: '#fee2e2', color: '#dc2626', label: 'Đã hủy' }
        };
        const style = styles[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
        
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 500
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div className="order-list-container">
            <div className="page-header">
                <h2>Quản lý Đơn hàng</h2>
            </div>

            <div className="tabs">
                {['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'ALL'].map(status => (
                    <button 
                        key={status}
                        className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => handleStatusChange(status)}
                    >
                        {status === 'ALL' ? 'Tất cả' : renderStatusBadge(status)}
                    </button>
                ))}
            </div>

            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>SĐT</th>
                                <th>Tổng tiền</th>
                                <th>Ngày đặt</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.code}</td>
                                    <td>{order.customer?.name || 'Khách lẻ'}</td>
                                    <td>{order.customer?.phone}</td>
                                    <td style={{fontWeight: 'bold'}}>{formatCurrency(order.totalAmount)}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>{renderStatusBadge(order.status)}</td>
                                    <td>
                                        <button className="btn-view" onClick={() => handleViewDetail(order.id)}>Chi tiết</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" style={{textAlign: 'center'}}>Không có đơn hàng nào</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="pagination">
                <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>Prev</button>
                <span>{pagination.page} / {Math.ceil(pagination.total / pagination.limit) || 1}</span>
                <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
            </div>

            {showModal && (
                <OrderDetail 
                    order={selectedOrder} 
                    onClose={handleCloseModal} 
                    onUpdate={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default OrderList;