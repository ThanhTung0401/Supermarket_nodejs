import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productApi from '../../api/productApi';
import ProductForm from './ProductForm';
import { formatCurrency } from '../../utils/format'; // Import helper
import './ProductList.css';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const ProductList = () => {
    const [searchParams] = useSearchParams();
    const initialCategoryId = searchParams.get('categoryId') || '';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
    const [filterStatus, setFilterStatus] = useState('true');

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productApi.getCategories();
                if (res?.status === 'success') {
                    setCategories(res.data.categories || res.data || []);
                }
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const catId = searchParams.get('categoryId');
        if (catId) {
            setSelectedCategory(catId);
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearchTerm,
                categoryId: selectedCategory || undefined,
                isActive: filterStatus
            };
            
            const response = await productApi.getAll(params);

            if (response?.status === 'success') {
                if (response.data?.products) {
                    setProducts(response.data.products);
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.pagination?.total || 0
                    }));
                } else if (Array.isArray(response.data)) {
                    setProducts(response.data);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [debouncedSearchTerm, selectedCategory, filterStatus, pagination.page]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearchTerm, selectedCategory, filterStatus]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleStatusChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handlePageChange = (newPage) => setPagination(prev => ({ ...prev, page: newPage }));

    const handleDelete = async (id) => {
        if (window.confirm('Xóa sản phẩm này vào thùng rác?')) {
            try {
                await productApi.remove(id);
                fetchProducts();
                alert('Đã chuyển vào thùng rác');
            } catch (e) {
                alert('Lỗi xóa');
            }
        }
    };

    const handleRestore = async (id) => {
        if (window.confirm('Khôi phục sản phẩm này?')) {
            try {
                await productApi.restore(id);
                fetchProducts();
                alert('Đã khôi phục');
            } catch (e) {
                alert('Lỗi khôi phục');
            }
        }
    };

    const handleHardDelete = async (id) => {
        if (window.confirm('CẢNH BÁO: Hành động này không thể hoàn tác! Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này khỏi cơ sở dữ liệu?')) {
            try {
                await productApi.hardRemove(id);
                fetchProducts();
                alert('Đã xóa vĩnh viễn');
            } catch (e) {
                alert('Lỗi: ' + (e.response?.data?.message || 'Không thể xóa vĩnh viễn sản phẩm này (có thể do đã có giao dịch).'));
            }
        }
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleSaveSuccess = () => {
        fetchProducts();
    };

    return (
        <div className="product-list-container">
            <div className="page-header">
                <h2>Danh sách sản phẩm</h2>
                <button className="btn-add" onClick={handleAdd}>Thêm mới</button>
            </div>

            <div className="toolbar">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />

                <select 
                    className="category-select" 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select 
                    className="category-select" 
                    value={filterStatus} 
                    onChange={handleStatusChange}
                    style={{minWidth: '150px'}}
                >
                    <option value="true">Đang bán</option>
                    <option value="false">Thùng rác</option>
                    <option value="all">Tất cả</option>
                </select>

                {loading && <span style={{marginLeft: '10px', color: '#666'}}>Đang tải...</span>}
            </div>

            <div className="table-container" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{width: '50px'}}>ID</th>
                            <th style={{width: '80px'}}>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Barcode</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th>Trạng thái</th>
                            <th style={{width: '180px'}}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className={!product.isActive ? 'row-deleted' : ''}>
                                <td>{product.id}</td>
                                <td>
                                    <img 
                                        src={product.imageUrl || 'https://via.placeholder.com/40'} 
                                        alt="" 
                                        className="product-thumb"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category?.name || '-'}</td>
                                <td>{product.barcode}</td>
                                <td>{formatCurrency(product.retailPrice)}</td> {/* Sử dụng formatCurrency */}
                                <td>
                                    <span className={`stock-badge ${product.stockQuantity <= (product.minStockLevel || 10) ? 'low' : 'good'}`}>
                                        {product.stockQuantity}
                                    </span>
                                </td>
                                <td>
                                    {product.isActive ? 
                                        <span className="status-active">Hoạt động</span> : 
                                        <span className="status-deleted">Đã xóa</span>
                                    }
                                </td>
                                <td>
                                    {product.isActive ? (
                                        <>
                                            <button className="btn-action edit" onClick={() => handleEdit(product)}>Sửa</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(product.id)}>Xóa</button>
                                        </>
                                    ) : (
                                        <div style={{display: 'flex', gap: '5px'}}>
                                            <button className="btn-action restore" onClick={() => handleRestore(product.id)} title="Khôi phục">
                                                ♻️
                                            </button>
                                            <button className="btn-action delete-forever" onClick={() => handleHardDelete(product.id)} title="Xóa vĩnh viễn">
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && !loading && (
                            <tr><td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>Prev</button>
                <span>{pagination.page} / {Math.ceil(pagination.total / pagination.limit) || 1}</span>
                <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
            </div>

            {showModal && (
                <ProductForm 
                    product={selectedProduct} 
                    onClose={handleCloseModal} 
                    onSave={handleSaveSuccess} 
                />
            )}
        </div>
    );
};

export default ProductList;