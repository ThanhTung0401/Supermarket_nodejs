import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryApi from '../../api/inventoryApi';
import partnerApi from '../../api/partnerApi';
import productApi from '../../api/productApi';
import './ImportReceiptForm.css';

// Component tìm kiếm sản phẩm
const ProductSearchSelect = ({ products, value, onChange, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Tìm sản phẩm đang được chọn để hiển thị tên
    const selectedProduct = products.find(p => p.id == value);

    // Lọc danh sách theo từ khóa
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (product) => {
        onChange(product.id);
        setIsOpen(false);
        setSearchTerm(''); // Reset search
    };

    return (
        <div className="product-search-select" ref={wrapperRef}>
            <div 
                className="selected-display" 
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedProduct ? (
                    <span>{selectedProduct.barcode} - {selectedProduct.name}</span>
                ) : (
                    <span className="placeholder">{placeholder}</span>
                )}
                <span className="arrow">▼</span>
            </div>

            {isOpen && (
                <div className="dropdown-list">
                    <input 
                        type="text" 
                        className="search-input-small"
                        placeholder="Nhập tên hoặc mã vạch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click input
                    />
                    <div className="list-items">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(p => (
                                <div 
                                    key={p.id} 
                                    className={`list-item ${p.id == value ? 'active' : ''}`}
                                    onClick={() => handleSelect(p)}
                                >
                                    <div className="item-name">{p.name}</div>
                                    <div className="item-barcode">{p.barcode}</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-result">Không tìm thấy sản phẩm</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ImportReceiptForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form Data
    const [supplierId, setSupplierId] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState([
        { productId: '', quantity: 1, unitCost: 0, productName: '', stock: 0, unit: '', retailPrice: 0 }
    ]);

    // Load Suppliers & Products
    useEffect(() => {
        const initData = async () => {
            try {
                const [supRes, prodRes] = await Promise.all([
                    partnerApi.getAll({ limit: 100 }),
                    productApi.getAll({ limit: 1000, isActive: 'true' })
                ]);

                if (supRes?.status === 'success') {
                    if (supRes.data && Array.isArray(supRes.data.suppliers)) {
                        setSuppliers(supRes.data.suppliers);
                    } else if (Array.isArray(supRes.data)) {
                        setSuppliers(supRes.data);
                    } else {
                        setSuppliers([]);
                    }
                }

                if (prodRes?.status === 'success') {
                    if (Array.isArray(prodRes.data)) {
                        setProducts(prodRes.data);
                    } else if (prodRes.data && Array.isArray(prodRes.data.products)) {
                        setProducts(prodRes.data.products);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };
        initData();
    }, []);

    // Thêm dòng sản phẩm
    const handleAddItem = () => {
        setItems([...items, { productId: '', quantity: 1, unitCost: 0, productName: '', stock: 0, unit: '', retailPrice: 0 }]);
    };

    // Xóa dòng
    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // Thay đổi thông tin dòng
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'productId') {
            const selectedProd = products.find(p => p.id == value);
            if (selectedProd) {
                newItems[index].productName = selectedProd.name;
                newItems[index].stock = selectedProd.stockQuantity;
                newItems[index].unitCost = selectedProd.importPrice || 0;
                newItems[index].unit = selectedProd.unit || '';
                newItems[index].retailPrice = Number(selectedProd.retailPrice) || 0;
            }
        }

        setItems(newItems);
    };

    // Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supplierId) return alert("Vui lòng chọn nhà cung cấp");
        if (items.some(i => !i.productId || i.quantity <= 0 || i.unitCost < 0)) {
            return alert("Vui lòng kiểm tra lại thông tin sản phẩm (số lượng > 0, giá >= 0)");
        }

        // Cảnh báo nếu giá nhập > giá bán
        const warningItems = items.filter(i => i.unitCost > i.retailPrice);
        if (warningItems.length > 0) {
            const confirm = window.confirm(`CẢNH BÁO: Có ${warningItems.length} sản phẩm có giá nhập CAO HƠN giá bán lẻ hiện tại. Bạn có chắc chắn muốn nhập?`);
            if (!confirm) return;
        }

        setLoading(true);
        try {
            const payload = {
                supplierId: Number(supplierId),
                note,
                items: items.map(i => ({
                    productId: Number(i.productId),
                    quantity: Number(i.quantity),
                    unitCost: Number(i.unitCost)
                }))
            };

            await inventoryApi.createImportReceipt(payload);
            alert("Tạo phiếu nhập thành công!");
            navigate('/inventory');
        } catch (err) {
            console.error(err);
            alert("Lỗi: " + (err.response?.data?.message || "Tạo phiếu thất bại"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="import-form-container">
            <div className="page-header">
                <h2>Tạo Phiếu Nhập Hàng</h2>
                <button className="btn-back" onClick={() => navigate('/inventory')}>Quay lại</button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Thông tin chung */}
                <div className="section-card">
                    <h3>Thông tin chung</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nhà cung cấp <span className="required">*</span></label>
                            <select 
                                value={supplierId} 
                                onChange={(e) => setSupplierId(e.target.value)} 
                                required
                            >
                                <option value="">-- Chọn nhà cung cấp --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Ghi chú</label>
                            <input 
                                type="text" 
                                value={note} 
                                onChange={(e) => setNote(e.target.value)} 
                                placeholder="VD: Nhập hàng tháng 10..."
                            />
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="section-card">
                    <h3>Chi tiết nhập hàng</h3>
                    <table className="import-table">
                        <thead>
                            <tr>
                                <th style={{width: '35%'}}>Sản phẩm</th>
                                <th style={{width: '10%'}}>Đơn vị</th>
                                <th style={{width: '10%'}}>Tồn</th>
                                <th style={{width: '15%'}}>Số lượng nhập</th>
                                <th style={{width: '15%'}}>Đơn giá nhập</th>
                                <th style={{width: '10%'}}>Thành tiền</th>
                                <th style={{width: '5%'}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td style={{overflow: 'visible'}}> {/* Cho phép dropdown tràn ra ngoài */}
                                        <ProductSearchSelect 
                                            products={products}
                                            value={item.productId}
                                            onChange={(val) => handleItemChange(index, 'productId', val)}
                                            placeholder="-- Chọn sản phẩm --"
                                        />
                                        {item.retailPrice > 0 && (
                                            <div style={{fontSize: '0.8rem', color: '#6b7280', marginTop: '4px'}}>
                                                Giá bán: {item.retailPrice.toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td>{item.unit}</td>
                                    <td>{item.stock}</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            min="1" required
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="number" 
                                            value={item.unitCost} 
                                            onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                                            min="0" required
                                            style={{borderColor: item.unitCost > item.retailPrice ? '#ef4444' : '#d1d5db'}}
                                        />
                                        {item.unitCost > item.retailPrice && (
                                            <div style={{fontSize: '0.75rem', color: '#ef4444', marginTop: '2px'}}>Cao hơn giá bán!</div>
                                        )}
                                    </td>
                                    <td>{Number(item.quantity * item.unitCost).toLocaleString()}</td>
                                    <td>
                                        {items.length > 1 && (
                                            <button type="button" className="btn-remove" onClick={() => handleRemoveItem(index)}>×</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" className="btn-add-row" onClick={handleAddItem}>+ Thêm dòng</button>
                </div>

                {/* Tổng kết */}
                <div className="summary-section">
                    <div className="total-row">
                        <span>Tổng tiền:</span>
                        <span className="total-amount">{totalAmount.toLocaleString()} đ</span>
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Hoàn tất nhập hàng'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImportReceiptForm;