import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import storeApi from '../../api/storeApi';
import './Cart.css';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Checkout Form State
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [address, setAddress] = useState('');
    const [voucherCode, setVoucherCode] = useState('');

    const user = JSON.parse(localStorage.getItem('customer_info') || 'null');

    const handleCheckout = async () => {
        if (!user) {
            alert("Vui lòng đăng nhập để đặt hàng!");
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) return;

        setLoading(true);
        try {
            const payload = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                paymentMethod,
                voucherCode,
                deliveryAddress: address || user.address // Dùng địa chỉ nhập hoặc mặc định
            };

            const res = await storeApi.createOrder(payload);
            if (res?.status === 'success') {
                alert("Đặt hàng thành công! Mã đơn: " + res.data.code);
                clearCart();
                navigate('/profile'); // Chuyển đến trang lịch sử đơn hàng
            }
        } catch (error) {
            console.error(error);
            alert("Đặt hàng thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container empty-cart">
                <h2>Giỏ hàng trống</h2>
                <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                <Link to="/" className="btn-continue">Tiếp tục mua sắm</Link>
            </div>
        );
    }

    return (
        <div className="container cart-container">
            <h2>Giỏ hàng của bạn</h2>
            
            <div className="cart-layout">
                {/* Danh sách sản phẩm */}
                <div className="cart-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="cart-product-info">
                                            <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} />
                                            <Link to={`/product/${item.id}`}>{item.name}</Link>
                                        </div>
                                    </td>
                                    <td>{Number(item.retailPrice).toLocaleString()} đ</td>
                                    <td>
                                        <div className="qty-control-small">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                        </div>
                                    </td>
                                    <td>{(Number(item.retailPrice) * item.quantity).toLocaleString()} đ</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeFromCart(item.id)}>×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Form Thanh toán */}
                <div className="checkout-box">
                    <h3>Thông tin thanh toán</h3>
                    
                    <div className="summary-row">
                        <span>Tạm tính:</span>
                        <span>{totalPrice.toLocaleString()} đ</span>
                    </div>
                    
                    <div className="checkout-form">
                        <div className="form-group">
                            <label>Địa chỉ giao hàng</label>
                            <input 
                                type="text" 
                                placeholder="Nhập địa chỉ..." 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                defaultValue={user?.address}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phương thức thanh toán</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Mã giảm giá (nếu có)</label>
                            <input 
                                type="text" 
                                placeholder="Nhập mã voucher" 
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="total-row">
                        <span>Tổng cộng:</span>
                        <span className="final-price">{totalPrice.toLocaleString()} đ</span>
                    </div>

                    <button className="btn-checkout" onClick={handleCheckout} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;