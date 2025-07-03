// src/pages/caidat/phan_quyen.jsx
import React from 'react';
import { Card, Table, Tag, Space, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
// Giả sử bạn sẽ tạo một hook để quản lý dữ liệu phân quyền
// import usePhanQuyen from '../../hooks/usePhanQuyen'; 

export default function PhanQuyenPage() {
    // Dữ liệu mẫu về phân quyền (thay thế bằng dữ liệu từ API sau này)
    const phanQuyenData = [
        {
            key: '1',
            roleName: 'Admin',
            permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'manage_settings'],
            description: 'Toàn quyền truy cập hệ thống',
        },
        {
            key: '2',
            roleName: 'Quản lý',
            permissions: ['view_employee', 'edit_employee', 'view_report', 'manage_department'],
            description: 'Quản lý nhân viên và phòng ban',
        },
        {
            key: '3',
            roleName: 'Nhân viên',
            permissions: ['view_personal_info', 'view_timesheet'],
            description: 'Chỉ xem thông tin cá nhân và bảng công',
        },
    ];

    const columns = [
        {
            title: 'Tên Vai Trò',
            dataIndex: 'roleName',
            key: 'roleName',
        },
        {
            title: 'Quyền Hạn',
            key: 'permissions',
            dataIndex: 'permissions',
            render: (permissions) => (
                <>
                    {permissions.map((permission) => {
                        let color = permission.length > 5 ? 'geekblue' : 'green';
                        if (permission.includes('delete')) {
                            color = 'volcano';
                        }
                        return (
                            <Tag color={color} key={permission} style={{ marginBottom: 4 }}>
                                {permission.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Mô Tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => console.log('Sửa:', record)}>Sửa</Button>
                    <Button type="default" danger icon={<DeleteOutlined />} onClick={() => console.log('Xóa:', record)}>Xóa</Button>
                </Space>
            ),
        },
    ];

    return (
        <Card title="Quản Lý Phân Quyền Tài Khoản" style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => console.log('Thêm quyền mới')}>Thêm Quyền Mới</Button>
            </div>
            <Table
                columns={columns}
                dataSource={phanQuyenData}
                pagination={{ pageSize: 10 }} // Thêm phân trang
                bordered // Thêm đường viền bảng
            />
        </Card>
    );
}