# Supermarket API Documentation

Documentation for the Supermarket Management System Backend API.

## Base URL
`http://localhost:8080/api`

## Authentication
Tất cả các endpoints private đều yêu cầu Header:
`Authorization: Bearer <your_token>`

Roles: `ADMIN`, `MANAGER`, `WAREHOUSE`, `CASHIER`

---

## 1. Auth Module (Nhân viên)
Quản lý đăng nhập, đăng ký và xác thực nhân viên.

### Register (Tạo nhân viên mới)
*   **URL:** `/auth/user/register`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Body:**
    ```json
    {
      "fullName": "Nguyen Van A",
      "email": "staff@example.com",
      "password": "password123",
      "phone": "0901234567",
      "role": "CASHIER" 
    }
    ```
    *(Role options: CASHIER, WAREHOUSE, MANAGER)*

### Login
*   **URL:** `/auth/user/login`
*   **Method:** `POST`
*   **Access:** `Public`
*   **Body:**
    ```json
    {
      "email": "staff@example.com",
      "password": "password123"
    }
    ```

### Logout
*   **URL:** `/auth/user/logout`
*   **Method:** `POST`
*   **Access:** `Private`

---

## 2. Users Module (Quản lý nhân viên)
Quản lý danh sách nhân viên trong hệ thống.

### Get All Users
*   **URL:** `/users`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`
*   **Query Params:**
    *   `role`: Lọc theo quyền (VD: CASHIER)
    *   `search`: Tìm theo tên hoặc email

### Get User Detail
*   **URL:** `/users/:id`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`

### Update User Info
*   **URL:** `/users/:id`
*   **Method:** `PATCH`
*   **Access:** `ADMIN`
*   **Body:** (Các trường muốn sửa)
    ```json
    {
      "fullName": "Nguyen Van B",
      "phone": "0999999999"
    }
    ```

### Toggle Active Status (Khóa/Mở khóa)
*   **URL:** `/users/:id/toggle-active`
*   **Method:** `PATCH`
*   **Access:** `ADMIN`

### Delete User
*   **URL:** `/users/:id`
*   **Method:** `DELETE`
*   **Access:** `ADMIN`

---

## 3. Products Module (Hàng hóa)
Quản lý danh mục và sản phẩm.

### Categories (Danh mục)

#### Get All Categories
*   **URL:** `/products/categories`
*   **Method:** `GET`
*   **Access:** `Private`

#### Create Category
*   **URL:** `/products/categories`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Body:**
    ```json
    {
      "name": "Nước ngọt"
    }
    ```

#### Get Category Detail
*   **URL:** `/products/categories/:id`
*   **Method:** `GET`
*   **Access:** `Private`

### Products (Sản phẩm)

#### Get All Products
*   **URL:** `/products`
*   **Method:** `GET`
*   **Access:** `Private`
*   **Query Params:**
    *   `categoryId`: ID danh mục
    *   `search`: Tên hoặc Barcode
    *   `lowStock`: `true` (Lọc hàng sắp hết)

#### Create Product
*   **URL:** `/products`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Body:**
    ```json
    {
      "name": "Coca Cola 330ml",
      "barcode": "893000123456",
      "categoryId": 1,
      "retailPrice": 10000,
      "unit": "Lon",
      "packingQuantity": 1,
      "imageUrl": "http://image-url.com"
    }
    ```

#### Get Product by Barcode
*   **URL:** `/products/barcode/:barcode`
*   **Method:** `GET`
*   **Access:** `Private`

#### Update Product
*   **URL:** `/products/:id`
*   **Method:** `PATCH`
*   **Access:** `ADMIN`, `MANAGER`

#### Delete Product
*   **URL:** `/products/:id`
*   **Method:** `DELETE`
*   **Access:** `ADMIN`, `MANAGER`

---

## 4. Inventory Module (Kho)
Quản lý nhập hàng và tồn kho.

### Import Goods (Nhập hàng)
*   **URL:** `/inventory/import`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`
*   **Body:**
    *   **Trường hợp 1: Nhập hàng cho sản phẩm đã có**
        ```json
        {
          "supplierId": 1,
          "note": "Nhập hàng đầu tháng",
          "items": [
            {
              "productId": 1,
              "quantity": 100,
              "unitCost": 8000
            }
          ]
        }
        ```
    *   **Trường hợp 2: Nhập hàng cho sản phẩm MỚI HOÀN TOÀN**
        ```json
        {
          "supplierId": 1,
          "note": "Nhập sản phẩm mới",
          "items": [
            {
              "isNewProduct": true,
              "quantity": 50,
              "unitCost": 15000,
              "productData": {
                "name": "Bánh Quy Bơ Mới",
                "barcode": "893123456789",
                "categoryId": 2,
                "retailPrice": 25000,
                "unit": "hộp",
                "minStockLevel": 20,
                "description": "Bánh quy bơ nhập khẩu",
                "imageUrl": "http://..."
              }
            }
          ]
        }
        ```

### Get Import History
*   **URL:** `/inventory/import`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`
*   **Query Params:** `page`, `limit`, `fromDate`, `toDate`

### Get Import Detail
*   **URL:** `/inventory/import/:id`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`

### Stock Status (Xem tồn kho)
*   **URL:** `/inventory/status`
*   **Method:** `GET`
*   **Access:** `All Roles`
*   **Query Params:** `lowStock=true` (chỉ xem hàng sắp hết)

### Adjust Stock (Kiểm kê / Hủy hàng)
*   **URL:** `/inventory/adjust`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`
*   **Body (Hư hỏng):**
    ```json
    {
      "productId": 1,
      "changeType": "DAMAGE",
      "quantity": 2,
      "note": "Hàng vỡ khi vận chuyển" 
    }
    ```
*   **Body (Kiểm kê):**
    ```json
    {
      "productId": 1,
      "changeType": "AUDIT",
      "quantity": 98, 
      "note": "Cân bằng lại kho sau kiểm kê"
    }
    ```
    *(Lưu ý: Với AUDIT, quantity là số lượng thực tế trong kho)*

### Stock Logs (Lịch sử kho)
*   **URL:** `/inventory/logs`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`

---

## 5. Partners Module (Nhà cung cấp)
Quản lý thông tin nhà cung cấp.

### Get All Suppliers
*   **URL:** `/partners/suppliers`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`
*   **Query Params:** `search`

### Create Supplier
*   **URL:** `/partners/supplier`
*   **Method:** `POST`
*   **Access:** `ADMIN`, `MANAGER`
*   **Body:**
    ```json
    {
      "name": "Coca Cola Viet Nam",
      "phone": "0281234567",
      "email": "contact@coca.vn",
      "address": "TP.HCM"
    }
    ```

### Get Supplier Detail
*   **URL:** `/partners/supplier/:id`
*   **Method:** `GET`
*   **Access:** `ADMIN`, `MANAGER`, `WAREHOUSE`

### Update Supplier
*   **URL:** `/partners/supplier/:id`
*   **Method:** `PATCH`
*   **Access:** `ADMIN`, `MANAGER`

### Delete Supplier
*   **URL:** `/partners/supplier/:id`
*   **Method:** `DELETE`
*   **Access:** `ADMIN`
