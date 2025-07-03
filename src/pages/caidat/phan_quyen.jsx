// src/pages/caidat/phan_quyen.jsx
import React from 'react';
import { Card, Table, Tag, Space, Button, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
// Import các hàm cần thiết từ user_permission.js
import { hasPermission, getPermissionMessage, USER_ROLES, getCurrentUserRole, isAdmin } from '../../config/utils/user_permission'; // Đã thêm getCurrentUserRole, isAdmin cho debug

export default function PhanQuyenPage() {
    // --- BẮT ĐẦU PHẦN DEBUG ---
    // Các console.log này rất hữu ích để kiểm tra trực tiếp trong trình duyệt (F12 -> Console)
    console.log('--- Debugging PhanQuyenPage Permissions ---');
    console.log('Current User Role (from localStorage):', getCurrentUserRole());
    console.log('Is Current User Admin (using isAdmin()):', isAdmin());
    console.log('Does current user have "phanQuyen:view" permission (using hasPermission):', hasPermission('phanQuyen', 'view'));
    console.log('------------------------------------------');
    // --- KẾT THÚC PHẦN DEBUG ---

    // Kiểm tra quyền xem trang ngay từ đầu. Nếu không có quyền, hiển thị thông báo.
    // Dựa trên logic của hasPermission, nếu là Admin thì sẽ luôn trả về true ở đây.
    if (!hasPermission('phanQuyen', 'view')) {
        message.error(getPermissionMessage('view'));
        return (
            <Card title="Quản Lý Phân Quyền Tài Khoản" style={{ marginTop: 20 }}>
                Bạn không có quyền xem trang này.
            </Card>
        );
    }

    // Dữ liệu mẫu cho bảng phân quyền
    const phanQuyenData = [
        {
            key: '1',
            roleName: 'Admin',
            roleCode: USER_ROLES.ADMIN, // Sử dụng USER_ROLES để đảm bảo nhất quán
            description: 'Toàn quyền truy cập và quản lý hệ thống.',
        },
        {
            key: '2',
            roleName: 'Quản lý nhân sự',
            roleCode: USER_ROLES.QUAN_LY_NHAN_SU,
            description: 'Quản lý nhân viên, phòng ban, lương, nghỉ phép và các cài đặt liên quan đến nhân sự.',
        },
        {
            key: '3',
            roleName: 'Quản lý nhân sự phụ',
            roleCode: USER_ROLES.QUAN_LY_NHAN_SU_PHU,
            description: 'Hỗ trợ quản lý nhân viên, chấm công, thêm mới các yêu cầu cơ bản.',
        },
        // Thêm các vai trò khác nếu có trong hệ thống của bạn
    ];

    // Xử lý sự kiện khi thêm quyền mới
    const handleAddRole = () => {
        if (hasPermission('phanQuyen', 'add')) {
            console.log('Được phép thêm quyền mới');
            message.success('Chức năng thêm quyền mới sẽ được triển khai tại đây!');
            // Triển khai logic thêm quyền mới ở đây (ví dụ: mở modal, gọi API)
        } else {
            message.error(getPermissionMessage('add'));
        }
    };

    // Xử lý sự kiện khi sửa quyền
    const handleEditRole = (record) => {
        if (hasPermission('phanQuyen', 'edit')) {
            console.log('Được phép sửa quyền:', record);
            message.success(`Chức năng sửa quyền cho vai trò "${record.roleName}" sẽ được triển khai!`);
            // Triển khai logic sửa quyền ở đây (ví dụ: mở modal chỉnh sửa)
        } else {
            message.error(getPermissionMessage('edit'));
        }
    };

    // Xử lý sự kiện khi xóa quyền
    const handleDeleteRole = (record) => {
        if (hasPermission('phanQuyen', 'delete')) {
            console.log('Được phép xóa quyền:', record);
            message.success(`Chức năng xóa quyền cho vai trò "${record.roleName}" sẽ được triển khai!`);
            // Triển khai logic xóa quyền ở đây (ví dụ: hiển thị confirm dialog, gọi API xóa)
        } else {
            message.error(getPermissionMessage('delete'));
        }
    };

    // Định nghĩa các cột cho bảng Ant Design
    const columns = [
        {
            title: 'Tên Vai Trò',
            dataIndex: 'roleName',
            key: 'roleName',
        },
        {
            title: 'Mã Vai Trò',
            dataIndex: 'roleCode',
            key: 'roleCode',
            render: (code) => <Tag color="blue">{code}</Tag> // Hiển thị mã vai trò dưới dạng tag
        },
        {
            title: 'Mô Tả',
            dataIndex: 'description',
            key: 'description',
            width: '40%' // Đặt chiều rộng cho cột mô tả
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {/* Chỉ hiển thị nút Sửa nếu người dùng có quyền 'edit' */}
                    {hasPermission('phanQuyen', 'edit') && (
                        <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditRole(record)}>Sửa</Button>
                    )}
                    {/* Chỉ hiển thị nút Xóa nếu người dùng có quyền 'delete' */}
                    {hasPermission('phanQuyen', 'delete') && (
                        <Button type="default" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRole(record)}>Xóa</Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card title="Quản Lý Phân Quyền Tài Khoản" style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 16 }}>
                {/* Chỉ hiển thị nút Thêm mới nếu người dùng có quyền 'add' */}
                {hasPermission('phanQuyen', 'add') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>Thêm Vai Trò Mới</Button>
                )}
            </div>
            <Table
                columns={columns}
                dataSource={phanQuyenData}
                pagination={{ pageSize: 10 }} // Phân trang với 10 mục mỗi trang
                bordered // Hiển thị đường viền cho bảng
                rowKey="key" // Sử dụng 'key' làm khóa duy nhất cho mỗi hàng
            />
        </Card>
    );
}