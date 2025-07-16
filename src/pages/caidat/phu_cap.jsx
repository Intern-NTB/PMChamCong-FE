import React, {useState, useCallback, useMemo } from "react";
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
    Tag,
    Popconfirm,
    Row,
    Divider,
    Col,
    Typography,
    ConfigProvider,
    List
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

import { ReloadContext } from "../../context/reloadContext";

export default function PhuCapComponent() {

    const { danhSachLoaiPhuCap, loadingLoaiPhuCap, getAllLoaiPhuCap, createLoaiPhuCap, updateLoaiPhuCap, deleteLoaiPhuCap } = useLoaiPhuCap();
    const { danhSachLichSuPhuCap, getAllLichSuPhuCap, createLichSuPhuCap, deleteLichSuPhuCap, deleteRowLichSuPhuCap } = useLichSuPhuCap();
    const { danhSachVaiTro } = useVaiTro();
    const { danhSachNhanVien } = useNhanVien();

    const [editingId, setEditingId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalType, setModalType] = useState("");
    const [selectedVaiTro, setSelectedVaiTro] = useState(null);
    const [form] = Form.useForm();

    //State chọn nhân viên để lấy vai trò rồi suy ra Phụ cấp
    const [selectedMaNhanVien, setSelectedMaNhanVien] = useState(null);
    const selectedNhanVien = danhSachNhanVien.find(nv => nv.maNhanVien === selectedMaNhanVien);
    const maVaiTro = selectedNhanVien?.maVaiTro;

    const danhSachPhuCapTheoVaiTro = useMemo(() => {
        if (!maVaiTro) return [];
        return danhSachLoaiPhuCap.filter(pc => pc.maVaiTro === maVaiTro);
    }, [maVaiTro, danhSachLoaiPhuCap]);

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
                soTienPhuCap: dslpc.soTienPhuCap
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
                soTienPhuCap: `${phuCapFind?.soTienPhuCap?.toLocaleString()} VNĐ`,
                tenVaiTro: vaiTroFind?.tenVaiTro,
                maVaiTro: vaiTroFind?.maVaiTro
            }
        })
    }, [danhSachLichSuPhuCap, danhSachNhanVien, danhSachLoaiPhuCap]);

    // State cho tìm kiếm
    const [searchTextLichSu, setSearchTextLichSu] = useState("");
    const [searchTextLoaiPhuCap, setSearchTextLoaiPhuCap] = useState("");

    // State cho select nhiều dòng
    const [selectedLichSuKeys, setSelectedLichSuKeys] = useState([]);
    const [selectedLoaiPhuCapKeys, setSelectedLoaiPhuCapKeys] = useState([]);

    // Hàm xử lý lọc các phụ cấp đã chọn trong lịch sử
    const danhSachPhuCapDaChon = danhSachLichSuPhuCap
        .filter(item => item.maNhanVien === selectedMaNhanVien)
        .map(item => item.maPhuCap);

    const danhSachPhuCapChuaChon = danhSachPhuCapTheoVaiTro.filter(
        (phucap) => !danhSachPhuCapDaChon.includes(phucap.maPhuCap)
    );

    const getFilteredLichSuPhuCap = () => {
        let filteredData = [...dataSourceLichSuPhuCap];

        // Lọc theo từ khóa tìm kiếm
        if (searchTextLichSu) {
            const searchLower = searchTextLichSu.toLowerCase();
            filteredData = filteredData.filter((item) => {
                return (
                    item.tenPhuCap?.toLowerCase().includes(searchLower) ||
                    item.hoTen?.toLowerCase().includes(searchLower) ||
                    getLoaiPhuCapName(item.maLoaiTienThuong)?.toLowerCase().includes(searchLower)
                );
            });
        }    

        if (selectedVaiTro) {
            filteredData = filteredData.filter(item => item.maVaiTro === selectedVaiTro);
        }

        // Gộp dữ liệu theo maNhanVien + hoTen
        const grouped = {};

        filteredData.forEach((item) => {
            const key = `${item.maNhanVien}-${item.hoTen}`;

            if (!grouped[key]) {
                grouped[key] = {
                    ...item,
                    tenPhuCap: [item.tenPhuCap],
                    tongTienPhuCap: Number(item.soTienPhuCap.replace(/\D/g, "")),
                };
            } else {
                grouped[key].tenPhuCap.push(item.tenPhuCap);
                grouped[key].tongTienPhuCap += Number(item.soTienPhuCap.replace(/\D/g, ""));
            }
        });

        return Object.values(grouped).map((item) => ({
            ...item,
            tenPhuCap: item.tenPhuCap.join(", "),
            soTienPhuCap: item.tongTienPhuCap.toLocaleString() + " VNĐ",
        }));
    };

    const getFilteredLoaiPhuCap = () => {
        return dataSourceLoaiPhuCap.filter((item) => {
            const matchSearch =
                !searchTextLoaiPhuCap ||
                item.tenPhuCap
                    .toLowerCase()
                    .includes(searchTextLoaiPhuCap.toLowerCase()) ||
                item.maPhuCap.toString().includes(searchTextLoaiPhuCap);

            const matchVaiTro =
                !selectedVaiTro || item.maVaiTro === selectedVaiTro;

            return matchSearch && matchVaiTro;
        });
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
                    const { maNhanVien, maPhuCap } = values;

                                            try {
                            const listPhuCap = Array.isArray(maPhuCap) ? maPhuCap : [maPhuCap];
                            // Thêm từng phụ cấp một cho nhân viên
                            for (const phuCapId of listPhuCap) {
                                await createLichSuPhuCap(maNhanVien, phuCapId);                                               
                            }
                            getAllLichSuPhuCap();
                        } catch (err) {
                            console.error("Lỗi khi submit form:", err);
                        }
                } else {
                    if (editingId) {
                        const updateValues = {
                            ...values,
                            maPhuCap: editingId.maPhuCap,
                        };
                        try {
                            await updateLoaiPhuCap(updateValues);
                        } catch (error) {
                            console.error("Lỗi khi cập nhật:", error);
                        }
                    } else {
                        try {
                            await createLoaiPhuCap(values);
                        } catch (error) {
                            console.error("Lỗi khi thêm:", error);
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
        [createLoaiPhuCap, getAllLoaiPhuCap, getAllLichSuPhuCap, editingId]
    );

    const handleAdd = () => {
        setEditingId(null);
        setModalType("loaiphucap");
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        console.log("record để set form:", record);
        setEditingId(record.maPhuCap);
        setModalType("loaiphucap");
        setIsModalVisible(true);
        form.setFieldsValue(record);
    };

    const handleDelete = async (maPhuCap, maVaiTro) => {
        try {
            await deleteLoaiPhuCap(maPhuCap, maVaiTro);
            getAllLoaiPhuCap();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
        };
    }

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
        setSelectedMaNhanVien(null);
    };

    // Hàm xử lý CRUD cho Lịch sử phụ cấp
    const handleAddLichSu = () => {
        setEditingId(null);
        setModalType("lichsu");
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleDeletePhuCap = async (maNhanVien, maPhuCap) => {
        try {
            await deleteLichSuPhuCap(maNhanVien, maPhuCap);
            getAllLichSuPhuCap();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
        };
        setModalVisible(false);
    };

    //Xử lý xóa dòng
    const handleDeleteRowLichSu = async (maNhanVien) => {
        try {
            await deleteRowLichSuPhuCap(maNhanVien);
            getAllLichSuPhuCap();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
        };
    }

    //xóa nhiều dòng
    const handleDeleteMultipleLichSu = () => { 
        console.log('Chưa hỗ trợ được tính năng này');
    };
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

    //Xử lý modal chi tiết phụ cấp cho nhân viên
    const showModalPhuCap = (record) => {
        const lichSuPhuCapNhanVien = dataSourceLichSuPhuCap.filter(
            (item) => item.maNhanVien === record.maNhanVien
        );
        setSelectedRecord({
            ...record,
            lichSuPhuCap: lichSuPhuCapNhanVien
        });
        setModalVisible(true);
    };

    const columns = [
        {
            title: "Mã Phụ Cấp",
            dataIndex: "maPhuCap",
            key: "maPhuCap",
            render: (text) => <Text color="blue">{text}</Text>,
        },
        {
            title: "Tên Vai Trò",
            dataIndex: "tenVaiTro",
            key: "tenVaiTro",
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) =>
                a.tenVaiTro.toLowerCase().localeCompare(b.tenVaiTro.toLowerCase()),
        },
        {
            title: "Tên Phụ Cấp",
            dataIndex: "tenPhuCap",
            key: "tenPhuCap",
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) =>
                a.tenPhuCap.toLowerCase().localeCompare(b.tenPhuCap.toLowerCase()),
        },
        {
            title: "Tiền phụ cấp",
            dataIndex: "soTienPhuCap",
            key: "soTienPhuCap",
            render: (value) => `${Number(value).toLocaleString()} VNĐ`
        },
        {
            title: "Thao Tác",
            key: "action",
            width: 120,
            //fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="middle"
                    />
                    <Popconfirm
                        title="Xóa phụ cấp"
                        description="Bạn có chắc chắn muốn xóa loại phụ cấp này?"
                        onConfirm={() => handleDelete(record.maPhuCap, record.maVaiTro)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{
                            style: {
                                minWidth: 64,
                                maxWidth: 100,
                                padding: "0 12px",
                                whiteSpace: "nowrap",
                            },
                        }}
                        cancelButtonProps={{
                            style: {
                                minWidth: 64,
                                maxWidth: 100,
                                padding: "0 12px",
                                whiteSpace: "nowrap",
                            },
                        }}
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
            key: "hoTen",
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
            render: (text, record) => {
                if (!text) return (
                <Tag color="red" onClick={() => showModalPhuCap(record)}>
                    Phụ cấp đã bị xóa
                </Tag>);
                const tags = text.split(',').map(tag => tag.trim());
                return (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}
                        onClick={() => showModalPhuCap(record)}
                    >
                        {tags.map((tag, index) => (
                            <Tag
                                color="#B8860B"
                                key={index}
                            >
                                {tag}
                            </Tag>
                        ))}
                    </div>
                );
            }
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
                            handleDeleteRowLichSu(
                                record.maNhanVien,
                            )
                        }
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{
                            style: {
                                minWidth: 64,
                                maxWidth: 100,
                                padding: "0 12px",
                                whiteSpace: "nowrap",
                            },
                        }}
                        cancelButtonProps={{
                            style: {
                                minWidth: 64,
                                maxWidth: 100,
                                padding: "0 12px",
                                whiteSpace: "nowrap",
                            },
                        }}
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
            <Card style={{ marginBottom: 32 }}>
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
                <Col xs={24} sm={8} style={{ marginBottom: 20 }}>
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
                <Col xs={24} sm={8} style={{ marginBottom: 20 }}>
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
                                        <Select
                                            allowClear
                                            placeholder="Lọc theo vai trò"
                                            value={selectedVaiTro}
                                            onChange={(value) => setSelectedVaiTro(value)}
                                            style={{ minWidth: 200, maxWidth: '100%', width: '100%' }}
                                        >
                                            {danhSachVaiTro.map((vaiTro) => (
                                                <Select.Option key={vaiTro.maVaiTro} value={vaiTro.maVaiTro}>
                                                    {vaiTro.tenVaiTro}
                                                </Select.Option>
                                            ))}
                                        </Select>
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
                            rowKey={(record) => `${record.maNhanVien}-${record.hoTen}`}
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
                                        <Select
                                            allowClear
                                            placeholder="Lọc theo vai trò"
                                            value={selectedVaiTro}
                                            onChange={(value) => setSelectedVaiTro(value)}
                                            style={{ minWidth: 200, maxWidth: '100%', width: '100%' }}
                                        >
                                            {danhSachVaiTro.map((vaiTro) => (
                                                <Select.Option key={vaiTro.maVaiTro} value={vaiTro.maVaiTro}>
                                                    {vaiTro.tenVaiTro}
                                                </Select.Option>
                                            ))}
                                        </Select>
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
                            rowKey="maPhuCap"
                            rowSelection={loaiPhuCapRowSelection}
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
                                                    {nhanvien.hoTen} - {nhanvien.tenVaiTro}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={24}>
                                    <Form.Item
                                        label="Phụ cấp"
                                        name="maPhuCap"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng chọn phụ cấp!",
                                            },
                                        ]}
                                    >
                                        <Select
                                            mode="multiple"
                                            disabled={!selectedMaNhanVien}
                                            placeholder={selectedMaNhanVien ? "Chọn phụ cấp" : "Vui lòng chọn nhân viên"}
                                            showSearch
                                        >
                                            {danhSachPhuCapChuaChon.map((phucap) => (
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
                                        Thêm Mới
                                    </Button>
                                </Space>
                            </Form.Item>
                        </>
                    ) : (
                        <>
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
                                            onChange={() => {
                                                form.setFieldsValue({
                                                    tenPhuCap: undefined,
                                                    soTienPhuCap: undefined,
                                                });
                                            }}
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
                                        label="Tên Phụ Cấp"
                                        name="tenPhuCap"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập tên phụ cấp!",
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value) return Promise.resolve();

                                                    const valueNormalized = value.trim().toLowerCase();
                                                    const selectedVaiTro = getFieldValue("maVaiTro");

                                                    const isDuplicate = danhSachLoaiPhuCap.some((item) => {
                                                        const sameRole = item.maVaiTro === selectedVaiTro;
                                                        const sameName = item.tenPhuCap.trim().toLowerCase() === valueNormalized;
                                                        const isDifferentRecord = editingId ? item.maPhuCap !== editingId : true;

                                                        return sameRole && sameName && isDifferentRecord;
                                                    });

                                                    if (isDuplicate) {
                                                        return Promise.reject(new Error("Tên phụ cấp đã tồn tại cho vai trò này!"));
                                                    }

                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input placeholder="Tên phụ cấp" />
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

            <Modal
                centered
                title={`Chi tiết phụ cấp của nhân viên: ${selectedRecord?.hoTen}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <List
                    dataSource={selectedRecord?.lichSuPhuCap || []}
                    renderItem={(item) => {
                        //const matchedPhuCap = dataSourceLoaiPhuCap.find((pc) => pc.tenPhuCap === item);
                        //const soTien = matchedPhuCap?.soTienPhuCap || "Không rõ";
                        const tenPhuCapTonTai = item.tenPhuCap?.trim();
                        const tenPhuCapHienThi = item.tenPhuCap?.trim()
                            ? item.tenPhuCap
                            : "Phụ cấp đã bị xóa hoặc không có phụ cấp nào cho vai trò này nữa";
                        return (
                            <List.Item
                                actions={[
                                    <Popconfirm
                                        title={`Xóa phụ cấp "${item.tenPhuCap}"?`}
                                        onConfirm={() => handleDeletePhuCap(item.maNhanVien, item.maPhuCap)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button type="primary" danger>
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                ]}
                            >
                                <span>
                                    <strong>{tenPhuCapHienThi}</strong>
                                    {tenPhuCapTonTai && item.soTienPhuCap != null && (
                                        <> - {item.soTienPhuCap.toLocaleString()}</>
                                    )}
                                </span>
                            </List.Item>
                        )
                    }
                    }
                />
            </Modal>

        </div>
    )
}