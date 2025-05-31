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
    Select,
    Collapse
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
const { Panel } = Collapse;

export const NgayLeComponent = () => {

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
    const [ngayLeList, setNgayLeList] = useState([
        { maNgayLe: 1, tenNgayLe: 'Tết Dương lịch', ngayBatDau: '2025-01-01', ngayKetThuc: '2025-01-01', soNgayNghi: 1 },
        { maNgayLe: 2, tenNgayLe: 'Tết Nguyên đán', ngayBatDau: '2025-01-29', ngayKetThuc: '2025-02-02', soNgayNghi: 5 },
        { maNgayLe: 3, tenNgayLe: 'Giỗ Tổ Hùng Vương', ngayBatDau: '2025-04-10', ngayKetThuc: '2025-04-10', soNgayNghi: 1 },
        { maNgayLe: 4, tenNgayLe: 'Ngày Giải phóng miền Nam', ngayBatDau: '2025-04-30', ngayKetThuc: '2025-04-30', soNgayNghi: 1 },
        { maNgayLe: 5, tenNgayLe: 'Ngày Quốc tế Lao động', ngayBatDau: '2025-05-01', ngayKetThuc: '2025-05-01', soNgayNghi: 1 },
        { maNgayLe: 6, tenNgayLe: 'Quốc khánh 2/9', ngayBatDau: '2025-09-02', ngayKetThuc: '2025-09-03', soNgayNghi: 2 },
    ]);

    // Filter data
    const filteredData = ngayLeList.filter(item => {
        const matchSearch = item.tenNgayLe.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            setVaiTroList(prev => prev.map(item =>
                item.id === editingId ? {
                    ...item,
                    ...values,
                    updatedDate: new Date().toISOString().split('T')[0]
                } : item
            ));
            message.success('Cập nhật ngày lễ thành công!');
        } else {
            const newItem = {
                id: Date.now(),
                ...values,
                status: 'Hoạt động',
                createdDate: new Date().toISOString().split('T')[0]
            };
            setVaiTroList(prev => [...prev, newItem]);
            message.success('Thêm ngày lễ thành công!');
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

    const handleDelete = useCallback((data) => {
        setIsModalConfirmVisible({
            visible: true,
            data: data
        });
    }, []);

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một ngày lễ để xóa!');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận xóa nhiều',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} ngày lễ đã chọn?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                setPhongBanList(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
                setSelectedRowKeys([]);
                message.success(`Đã xóa ${selectedRowKeys.length} ngày lễ thành công!`);
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

    const groupedByNgayLe = paginatedData.reduce((acc, item) => {
        const { tenNgayLe } = item;
        if (!acc[tenNgayLe]) {
            acc[tenNgayLe] = [];
        }
        acc[tenNgayLe].push(item);
        return acc;
    }, {});

    const renderNgayLeCard = (item) => (
        <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
                hoverable
                style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    height: '150px',
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
                            ID: {item.maNgayLe}
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex' }}>
                    <Space size="small">
                        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                            {item.tenNgayLe}
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
                <div>
                    <Text level={5} style={{ margin: 0, marginBottom: 8 }}>
                        Số ngày nghỉ: {item.soNgayNghi}
                    </Text>
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
                        Quản lý Ngày lễ
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
                        <AntButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm ngày lễ
                        </AntButton>
                    </Space>
                </Col>
            </Row>

            {/* Filter Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8}>
                    <Search
                        placeholder="Tìm kiếm ngày lễ..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        value={searchTerm}
                    //onChange={(e) => setSearchTerm(e.target.value)}
                    //onSearch={setSearchTerm}
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
                    </div>
                </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            {/* Cards Section */}
            {paginatedData.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {paginatedData.map(renderNgayLeCard)}
                </Row>
            ) : (
                <Empty
                    description="Không tìm thấy ngày lễ nào"
                    style={{ margin: '40px 0' }}
                />
            )}

            {/* Modal Form */}
            <Modal
                title={editingId ? 'Sửa ngày lễ' : 'Thêm ngày lễ'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    name="ngayLeform"
                    onFinish={onFinish}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="tenNgayle"
                        label="Tên ngày lễ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên vai trò!' },
                            { min: 2, message: 'Tên vai trò phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên ngày lễ"
                            size="default"
                        />
                        
                    </Form.Item>

                    <Form.Item
                        name="soNgaynghi"
                        label="Số ngày nghỉ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên vai trò!' },
                            { min: 2, message: 'Tên vai trò phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập số ngày nghỉ lễ"
                            size="default"
                        />
                    </Form.Item>

                    <Form.Item
                        name="maNgayle"
                        label="Mã ngày lễ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Mã vai trò!' },
                            { min: 2, message: 'Mã vai trò phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập Mã ngày lễ"
                            size="default"
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
    )
}