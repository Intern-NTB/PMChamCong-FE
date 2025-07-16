import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import {
    Row,
    Col,
    Form,
    Input,
    Space,
    Modal,
    Button as AntButton,
    Card,
    Checkbox,
    Typography,
    Empty,
    Pagination,
    Select,
    Spin,
    Tag
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    CalendarOutlined,
    TeamOutlined,
    BankOutlined
} from '@ant-design/icons';
import { usePhongBan } from '../../component/hooks/usePhongBan';
import { useCaLam } from '../../component/hooks/useCaLam';
import { ReloadContext } from '../../context/reloadContext';


const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function PhongBanComponent () {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalConfirmVisible, setIsModalConfirmVisible] = useState({
        visible: false,
        data: null
    });
    const [editingId, setEditingId] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);


    const {
        danhSachPhongBan,
        loadingPhongBan,
        fetchPhongBan,
        updatePhongBan,
        createPhongBan,
        deletePhongBan
    } = usePhongBan();

    const { danhSachCaLam, loadingCaLam } = useCaLam();
    const { setReload } = useContext(ReloadContext);

    // Memoized data source with safe handling for undefined
    const dataSource = useMemo(() => {
        if (!danhSachPhongBan || !Array.isArray(danhSachPhongBan)) {
            return [];
        }

        return danhSachPhongBan.map(pb => {
            // Safe check for ca làm việc
            const ca = danhSachCaLam?.find(ca => ca.maCa === pb.maCa) || {};

            return {
                id: pb.maPhongBan,
                maPhongBan: pb.maPhongBan,
                tenPhongBan: pb.tenPhongBan || '',
                maCa: pb.maCa,
                tenCa: ca.tenCa || 'Chưa xác định',
            };
        });
    }, [danhSachPhongBan, danhSachCaLam]);

    useEffect(() => {
        setReload(() => fetchPhongBan);
    }, []); // Only run once when component mounts

    // Filter data with safe check
    const filteredData = useMemo(() => {
        return dataSource.filter(item => {
            const searchText = searchTerm.toLowerCase();
            const matchSearch =
                (item.tenPhongBan || '').toLowerCase().includes(searchText) ||
                (item.note || '').toLowerCase().includes(searchText) ||
                (item.tenCa || '').toLowerCase().includes(searchText);

            return matchSearch
        });
    }, [dataSource, searchTerm]);

    // Pagination data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, pageSize]);

    // Handle card selection
    const handleCardSelect = useCallback((id, checked) => {
        setSelectedRowKeys(prev => {
            if (checked) {
                return [...prev, id];
            } else {
                return prev.filter(key => key !== id);
            }
        });
    }, []);

    // Handle form submission
    const onFinish = useCallback(async (values) => {
        try {
            if (editingId) {
                const updatedData = {
                    maPhongBan: editingId,
                    ...values
                };
                await updatePhongBan(updatedData);
            } else {
                await createPhongBan(values);
            }
            handleCancel();
        } catch (error) {
            console.error('Error:', error);
        }
    }, [editingId, updatePhongBan, createPhongBan]); // Remove danhSachPhongBan and apiNotification dependencies

    const handleAdd = useCallback(() => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    }, [form]);

    const handleEdit = useCallback((data) => {
        setEditingId(data.maPhongBan);
        form.setFieldsValue({
            tenPhongBan: data.tenPhongBan,
            maCa: data.maCa,
        });
        setIsModalVisible(true);
    }, [form]);

    const handleDelete = useCallback((data) => {
        setIsModalConfirmVisible({
            visible: true,
            data: data
        });
    }, []);

    const handleBulkDelete = useCallback(() => {
        if (selectedRowKeys.length === 0) {
            return;
        }
        // Implement bulk delete logic here
        console.log('Bulk delete:', selectedRowKeys);
    }, [selectedRowKeys]); // Remove apiNotification dependency

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
    };

    // Search and filter handlers
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    }, []);

    const handlePageChange = useCallback((page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    }, []);

    const handlePageSizeChange = useCallback((current, size) => {
        setCurrentPage(1);
        setPageSize(size);
    }, []);

    // Confirm delete handler
    const handleConfirmDelete = useCallback(async () => {
        try {
            if (isModalConfirmVisible.data) {
                await deletePhongBan(isModalConfirmVisible.data.maPhongBan);
            }
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setIsModalConfirmVisible({ visible: false, data: null });
        }
    }, [isModalConfirmVisible.data, deletePhongBan]); // Remove apiNotification dependency

    // Render department card
    const renderPhongBanCard = useCallback((item) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={item.id}>
            <Card
                hoverable
                className="department-card"
                style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow: selectedRowKeys.includes(item.id)
                        ? '0 4px 16px rgba(24, 144, 255, 0.2)'
                        : '0 2px 8px rgba(0,0,0,0.1)',
                    border: selectedRowKeys.includes(item.id)
                        ? '2px solid #1890ff'
                        : '1px solid #f0f0f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    background: selectedRowKeys.includes(item.id)
                        ? 'linear-gradient(135deg, #f6f9ff 0%, #e6f3ff 100%)'
                        : '#ffffff'
                }}
            >
                {/* Header with checkbox and ID */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16
                }}>
                    <Checkbox
                        checked={selectedRowKeys.includes(item.id)}
                        onChange={(e) => handleCardSelect(item.id, e.target.checked)}
                        style={{ marginTop: 2 }}
                    />
                    <Tag color="blue" style={{ margin: 0 }}>
                        #{item.maPhongBan}
                    </Tag>
                </div>

                {/* Content section */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    {/* Icon and department name */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <BankOutlined style={{
                            fontSize: 18,
                            color: '#1890ff',
                            marginTop: 2,
                            flexShrink: 0
                        }} />
                        <Title
                            level={4}
                            style={{
                                margin: 0,
                                fontSize: 16,
                                lineHeight: 1.4,
                                wordBreak: 'break-word',
                                color: '#262626'
                            }}
                        >
                            {item.tenPhongBan}
                        </Title>
                    </div>

                    {/* Shift information */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarOutlined style={{
                            fontSize: 14,
                            color: '#666',
                            flexShrink: 0
                        }} />
                        <Text style={{
                            fontSize: 14,
                            color: '#666'
                        }}>
                            {item.tenCa}
                        </Text>
                    </div>


                </div>

                {/* Action buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <AntButton
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(item)}
                        size="small"
                        title="Sửa"
                        style={{
                            borderColor: '#1890ff',
                            color: '#1890ff'
                        }}
                    />
                    <AntButton
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item)}
                        size="small"
                        title="Xóa"
                        danger
                    />
                </div>
            </Card>
        </Col>
    ), [selectedRowKeys, handleCardSelect, handleEdit, handleDelete]);

    // Loading state
    if (loadingPhongBan || loadingCaLam) {
        return (
            <div style={{
                padding: '0 16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section - Fixed to full width */}
            <Card
                style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 24,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    width: '100%'
                }}
            >
                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                    <Col flex="auto">
                        <Title level={2} style={{
                            marginBottom: 8,
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                        }}>
                            Quản lý phòng ban
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Quản lý phòng ban trong hệ thống
                        </Text>
                    </Col>
                    <Col flex="none">
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
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    borderColor: 'transparent',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                Thêm phòng ban
                            </AntButton>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Filter Section */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Tìm kiếm phòng ban, ca làm việc..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onSearch={setSearchTerm}
                            size="large"
                        />
                    </Col>

                </Row>
            </Card>

            {/* Cards Section */}
            {paginatedData.length > 0 ? (
                <>
                    <Row gutter={[16, 16]}>
                        {paginatedData.map(renderPhongBanCard)}
                    </Row>

                    {/* Pagination */}
                    {filteredData.length > pageSize && (
                        <Row justify="center" style={{ marginTop: 32, marginBottom: 16 }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filteredData.length}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `Hiển thị ${range[0]}-${range[1]} trên tổng ${total} phòng ban`
                                }
                                pageSizeOptions={['8', '16', '24', '32']}
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageSizeChange}
                                style={{
                                    '& .ant-pagination-item-active': {
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)'
                                    }
                                }}
                            />
                        </Row>
                    )}
                </>
            ) : (
                <Empty
                    description={
                        <div>
                            <Text style={{ fontSize: 16, color: '#666' }}>
                                {searchTerm ? 'Không tìm thấy phòng ban phù hợp' : 'Chưa có phòng ban nào'}
                            </Text>
                            <br />
                            <Text type="secondary">
                                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm phòng ban đầu tiên'}
                            </Text>
                        </div>
                    }
                    style={{ margin: '60px 0' }}
                />
            )}

            {/* Modal Confirm Delete */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DeleteOutlined style={{ color: '#ff4d4f' }} />
                        Xác nhận xóa
                    </div>
                }
                open={isModalConfirmVisible.visible}
                centered
                width={400}
                onCancel={() => setIsModalConfirmVisible({ visible: false, data: null })}
                footer={[
                    <AntButton
                        key="cancel"
                        onClick={() => setIsModalConfirmVisible({ visible: false, data: null })}
                        size="large"
                        style={{ width: 80 }}
                    >
                        Hủy
                    </AntButton>,
                    <AntButton
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleConfirmDelete}
                        size="large"
                        style={{ width: 120 }}
                    >
                        Xóa
                    </AntButton>
                ]}
            >
                <div style={{ padding: '16px 0' }}>
                    <Text style={{ fontSize: 16 }}>
                        Bạn có chắc chắn muốn xóa phòng ban{' '}
                        <Text strong style={{ color: '#ff4d4f' }}>
                            "{isModalConfirmVisible.data?.tenPhongBan}"
                        </Text>{' '}
                        không?
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
                        Hành động này không thể hoàn tác.
                    </Text>
                </div>
            </Modal>

            {/* Modal Form */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {editingId ? <EditOutlined /> : <PlusOutlined />}
                        {editingId ? 'Sửa phòng ban' : 'Thêm phòng ban'}
                    </div>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
                destroyOnClose
            >
                <Form
                    form={form}
                    name="phongBanForm"
                    onFinish={onFinish}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                    size="large"
                >
                    <Form.Item
                        name="tenPhongBan"
                        label={
                            <span style={{ fontWeight: 600 }}>
                                <BankOutlined style={{ marginRight: 4 }} />
                                Tên phòng ban
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên phòng ban!' },
                            { min: 2, message: 'Tên phòng ban phải có ít nhất 2 ký tự!' },
                            { max: 100, message: 'Tên phòng ban không được quá 100 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên phòng ban (VD: Phòng Nhân sự)"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="maCa"
                        label={
                            <span style={{ fontWeight: 600 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                Ca làm việc
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng chọn ca làm việc!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn ca làm việc"
                            style={{ borderRadius: 8 }}
                            loading={loadingCaLam}
                            notFoundContent={loadingCaLam ? <Spin size="small" /> : "Không có dữ liệu"}
                        >
                            {danhSachCaLam?.map(cl => (
                                <Option key={cl.maCa} value={cl.maCa}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CalendarOutlined style={{ color: '#1890ff' }} />
                                        {cl.tenCa}
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                            paddingTop: 16,
                            borderTop: '1px solid #f0f0f0'
                        }}>
                            <AntButton
                                onClick={handleCancel}
                                size="large"
                                style={{ minWidth: 100 }}
                            >
                                Hủy
                            </AntButton>
                            <AntButton
                                type="primary"
                                htmlType="submit"
                                size="large"
                                style={{
                                    minWidth: 120,
                                    background: editingId
                                        ? 'linear-gradient(45deg, #52c41a, #389e0d)'
                                        : 'linear-gradient(45deg, #667eea, #764ba2)',
                                    borderColor: 'transparent'
                                }}
                            >
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </AntButton>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx>{`
                .department-card:hover {
                    transform: translateY(-2px);
                }
                
                .ant-pagination-item-active a {
                    background: linear-gradient(45deg, #667eea, #764ba2) !important;
                    border-color: transparent !important;
                }
            `}</style>
        </div>
    );
};