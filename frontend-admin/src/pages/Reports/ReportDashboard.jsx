import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import reportApi from '../../api/reportApi';
import './ReportDashboard.css';

const ReportDashboard = () => {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartRes, topRes, lowRes] = await Promise.all([
                    reportApi.getDashboardStats(),
                    reportApi.getRevenueChart(),
                    reportApi.getTopSelling(),
                    reportApi.getLowStock()
                ]);

                if (statsRes?.status === 'success') setStats(statsRes.data);
                if (chartRes?.status === 'success') setRevenueData(chartRes.data);
                if (topRes?.status === 'success') setTopSelling(topRes.data);
                if (lowRes?.status === 'success') setLowStock(lowRes.data);
            } catch (error) {
                console.error("Lỗi tải báo cáo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loading">Đang tải báo cáo...</div>;

    // Màu cho biểu đồ tròn
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
                <h3>Biểu đồ doanh thu 7 ngày gần nhất</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => Number(value).toLocaleString() + ' đ'} />
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