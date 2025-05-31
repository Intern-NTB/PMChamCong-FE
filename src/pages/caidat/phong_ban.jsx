import React, { useState, useCallback, useContext, useEffect } from 'react';
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
import { usePhongBan } from '../../component/hooks/usePhongBan';
import { useCaLam } from '../../component/hooks/useCaLam';
import { ReloadContext } from '../../context/reloadContext';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const PhongBanComponent = () => {
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
    const { danhSachPhongBan, loadingPhongBan, statusPhongBan, fetchPhongBan, updatePhongBan, createPhongBan, deletePhongBan } = usePhongBan()
    const { danhSachCaLam } = useCaLam()
    const { setReload } = useContext(ReloadContext)

    const dataSourceCaLam = danhSachCaLam.map(cl => ({
        maCa: cl.maCa,
        tenCa: cl.tenCa
    }))

    const dataSource = danhSachPhongBan.map(pb => {
        const ca = danhSachCaLam.find(ca => ca.maCa === pb.maCa)
        return {
            id: pb.maPhongBan,
            maPhongBan: pb.maPhongBan,
            tenPhongBan: pb.tenPhongBan,
            maCa: pb.maCa,
            tenCa: ca.tenCa
        }

    })

    useEffect(() => {
        setReload(() => fetchPhongBan);

    }, [])

    // Filter data
    const filteredData = dataSource.filter(item => {
        const matchSearch = item.tenPhongBan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.note.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const onFinish = async (values) => {
        if (editingId) {
            const updatedData = {
                maPhongBan: editingId,
                ...values
            };
            await updatePhongBan(updatedData)
        } else {
            console.log(JSON.stringify(values))
            await createPhongBan(values)
        }
        handleCancel();
    };


    const handleAdd = async () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

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

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một phòng ban để xóa!');
            return;
        }else{

        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
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
                            ID: {item.maPhongBan}
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex' }}>
                    <Space size="small">
                        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                            {item.tenPhongBan}
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
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                    Ca : {item.tenCa}
                </Title>
            </Card>
        </Col>
    );

    return (
        <div style={{ padding: '0 16px' }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 12 }}>
                        Quản lý Phòng ban
                    </Title>
                </Col>
                <Col>
                    <Space wrap>
                        <AntButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm phòng ban
                        </AntButton>
                    </Space>
                </Col>
            </Row>

            {/* Filter Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8}>
                    <Search
                        placeholder="Tìm kiếm phòng ban..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={setSearchTerm}
                    />
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
                Tổng: {filteredData.length} phòng ban
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
                        onClick={async () => {
                            if (isModalConfirmVisible) {
                                // Thực hiện việc xoá phòng ban
                                await deletePhongBan(isModalConfirmVisible.data.maPhongBan)
                            }
                            setIsModalConfirmVisible({ visible: false, data: null });
                        }}
                    >
                        Xóa
                    </AntButton>
                ]}
            >
                <p>
                    Bạn có chắc chắn muốn xóa đối tượng
                    <strong> "{isModalConfirmVisible.data?.tenPhongBan}"</strong> không?
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
                        name="tenPhongBan"
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
                        name="maCa"
                        label="Ca Làm"
                    >
                        <Select
                            style={{ width: '100%' }}
                            options={dataSourceCaLam.map(pb => ({
                                value: pb.maCa,
                                label: pb.tenCa,
                            }))}
                        />

                    </Form.Item>

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