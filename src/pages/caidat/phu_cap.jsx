import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Card,
    Statistic,
    Tabs,
    Space,
    Popconfirm,
    message,
    Row,
    Divider,
    Col,
    Typography,
    ConfigProvider
} from "antd";

import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    DollarOutlined,
    TrophyOutlined,
    HistoryOutlined,
    SearchOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Search, TextArea } = Input;

import { useLoaiPhuCap } from "../../component/hooks/useLoaiPhuCap";
import { useLichSuPhuCap } from "../../component/hooks/useLichSuPhuCap";
import { useVaiTro } from "../../component/hooks/useVaiTro";
import { useNhanVien } from "../../component/hooks/useNhanVien";

import { useAppNotification } from "../../component/ui/notification";
import { ReloadContext } from "../../context/reloadContext";

export default function PhuCapComponent() {

    const { danhSachLoaiPhuCap, getAllLoaiPhuCap, createLoaiPhuCap } = useLoaiPhuCap();
    const { danhSachLichSuPhuCap, getAllLichSuPhuCap, createLichSuPhuCap } = useLichSuPhuCap();
    const { danhSachVaiTro } = useVaiTro();
    const { danhSachNhanVien } = useNhanVien();

    const [editingId, setEditingId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [modalType, setModalType] = useState("");
    const [form] = Form.useForm();

    // state
    const apiNotification = useAppNotification();
    const { setReload } = useContext(ReloadContext);

    // Data Source
    const dataSourceLoaiPhuCap = useMemo(() => {
        return danhSachLoaiPhuCap.map((dslpc) => {
            const vaiTroFind = danhSachVaiTro.find((vt) => vt.maVaiTro === dslpc.maVaiTro);
            return {
                key: dslpc.maPhuCap,
                maPhuCap: dslpc.maPhuCap,
                maVaiTro: dslpc.maVaiTro,
                tenVaiTro: vaiTroFind?.tenVaiTro,
                tenPhuCap: dslpc.tenPhuCap,
                soTienPhuCap: `${dslpc.soTienPhuCap.toLocaleString()} VNĐ`
            };
        });
    }, [danhSachLoaiPhuCap, danhSachVaiTro]);

    const dataSourceLichSuPhuCap = useMemo(() => {
        return danhSachNhanVien.flatMap((nv) => {
            const vaiTro = danhSachVaiTro.find((vt) => vt.maVaiTro === nv.maVaiTro);
            const danhSachPhuCap = danhSachLoaiPhuCap.filter((pc) => pc.maVaiTro === nv.maVaiTro);

            return danhSachPhuCap.map((pc) => ({
                key: `${nv.maNhanVien}-${pc.maPhuCap}`,
                maNhanVien: nv.maNhanVien,
                hoTen: nv.hoTen,
                maVaiTro: vaiTro?.maVaiTro,
                tenVaiTro: vaiTro?.tenVaiTro || "Không xác định",
                tenPhuCap: pc.tenPhuCap,
                soTienPhuCap: `${pc.soTienPhuCap.toLocaleString()} VNĐ`
            }));
        });
    }, [danhSachNhanVien, danhSachVaiTro, danhSachLoaiPhuCap]);

    useEffect(() => {
        getAllLoaiPhuCap();
        getAllLichSuPhuCap();
    }, [])
    useEffect(() => {
        setReload(() => getAllLoaiPhuCap);
    }, []);

    // State cho tìm kiếm
    const [searchTextLichSu, setSearchTextLichSu] = useState("");
    const [searchTextLoaiThuong, setSearchTextLoaiThuong] = useState("");

    // State cho select nhiều dòng
    const [selectedLichSuKeys, setSelectedLichSuKeys] = useState([]);
    const [selectedLoaiThuongKeys, setSelectedLoaiThuongKeys] = useState([]);

    const getFilteredLoaiPhuCap = () => {
        let filteredData = dataSourceLoaiPhuCap;
        // Lọc theo từ khóa tìm kiếm
        if (searchTextLichSu) {
            const searchLower = searchTextLichSu.toLowerCase();
            filteredData = filteredData.filter((item) => {
                return (
                    item.tenPhuCap?.toLowerCase().includes(searchLower) ||
                    item.tenVaiTro?.toLowerCase().includes(searchLower) ||
                    item.hoTen?.toLowerCase().includes(searchLower) ||
                    getLoaiPhuCapName(item.maLoaiTienThuong)
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    item.lyDo?.toLowerCase().includes(searchLower)
                );
            });
        }
    };
    const getLoaiPhuCapName = (maLoaiPhuCap) => {
        const phucap = dataSourceLoaiPhuCap.find(
            (item) => item.maPhuCap === maLoaiPhuCap
        );
        return phucap ? phucap.tenPhuCap : "Không xác định";
    };

    const onFinish = async () => {
        try {
            const values = await form.validateFields();

            if (modalType === "lichsu") {
                const formattedValues = {
                    ...values,
                };

                if (editingId) {
                    await updateLichSuThuong(values);
                    apiNotification.success({ message: "Cập nhật lịch sử thưởng thành công!" });
                } else {
                    await createLichSuThuong(formattedValues);
                    apiNotification.success({ message: "Thêm lịch sử thưởng thành công!" });
                }
            } else {
                if (editingId) {
                    const updateValues = {
                        ...values,
                        maLoaiTienThuong: editingId.maLoaiTienThuong,
                    };
                    try {
                        await updateLoaiTienThuong(updateValues);
                        apiNotification.success({ message: "Cập nhật thành công!" });
                    } catch (error) {
                        apiNotification.error({
                            message: "Cập nhật không thành công!",
                            descriptions: error,
                        });
                    }
                } else {
                    try {
                        await createLoaiPhuCap(values);
                        apiNotification.success({ message: "Thêm thành công!" });
                    } catch (error) {
                        apiNotification.error({
                            message: "Thêm Không thành công!",
                            descriptions: error,
                        });
                    }
                }
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.log("Validation failed:", error);
        }
        handleCancel();
    };

    const handleAdd = () => {
        setEditingId(null);
        setModalType("loaiphucap");
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = useCallback(
        (record) => {
        },
        [form]
    );

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
    };

    // Hàm xử lý CRUD cho Lịch sử thưởng
    const handleAddLichSu = () => {
        setEditingId(null);
        setModalType("lichsu");
        setIsModalVisible(true);
        form.resetFields();
    };

    const columns = [
        {
            title: "Mã Phụ Cấp",
            dataIndex: "maPhuCap",
            key: "maPhuCap",
            width: 100,
            render: (text) => <Text color="blue">{text}</Text>,
        },
        {
            title: "Tên Vai Trò",
            dataIndex: "tenVaiTro",
            key: "tenVaiTro",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Tên Phụ Cấp",
            dataIndex: "tenPhuCap",
            key: "tenPhuCap",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Tiền phụ cấp",
            dataIndex: "soTienPhuCap",
            key: "soTienPhuCap",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Thao Tác",
            key: "action",
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="middle"
                    />
                    <Popconfirm
                        title="Xóa tài khoản"
                        description="Bạn có chắc chắn muốn xóa tài khoản này?"
                        onConfirm={() => handleDelete(record.maNhanVien)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                            size="middle"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    const lichSuColumns = [
        {
            title: "Mã nhân viên",
            dataIndex: "maNhanVien",
            key: "maNhanVien",
        },
        {
            title: "Tên nhân viên",
            dataIndex: "hoTen",
            key: "hoTen ",
        },
        {
            title: "Vai trò",
            dataIndex: "tenVaiTro",
            key: "tenVaiTro",
        },
        {
            title: "Phụ cấp",
            dataIndex: "tenPhuCap",
            key: "tenPhuCap",
        },
        {
            title: "Tiền phụ cấp",
            dataIndex: "soTienPhuCap",
            key: "soTienPhuCap",
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        ghost
                        size="middle"
                        icon={<EditOutlined />}
                        onClick={() => handleEditLichSu(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() =>
                            handleDeleteLichSuThuong(
                                record.maNhanVien,
                                record.maLoaiTienThuong
                            )
                        }
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            danger
                            ghost
                            size="middle"
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {/* Header */}
            <Card style={{ marginBottom: 8 }}>
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
                    Quản lý phụ cấp
                </Title>
                <Text style={{ color: "grey", fontSize: 14 }}>
                    Quản lý các khoản phụ cấp theo vai trò của nhân viên
                </Text>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={24} style={{ marginBottom: "32px" }}>
                <Col xs={24} sm={12}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Tổng các phụ cấp"
                            value={0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff", cursor: "pointer" }}
                            onClick={() => setIsModalVisible(true)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Tổng số tiền phụ cấp"
                            value={0}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                            formatter={(value) =>
                                new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(value)
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Card>
                <Tabs defaultActiveKey="lichsu">
                    <TabPane
                        tab={
                            <span>
                                <HistoryOutlined style={{ marginRight: 8 }} />
                                Lịch sử phụ cấp
                            </span>
                        }
                        key="lichsu"
                    >
                        <div style={{ marginBottom: "16px" }}>
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} md={12} lg={16}>
                                    <Space wrap>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleAddLichSu}
                                        >
                                            Thêm phụ cấp cho nhân viên
                                        </Button>
                                        {/* selectedLichSuKeys.length > 0 && (
                                            <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteMultipleLichSu}
                                            >
                                                Xóa {selectedLichSuKeys.length} mục đã chọn
                                            </Button>
                                        )*/}
                                    </Space>
                                </Col>
                                <Col xs={24} md={10} lg={8}>
                                    <Search
                                        placeholder="Tìm kiếm theo tên vai trò, tên phụ cấp, số tiền..."
                                        allowClear
                                        style={{ width: "100%" }}
                                        onChange={(e) => setSearchTextLichSu(e.target.value)}
                                        prefix={<SearchOutlined />}
                                    />
                                </Col>
                                {/* Bộ lọc thời gian
                                <Col xs={20} sm={20} md={18} lg={16} xl={12}>
                                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        <span style={{ marginBottom: 8 }}>Chọn khoảng thời gian:</span>
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            <RangePicker
                                                value={dateRange}
                                                onChange={handleDateRangeChange}
                                                format="DD/MM/YYYY"
                                                size="large"
                                                style={{ flex: 1, minWidth: 150 }}
                                            />
                                            <ConfigProvider locale={viVN}>
                                                <DatePicker
                                                    placeholder="Chọn tháng"
                                                    picker="month"
                                                    value={selectedMonth}
                                                    onChange={handleMonthChange}
                                                    format="MM/YYYY"
                                                    size="large"
                                                    style={{ flex: 1, minWidth: 150 }}
                                                />
                                            </ConfigProvider>
                                        </div>
                                    </div>
                                </Col>*/}
                            </Row>
                        </div>

                        {/*selectedLichSuKeys.length > 0 && (
                            <div
                                style={{
                                    marginBottom: "16px",
                                    padding: "8px 16px",
                                    background: "#e6f7ff",
                                    border: "1px solid #91d5ff",
                                    borderRadius: "6px",
                                }}
                            >
                                <Text type="secondary">
                                    Đã chọn {selectedLichSuKeys.length} mục
                                </Text>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setSelectedLichSuKeys([])}
                                >
                                    Bỏ chọn tất cả
                                </Button>
                            </div>
                        )*/}

                        <Table
                            columns={lichSuColumns}
                            dataSource={dataSourceLichSuPhuCap}
                            rowKey="maPhuCap"
                            //rowSelection={lichSuRowSelection}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                            }}
                            scroll={{ x: 1000 }}
                        />
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <DollarOutlined style={{ marginRight: 8 }} />
                                Loại phụ cấp
                            </span>
                        }
                        key="loaiphucap"
                    >
                        <div style={{ marginBottom: "16px" }}>
                            <Row gutter={[16, 16]} align="middle">
                                {/* Nhóm nút Thêm và Xóa */}
                                <Col xs={24} md={16} lg={18}>
                                    <Space wrap>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleAdd}
                                        >
                                            Thêm loại phụ cấp
                                        </Button>
                                        {/*selectedLoaiThuongKeys.length > 0 && (
                                            <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteMultipleLoaiThuong}
                                            >
                                                Xóa {selectedLoaiThuongKeys.length} mục đã chọn
                                            </Button>
                                        )*/}
                                    </Space>
                                </Col>

                                {/* Ô tìm kiếm */}
                                <Col xs={24} md={8} lg={6}>
                                    <Search
                                        placeholder="Tìm kiếm theo tên vai trò, tên phụ cấp, số tiền..."
                                        allowClear
                                        prefix={<SearchOutlined />}
                                        onChange={(e) => setSearchTextLoaiThuong(e.target.value)}
                                        style={{
                                            width: "100%",
                                            maxWidth: 350,
                                            marginLeft: "auto", // Đẩy sát phải nếu còn dư không gian
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {selectedLoaiThuongKeys.length > 0 && (
                            <div
                                style={{
                                    marginBottom: "16px",
                                    padding: "8px 16px",
                                    background: "#e6f7ff",
                                    border: "1px solid #91d5ff",
                                    borderRadius: "6px",
                                }}
                            >
                                <Text type="secondary">
                                    Đã chọn {selectedLoaiThuongKeys.length} mục
                                </Text>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setSelectedLoaiThuongKeys([])}
                                >
                                    Bỏ chọn tất cả
                                </Button>
                            </div>
                        )}

                        <Table
                            columns={columns}
                            dataSource={dataSourceLoaiPhuCap}
                            rowKey="maLoaiPhuCap"
                            //rowSelection={loaiThuongRowSelection}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Modal Form cho Lịch sử ưu tiên */}
            <Modal
                centered
                title={
                    <Space>
                        <HistoryOutlined style={{ color: "black" }} />
                        {editingId
                            ? "Chỉnh Sửa"
                            : "Thêm Mới"}
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    {modalType === "lichsu" ? (
                        <>
                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Họ tên nhân viên"
                                        name="maNhanVien"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng chọn đối tượng ưu tiên!",
                                            },
                                        ]}
                                    >
                                        <Select
                                            disabled={editingId ? true : false}
                                            placeholder="Họ tên nhân viên"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Tên Phụ Cấp"
                                        name="maUuTien"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng chọn phụ cấp!",
                                            },
                                        ]}
                                    >
                                        <Select
                                            disabled={editingId ? true : false}
                                            placeholder="Chọn phụ cấp"
                                            showSearch
                                        >
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                                <Space>
                                    <Button onClick={handleCancel}>Hủy</Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{
                                            background: "linear-gradient(45deg, #667eea, #764ba2)",
                                        }}
                                    >
                                        {editingId ? "Cập Nhật" : "Thêm Mới"}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </>
                    ) : (
                        <>
                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Tên Phụ Cấp"
                                        name="tenPhuCap"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập tên phụ cấp!",
                                            },
                                        ]}
                                    >
                                        <Input
                                            disabled={editingId ? true : false}
                                            placeholder="Tên phụ cấp"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Vai Trò"
                                        name="maVaiTro"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng chọn vai trò!",
                                            },
                                        ]}
                                    >
                                            <Select
                                                disabled={editingId ? true : false}
                                                placeholder="Chọn vai trò"
                                                showSearch
                                                filterOption={(input, option) =>
                                                    (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                                                }>
                                            {danhSachVaiTro.map((vaiTro) => (
                                                <Select.Option key={vaiTro.maVaiTro} value={vaiTro.maVaiTro}>
                                                    {vaiTro.tenVaiTro}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Số Tiền Phụ Cấp"
                                        name="soTienPhuCap"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập số tiền phụ cấp!",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            disabled={editingId ? true : false}
                                            placeholder="Số tiền phụ cấp"
                                            step={10000}
                                            style={{ width: "100%" }}
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ"
                                            }
                                            parser={(value) => value.replace(/\D/g, "")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                                <Space>
                                    <Button onClick={handleCancel}>Hủy</Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{
                                            background: "linear-gradient(45deg, #667eea, #764ba2)",
                                        }}
                                    >
                                        {editingId ? "Cập Nhật" : "Thêm Mới"}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </>
                    )}
                </Form>

            </Modal>
        </div>
    )
}