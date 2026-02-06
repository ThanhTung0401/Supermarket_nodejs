import React, { useState, useEffect } from 'react';
import productApi from '../../api/productApi';
import './CategoryList.css'; // Dùng chung style với ProductList hoặc tạo riêng

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null); // Để sửa
    const [categoryName, setCategoryName] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await productApi.getCategories();
            if (res.status === 'success') {
                setCategories(res.data.categories || []);
            }
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = () => {
        setCurrentCategory(null);
        setCategoryName('');
        setShowForm(true);
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setCategoryName(category.name);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa danh mục này sẽ ảnh hưởng đến các sản phẩm liên quan. Bạn chắc chắn?')) {
            try {
                await productApi.removeCategory(id);
                fetchCategories(); // Tải lại danh sách
                alert('Xóa thành công');
            } catch (err) {
                alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa danh mục này.'));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName) return;

        const payload = { name: categoryName };

        try {
            if (currentCategory) {
                // Update
                await productApi.updateCategory(currentCategory.id, payload);
            } else {
                // Create
                await productApi.addCategory(payload);
            }
            fetchCategories();
            setShowForm(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    return (
        <div className="product-list-container"> {/* Tái sử dụng class style */}
            <div className="page-header">
                <h2>Quản lý Danh mục</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm danh mục</button>
            </div>

            {/* Form Thêm/Sửa (Modal đơn giản) */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '400px'}}>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h3>{currentCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tên danh mục</label>
                                    <input 
                                        type="text" 
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bảng danh sách */}
            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Danh mục</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>{cat.name}</td>
                                    <td>
                                        <button className="btn-action edit" onClick={() => handleEdit(cat)}>Sửa</button>
                                        <button className="btn-action delete" onClick={() => handleDelete(cat.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CategoryList;