import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import storeApi from '../../api/storeApi';
import { useCart } from '../../context/CartContext';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Filter States
    const searchTerm = searchParams.get('search') || '';
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 12; // Số sản phẩm mỗi trang

    // Load Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await storeApi.getCategories();
                if (res?.status === 'success') {
                    setCategories(res.data || []);
                }
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Load Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    page, // Truyền page
                    limit: LIMIT,
                    search: searchTerm,
                    categoryId: selectedCategory || undefined,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    sortBy
                };

                const res = await storeApi.getProducts(params);
                
                if (res?.status === 'success') {
                    // Xử lý products
                    if (Array.isArray(res.products)) {
                        setProducts(res.products);
                    } else if (res.data && Array.isArray(res.data.products)) {
                        setProducts(res.data.products);
                    } else if (Array.isArray(res.data)) {
                        setProducts(res.data);
                    } else {
                        setProducts([]);
                    }

                    // Xử lý pagination
                    if (res.totalPages) {
                        setTotalPages(res.totalPages);
                    } else if (res.data?.totalPages) {
                        setTotalPages(res.data.totalPages);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, page]); // Thêm page vào dependency

    // Reset filters & page
    const handleResetFilters = () => {
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
        setPage(1); // Reset về trang 1
        setSearchParams({});
    };

    // Khi filter thay đổi, reset về trang 1
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            // Scroll lên đầu danh sách sản phẩm
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            {!searchTerm && (
                <section className="hero-section">
                    <div className="hero-content container">
                        <h1 className="hero-title">Siêu Thị Tươi Ngon <br/> Giao Hàng Tận Nơi</h1>
                        <p className="hero-subtitle">
                            Khám phá hàng ngàn sản phẩm chất lượng cao, giá tốt mỗi ngày. 
                            Đặt hàng ngay để nhận ưu đãi hấp dẫn!
                        </p>
                        <button className="btn-hero" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
                            Mua Sắm Ngay
                        </button>
                    </div>
                    <div className="hero-overlay"></div>
                </section>
            )}

            <div className="container main-content">
                {/* Sidebar Filters */}
                <aside className="filters-sidebar">
                    <div className="filter-header">
                        <h3>Bộ lọc tìm kiếm</h3>
                        <button className="btn-reset-text" onClick={handleResetFilters}>Xóa tất cả</button>
                    </div>

                    <div className="filter-group">
                        <h4>Danh mục sản phẩm</h4>
                        <select 
                            className="filter-select"
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <h4>Khoảng giá (VNĐ)</h4>
                        <div className="price-inputs">
                            <input 
                                type="number" 
                                placeholder="Từ" 
                                value={minPrice} 
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <input 
                                type="number" 
                                placeholder="Đến" 
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </aside>

                {/* Product List */}
                <section id="products" className="products-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            {searchTerm ? `Kết quả: "${searchTerm}"` : 'Sản Phẩm'}
                        </h2>
                        
                        <div className="sort-control">
                            <label>Sắp xếp:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                <option value="name_asc">Tên A-Z</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            {products.length > 0 ? (
                                <div className="product-grid">
                                    {products.map(product => (
                                        <div key={product.id} className="product-card">
                                            <div className="card-image-wrapper">
                                                <Link to={`/product/${product.id}`}>
                                                    <img 
                                                        src={product.imageUrl || 'https://via.placeholder.com/300'} 
                                                        alt={product.name} 
                                                        className="product-image"
                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                                    />
                                                </Link>
                                                {product.stockQuantity <= 0 && <span className="badge-out-of-stock">Hết hàng</span>}
                                            </div>
                                            
                                            <div className="card-content">
                                                <div className="product-category">{product.category?.name || 'Sản phẩm'}</div>
                                                <Link to={`/product/${product.id}`} className="product-name">
                                                    {product.name}
                                                </Link>
                                                <div className="product-price-row">
                                                    <span className="current-price">{Number(product.retailPrice).toLocaleString()} đ</span>
                                                </div>
                                                
                                                <button 
                                                    className="btn-add-cart"
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stockQuantity <= 0}
                                                >
                                                    {product.stockQuantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        className="page-btn" 
                                        disabled={page <= 1}
                                        onClick={() => handlePageChange(page - 1)}
                                    >
                                        &laquo; Trước
                                    </button>
                                    
                                    <span className="page-info">
                                        Trang {page} / {totalPages}
                                    </span>
                                    
                                    <button 
                                        className="page-btn" 
                                        disabled={page >= totalPages}
                                        onClick={() => handlePageChange(page + 1)}
                                    >
                                        Sau &raquo;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;