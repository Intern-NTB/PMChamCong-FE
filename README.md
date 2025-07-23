# Dự án máy chấm công và quản lý nhân sự

## 📋 Mô tả dự án

Hệ thống quản lý máy chấm công và nhân sự là một ứng dụng web frontend được xây dựng bằng React, giúp quản lý:
- Thông tin nhân viên và phòng ban
- Hệ thống chấm công với máy quét vân tay
- Quản lý lương, phụ cấp, tiền thưởng
- Quản lý nghỉ phép và giấy nghỉ phép
- Hệ thống phân quyền và vai trò
- Báo cáo và thống kê

## 🚀 Công nghệ sử dụng

### Frontend Framework
- **React 19.1.0** - Thư viện UI chính
- **Vite** - Build tool và dev server
- **React Router DOM** - Routing

### UI Library & Styling
- **Ant Design 5.26.1** - Component library chính
- **Ant Design Icons** - Icon set
- **Ant Design Charts** - Biểu đồ và charts
- **DevExtreme React** - Advanced UI components
- **React Icons** - Bộ icon bổ sung
- **Tailwind CSS** - Utility-first CSS framework

### State Management & Data Fetching
- **Redux Toolkit** - State management
- **React Redux** - React bindings cho Redux
- **TanStack React Query** - Server state management
- **Axios** - HTTP client

### Utilities & Tools
- **Day.js & Moment.js** - Xử lý ngày tháng
- **Excel.js** - Xuất file Excel
- **jsPDF & jsPDF AutoTable** - Tạo file PDF
- **PDFMake** - Tạo PDF nâng cao
- **QRCode.React** - Tạo mã QR
- **React Toastify** - Thông báo toast
- **Socket.io Client** - Real-time communication
- **React Highlight Words** - Highlight text
- **File Saver** - Lưu file
- **IMask & React IMask** - Input masking

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy ở môi trường development
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5175`

### Build cho production
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

## 🏗️ Cấu trúc thư mục

```
src/
├── assets/                 # Tài nguyên tĩnh
│   ├── fonts/             # Font chữ
│   ├── icons/             # Icon
│   ├── images/            # Hình ảnh
│   └── styles/            # CSS variables
├── component/             # Components tái sử dụng
│   ├── hooks/             # Custom hooks
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   └── utils/             # Utility functions
├── config/                # Cấu hình ứng dụng
│   ├── axiosInstance.js   # Cấu hình Axios
│   └── utils/             # Utilities cho config
├── context/               # React Context
├── pages/                 # Các trang chính
│   ├── auth/              # Đăng nhập
│   ├── caidat/            # Cài đặt
│   ├── chamcong/          # Chấm công
│   ├── employee/          # Nhân viên
│   ├── giaynghiphep/      # Giấy nghỉ phép
│   ├── luong/             # Lương
│   ├── maychamcong/       # Máy chấm công
│   └── nghiphep/          # Nghỉ phép
├── routes/                # Định tuyến
├── services/              # API services
└── types/                 # Type definitions
```

## ⚙️ Cấu hình môi trường

Tạo file `.env` với các biến môi trường:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🔧 Tính năng chính

### 1. Quản lý nhân viên
- Thêm, sửa, xóa nhân viên
- Quản lý thông tin cá nhân
- Phân bổ phòng ban và vai trò

### 2. Hệ thống chấm công
- Quét vân tay
- Theo dõi giờ vào/ra
- Quản lý ca làm việc
- Thống kê chấm công

### 3. Quản lý máy chấm công
- Cấu hình máy chấm công
- Đồng bộ dữ liệu
- Quản lý kết nối

### 4. Quản lý lương
- Tính lương theo ca
- Phụ cấp và tiền thưởng
- Lịch sử lương
- Xuất báo cáo

### 5. Nghỉ phép
- Đăng ký nghỉ phép
- Duyệt nghỉ phép
- Quản lý ngày lễ
- Theo dõi số ngày phép

### 6. Hệ thống phân quyền
- Quản lý vai trò
- Phân quyền theo chức năng
- Bảo mật đa tầng

## 🔐 Xác thực và phân quyền

- **JWT Token Authentication**: Sử dụng Bearer token
- **Auto logout**: Tự động đăng xuất khi token hết hạn
- **Protected Routes**: Bảo vệ route theo quyền
- **Role-based Access**: Phân quyền dựa trên vai trò

## 📱 Responsive Design

- Hỗ trợ đầy đủ trên desktop, tablet và mobile
- Sử dụng Ant Design responsive utilities
- Layout linh hoạt với Tailwind CSS

## 🔔 Hệ thống thông báo

- **Notification tự động**: Hiển thị thông báo dựa trên HTTP status code
- **Toast notifications**: Sử dụng react-toastify
- **Error handling**: Xử lý lỗi tập trung thông qua Axios interceptors

### Các loại thông báo:
- ✅ **200-299**: Thành công
- ⚠️ **400**: Dữ liệu không hợp lệ
- 🚫 **401**: Không có quyền thực hiện
- 🔒 **403**: Truy cập bị từ chối
- ❓ **404**: Không tìm thấy dữ liệu
- 📝 **422**: Dữ liệu không đúng định dạng
- ❌ **500+**: Lỗi hệ thống

## 🎨 UI/UX Features

- **Dark/Light mode**: Hỗ trợ theme switching
- **Charts & Analytics**: Biểu đồ thống kê với Ant Design Charts
- **Export functions**: Xuất Excel, PDF
- **QR Code generation**: Tạo mã QR
- **Real-time updates**: Socket.io integration

## 🛠️ Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting (cần cài đặt thêm)
- **Vite DevTools**: Development server
- **React DevTools**: Debug React components

## 📈 Performance

- **Code splitting**: Lazy loading cho routes
- **React Query**: Caching và synchronization
- **Memoization**: Tối ưu re-renders
- **Bundle optimization**: Vite build optimization

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này thuộc bản quyền của công ty.

## 📞 Liên hệ

- **Dự án**: Hệ thống máy chấm công
- **Version**: 0.0.0
- **Port**: 5175 (development)

---

**Lưu ý**: Đảm bảo cấu hình đúng biến môi trường và kết nối backend API trước khi chạy ứng dụng.
