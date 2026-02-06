import React, { useEffect, useState } from 'react';
import productApi from '../../api/productApi';
import ProductForm from './ProductForm'; // Import Form
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
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearchTerm
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
    }, [debouncedSearchTerm, pagination.page]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearchTerm]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handlePageChange = (newPage) => setPagination(prev => ({ ...prev, page: newPage }));

    const handleDelete = async (id) => {
        if (window.confirm('Xóa sản phẩm này?')) {
            try {
                await productApi.remove(id);
                setProducts(prev => prev.filter(p => p.id !== id));
                alert('Đã xóa');
            } catch (e) {
                alert('Lỗi xóa');
            }
        }
    };

    // Mở Modal Thêm mới
    const handleAdd = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    // Mở Modal Sửa
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    // Đóng Modal và Refresh nếu cần
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleSaveSuccess = () => {
        fetchProducts(); // Refresh lại danh sách
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
                {loading && <span style={{marginLeft: '10px', color: '#666'}}>Đang tải...</span>}
            </div>

            <div className="table-container" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{width: '50px'}}>ID</th>
                            <th style={{width: '80px'}}>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Barcode</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th style={{width: '150px'}}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
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
                                <td>{product.barcode}</td>
                                <td>{Number(product.retailPrice).toLocaleString()}</td>
                                <td>
                                    <span className={`stock-badge ${product.stockQuantity <= 10 ? 'low' : 'good'}`}>
                                        {product.stockQuantity}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-action edit" onClick={() => handleEdit(product)}>Sửa</button>
                                    <button className="btn-action delete" onClick={() => handleDelete(product.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && !loading && (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>Prev</button>
                <span>{pagination.page} / {Math.ceil(pagination.total / pagination.limit) || 1}</span>
                <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
            </div>

            {/* Render Modal */}
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