import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import MainLayout from './components/Layout/MainLayout';
import ProductList from './pages/Products/ProductList';
import CategoryList from './pages/Categories/CategoryList';
import SupplierList from './pages/Partners/SupplierList';
import InventoryList from './pages/Inventory/InventoryList';
import ImportReceiptForm from './pages/Inventory/ImportReceiptForm';
import OrderList from './pages/Orders/OrderList';
import ReportDashboard from './pages/Reports/ReportDashboard';
import CustomerList from './pages/Customers/CustomerList';
import UserList from './pages/Users/UserList';
import VoucherList from './pages/Marketing/VoucherList';
import ShiftList from './pages/Sales/ShiftList';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

// Sử dụng ReportDashboard làm trang chủ Dashboard
const DashboardHome = ReportDashboard;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardHome />} />
          
          <Route path="products" element={<ProductList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="suppliers" element={<SupplierList />} />
          
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/import/new" element={<ImportReceiptForm />} />
          
          <Route path="orders" element={<OrderList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="users" element={<UserList />} />
          
          <Route path="marketing/vouchers" element={<VoucherList />} />
          <Route path="sales/shifts" element={<ShiftList />} />
          
          {/* Đã xóa route /reports */}
        </Route>

        <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;