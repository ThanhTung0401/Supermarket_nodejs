import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import reportApi from '../../api/reportApi';
import './ReportDashboard.css';

const ReportDashboard = () => {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi song song các API không phụ thuộc filter
                const [statsRes, topRes, lowRes] = await Promise.all([
                    reportApi.getDashboardStats(),
                    reportApi.getTopSelling(),
                    reportApi.getLowStock()
                ]);

                if (statsRes?.status === 'success') setStats(statsRes.data);
                if (topRes?.status === 'success') setTopSelling(topRes.data);
                if (lowRes?.status === 'success') setLowStock(lowRes.data);
            } catch (error) {
                console.error("Lỗi tải báo cáo chung:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Gọi API biểu đồ khi filter thay đổi
    useEffect(() => {
        const fetchChart = async () => {
            try {
                const chartRes = await reportApi.getRevenueChart({ 
                    month: selectedMonth, 
                    year: selectedYear 
                });
                if (chartRes?.status === 'success') setRevenueData(chartRes.data);
            } catch (error) {
                console.error("Lỗi tải biểu đồ:", error);
            }
        };
        fetchChart();
    }, [selectedMonth, selectedYear]);

    if (loading) return <div className="loading">Đang tải báo cáo...</div>;

    return (
        <div className="report-container">
            <h2>Báo cáo Thống kê</h2>

            {/* 1. Thẻ thống kê tổng quan */}
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <h3>Doanh thu hôm nay</h3>
                    <p>{stats?.todayRevenue?.toLocaleString()} đ</p>
                </div>
                <div className="stat-card revenue-month">
                    <h3>Doanh thu tháng này</h3>
                    <p>{stats?.monthRevenue?.toLocaleString()} đ</p>
                </div>
                <div className="stat-card orders">
                    <h3>Tổng đơn hàng</h3>
                    <p>{stats?.totalOrders}</p>
                </div>
                <div className="stat-card customers">
                    <h3>Khách hàng</h3>
                    <p>{stats?.totalCustomers}</p>
                </div>
            </div>

            {/* 2. Biểu đồ doanh thu */}
            <div className="chart-section">
                <div className="chart-header">
                    <h3>Biểu đồ doanh thu</h3>
                    <div className="chart-filters">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" label={{ value: 'Ngày', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)} />
                            <Tooltip formatter={(value) => Number(value).toLocaleString() + ' đ'} labelFormatter={(label) => `Ngày ${label}/${selectedMonth}/${selectedYear}`} />
                            <Legend />
                            <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bottom-grid">
                {/* 3. Top sản phẩm bán chạy */}
                <div className="section-card">
                    <h3>Top 5 Sản phẩm bán chạy</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đã bán</th>
                                <th>Tồn kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSelling.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td className="highlight">{item.sold}</td>
                                    <td>{item.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Sản phẩm sắp hết hàng */}
                <div className="section-card">
                    <h3>Cảnh báo sắp hết hàng</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Tồn kho</th>
                                <th>Mức tối thiểu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td className="danger">{item.stockQuantity}</td>
                                    <td>{item.minStockLevel}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;