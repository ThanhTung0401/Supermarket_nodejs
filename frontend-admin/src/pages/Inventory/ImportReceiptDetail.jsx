import React from 'react';
import './ImportReceiptDetail.css';

const ImportReceiptDetail = ({ receipt, onClose }) => {
    if (!receipt) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content detail-modal">
                <div className="modal-header">
                    <h3>Chi tiết Phiếu nhập: {receipt.code}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {/* Thông tin chung */}
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Nhà cung cấp:</label>
                            <span>{receipt.supplier?.name}</span>
                        </div>
                        <div className="info-item">
                            <label>Người nhập:</label>
                            <span>{receipt.staff?.fullName}</span>
                        </div>
                        <div className="info-item">
                            <label>Ngày nhập:</label>
                            <span>{new Date(receipt.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                            <label>Tổng tiền:</label>
                            <span className="highlight-price">{Number(receipt.totalCost).toLocaleString()} đ</span>
                        </div>
                        <div className="info-item full-width">
                            <label>Ghi chú:</label>
                            <span>{receipt.note || 'Không có'}</span>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <h4>Danh sách sản phẩm</h4>
                    <div className="table-container">
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Sản phẩm</th>
                                    <th>Đơn vị</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipt.details?.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="product-info">
                                                <span className="product-name">{item.product?.name}</span>
                                                <span className="product-barcode">{item.product?.barcode}</span>
                                            </div>
                                        </td>
                                        <td>{item.product?.unit}</td>
                                        <td>{item.quantity}</td>
                                        <td>{Number(item.unitCost).toLocaleString()}</td>
                                        <td>{Number(item.totalCost).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Đóng</button>
                    <button className="btn-print" onClick={() => window.print()}>In phiếu</button>
                </div>
            </div>
        </div>
    );
};

export default ImportReceiptDetail;