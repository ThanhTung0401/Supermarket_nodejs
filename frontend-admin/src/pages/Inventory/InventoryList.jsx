import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryApi from '../../api/inventoryApi';
import ImportReceiptDetail from './ImportReceiptDetail'; // Import Modal
import './InventoryList.css';

const InventoryList = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('status');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    // State cho Modal chi tiết
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm
            };

            if (activeTab === 'status') {
                res = await inventoryApi.getStockStatus(params);
            } else if (activeTab === 'import') {
                res = await inventoryApi.getImportReceipts({ ...params, fromDate: null, toDate: null });
            } else if (activeTab === 'logs') {
                res = await inventoryApi.getStockLogs(params);
            }

            if (res && (res.items || res.data?.items)) {
                setData(res.items || res.data?.items || []);
                setPagination(res.pagination || res.data?.pagination || { page: 1, limit: 10, total: 0 });
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu kho:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, pagination.page, searchTerm]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPagination({ page: 1, limit: 10, total: 0 });
        setSearchTerm('');
        setData([]);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Xem chi tiết phiếu nhập
    const handleViewDetail = async (id) => {
        try {
            const res = await inventoryApi.getImportReceiptDetail(id);
            // Backend trả về trực tiếp object receipt hoặc bọc trong data
            // inventory.controller.js: res.json(result) -> result là object receipt
            if (res) {
                setSelectedReceipt(res);
                setShowDetailModal(true);
            }
        } catch (error) {
            alert("Không thể tải chi tiết phiếu nhập");
        }
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedReceipt(null);
    };

    return (
        <div className="inventory-container">
            <div className="page-header">
                <h2>Quản lý Kho hàng</h2>
                {activeTab === 'import' && (
                    <button className="btn-add" onClick={() => navigate('/inventory/import/new')}>
                        + Tạo phiếu nhập
                    </button>
                )}
            </div>

            <div className="tabs">
                <button 
                    className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
                    onClick={() => handleTabChange('status')}
                >
                    Tồn kho hiện tại
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
                    onClick={() => handleTabChange('import')}
                >
                    Lịch sử nhập hàng
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => handleTabChange('logs')}
                >
                    Nhật ký biến động
                </button>
            </div>

            <div className="toolbar">
                <input 
                    type="text" 
                    placeholder={activeTab === 'status' ? "Tìm sản phẩm..." : "Tìm kiếm..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            {activeTab === 'status' && (
                                <tr>
                                    <th>ID</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Barcode</th>
                                    <th>Danh mục</th>
                                    <th>Tồn kho</th>
                                    <th>Cảnh báo</th>
                                </tr>
                            )}
                            {activeTab === 'import' && (
                                <tr>
                                    <th>Mã phiếu</th>
                                    <th>Nhà cung cấp</th>
                                    <th>Người nhập</th>
                                    <th>Tổng tiền</th>
                                    <th>Ngày nhập</th>
                                    <th>Chi tiết</th>
                                </tr>
                            )}
                            {activeTab === 'logs' && (
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Sản phẩm</th>
                                    <th>Loại</th>
                                    <th>Số lượng</th>
                                    <th>Tồn sau đó</th>
                                    <th>Ghi chú</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map((item, index) => (
                                <tr key={index}>
                                    {activeTab === 'status' && (
                                        <>
                                            <td>{item.id}</td>
                                            <td>{item.name}</td>
                                            <td>{item.barcode}</td>
                                            <td>{item.category?.name}</td>
                                            <td>
                                                <span className={`stock-badge ${item.stockQuantity <= item.minStockLevel ? 'low' : 'good'}`}>
                                                    {item.stockQuantity} {item.unit}
                                                </span>
                                            </td>
                                            <td>{item.stockQuantity <= item.minStockLevel ? <span style={{color:'red'}}>Sắp hết</span> : '-'}</td>
                                        </>
                                    )}
                                    {activeTab === 'import' && (
                                        <>
                                            <td>{item.code}</td>
                                            <td>{item.supplier?.name}</td>
                                            <td>{item.staff?.fullName}</td>
                                            <td>{Number(item.totalCost).toLocaleString()} đ</td>
                                            <td>{new Date(item.createdAt).toLocaleString()}</td>
                                            <td>
                                                <button className="btn-view" onClick={() => handleViewDetail(item.id)}>Xem</button>
                                            </td>
                                        </>
                                    )}
                                    {activeTab === 'logs' && (
                                        <>
                                            <td>{new Date(item.createdAt).toLocaleString()}</td>
                                            <td>{item.product?.name}</td>
                                            <td>
                                                <span className={`log-type ${item.changeType}`}>
                                                    {item.changeType}
                                                </span>
                                            </td>
                                            <td style={{color: item.changeQuantity > 0 ? 'green' : 'red', fontWeight: 'bold'}}>
                                                {item.changeQuantity > 0 ? '+' : ''}{item.changeQuantity}
                                            </td>
                                            <td>{item.currentStock}</td>
                                            <td>{item.note}</td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
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

            {/* Modal Chi tiết */}
            {showDetailModal && (
                <ImportReceiptDetail 
                    receipt={selectedReceipt} 
                    onClose={handleCloseDetail} 
                />
            )}
        </div>
    );
};

export default InventoryList;