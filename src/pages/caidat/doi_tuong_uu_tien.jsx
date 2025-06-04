import React, { useState, useCallback } from 'react';
import {
    Row, Col, Form, Input, Space,
    Modal, message, Button as AntButton, Card,
    Tag, Checkbox, Typography, Empty, Pagination, Select,
    Tooltip, Avatar, Badge
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,

} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function DoiTuongUuTienComponent() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalConfirmVisible, setIsModalConfirmVisible] = useState({
        visible: false,
        data: null
    });
    const [editingId, setEditingId] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Mock data với thêm fields
    const [doiTuongUuTienList, setDoiTuongUuTienList] = useState([
        {
            maUuTien: 1,
            tenVaiTro: 'Thai sản',
            ghiChu: 'Dành cho phụ nữ mang thai và cho con bú',
            totalMembers: 156
        },
        {
            maUuTien: 2,
            tenVaiTro: 'Có con nhỏ',
            ghiChu: 'Dành cho người có con dưới 6 tuổi',
            totalMembers: 89
        },
        {
            maUuTien: 3,
            tenVaiTro: 'Người khuyết tật',
            ghiChu: 'Dành cho người khuyết tật và gia đình',
            totalMembers: 42
        },
        {
            maUuTien: 4,
            tenVaiTro: 'Người cao tuổi',
            ghiChu: 'Dành cho người trên 65 tuổi',
            totalMembers: 73
        },
    ]);



    // Color mapping cho priority
    const getPriorityColor = (priority) => {
        const colorMap = {
            'Cao': '#ff4d4f',
            'Trung bình': '#faad14',
            'Thấp': '#52c41a'
        };
        return colorMap[priority] || '#d9d9d9';
    };

    // Filter data
    const filteredData = doiTuongUuTienList.filter(item => {
        const matchSearch = item.tenVaiTro.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.ghiChu && item.ghiChu.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

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

    const handleEdit = useCallback((data) => {
        setEditingId(data.maUuTien);
        form.setFieldsValue(data);
        setIsModalVisible(true);
    }, [form]);

    const handleView = useCallback((data) => {
        Modal.info({
            title: 'Thông tin đối tượng ưu tiên',
            wmaUuTienth: 600,
            content: (
                <div style={{ marginTop: 16 }}>
                    <p><strong>Tên:</strong> {data.tenVaiTro}</p>
                    <p><strong>Ghi chú:</strong> {data.ghiChu}</p>
                    <p><strong>Độ ưu tiên:</strong> <Tag color={getPriorityColor(data.priority)}>{data.priority}</Tag></p>
                    <p><strong>Trạng thái:</strong> <Tag color={data.status === 'Hoạt động' ? 'green' : 'red'}>{data.status}</Tag></p>
                    <p><strong>Tổng số thành viên:</strong> {data.totalMembers}</p>
                </div>
            )
        });
    }, []);

    const handleDelete = useCallback((data) => {
        setIsModalConfirmVisible({
            visible: true,
            data: data
        });
    }, []);

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một đối tượng ưu tiên để xóa!');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận xóa nhiều',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} đối tượng ưu tiên đã chọn?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                setDoiTuongUuTienList(prev => prev.filter(item => !selectedRowKeys.includes(item.maUuTien)));
                setSelectedRowKeys([]);
                message.success(`Đã xóa ${selectedRowKeys.length} đối tượng ưu tiên thành công!`);
            }
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
    };

    const handleCardSelect = (maUuTien, checked) => {
        if (checked) {
            setSelectedRowKeys(prev => [...prev, maUuTien]);
        } else {
            setSelectedRowKeys(prev => prev.filter(key => key !== maUuTien));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRowKeys(paginatedData.map(item => item.maUuTien));
        } else {
            setSelectedRowKeys([]);
        }
    };

    const renderDoiTuongUuTienCard = (item) => (
        <Col xs={24} sm={12} md={8} lg={6} key={item.maUuTien}>
            <Card
                hoverable
                style={{
                    padding: 0,
                    height: '100%',
                    position: 'relative',
                    marginBottom: 16,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: selectedRowKeys.includes(item.maUuTien) ? '3px solmaUuTien #1890ff' : 'none',
                    height: '100%',
                    overflow: 'hmaUuTienden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: selectedRowKeys.includes(item.maUuTien) ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: selectedRowKeys.includes(item.maUuTien)
                        ? '0 20px 40px rgba(0,0,0,0.15)'
                        : '0 10px 30px rgba(0,0,0,0.1)'
                }}
            >
                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'white',
                    backdropFilter: 'blur(10px)'
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: 20,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 16
                    }}>
                        <Checkbox
                            checked={selectedRowKeys.includes(item.maUuTien)}
                            onChange={(e) => handleCardSelect(item.maUuTien, e.target.checked)}
                            style={{
                                transform: 'scale(1.2)'
                            }}
                        />
                        <Badge
                            color="#52c41a"
                            text={
                                <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>
                                    {item.totalMembers} nhân viên
                                </Text>
                            }
                        />
                    </div>

                    {/* Icon và Status */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16
                    }}>
                        <Avatar
                            size={48}
                            style={{
                                background: `linear-gradient(45deg, ${getPriorityColor(item.priority)}, ${getPriorityColor(item.priority)}90)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, marginBottom: 16 }}>
                        <Title
                            level={4}
                            style={{
                                margin: 0,
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#262626',
                                lineHeight: 1.3,
                                marginBottom: 8
                            }}
                        >
                            {item.tenVaiTro}
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 13,
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hmaUuTienden'
                            }}
                        >
                            {item.ghiChu}
                        </Text>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginTop: 'auto'
                    }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <Tooltip title="Chỉnh sửa">
                                <AntButton
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(item)}
                                    size="mmaUuTiendle"

                                />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <AntButton
                                    danger
                                    icon={<DeleteOutlined style={{ color: 'red' }} />}
                                    onClick={() => handleDelete(item)}
                                    size="mmaUuTiendle"

                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </Card>
        </Col>
    );

    return (
        <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <Row justify="space-between" align="mmaUuTiendle">
                    <Col>
                        <Title level={2} style={{

                            marginBottom: 8,
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                        }}>
                            Quản lý đối tượng ưu tiên
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Quản lý và phân loại các đối tượng được ưu tiên trong hệ thống
                        </Text>
                    </Col>
                    <Col>
                        <Space wrap>
                            {selectedRowKeys.length > 0 && (
                                <AntButton
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleBulkDelete}
                                >
                                    Xóa đã chọn ({selectedRowKeys.length})
                                </AntButton>
                            )}
                            <AntButton
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                size="large"
                                style={{
                                    borderRadius: 8,
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    border: 'none',
                                    height: 40,
                                    fontWeight: 500
                                }}
                            >
                                Thêm đối tượng ưu tiên
                            </AntButton>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Filter Section */}
            <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Tìm kiếm đối tượng ưu tiên..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onSearch={setSearchTerm}
                            size="large"

                        />
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 40 }}>
                            <Checkbox
                                checked={paginatedData.length > 0 && selectedRowKeys.length === paginatedData.length}
                                indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < paginatedData.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                style={{ fontWeight: 500 }}
                            >
                                Chọn tất cả
                            </Checkbox>
                            <Text type="secondary">
                                Tổng: <strong>{filteredData.length}</strong> đối tượng
                            </Text>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Cards Section */}
            {paginatedData.length > 0 ? (
                <Row gutter={[20, 20]}>
                    {paginatedData.map(renderDoiTuongUuTienCard)}
                </Row>
            ) : (
                <div style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 60,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}>
                    <Empty
                        description="Không tìm thấy đối tượng ưu tiên nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            )}

            {/* Pagination */}
            {filteredData.length > pageSize && (
                <div style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 20,
                    marginTop: 24,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredData.length}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} của ${total} mục`
                        }
                        pageSizeOptions={['8', '16', '24', '32']}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }}
                        onShowSizeChange={(current, size) => {
                            setCurrentPage(1);
                            setPageSize(size);
                        }}
                    />
                </div>
            )}

            {/* Modal Confirm Delete */}
            <Modal
                title="Xác nhận xóa"
                open={isModalConfirmVisible.visible}
                centered
                wmaUuTienth={400}
                onCancel={() => setIsModalConfirmVisible({ visible: false, data: null })}
                footer={[
                    <AntButton
                        key="cancel"
                        onClick={() => setIsModalConfirmVisible({ visible: false, data: null })}
                        style={{ borderRadius: 8 }}
                    >
                        Hủy
                    </AntButton>,
                    <AntButton
                        key="delete"
                        type="primary"
                        danger
                        onClick={() => {
                            setDoiTuongUuTienList(prev =>
                                prev.filter(item => item.maUuTien !== isModalConfirmVisible.data.maUuTien)
                            );
                            setIsModalConfirmVisible({ visible: false, data: null });
                            message.success('Xóa đối tượng ưu tiên thành công!');
                        }}
                        style={{ borderRadius: 8 }}
                    >
                        Xóa
                    </AntButton>
                ]}
            >
                <p>
                    Bạn có chắc chắn muốn xóa đối tượng ưu tiên
                    <strong> "{isModalConfirmVisible.data?.tenVaiTro}"</strong> không?
                </p>
            </Modal>

            {/* Modal Form */}
            <Modal
                title={editingId ? 'Sửa đối tượng ưu tiên' : 'Thêm đối tượng ưu tiên'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                wmaUuTienth={600}
                style={{ borderRadius: 16 }}
            >
                <Form
                    form={form}
                    tenVaiTro="doiTuongUuTienForm"
                    onFinish={onFinish}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        tenVaiTro="tenVaiTro"
                        label="Tên đối tượng ưu tiên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đối tượng ưu tiên!' },
                            { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên đối tượng ưu tiên"
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        tenVaiTro="ghiChu"
                        label="Ghi chú"
                        rules={[
                            { required: true, message: 'Vui lòng nhập ghi chú!' }
                        ]}
                    >
                        <Input.TextArea
                            placeholder="Nhập ghi chú về đối tượng ưu tiên"
                            rows={4}
                            size="large"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ wmaUuTienth: '100%', justifyContent: 'flex-end' }}>
                            <AntButton onClick={handleCancel} style={{ borderRadius: 8 }}>
                                Hủy
                            </AntButton>
                            <AntButton
                                type="primary"
                                htmlType="submit"
                                style={{
                                    borderRadius: 8,
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    border: 'none'
                                }}
                            >
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </AntButton>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}