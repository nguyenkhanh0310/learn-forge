# New project

- Khởi tạo 1 project mới
```
npm init -y
```
- Tải các packages cần thiết
```
npm install --save dotenv express express-formidable
npm install --save @aps_sdk/authentication @aps_sdk/model-derivative @aps_sdk/oss
```

- Tạo các folders:
  + wwwroot: nơi chứa các file nội dung phía máy khách (HTML, CSS, JS, ảnh,...)
  + routes: nơi triển khai các server endpoints (route) khác nhau của ứng dụng
  + services: here we're going to keep all the server-side logic that can be shared by different endpoints

- Run & debug: Run > Add Configuration -> Node.js, sửa file launch.json

## Basic server
- Tạo 1 basic server application
- Tạo file server.js
- Chỉnh sửa file package.json: thêm dòng "start": "node server.js"

# Authentication

## Access tokens
- Tạo file aps.js trong thư mục services
- File aps.js tập trung tất cả logic liên quan đến APS (xác thực, quản lý bucket, chuyển đổi tệp) trong một tệp duy nhất để tái sử dụng trên toàn bộ ứng dụng.

## Server endpoints
- Tạo file auth.js trong thư mục subfolder
- File auth.js xử lý các yêu cầu liên quan đến xác thực
- "mount" router: gắn router vào ứng dụng server để sử dụng các route được định nghĩa trong auth.js

* Quy trình hoạt động:
  - Client gửi yêu cầu đến /api/auth/token.
  - Server chuyển yêu cầu này đến router trong auth.js.
  - Router xử lý yêu cầu, tạo token và trả về JSON cho client.
  - Nếu client yêu cầu tệp tĩnh (ví dụ: /index.html), server sẽ trả về tệp từ thư mục wwwroot.

# Data & Derivatives
- Mở rộng server để list models, upload models, prepare for viewing

## Data management
- Data retention policy (chính sách lưu trữ dữ liệu)
  + Transient: lưu giữ trong vòng 24 tiếng
  + Temporary: 30 ngày
  + Persistent: vĩnh viễn (trừ khi người dùng xóa)

## Derivatives
- Derivatives là các loại dữ liệu được trích xuất từ thiết kế gốc, vd:
  + Bản vẽ 2D: thông tin bản vẽ dạng mặt phẳng
  + Hình học 3D: Thông tin không gian 3 chiều.
  + Siêu dữ liệu (Metadata): Các thông tin chi tiết, như thuộc tính đối tượng, kích thước, vật liệu, v.v.

- Tích hợp một số hàm hỗ trợ để trích xuất các loại thông tin khác nhau từ các tệp đã tải lên - VD: 2D, 3D, metadata,...
  ->  To do so, we will need to start a new conversion job in the Model Derivative service, and checking the status of the conversion.

- Add code vào file services/aps.js

### Server endpoints
- Tạo file models.js trong folder routes
- mount router đến server application -> sửa file server.js

# Viewer $ UI
- Build client-side piece of the application
```
npm install --dev @types/forge-viewer
```

### Viewer logic
- Tạo file viewer.js trong wwwroot

### Application logic
- Cho vào giao diện người dùng tất cả các mô hình có sẵn để xem, thêm giao diện người dùng để tải lên và translate mô hình mới
- Tạo tệp main.js trong thư mục wwwroot

### User interface
- Tạo file index.html trong wwwroot để tạo giao diện
- Tạo file main.css

-> run  http://localhost:8080