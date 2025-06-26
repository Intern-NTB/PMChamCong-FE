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

    const { danhSachLoaiPhuCap, loadingLoaiPhuCap, getAllLoaiPhuCap, createLoaiPhuCap, updateLoaiPhuCap, deleteLoaiPhuCap } = useLoaiPhuCap();
    const { danhSachLichSuPhuCap, getAllLichSuPhuCap, createLichSuPhuCap, deleteLichSuPhuCap } = useLichSuPhuCap();
    const { danhSachVaiTro } = useVaiTro();
    const { danhSachNhanVien } = useNhanVien();

    const [editingId, setEditingId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [modalType, setModalType] = useState("");
    const [form] = Form.useForm();

    //State chọn nhân viên để lấy vai trò rồi suy ra Phụ cấp
    const [selectedMaNhanVien, setSelectedMaNhanVien] = useState(null);
    const selectedNhanVien = danhSachNhanVien.find(nv => nv.maNhanVien === selectedMaNhanVien);
    const maVaiTro = selectedNhanVien?.maVaiTro;

    const danhSachPhuCapTheoVaiTro = useMemo(() => {
        if (!maVaiTro) return [];
        return danhSachLoaiPhuCap.filter(pc => pc.maVaiTro === maVaiTro);
    }, [maVaiTro, danhSachLoaiPhuCap]);

    // state
    const apiNotification = useAppNotification();
    const { setReload } = useContext(ReloadContext);

    // Tính toán thống kê
    const tongSoCacPhuCap = new Set(
        danhSachLoaiPhuCap.map((item) => item.maPhuCap)
    ).size;
    const tongDangPhuCap = new Set(
        danhSachLichSuPhuCap.map((item) => item.maNhanVien)
    ).size;
    const tongTienPhuCap = danhSachLichSuPhuCap.reduce((total, item) => {
        const loaiPhuCap = danhSachLoaiPhuCap.find(
            (lpc) => lpc.maPhuCap === item.maPhuCap
        );
        return total + (loaiPhuCap?.soTienPhuCap || 0);
    }, 0);

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
        return danhSachLichSuPhuCap.map((dslspc) => {
            const nhanVienFind = danhSachNhanVien.find((nv) => nv.maNhanVien === dslspc.maNhanVien);
            const vaiTroFind = danhSachVaiTro.find((vt) => vt.maVaiTro === nhanVienFind?.maVaiTro);
            const phuCapFind = danhSachLoaiPhuCap.find((pc) => pc.maPhuCap === dslspc.maPhuCap)
            return {
                key: dslspc.maPhuCap,
                maPhuCap: dslspc.maPhuCap,
                tenPhuCap: phuCapFind?.tenPhuCap,
                tenPhuCapTheovaiTro: vaiTroFind?.tenPhuCap,
                maNhanVien: dslspc.maNhanVien,
                hoTen: nhanVienFind?.hoTen,
                soTienPhuCap: `${phuCapFind.soTienPhuCap.toLocaleString()} VNĐ`,
                tenVaiTro: vaiTroFind?.tenVaiTro
            }
        })
    }, [danhSachLichSuPhuCap, danhSachNhanVien, danhSachLoaiPhuCap]);

    useEffect(() => {
        getAllLoaiPhuCap();
        getAllLichSuPhuCap();
    }, [])
    useEffect(() => {
        setReload(() => getAllLoaiPhuCap);
    }, []);

    // State cho tìm kiếm
    const [searchTextLichSu, setSearchTextLichSu] = useState("");
    const [searchTextLoaiPhuCap, setSearchTextLoaiPhuCap] = useState("");

    // State cho select nhiều dòng
    const [selectedLichSuKeys, setSelectedLichSuKeys] = useState([]);
    const [selectedLoaiPhuCapKeys, setSelectedLoaiPhuCapKeys] = useState([]);

    const getFilteredLichSuPhuCap = () => {
        let filteredData = dataSourceLichSuPhuCap;
        // Lọc theo từ khóa tìm kiếm
        if (searchTextLichSu) {
            const searchLower = searchTextLichSu.toLowerCase();
            filteredData = filteredData.filter((item) => {
                return (
                    item.tenPhuCap?.toLowerCase().includes(searchLower) ||
                    item.hoTen?.toLowerCase().includes(searchLower) ||
                    getLoaiPhuCapName(item.maLoaiTienThuong)
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    item.lyDo?.toLowerCase().includes(searchLower)
                );
            });
        }
        return filteredData;
    };
    const getFilteredLoaiPhuCap = () => {
        if (!searchTextLoaiPhuCap) return dataSourceLoaiPhuCap;
        return dataSourceLoaiPhuCap.filter(
            (item) =>
                item.tenPhuCap
                    .toLowerCase()
                    .includes(searchTextLoaiPhuCap.toLowerCase()) ||
                item.maPhuCap.toString().includes(searchTextLoaiPhuCap)
        );
    };

    const getLoaiPhuCapName = (maPhuCap) => {
        const phucap = dataSourceLoaiPhuCap.find(
            (item) => item.maPhuCap === maPhuCap
        );
        return phucap ? phucap.tenPhuCap : "Không xác định";
    };

    const onFinish = useCallback(
        async () => {
            try {
                const values = await form.validateFields();

                if (modalType === "lichsu") {
                    try {
                        const values = await form.validateFields();
                        const { maNhanVien, maPhuCap } = values;

                        if (modalType === "lichsu") {
                            await createLichSuPhuCap(maNhanVien, maPhuCap);
                            getAllLichSuPhuCap();
                            apiNotification.success({ message: "Thêm thành công!" });
                        }
                    } catch (err) {
                        console.error("Lỗi khi submit form:", err);
                        apiNotification.error({ message: "Thêm không thành công!" });
                    }
                } else {
                    if (editingId) {
                        const updateValues = {
                            ...values,
                            maPhuCap: editingId.maPhuCap,
                        };
                        try {
                            await updateLoaiPhuCap(updateValues);
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
                handleCancel();
                getAllLoaiPhuCap();
            } catch (error) {
                console.log("Validation failed:", error);
            }    
        },
        [apiNotification, createLoaiPhuCap, getAllLoaiPhuCap, getAllLichSuPhuCap, editingId]
    );

    const handleAdd = () => {
        setEditingId(null);
        setModalType("loaiphucap");
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingId(record);
        setModalType("loaiphucap");
        setIsModalVisible(true);
        form.setFieldsValue(record);
    };

    const handleDelete = async (maPhuCap, maVaiTro) => {
        try {
            await deleteLoaiPhuCap(maPhuCap, maVaiTro);
            getAllLoaiPhuCap();
            apiNotification.success({ message: "Xóa thành công!" });
        } catch (error) {
            apiNotification.error({ message: "Xóa thất bại!" });
        };
    }

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
    };

    // Hàm xử lý CRUD cho Lịch sử phụ cấp
    const handleAddLichSu = () => {
        setEditingId(null);
        setModalType("lichsu");
        setIsModalVisible(true);
        form.resetFields();
    };
    const handleDelleteLichSu = async (maNhanVien, maPhuCap) => {
        try {
            await deleteLichSuPhuCap(maNhanVien, maPhuCap);
            getAllLichSuPhuCap();
            apiNotification.success({ message: "Xóa thành công!" });
        } catch (error) {
            apiNotification.error({ message: "Xóa thất bại!" });
        };
    }

    //xóa nhiều dòng
    const handleDeleteMultipleLichSu = () => {apiNotification.error({message: 'Có lỗi xảy ra', description: 'Chưa hổ trợ được tính năng này'})};
    const handleDeleteMultipleLoaiPhuCap = () => {
        Modal.confirm({
            title: `Bạn có chắc chắn muốn xóa ${selectedLoaiPhuCapKeys.length} loại phụ cấp đã chọn?`,
            content: "Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
                selectedLoaiPhuCapKeys.forEach(async (maPhuCap, maVaiTro) => {
                    try {
                        await deleteLoaiPhuCap(maPhuCap, maVaiTro);
                    } catch (error) {
                        console.error("Error deleting:", error);
                    }
                });
                setSelectedLoaiPhuCapKeys([]);
                apiNotification.success(`Đã xóa ${selectedLoaiPhuCapKeys.length} loại phụ cấp!`);
            },
        });
    };

    //Hàm xử lý chọn nhiều
    const lichSuRowSelection = {
        selectedRowKeys: selectedLichSuKeys,
        onChange: (selectedRowKeys) => {
            setSelectedLichSuKeys(selectedRowKeys);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            console.log("Select all:", selected, selectedRows, changeRows);
        },
        onSelect: (record, selected, selectedRows) => {
            console.log("Select:", record, selected, selectedRows);
        },
    };
    
    const loaiPhuCapRowSelection = {
    selectedRowKeys: selectedLoaiPhuCapKeys,
    onChange: (selectedRowKeys) => {
      setSelectedLoaiPhuCapKeys(selectedRowKeys);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log("Select all:", selected, selectedRows, changeRows);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log("Select:", record, selected, selectedRows);
    },
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
            sorter: (a, b) =>
            a.tenVaiTro.toLowerCase().localeCompare(b.tenVaiTro.toLowerCase()),
        },
        {
            title: "Tên Phụ Cấp",
            dataIndex: "tenPhuCap",
            key: "tenPhuCap",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) =>
            a.tenPhuCap.toLowerCase().localeCompare(b.tenPhuCap.toLowerCase()),
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
                        description="Bạn có chắc chắn muốn xóa loại phụ cấp này?"
                        onConfirm={() => handleDelete(record.maPhuCap, record.maVaiTro)}
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
            sorter: (a, b) =>
            a.hoTen.toLowerCase().localeCompare(b.hoTen.toLowerCase()),
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
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() =>
                            handleDelleteLichSu(
                                record.maNhanVien,
                                record.maPhuCap
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
                <Col xs={24} sm={8}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Tổng các phụ cấp"
                            value={tongSoCacPhuCap}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff", cursor: "pointer" }}
                            onClick={() => setIsModalVisible(true)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Tổng đang phụ cấp"
                            value={tongDangPhuCap}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#B8860B", cursor: "pointer" }}
                            onClick={() => setIsModalVisible(true)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ height: "100%" }}>
                        <Statistic
                            title="Tổng số tiền phụ cấp"
                            value={tongTienPhuCap}
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
                                        {selectedLichSuKeys.length > 0 && (
                                            <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteMultipleLichSu}
                                            >
                                                Xóa {selectedLichSuKeys.length} mục đã chọn
                                            </Button>
                                        )}
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
                            </Row>
                        </div>

                        {selectedLichSuKeys.length > 0 && (
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
                        )}

                        <Table
                            columns={lichSuColumns}
                            dataSource={getFilteredLichSuPhuCap()}
                            rowKey="maNhanVien"
                            rowSelection={lichSuRowSelection}
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
                                        {selectedLoaiPhuCapKeys.length > 0 && (
                                            <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteMultipleLoaiPhuCap}
                                            >
                                                Xóa {selectedLoaiPhuCapKeys.length} mục đã chọn
                                            </Button>
                                        )}
                                    </Space>
                                </Col>

                                {/* Ô tìm kiếm */}
                                <Col xs={24} md={8} lg={6}>
                                    <Search
                                        placeholder="Tìm kiếm theo tên vai trò, tên phụ cấp, số tiền..."
                                        allowClear
                                        prefix={<SearchOutlined />}
                                        onChange={(e) => setSearchTextLoaiPhuCap(e.target.value)}
                                        style={{
                                            width: "100%",
                                            maxWidth: 350,
                                            marginLeft: "auto", // Đẩy sát phải nếu còn dư không gian
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {selectedLoaiPhuCapKeys.length > 0 && (
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
                                    Đã chọn {selectedLoaiPhuCapKeys.length} mục
                                </Text>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setSelectedLoaiPhuCapKeys([])}
                                >
                                    Bỏ chọn tất cả
                                </Button>
                            </div>
                        )}

                        <Table
                            columns={columns}
                            dataSource={getFilteredLoaiPhuCap()}
                            loading={loadingLoaiPhuCap}
                            rowKey="maLoaiPhuCap"
                            rowSelection={loaiPhuCapRowSelection}
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

            {/* Modal Form */}
            <Modal
                centered
                title={
                    <Space>
                        <HistoryOutlined style={{ color: "black" }} />
                        Thêm mới
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
                                            disabled={false}
                                            onChange={(value) => setSelectedMaNhanVien(value)}
                                            showSearch
                                            placeholder="Họ tên nhân viên" filterOption={(input, option) =>
                                                (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                                        }>                                        
                                            {danhSachNhanVien.map((nhanvien) => (
                                                <Select.Option key={nhanvien.maNhanVien} value={nhanvien.maNhanVien}>
                                                    {nhanvien.hoTen}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Tên Phụ Cấp"
                                        name="maPhuCap"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng chọn phụ cấp!",
                                            },
                                        ]}
                                    >
                                        <Select
                                            disabled={!selectedMaNhanVien}
                                            placeholder="Chọn phụ cấp"
                                            showSearch
                                        >
                                            {danhSachPhuCapTheoVaiTro.map((phucap) => (
                                                <Select.Option key={phucap.maPhuCap} value={phucap.maPhuCap}>
                                                    {phucap.tenPhuCap}
                                                </Select.Option>
                                            ))}
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
                                            disabled={false}
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
                                                disabled={false}
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
                                            disabled={false}
                                            placeholder="Số tiền phụ cấp"
                                            min={0}
                                            step={10000}
                                            style={{ width: "100%" }}
                                            formatter={(value) =>
                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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