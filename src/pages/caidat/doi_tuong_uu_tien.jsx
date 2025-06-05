import React, { useState, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, Space, Card, Statistic, Row, Col, Typography, Tag, Popconfirm, message, Divider, Select
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined, UserOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Search } = Input;

export default function DoiTuongUuTienComponent  ()  {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');

    // Mock data
    const [doiTuongUuTienList, setDoiTuongUuTienList] = useState([
        {
            maUuTien: 1,
            tenVaiTro: 'Thai sản',
            ghiChu: 'Dành cho phụ nữ mang thai và cho con bú',
            totalMembers: 156,
        },
        {
            maUuTien: 2,
            tenVaiTro: 'Có con nhỏ',
            ghiChu: 'Dành cho người có con dưới 6 tuổi',
            totalMembers: 89,
        },
        {
            maUuTien: 3,
            tenVaiTro: 'Người khuyết tật',
            ghiChu: 'Dành cho người khuyết tật và gia đình',
            totalMembers: 42,
        },
        {
            maUuTien: 4,
            tenVaiTro: 'Người cao tuổi',
            ghiChu: 'Dành cho người trên 65 tuổi',
            totalMembers: 73,
        },
        {
            maUuTien: 5,
            tenVaiTro: 'Cựu chiến binh',
            ghiChu: 'Dành cho cựu chiến binh và gia đình liệt sĩ',
            totalMembers: 25,
        },
    ]);

    // Color mapping cho priority
    const getPriorityColor = (priority) => {
        const colorMap = {
            'Cao': 'red',
            'Trung bình': 'orange',
            'Thấp': 'green'
        };
        return colorMap[priority] || 'default';
    };

    // Data source mapping
    const dataSource = doiTuongUuTienList.map(item => ({
        key: item.maUuTien,
        maUuTien: item.maUuTien,
        tenVaiTro: item.tenVaiTro,
        ghiChu: item.ghiChu,
        totalMembers: item.totalMembers,
        status: item.status,
        priority: item.priority,
        createdDate: item.createdDate
    }));

    const onFinish = (values) => {
        if (editingId) {
            setDoiTuongUuTienList(prev => prev.map(item =>
                item.maUuTien === editingId ? {
                    ...item,
                    ...values,
                    updatedDate: new Date().toISOString().split('T')[0]
                } : item
            ));
            message.success('Cập nhật đối tượng ưu tiên thành công!');
        } else {
            const newItem = {
                maUuTien: Date.now(),
                ...values,
                status: 'Hoạt động',
                priority: values.priority || 'Trung bình',
                createdDate: new Date().toISOString().split('T')[0],
                totalMembers: 0
            };
            setDoiTuongUuTienList(prev => [...prev, newItem]);
            message.success('Thêm đối tượng ưu tiên thành công!');
        }
        handleCancel();
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = useCallback((record) => {
        setEditingId(record.maUuTien);
        form.setFieldsValue({
            tenVaiTro: record.tenVaiTro,
            ghiChu: record.ghiChu,
            priority: record.priority
        });
        setIsModalVisible(true);
    }, [form]);

    const handleDelete = async (maUuTien) => {
        try {
            setDoiTuongUuTienList(prev => prev.filter(item => item.maUuTien !== maUuTien));
            message.success('Xóa đối tượng ưu tiên thành công!');
        } catch (error) {
            message.error('Đã xảy ra lỗi khi xóa đối tượng ưu tiên');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Mã ưu tiên',
            dataIndex: 'maUuTien',
            key: 'maUuTien',
            width: 120,
            render: (text) => <Tag color="blue">UT{text}</Tag>,
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                record.maUuTien?.toString().toLowerCase().includes(value.toLowerCase()) ||
                record.tenVaiTro?.toLowerCase().includes(value.toLowerCase()) ||
                record.ghiChu?.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Tên đối tượng',
            dataIndex: 'tenVaiTro',
            key: 'tenVaiTro',
            width: 200,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: 300,
            render: (text) => (
                <Text
                    type="secondary"
                    ellipsis={{ tooltip: text }}
                    style={{ maxWidth: 280 }}
                >
                    {text}
                </Text>
            ),
        },
      
        {
            title: 'Số thành viên',
            dataIndex: 'totalMembers',
            key: 'totalMembers',
            width: 120,
            render: (count) => (
                <Space>
                    <TeamOutlined />
                    <Tag color="green">{count}</Tag>
                </Space>
            ),
            sorter: (a, b) => a.totalMembers - b.totalMembers,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="middle"
                    />
                    <Popconfirm
                        title="Xóa đối tượng ưu tiên"
                        description="Bạn có chắc chắn muốn xóa đối tượng ưu tiên này?"
                        onConfirm={() => handleDelete(record.maUuTien)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined style={{ color: 'red' }} />}
                            size="middle"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Tính toán thống kê
    const totalObjects = dataSource.length;
    const activeObjects = dataSource.filter(item => item.status === 'Hoạt động').length;
    const totalMembers = dataSource.reduce((acc, item) => acc + (item.totalMembers || 0), 0);
    const highPriorityCount = dataSource.filter(item => item.priority === 'Cao').length;

    return (
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
            <div style={{ margin: '0 auto' }}>
                {/* Header */}
                <Card style={{ marginBottom: '24px' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title
                                level={2}
                                style={{
                                    marginBottom: 8,
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 700
                                }}
                            >
                                Quản Lý Đối Tượng Ưu Tiên
                            </Title>
                            <Text type="secondary">Quản lý và phân loại các đối tượng được ưu tiên trong hệ thống</Text>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={handleAdd}
                                style={{
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)'
                                }}
                            >
                                Thêm Đối Tượng Ưu Tiên
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Statistics */}
                <Row gutter={[16, 16]} justify={'center'} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Tổng Đối Tượng"
                                value={totalObjects}
                                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Đang Hoạt Động"
                                value={activeObjects}
                                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Search and Table */}
                <Card>
                    <Row style={{ marginBottom: '16px' }}>
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder="Tìm kiếm theo mã, tên hoặc ghi chú..."
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
                        rowKey="maUuTien"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} đối tượng ưu tiên`,
                        }}
                        scroll={{ x: 1200 }}
                        size="middle"
                    />
                </Card>

                {/* Modal Form */}
                <Modal
                    centered
                    title={
                        <Space>
                            <UserOutlined />
                            {editingId ? 'Chỉnh Sửa Đối Tượng Ưu Tiên' : 'Thêm Đối Tượng Ưu Tiên'}
                        </Space>
                    }
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                    width={700}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Tên đối tượng ưu tiên"
                                    name="tenVaiTro"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên đối tượng ưu tiên!' },
                                        { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
                                    ]}
                                >
                                    <Input placeholder="Nhập tên đối tượng ưu tiên" />
                                </Form.Item>
                            </Col>
                           
                        </Row>

                        <Form.Item
                            label="Ghi chú"
                            name="ghiChu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập ghi chú!' }
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Nhập ghi chú về đối tượng ưu tiên"
                                rows={4}
                            />
                        </Form.Item>

                        <Divider />

                        <Row justify="end" gutter={8}>
                            <Col>
                                <Button onClick={handleCancel}>
                                    Hủy
                                </Button>
                            </Col>
                            <Col>
                                <Button type="primary" htmlType="submit">
                                    {editingId ? 'Cập Nhật' : 'Thêm Mới'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}