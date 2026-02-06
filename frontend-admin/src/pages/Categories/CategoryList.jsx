import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import './CategoryList.css';

const CategoryList = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await productApi.getCategories();
            if (res && res.status === 'success') {
                let data = [];
                if (res.data && Array.isArray(res.data.categories)) {
                    data = res.data.categories;
                } else if (Array.isArray(res.data)) {
                    data = res.data;
                }
                setCategories(data);
                setFilteredCategories(data);
            } else {
                setError("Không tải được danh mục.");
            }
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            setError("Lỗi kết nối server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredCategories(categories);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = categories.filter(cat => 
                cat.name.toLowerCase().includes(lowerTerm) || 
                cat.id.toString().includes(lowerTerm)
            );
            setFilteredCategories(filtered);
        }
    }, [searchTerm, categories]);

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
                fetchCategories();
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
                await productApi.updateCategory(currentCategory.id, payload);
            } else {
                await productApi.addCategory(payload);
            }
            fetchCategories();
            setShowForm(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    // Chuyển hướng sang trang sản phẩm với filter
    const handleViewProducts = (categoryId) => {
        navigate(`/products?categoryId=${categoryId}`);
    };

    if (error) return <div className="error-message">Lỗi: {error}</div>;

    return (
        <div className="product-list-container">
            <div className="page-header">
                <h2>Quản lý Danh mục</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm danh mục</button>
            </div>

            <div className="toolbar" style={{marginBottom: '20px'}}>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên hoặc ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{width: '100%', maxWidth: '400px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd'}}
                />
            </div>

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
                                        required
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

            <div className="table-container">
                {loading ? <p>Đang tải...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '50px'}}>ID</th>
                                <th>Tên Danh mục</th>
                                <th>Số sản phẩm</th>
                                <th style={{width: '150px'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map(cat => (
                                    <tr key={cat.id}>
                                        <td>{cat.id}</td>
                                        <td 
                                            style={{cursor: 'pointer', color: '#6366f1', fontWeight: '500'}}
                                            onClick={() => handleViewProducts(cat.id)}
                                            title="Xem sản phẩm thuộc danh mục này"
                                        >
                                            {cat.name}
                                        </td>
                                        <td>
                                            <span className="badge-count">
                                                {cat._count?.products || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(cat)}>Sửa</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(cat.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={{textAlign: 'center'}}>
                                    {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có danh mục nào'}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CategoryList;