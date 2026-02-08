import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import storeApi from '../../api/storeApi';
import { useCart } from '../../context/CartContext';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [searchParams] = useSearchParams(); // Hook lấy query params
    
    // Lấy từ khóa tìm kiếm từ URL
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); // Set loading mỗi khi search thay đổi
            try {
                // Truyền thêm tham số search vào API
                const res = await storeApi.getProducts({ 
                    limit: 12,
                    search: searchTerm 
                });
                
                if (res?.status === 'success') {
                    if (Array.isArray(res.products)) {
                        setProducts(res.products);
                    } else if (res.data && Array.isArray(res.data.products)) {
                        setProducts(res.data.products);
                    } else if (Array.isArray(res.data)) {
                        setProducts(res.data);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchTerm]); // Chạy lại khi searchTerm thay đổi

    return (
        <div className="home-page">
            {/* Chỉ hiện Hero Banner khi KHÔNG tìm kiếm */}
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

            {/* Features Section (Cũng ẩn khi tìm kiếm cho gọn) */}
            {!searchTerm && (
                <section className="features-section container">
                    <div className="feature-item">
                        <div className="feature-icon">🚀</div>
                        <h3>Giao hàng nhanh</h3>
                        <p>Nhận hàng trong 2h nội thành</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🛡️</div>
                        <h3>Đảm bảo chất lượng</h3>
                        <p>Hoàn tiền nếu sản phẩm lỗi</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">💳</div>
                        <h3>Thanh toán an toàn</h3>
                        <p>Hỗ trợ nhiều phương thức</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">📞</div>
                        <h3>Hỗ trợ 24/7</h3>
                        <p>Luôn sẵn sàng giải đáp</p>
                    </div>
                </section>
            )}

            {/* Product List Section */}
            <section id="products" className="products-section container" style={{marginTop: searchTerm ? '40px' : '0'}}>
                <div className="section-header">
                    <h2 className="section-title">
                        {searchTerm ? `Kết quả tìm kiếm: "${searchTerm}"` : 'Sản Phẩm Nổi Bật'}
                    </h2>
                    {!searchTerm && <p className="section-desc">Những sản phẩm được yêu thích nhất tuần qua</p>}
                </div>
                
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    products.length > 0 ? (
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
                            {searchTerm && <Link to="/" className="btn-back-home">Quay lại trang chủ</Link>}
                        </div>
                    )
                )}
            </section>

            {/* Newsletter Section */}
            {!searchTerm && (
                <section className="newsletter-section">
                    <div className="container">
                        <h2>Đăng ký nhận tin</h2>
                        <p>Nhận thông báo về các chương trình khuyến mãi sớm nhất</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Nhập email của bạn..." />
                            <button>Đăng ký</button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;