import React, { useState, useEffect } from 'react';
import productApi from '../../api/productApi';
import './ProductForm.css';

const ProductForm = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        categoryId: '',
        importPrice: 0,
        retailPrice: 0,
        unit: 'cái',
        packingQuantity: 1,
        minStockLevel: 10,
        imageUrl: '',
        description: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load danh mục và dữ liệu sản phẩm (nếu là sửa)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productApi.getCategories();
                if (res.status === 'success') {
                    setCategories(res.data.categories || []);
                }
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };

        fetchCategories();

        if (product) {
            setFormData({
                name: product.name || '',
                barcode: product.barcode || '',
                categoryId: product.categoryId || '',
                importPrice: product.importPrice || 0,
                retailPrice: product.retailPrice || 0,
                unit: product.unit || 'cái',
                packingQuantity: product.packingQuantity || 1,
                minStockLevel: product.minStockLevel || 10,
                imageUrl: product.imageUrl || '',
                description: product.description || ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate cơ bản
            if (!formData.name || !formData.barcode || !formData.retailPrice) {
                throw new Error("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            }

            // Chuyển đổi kiểu dữ liệu số
            const payload = {
                ...formData,
                categoryId: Number(formData.categoryId),
                importPrice: Number(formData.importPrice),
                retailPrice: Number(formData.retailPrice),
                packingQuantity: Number(formData.packingQuantity),
                minStockLevel: Number(formData.minStockLevel)
            };

            let response;
            if (product?.id) {
                // Update
                response = await productApi.update(product.id, payload);
            } else {
                // Create
                response = await productApi.add(payload);
            }

            if (response.status === 'success') {
                onSave(); // Callback để refresh list bên ngoài
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-alert">{error}</div>}
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tên sản phẩm <span className="required">*</span></label>
                                <input 
                                    type="text" name="name" 
                                    value={formData.name} onChange={handleChange} required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Mã vạch (Barcode) <span className="required">*</span></label>
                                <input 
                                    type="text" name="barcode" 
                                    value={formData.barcode} onChange={handleChange} required 
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Danh mục</label>
                                <select 
                                    name="categoryId" 
                                    value={formData.categoryId} onChange={handleChange}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Đơn vị tính</label>
                                <input 
                                    type="text" name="unit" 
                                    value={formData.unit} onChange={handleChange} placeholder="VD: cái, hộp, lon"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Giá bán lẻ <span className="required">*</span></label>
                                <input 
                                    type="number" name="retailPrice" 
                                    value={formData.retailPrice} onChange={handleChange} required min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Giá nhập (Tham khảo)</label>
                                <input 
                                    type="number" name="importPrice" 
                                    value={formData.importPrice} onChange={handleChange} min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Quy cách đóng gói</label>
                                <input 
                                    type="number" name="packingQuantity" 
                                    value={formData.packingQuantity} onChange={handleChange} min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mức tồn kho tối thiểu</label>
                                <input 
                                    type="number" name="minStockLevel" 
                                    value={formData.minStockLevel} onChange={handleChange} min="0"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Link hình ảnh</label>
                            <input 
                                type="text" name="imageUrl" 
                                value={formData.imageUrl} onChange={handleChange} placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Mô tả</label>
                            <textarea 
                                name="description" 
                                value={formData.description} onChange={handleChange} rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;