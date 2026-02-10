import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import storeApi from '../../api/storeApi';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await storeApi.getProductDetail(id);
                if (res?.status === 'success') {
                    setProduct(res.data);
                }
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) setQuantity(val);
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

    if (loading) return <div className="container loading">Đang tải...</div>;
    if (!product) return <div className="container not-found">Sản phẩm không tồn tại</div>;

    return (
        <div className="container product-detail-container">
            <div className="product-detail-grid">
                {/* Cột trái: Hình ảnh */}
                <div className="product-gallery">
                    <img 
                        src={product.imageUrl || 'https://via.placeholder.com/400'} 
                        alt={product.name} 
                        className="main-image"
                    />
                </div>

                {/* Cột phải: Thông tin */}
                <div className="product-info-detail">
                    <h1 className="product-title">{product.name}</h1>
                    <div className="product-meta">
                        <span>Mã SP: {product.barcode}</span>
                        <span> | </span>
                        <span>Đơn vị: {product.unit}</span>
                    </div>
                    
                    <div className="product-price-large">
                        {Number(product.retailPrice).toLocaleString()} đ
                    </div>

                    <div className="product-description">
                        <h3>Mô tả sản phẩm</h3>
                        <p>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                    </div>

                    <div className="add-to-cart-section">
                        <div className="quantity-control">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={handleQuantityChange}
                                min="1"
                            />
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                        <button className="btn-buy-now" onClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>

                    <div className="product-specs">
                        <h3>Thông tin chi tiết</h3>
                        <ul>
                            <li><strong>Danh mục:</strong> {product.category?.name || 'Khác'}</li>
                            <li><strong>Quy cách:</strong> {product.packingQuantity} {product.unit}/gói</li>
                            <li><strong>Tình trạng:</strong> {product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;