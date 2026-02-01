# Supermarket Management System API

Tài liệu API chi tiết cho hệ thống quản lý siêu thị (Backend Node.js + Express + Prisma + PostgreSQL).

## 🌐 Base URL
`http://localhost:8080/api`

## 🔐 Authentication & Authorization
*   **Header:** `Authorization: Bearer <your_jwt_token>`
*   **Roles:** `ADMIN`, `MANAGER`, `WAREHOUSE`, `CASHIER`
*   **Response Format Standard:**
    ```json
    {
      "status": "success", // hoặc "fail", "error"
      "data": { ... }      // Dữ liệu trả về
    }
    ```

---

## 1. 🧑‍💼 Auth Module (Nhân viên)
Quản lý tài khoản nhân viên nội bộ.

### 1.1 Đăng ký nhân viên mới
*   **URL:** `/auth/user/register`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Request Body:**
    ```json
    {
      "fullName": "Nguyen Van Quan Ly",
      "email": "manager@supermarket.com",
      "password": "password123",
      "phone": "0901234567",
      "role": "MANAGER" // CASHIER, WAREHOUSE, ADMIN
    }
    ```
*   **Response:**
    ```json
    {
      "status": "success",
      "data": {
        "user": { "id": 1, "email": "manager@supermarket.com", "role": "MANAGER" }
      }
    }
    ```

### 1.2 Đăng nhập
*   **URL:** `/auth/user/login`
*   **Method:** `POST`
*   **Access:** `Public`
*   **Request Body:**
    ```json
    {
      "email": "manager@supermarket.com",
      "password": "password123"
    }
    ```
*   **Response:**
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "data": {
        "user": { "id": 1, "fullName": "Nguyen Van Quan Ly", "role": "MANAGER" }
      }
    }
    ```

---

## 2. 🛒 Auth Module (Khách hàng)
Dành cho App/Web của khách hàng (End-User).

### 2.1 Đăng ký khách hàng
*   **URL:** `/auth/customer/register`
*   **Method:** `POST`
*   **Access:** `Public`
*   **Request Body:**
    ```json
    {
      "name": "Tran Van Khach",
      "phone": "0912345678", // Dùng làm username
      "password": "customer123",
      "email": "khach@gmail.com",
      "address": "123 Le Loi, Q1"
    }
    ```

### 2.2 Đăng nhập khách hàng
*   **URL:** `/auth/customer/login`
*   **Method:** `POST`
*   **Access:** `Public`
*   **Request Body:**
    ```json
    {
      "phone": "0912345678",
      "password": "customer123"
    }
    ```

---

## 3. 👥 Users Module (Quản lý nhân sự)

### 3.1 Lấy danh sách nhân viên
*   **URL:** `/users`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`
*   **Query Params:** `?role=CASHIER&search=Nguyen`
*   **Response:**
    ```json
    {
      "status": "success",
      "data": {
        "users": [
          { "id": 2, "fullName": "Thu Ngan A", "role": "CASHIER", "isActive": true }
        ]
      }
    }
    ```

### 3.2 Cập nhật thông tin nhân viên
*   **URL:** `/users/:id`
*   **Method:** `PATCH`
*   **Access:** `ADMIN`
*   **Request Body:**
    ```json
    {
      "fullName": "Thu Ngan A (Da sua)",
      "phone": "0999888777"
    }
    ```

### 3.3 Khóa/Mở khóa tài khoản
*   **URL:** `/users/:id/toggle-active`
*   **Method:** `PATCH`
*   **Access:** `ADMIN`
*   **Response:**
    ```json
    {
      "status": "success",
      "message": "User deactivated",
      "data": { "user": { "id": 2, "isActive": false } }
    }
    ```

---

## 4. 📦 Products Module (Hàng hóa)

### 4.1 Tạo danh mục (Category)
*   **URL:** `/products/categories`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Request Body:**
    ```json
    { "name": "Đồ uống có gas" }
    ```

### 4.2 Tạo sản phẩm mới
*   **URL:** `/products`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Request Body:**
    ```json
    {
      "name": "Coca Cola 330ml",
      "barcode": "893000123456",
      "categoryId": 1,
      "retailPrice": 10000, // Giá bán lẻ
      "unit": "Lon",
      "packingQuantity": 24, // Quy cách (24 lon/thùng)
      "minStockLevel": 10,
      "imageUrl": "https://example.com/coca.jpg"
    }
    ```

### 4.3 Lấy danh sách sản phẩm
*   **URL:** `/products`
*   **Method:** `GET`
*   **Access:** `Private`
*   **Query Params:** `?categoryId=1&search=Coca&lowStock=true`

### 4.4 Tìm sản phẩm theo Barcode (Scan)
*   **URL:** `/products/barcode/:barcode`
*   **Method:** `GET`
*   **Access:** `Private`
*   **Response:**
    ```json
    {
      "status": "success",
      "data": {
        "product": {
          "id": 1,
          "name": "Coca Cola 330ml",
          "retailPrice": "10000",
          "stockQuantity": 100
        }
      }
    }
    ```

---

## 5. 🏭 Inventory Module (Kho hàng)

### 5.1 Nhập hàng (Import) - Quan trọng
Hỗ trợ nhập hàng cho sản phẩm cũ và tạo mới sản phẩm ngay trong phiếu nhập.

*   **URL:** `/inventory/import`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`
*   **Request Body:**
    ```json
    {
      "supplierId": 1,
      "note": "Nhập hàng tháng 6",
      "items": [
        {
          "productId": 1, // Sản phẩm đã có
          "quantity": 100,
          "unitCost": 8000 // Giá nhập
        },
        {
          "isNewProduct": true, // Sản phẩm mới hoàn toàn
          "quantity": 50,
          "unitCost": 15000,
          "productData": {
            "name": "Bánh Quy Bơ Mới",
            "barcode": "893999999999",
            "categoryId": 2,
            "retailPrice": 25000,
            "unit": "Hộp",
            "minStockLevel": 20
          }
        }
      ]
    }
    ```

### 5.2 Xem trạng thái kho
*   **URL:** `/inventory/status`
*   **Method:** `GET`
*   **Query Params:** `?lowStock=true` (Lọc hàng sắp hết)

### 5.3 Điều chỉnh kho (Kiểm kê/Hủy)
*   **URL:** `/inventory/adjust`
*   **Method:** `POST`
*   **Request Body (Hủy hàng hỏng):**
    ```json
    {
      "productId": 1,
      "changeType": "DAMAGE",
      "quantity": 5, // Số lượng hỏng
      "note": "Vỡ khi vận chuyển"
    }
    ```
*   **Request Body (Kiểm kê):**
    ```json
    {
      "productId": 1,
      "changeType": "AUDIT",
      "quantity": 95, // Số lượng THỰC TẾ đếm được
      "note": "Cân bằng kho"
    }
    ```

---

## 6. 🤝 Partners Module (Nhà cung cấp)

### 6.1 Tạo nhà cung cấp
*   **URL:** `/partners/supplier`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "name": "Công ty PepsiCo",
      "phone": "02833334444",
      "email": "contact@pepsi.vn",
      "address": "KCN Song Than"
    }
    ```

---

## 7. 💖 Customers Module (CRM)

### A. Dành cho Nhân viên (POS/CSKH)

#### 7.1 Tìm kiếm khách hàng (Tích điểm)
*   **URL:** `/customers`
*   **Method:** `GET`
*   **Query Params:** `?search=0912345678` (Tìm theo SĐT)

#### 7.2 Tạo khách hàng nhanh tại quầy
*   **URL:** `/customers`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "name": "Khách Vãng Lai",
      "phone": "0909000111"
    }
    ```

#### 7.3 Xem lịch sử mua hàng của khách
*   **URL:** `/customers/:id/invoices`
*   **Method:** `GET`

### B. Dành cho Khách hàng (App)

#### 7.4 Xem Profile cá nhân
*   **URL:** `/customer/profile/me`
*   **Method:** `GET`
*   **Access:** `Customer Token`

---

## 8. 🎁 Marketing Module (Vouchers)

### 8.1 Tạo mã giảm giá
*   **URL:** `/vouchers`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "code": "SALE50",
      "type": "PERCENTAGE", // hoặc FIXED_AMOUNT
      "value": 50, // Giảm 50%
      "maxDiscount": 100000, // Tối đa 100k
      "minOrderValue": 200000, // Đơn tối thiểu 200k
      "startDate": "2026-01-01",
      "endDate": "2026-02-01"
    }
    ```

### 8.2 Kiểm tra mã (Verify)
*   **URL:** `/vouchers/verify`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "code": "SALE50",
      "orderValue": 250000
    }
    ```
*   **Response:**
    ```json
    {
      "status": "success",
      "data": {
        "isValid": true,
        "discountAmount": 100000
      }
    }
    ```

---

## 9. 🏪 Sales Module (POS & Ca làm việc)

### 9.1 Bắt đầu ca làm việc
*   **URL:** `/sales/shift/start`
*   **Method:** `POST`
*   **Access:** `CASHIER`
*   **Request Body:**
    ```json
    { "initialCash": 1000000 } // Tiền lẻ đầu ca
    ```

### 9.2 Thanh toán hóa đơn (POS)
*   **URL:** `/sales/pos/invoice`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "customerId": 5, // Optional (để tích điểm)
      "voucherCode": "SALE50", // Optional
      "paymentMethod": "CASH", // CASH, BANK_TRANSFER, CREDIT_CARD
      "items": [
        { "productId": 1, "quantity": 2 },
        { "productId": 3, "quantity": 1 }
      ]
    }
    ```
*   **Response:** Trả về chi tiết hóa đơn, tổng tiền, điểm tích lũy.

### 9.3 Trả hàng (Return)
*   **URL:** `/sales/return`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "invoiceId": 102,
      "reason": "Sản phẩm bị lỗi",
      "items": [
        {
          "productId": 1,
          "quantity": 1,
          "isRestocked": false // false = Hủy luôn, true = Nhập lại kho bán
        }
      ]
    }
    ```

### 9.4 Kết ca
*   **URL:** `/sales/shift/end`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "actualCash": 5500000, // Tiền đếm được trong két
      "note": "Kết ca, lệch 10k do thối nhầm"
    }
    ```

---

## 10. 🚚 Orders Module (Đơn hàng Online)

### 10.1 Lấy danh sách đơn hàng
*   **URL:** `/orders`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`
*   **Query Params:**
    *   `status`: `PENDING` (Chờ duyệt), `CONFIRMED` (Đã duyệt/Đang lấy hàng), `SHIPPING` (Đang giao), `COMPLETED`, `CANCELLED`.
    *   `page`: 1
    *   `limit`: 20

### 10.2 Cập nhật trạng thái đơn
*   **URL:** `/orders/:id/status`
*   **Method:** `PATCH`
*   **Request Body:**
    ```json
    {
      "status": "CONFIRMED"
    }
    ```
*   **Logic xử lý:**
    *   `PENDING` -> `CONFIRMED`: Hệ thống sẽ **trừ tồn kho** sản phẩm.
    *   `SHIPPING` -> `COMPLETED`: Hệ thống sẽ **cộng điểm** cho khách hàng.
    *   `CONFIRMED/SHIPPING` -> `CANCELLED`: Hệ thống sẽ **hoàn lại tồn kho** (cộng lại).
