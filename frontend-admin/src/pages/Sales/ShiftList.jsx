import React, { useState, useEffect } from 'react';
import shiftApi from '../../api/shiftApi';
import './ShiftList.css';

const ShiftList = () => {
    const [shifts, setShifts] = useState([]);
    const [currentShift, setCurrentShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [initialCash, setInitialCash] = useState('');
    const [actualCash, setActualCash] = useState('');
    const [note, setNote] = useState('');

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const [allRes, currentRes] = await Promise.all([
                shiftApi.getAll(),
                shiftApi.getCurrent()
            ]);

            if (allRes?.status === 'success') setShifts(allRes.data || []);
            if (currentRes?.status === 'success') setCurrentShift(currentRes.data);
            else setCurrentShift(null); // Không có ca đang mở
        } catch (error) {
            console.error("Lỗi tải ca làm việc:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleStartShift = async (e) => {
        e.preventDefault();
        try {
            await shiftApi.start({ initialCash: Number(initialCash) });
            alert("Mở ca thành công!");
            setShowStartModal(false);
            fetchShifts();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Không thể mở ca"));
        }
    };

    const handleEndShift = async (e) => {
        e.preventDefault();
        try {
            await shiftApi.end({ 
                actualCash: Number(actualCash),
                note 
            });
            alert("Kết ca thành công!");
            setShowEndModal(false);
            fetchShifts();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Không thể kết ca"));
        }
    };

    return (
        <div className="shift-list-container">
            <div className="page-header">
                <h2>Quản lý Ca làm việc</h2>
                {!currentShift ? (
                    <button className="btn-add" onClick={() => setShowStartModal(true)}>Bắt đầu ca mới</button>
                ) : (
                    <button className="btn-end" onClick={() => setShowEndModal(true)}>Kết thúc ca hiện tại</button>
                )}
            </div>

            {/* Current Shift Info */}
            {currentShift && (
                <div className="current-shift-card">
                    <h3>Ca đang hoạt động</h3>
                    <div className="shift-info">
                        <p><strong>Bắt đầu:</strong> {new Date(currentShift.startTime).toLocaleString()}</p>
                        <p><strong>Tiền đầu ca:</strong> {Number(currentShift.initialCash).toLocaleString()} đ</p>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="table-container">
                <h3>Lịch sử ca làm việc</h3>
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                                <th>Tiền đầu ca</th>
                                <th>Doanh thu hệ thống</th>
                                <th>Tiền thực tế</th>
                                <th>Chênh lệch</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.length > 0 ? (
                                shifts.map(shift => (
                                    <tr key={shift.id}>
                                        <td>{shift.id}</td>
                                        <td>{new Date(shift.startTime).toLocaleString()}</td>
                                        <td>{shift.endTime ? new Date(shift.endTime).toLocaleString() : <span style={{color:'green'}}>Đang mở</span>}</td>
                                        <td>{Number(shift.initialCash).toLocaleString()}</td>
                                        <td>{shift.systemRevenue ? Number(shift.systemRevenue).toLocaleString() : '-'}</td>
                                        <td>{shift.actualCash ? Number(shift.actualCash).toLocaleString() : '-'}</td>
                                        <td style={{color: shift.difference < 0 ? 'red' : 'inherit'}}>
                                            {shift.difference ? Number(shift.difference).toLocaleString() : '-'}
                                        </td>
                                        <td>{shift.note}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" style={{textAlign: 'center'}}>Chưa có lịch sử ca</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Start Modal */}
            {showStartModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Bắt đầu ca làm việc</h3>
                            <button className="close-btn" onClick={() => setShowStartModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleStartShift}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tiền mặt đầu ca (VNĐ)</label>
                                    <input 
                                        type="number" 
                                        value={initialCash} 
                                        onChange={(e) => setInitialCash(e.target.value)} 
                                        required min="0"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowStartModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Bắt đầu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* End Modal */}
            {showEndModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Kết thúc ca làm việc</h3>
                            <button className="close-btn" onClick={() => setShowEndModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleEndShift}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tiền mặt thực tế trong két (VNĐ)</label>
                                    <input 
                                        type="number" 
                                        value={actualCash} 
                                        onChange={(e) => setActualCash(e.target.value)} 
                                        required min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea 
                                        value={note} 
                                        onChange={(e) => setNote(e.target.value)} 
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowEndModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Kết thúc</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftList;