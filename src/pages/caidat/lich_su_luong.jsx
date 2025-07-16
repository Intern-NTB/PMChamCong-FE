import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  Divider,
  Select,
  Tabs,
  DatePicker,
  TimePicker,
} from "antd";
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

import { useLuong } from '../../component/hooks/useLuong';
import { useNhanVien } from '../../component/hooks/useNhanVien';

export default function LichSuLuongComponent() {
    const [searchText, setSearchText] = useState('');

    const {
        danhSachLichSuThayDoi,
        loading,
        historyChangeLuong
    } = useLuong();

    useEffect(() => {
        historyChangeLuong();
    }, []);

    const {
        danhSachNhanVien,
    } = useNhanVien();

    const getTenNhanVien = (ma) => {
        const nhanVien = danhSachNhanVien.find(nv => nv.maNhanVien === ma);
        return nhanVien ? nhanVien.hoTen : ma;
    };

    const dataSource = danhSachLichSuThayDoi.map((history) => ({
        luongCu: history.luongCu,
        luongMoi: history.luongMoi,
        thoiGianThayDoi: history.thoiGianThayDoi,
        tenNguoiDuocChinh: getTenNhanVien(history.maNguoiDuocChinh),
        tenNguoiChinh: getTenNhanVien(history.maNguoiChinh),
    })).sort((a, b) => new Date(b.thoiGianThayDoi) - new Date(a.thoiGianThayDoi));;
    const columns = [
        {
            title: "Ngày Thay Đổi",
            dataIndex: "thoiGianThayDoi",
            key: "thoiGianThayDoi",
            width: 150,
            render: (text) => <Text>{new Date(text).toLocaleString()}</Text>,
            sorter: {
                compare: (a, b) => a.thoiGianThayDoi.localeCompare(b.thoiGianThayDoi, 'vi', { numeric: true }),
                multiple: 1,
            },
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                record.tenNguoiDuocChinh?.toString().toLowerCase().includes(value.toLowerCase()) ||
                record.tenNguoiChinh?.toLowerCase().includes(value.toLowerCase()) || record.tenPhongBanMoi?.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: "Nhân viên",
            dataIndex: "tenNguoiDuocChinh",
            key: "tenNguoiDuocChinh",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
            sorter: {
                compare: (a, b) => a.tenNguoiDuocChinh.localeCompare(b.tenNguoiDuocChinh, 'vi', { numeric: true }),
                multiple: 1,
            },            
        },
        {
            title: "Người thay đổi",
            dataIndex: "tenNguoiChinh",
            key: "tenNguoiChinh",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Lương Cũ",
            dataIndex: "luongCu",
            key: "luongCu",
            width: 150,
            render: (text) => <Text strong>{Number(text).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>,
            sorter: {
                compare: (a, b) => Number(a.luongCu) - Number(b.luongCu),
                multiple: 1,
            },
        },
        {
            title: "Lương Mới",
            dataIndex: "luongMoi",
            key: "luongMoi",
            width: 150,
            render: (text) => <Text strong>{Number(text).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>,
            sorter: {
                compare: (a, b) => Number(a.luongCu) - Number(b.luongCu),
                multiple: 1,
            },
        },    
    ];
    return (
        <div
            style={{
                padding: "24px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                minHeight: "100vh",
            }}
        >
            <div style={{ margin: "0 auto" }}>
                {/* Header */}
                <Card style={{ marginBottom: "24px" }}>
                    <Title
                        level={2}
                        style={{
                            marginBottom: 8,
                            background: "linear-gradient(45deg, #667eea, #764ba2)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 700,
                        }}
                    >
                        Quản Lý Lịch Sử Thay Đổi Lương
                    </Title>
                    <Text type="secondary">
                        Quản lý lịch sử các thay đổi về lương cơ bản của nhân viên
                    </Text>
                </Card>

                <Card>
                    <Row style={{ marginBottom: '16px' }}>
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder="Tìm kiếm theo tên nhân viên hoặc phòng ban mới..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                onSearch={setSearchText}
                                onChange={(e) => !e.target.value && setSearchText('')}
                            />
                        </Col>
                    </Row>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey="maNguoiChinh"
                        loading={loading}
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} tài khoản`,
                        }}
                        scroll={{ x: 800 }}
                        size="middle"
                    />
                </Card>
            </div>
        </div>
    )
}