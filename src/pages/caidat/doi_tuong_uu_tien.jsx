import React, { useState, useCallback } from 'react';
import {
    Row,
    Col,
    Form,
    Input,
    Space,
    Divider,
    Modal,
    message,
    Button as AntButton,
    Card,
    Tag,
    Checkbox,
    Typography,
    Empty,
    Pagination,
    Select
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const DoiTuongUuTienComponent = () => {
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

    // Mock data
    const [doiTuongUuTienList, setDoiTuongUuTienList] = useState([
        { id: 1, name: 'Thai sản' },
        { id: 2, name: 'Có con' },
    ]);

    // Filter data
    const filteredData = doiTuongUuTienList.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.note.toLowerCase().includes(searchTerm.toLowerCase());
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
                item.id === editingId ? {
                    ...item,
                    ...values,
                    updatedDate: new Date().toISOString().split('T')[0]
                } : item
            ));
            message.success('Cập nhật phòng ban thành công!');
        } else {
            const newItem = {
                id: Date.now(),
                ...values,
                status: 'Hoạt động',
                createdDate: new Date().toISOString().split('T')[0]
            };
            setDoiTuongUuTienList(prev => [...prev, newItem]);
            message.success('Thêm phòng ban thành công!');
        }
        handleCancel();
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = useCallback((data) => {
        setEditingId(data.id);
        form.setFieldsValue(data);
        setIsModalVisible(true);
    }, [form]);

    const handleView = useCallback((data) => {
        Modal.info({
            title: 'Thông tin phòng ban',
            width: 600,
            content: (
                <div style={{ marginTop: 16 }}>
                    <p><strong>Tên phòng ban:</strong> {data.name}</p>
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
            message.warning('Vui lòng chọn ít nhất một phòng ban để xóa!');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận xóa nhiều',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} phòng ban đã chọn?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                setDoiTuongUuTienList(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
                setSelectedRowKeys([]);
                message.success(`Đã xóa ${selectedRowKeys.length} phòng ban thành công!`);
            }
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
    };

    const handleCardSelect = (id, checked) => {
        if (checked) {
            setSelectedRowKeys(prev => [...prev, id]);
        } else {
            setSelectedRowKeys(prev => prev.filter(key => key !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRowKeys(paginatedData.map(item => item.id));
        } else {
            setSelectedRowKeys([]);
        }
    };

    const renderPhongBanCard = (item) => (
        <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
                hoverable
                style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: selectedRowKeys.includes(item.id) ? '2px solid #1890ff' : '1px solid #d9d9d9'
                }}
            >
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Checkbox
                            checked={selectedRowKeys.includes(item.id)}
                            onChange={(e) => handleCardSelect(item.id, e.target.checked)}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: {item.id}
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex' }}>
                    <Space size="small">
                        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                            {item.name}
                        </Title>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                            <AntButton
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(item)}
                                size="small"
                                title="Sửa"
                                style={{
                                    marginRight: 12
                                }}
                            />

                            <AntButton
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(item)}
                                size="small"
                                title="Xóa"
                                style={{ color: 'white' }}
                            />
                        </div>

                    </Space>
                </div>
            </Card>
        </Col>
    );

    return (
        <div style={{ padding: '0 16px' }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 12 }}>
                        Quản lý đối tượng ưu tiên
                    </Title>
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

                    </Space>
                </Col>
            </Row>

            {/* Filter Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8}>
                    <Search
                        placeholder="Tìm kiếm đối tượng ưu tiên..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={setSearchTerm}
                    />
                </Col>
                <Col xs={24} sm={24} md={10}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <Checkbox
                            checked={paginatedData.length > 0 && selectedRowKeys.length === paginatedData.length}
                            indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < paginatedData.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        >
                            Chọn tất cả
                        </Checkbox>
                        <AntButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm đối tượng ưu tiên
                        </AntButton>
                    </div>
                </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            {/* Cards Section */}
            {paginatedData.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {paginatedData.map(renderPhongBanCard)}
                </Row>
            ) : (
                <Empty
                    description="Không tìm thấy phòng ban nào"
                    style={{ margin: '40px 0' }}
                />
            )}

            {/* Pagination */}
            {filteredData.length > pageSize && (
                <Row justify="center" style={{ marginTop: 24 }}>
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
                </Row>
            )}
            <Text type="secondary">
                Tổng: {filteredData.length} đối tượng ưu tiên
            </Text>

            {/* Modal Confirm Delete */}
            <Modal
                title="Xác nhận xóa"
                open={isModalConfirmVisible.visible}
                centered
                width={400}
                onCancel={() => setIsModalConfirmVisible({ visible: false, data: null })}
                footer={[
                    <AntButton
                        key="cancel"
                        onClick={() => setIsModalConfirmVisible({ visible: false, data: null })}
                    >
                        Hủy
                    </AntButton>,
                    <AntButton
                        key="delete"
                        type="primary"
                        danger
                        onClick={() => {
                            setDoiTuongUuTienList(prev =>
                                prev.filter(item => item.id !== isModalConfirmVisible.data.id)
                            );
                            setIsModalConfirmVisible({ visible: false, data: null });
                            message.success('Xóa phòng ban thành công!');
                        }}
                    >
                        Xóa
                    </AntButton>
                ]}
            >
                <p>
                    Bạn có chắc chắn muốn xóa phòng ban
                    <strong> "{isModalConfirmVisible.data?.name}"</strong> không?
                </p>
            </Modal>

            {/* Modal Form */}
            <Modal
                title={editingId ? 'Sửa phòng ban' : 'Thêm phòng ban'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    name="phongBanForm"
                    onFinish={onFinish}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="name"
                        label="Tên phòng ban"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên phòng ban!' },
                            { min: 2, message: 'Tên phòng ban phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên phòng ban"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="note"
                        label="Ghi chú"
                        rules={[
                            { required: true, message: 'Vui lòng nhập ghi chú!' }
                        ]}
                    >
                        <Input.TextArea
                            placeholder="Nhập ghi chú về phòng ban"
                            rows={4}
                            size="large"
                        />
                    </Form.Item>

                    {editingId && (
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[
                                { required: true, message: 'Vui lòng chọn trạng thái!' }
                            ]}
                        >
                            <Select size="large" placeholder="Chọn trạng thái">
                                <Option value="Hoạt động">Hoạt động</Option>
                                <Option value="Tạm dừng">Tạm dừng</Option>
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <AntButton onClick={handleCancel}>
                                Hủy
                            </AntButton>
                            <AntButton type="primary" htmlType="submit">
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </AntButton>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};