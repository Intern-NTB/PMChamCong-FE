/**
 * @typedef {Object} NhanVien
 * @property {number} MaNhanVien - Mã nhân viên (Primary Key, auto increment)
 * @property {string} HoTen - Họ và tên nhân viên
 * @property {string} NgaySinh - Ngày sinh (format: dd/MM/yyyy)
 * @property {string} SoDienThoai - Số điện thoại (10 số)
 * @property {string} CMND - Chứng minh nhân dân/CCCD (12 số)
 * @property {string} DiaChi - Địa chỉ
 * @property {string} NgayVaoLam - Ngày vào làm (format: dd/MM/yyyy HH:mm:ss)
 * @property {number} LuongCoBan - Lương cơ bản
 * @property {'Mới đăng ký'|'Đang làm'|'Nghỉ phép'|'Nghỉ dài hạn'|'Không còn làm'} TrangThai - Trạng thái nhân viên
 * @property {number} MaVaiTro - Mã vai trò (Foreign Key)
 * @property {number} MaUuTien - Mã ưu tiên (Foreign Key)
 * @property {number} MaPhongBan - Mã phòng ban (Foreign Key)
 * @property {number} HeSoTangCa - Hệ số tăng ca (default: 1.0)
 */