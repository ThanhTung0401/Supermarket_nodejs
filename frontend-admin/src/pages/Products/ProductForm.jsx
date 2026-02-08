import React, { useState, useEffect } from 'react';
import productApi from '../../api/productApi';
import axiosClient from '../../api/axiosClient'; // Import axiosClient để gọi API upload
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
    const [uploading, setUploading] = useState(false); // State upload
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productApi.getCategories();
                if (res && res.status === 'success') {
                    if (res.data && Array.isArray(res.data.categories)) {
                        setCategories(res.data.categories);
                    } else if (Array.isArray(res.data)) {
                        setCategories(res.data);
                    } else {
                        setCategories([]);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải danh mục trong form:", err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
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

    // Xử lý upload ảnh
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        setUploading(true);
        try {
            // Gọi API upload (cần cấu hình axiosClient để hỗ trợ multipart/form-data nếu cần, 
            // nhưng axios tự động xử lý nếu data là FormData)
            // Tuy nhiên axiosClient của ta đang set Content-Type: application/json mặc định
            // Nên ta cần override header
            const res = await axiosClient.post('/upload', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (res.status === 'success') {
                setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload ảnh thất bại!");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.name || !formData.barcode || !formData.retailPrice || !formData.categoryId) {
                throw new Error("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            }

            if (Number(formData.retailPrice) < 0 || Number(formData.importPrice) < 0) {
                throw new Error("Giá không được âm");
            }
            
            if (Number(formData.packingQuantity) < 1) {
                throw new Error("Quy cách đóng gói phải lớn hơn hoặc bằng 1");
            }

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
                response = await productApi.update(product.id, payload);
            } else {
                response = await productApi.add(payload);
            }

            if (response.status === 'success') {
                onSave();
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
                                <label>Danh mục <span className="required">*</span></label>
                                <select 
                                    name="categoryId" 
                                    value={formData.categoryId} onChange={handleChange}
                                    required
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
                            <label>Hình ảnh</label>
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <input 
                                    type="text" name="imageUrl" 
                                    value={formData.imageUrl} onChange={handleChange} placeholder="Link ảnh hoặc upload..."
                                    style={{flex: 1}}
                                />
                                <label className="btn-upload" style={{
                                    padding: '8px 12px', 
                                    background: '#e5e7eb', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                </label>
                            </div>
                            {formData.imageUrl && (
                                <div style={{marginTop: '10px'}}>
                                    <img src={formData.imageUrl} alt="Preview" style={{height: '80px', borderRadius: '4px', border: '1px solid #ddd'}} />
                                </div>
                            )}
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
                        <button type="submit" className="btn-save" disabled={loading || uploading}>
                            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;