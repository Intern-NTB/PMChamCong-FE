import React, { useEffect, useState, useContext, useCallback } from "react";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

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
  Row,
  Col,
  Typography,
  ConfigProvider,
  Tooltip,
} from "antd";

import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  HistoryOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";

// ==== HOOKS TUỲ CHỈNH ====
import { useLoaiTienThuong } from "../../component/hooks/useLoaiTienThuong";
import { useLichSuThuong } from "../../component/hooks/useLichSuTienThuong";
import { useNhanVien } from "../../component/hooks/useNhanVien";

// ==== CONTEXT ====
import { ReloadContext } from "../../context/reloadContext";

import dayjs from "dayjs";
// ===== Cấu hình Day.js =====
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("vi");
const { RangePicker } = DatePicker;

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Search } = Input;

export default function ThuongComponent() {
  // Hooks
  const {
    danhSachLoaiTienThuong,
    updateLoaiTienThuong,
    deleteLoaiTienThuong,
    createLoaiTienThuong,
    getAllLoaiTienThuong,
  } = useLoaiTienThuong();
  const {
    danhSachLichSuThuong,
    updateLichSuThuong,
    createLichSuThuong,
    deleteLichSuThuong,
  } = useLichSuThuong();
  const { danhSachNhanVien } = useNhanVien();
  // state
  const { setReload } = useContext(ReloadContext);
  const [donVi, setDonVi] = useState("VND");
  const [loaiThuongChuaApDung, setLoaiThuongChuaApDung] = useState([]);

  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Data Source
  const dataSourceDanhSachLichSuThuong = danhSachLichSuThuong.map((dsltt) => {
    const danhSachNhanVienFind = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === dsltt.maNhanVien
    );
    const danhSachLoaiTienThuongFind = danhSachLoaiTienThuong.find(
      (ltt) => ltt.maLoaiTienThuong === dsltt.maLoaiTienThuong
    );

    let quyDoi = 0;
    if (dsltt.soTienThuongKhac && dsltt.soTienThuongKhac > 0) {
      quyDoi = dsltt.soTienThuongKhac;
    } else if (
      danhSachLoaiTienThuongFind &&
      danhSachLoaiTienThuongFind.donVi === "%"
    ) {
      const luongCoBan = danhSachNhanVienFind?.luongCoBan || 0;
      quyDoi =
        (luongCoBan * (danhSachLoaiTienThuongFind.soTienThuong || 0)) / 100;
    } else {
      quyDoi = danhSachLoaiTienThuongFind?.soTienThuong || 0;
    }

    return {
      ...dsltt,
      hoTen: danhSachNhanVienFind?.hoTen || "N/A",
      tenLoaiTienThuong: danhSachLoaiTienThuongFind?.tenLoaiTienThuong || "N/A",
      soTienThuong: danhSachLoaiTienThuongFind?.soTienThuong || 0,
      donVi: danhSachLoaiTienThuongFind?.donVi || "N/A",
      luongCoBan: danhSachNhanVienFind?.luongCoBan || 0,
      quyDoi,
    };
  });

  useEffect(() => {
    setReload(() => getAllLoaiTienThuong);
  }, []);



  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(""); // 'lichsu' hoặc 'loaithuong'
  const [form] = Form.useForm();

  // State cho tìm kiếm
  const [searchTextLichSu, setSearchTextLichSu] = useState("");
  const [searchTextLoaiThuong, setSearchTextLoaiThuong] = useState("");

  // State cho select nhiều dòng
  const [selectedLichSuKeys, setSelectedLichSuKeys] = useState([]);
  const [selectedLoaiThuongKeys, setSelectedLoaiThuongKeys] = useState([]);

  useEffect(() => {
    if (editingItem?.maNhanVien) {
      handleNhanVienChange(editingItem.maNhanVien);
      form.setFieldsValue(editingItem);
      setDonVi(editingItem.donVi || "VND"); // nếu bạn có lưu đơn vị
    }
  }, [editingItem]);

  // Tính toán thống kê
  const tongSoNhanVienDuocThuong = new Set(
    danhSachLichSuThuong.map((item) => item.maNhanVien)
  ).size;
  const tongSoTienThuong = dataSourceDanhSachLichSuThuong.reduce(
    (sum, item) => sum + (item.quyDoi || 0),
    0
  );
  const tongSoLanThuong = danhSachLichSuThuong.length;

  //Hàm check các loại thưởng chưa áp dụng

  // Hàm lọc dữ liệu cho tìm kiếm, lọc theo thời gian
  const getFilteredLichSu = () => {
  let filteredData = dataSourceDanhSachLichSuThuong;

  // Thêm kiểm tra dateRange[0] và dateRange[1]
  if (dateRange && dateRange[0] && dateRange[1]) {
    filteredData = filteredData.filter((item) => {
      const itemDate = dayjs(item.ngayTru);
      return itemDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
    });
  }

  // Phần lọc tháng không cần thay đổi vì nó đã có kiểm tra `if (selectedMonth)`
  if (selectedMonth) {
    filteredData = filteredData.filter((item) => {
      const itemDate = dayjs(item.ngayTru);
      return (
        itemDate.month() === selectedMonth.month() &&
        itemDate.year() === selectedMonth.year()
      );
    });
  }

  // Phần lọc theo từ khóa tìm kiếm không cần thay đổi
  if (searchTextLichSu) {
    const searchLower = searchTextLichSu.toLowerCase();
    filteredData = filteredData.filter((item) => {
      return (
        item.maNhanVien?.toLowerCase().includes(searchLower) ||
        item.hoTen?.toLowerCase().includes(searchLower) ||
        getLoaiThuongName(item.maLoaiTienThuong)
          ?.toLowerCase()
          .includes(searchLower) ||
        item.lyDo?.toLowerCase().includes(searchLower)
      );
    });
  }

  return filteredData;
};

  const getFilteredLoaiThuong = () => {
    if (!searchTextLoaiThuong) return danhSachLoaiTienThuong;
    return danhSachLoaiTienThuong.filter(
      (item) =>
        item.tenLoaiTienThuong
          .toLowerCase()
          .includes(searchTextLoaiThuong.toLowerCase()) ||
        item.maLoaiTienThuong.toString().includes(searchTextLoaiThuong)
    );
  };

  // Hàm xử lý select nhiều dòng
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

  const loaiThuongRowSelection = {
    selectedRowKeys: selectedLoaiThuongKeys,
    onChange: (selectedRowKeys) => {
      setSelectedLoaiThuongKeys(selectedRowKeys);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log("Select all:", selected, selectedRows, changeRows);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log("Select:", record, selected, selectedRows);
    },
  };

  // Hàm xử lý xóa nhiều dòng
  const handleDeleteMultipleLichSu = () => { };

  const handleDeleteMultipleLoaiThuong = () => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa ${selectedLoaiThuongKeys.length} loại thưởng đã chọn?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        // Gọi API xóa nhiều loại thưởng
        selectedLoaiThuongKeys.forEach(async (maLoaiTienThuong) => {
          try {
            await deleteLoaiTienThuong(maLoaiTienThuong);
          } catch (error) {
            console.error("Error deleting:", error);
          }
        });
        setSelectedLoaiThuongKeys([]);
      },
    });
  };

  // Hàm xử lý CRUD cho Lịch sử thưởng
  const handleAddLichSu = () => {
    setEditingItem(null);
    setModalType("lichsu");
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditLichSu = (record) => {
    setEditingItem(record);
    setModalType("lichsu");
    setIsModalVisible(true);
    setDonVi(record.donVi);
    form.setFieldsValue({
      ...record,
      ngayThuong: dayjs(record.ngayThuong),
    });
  };

  const handleDeleteLichSuThuong = async (maNhanVien, maLoaiTienThuong) => {
    try {
      await deleteLichSuThuong(maNhanVien, maLoaiTienThuong);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  // Hàm xử lý CRUD cho Loại thưởng
  const handleAddLoaiThuong = () => {
    setEditingItem(null);
    setModalType("loaithuong");
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditLoaiThuong = (record) => {
    setEditingItem(record);
    setModalType("loaithuong");
    setIsModalVisible(true);
    setDonVi(record.donVi);
    form.setFieldsValue(record);
  };

  const handleDeleteLoaiThuong = async (maLoaiTienThuong) => {
    const isBeingUsed = dataSourceDanhSachLichSuThuong.some(
      (item) => item.maLoaiTienThuong === maLoaiTienThuong
    );

    if (isBeingUsed) {
      console.log("Không thể xóa! Loại tiền thưởng này đang được sử dụng.");
      return;
    }

    // Nếu không bị dùng, cho phép xóa
    try {
      await deleteLoaiTienThuong(maLoaiTienThuong);
      getAllLoaiTienThuong(); // cập nhật lại danh sách
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === "lichsu") {
        const formattedValues = {
          ...values,
          ngayThuong: values.ngayThuong.format("YYYY-MM-DD"),
          soTienThuongKhac: values.soTienThuongKhac ?? 0
        };

        if (editingItem) {
          await updateLichSuThuong(formattedValues);
        } else {
          await createLichSuThuong(formattedValues);
        }
      } else {
        if (editingItem) {
          const updateValues = {
            ...values,
            maLoaiTienThuong: editingItem.maLoaiTienThuong,
          };
          try {
            await updateLoaiTienThuong(updateValues);
          } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
          }
        } else {
          try {
            await createLoaiTienThuong(values);
          } catch (error) {
            console.error("Lỗi khi thêm:", error);
          }
        }
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleDateRangeChange = useCallback((dates) => {
    setDateRange(dates);
    setSelectedMonth(null);
  }, []);

  const handleMonthChange = useCallback((month) => {
    setSelectedMonth(month);

    if (month) {
      const startOfMonth = month.startOf("month");
      const endOfMonth = month.endOf("month");
      setDateRange([startOfMonth, endOfMonth]);
    } else {
      setDateRange([null, null]);
    }
  }, []);

  const getLoaiThuongName = (maLoaiTienThuong) => {
    const loaiThuong = dataSourceDanhSachLichSuThuong.find(
      (item) => item.maLoaiTienThuong === maLoaiTienThuong
    );
    return loaiThuong ? loaiThuong.tenLoaiTienThuong : "Không xác định";
  };

  const handleDonViChange = (value) => {
    setDonVi(value);
    form.setFieldValue("soTienThuong", null);
  };

  const handleLoaiThuongChange = (maLoaiTienThuong) => {
    const loai = danhSachLoaiTienThuong.find(
      (item) => item.maLoaiTienThuong === maLoaiTienThuong
    );

    if (loai) {
      setDonVi(loai.donVi);
    }

    form.setFieldValue("maLoaiTienThuong", maLoaiTienThuong);
  };

  const handleNhanVienChange = (maNhanVienChon) => {
    form.setFieldValue("maNhanVien", maNhanVienChon);
    const loaiLoc = danhSachLoaiTienThuong.filter((loai) => {
      const daApDung = dataSourceDanhSachLichSuThuong.some(
        (lichSu) =>
          lichSu.maNhanVien === maNhanVienChon &&
          lichSu.maLoaiTienThuong === loai.maLoaiTienThuong
      );

      if (editingItem?.maLoaiTienThuong === loai.maLoaiTienThuong) return true;

      return !daApDung;
    });

    setLoaiThuongChuaApDung(loaiLoc);
    form.setFieldValue("maLoaiTienThuong", null);
  };

  // Columns cho bảng Lịch sử thưởng
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
    },
    {
      title: "Loại thưởng",
      dataIndex: "tenLoaiTienThuong",
      key: "tenLoaiTienThuong",
    },
    {
      title: "Mức thưởng cơ bản",
      key: "mucThuongCoBan",
      render: (_, record) => {
        const { soTienThuong, donVi } = record;
        if (donVi === "%") {
          return `${soTienThuong}%`;
        }
        return `${new Intl.NumberFormat("vi-VN").format(soTienThuong)} ${donVi}`;
      },
    },
    {
      title: "Mức thưởng tùy chọn",
      key: "mucThuongTuyChon",
      render: (_, record) => {
        const { soTienThuongKhac, donVi } = record;
        if (donVi === "%") {
          return `${soTienThuongKhac}%`;
        }
        return `${new Intl.NumberFormat("vi-VN").format(soTienThuongKhac)} ${donVi}`;
      },
    },
    {
      title: "Số tiền quy đổi",
      dataIndex: "quyDoi",
      key: "quyDoi",
      render: (amount) => new Intl.NumberFormat("vi-VN").format(amount),
    },
    {
      title: "Ngày thưởng",
      dataIndex: "ngayTao",
      key: "ngayTao",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Lý do",
      dataIndex: "lyDo",
      key: "lyDo",
      ellipsis: true,
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

  // Columns cho bảng Loại thưởng
  const loaiThuongColumns = [
    {
      title: "Tên loại thưởng",
      dataIndex: "tenLoaiTienThuong",
      key: "tenLoaiTienThuong",
    },
    {
      title: "Mức thưởng",
      key: "giaTriThuong",
      render: (_, record) => {
        const { soTienThuong, donVi } = record;

        //đơn vị phần trăm
        if (donVi === "%") {
          return `${soTienThuong} %`;
        }

        //VND (đơn vị khác)
        return `${new Intl.NumberFormat("vi-VN").format(soTienThuong)} ${donVi}`;
      },
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
            onClick={() => handleEditLoaiThuong(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteLoaiThuong(record.maLoaiTienThuong)}
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
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
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
            Quản lý thưởng
          </Title>
          <Text style={{ color: "grey", fontSize: 14 }}>
            Quản lý thông tin thưởng và lịch sử thưởng nhân viên
          </Text>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={24} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng nhân viên được thưởng"
                value={tongSoNhanVienDuocThuong}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1890ff", cursor: "pointer" }}
                onClick={() => setIsHistoryModalVisible(true)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số tiền thưởng"
                value={tongSoTienThuong}
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
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng lần thưởng"
                value={tongSoLanThuong}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#722ed1" }}
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
                  Lịch sử thưởng
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
                        Thêm thưởng cho nhân viên
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
                      placeholder="Tìm kiếm theo mã NV, tên, loại thưởng, lý do..."
                      allowClear
                      style={{ width: "100%" }}
                      onChange={(e) => setSearchTextLichSu(e.target.value)}
                      prefix={<SearchOutlined />}
                    />
                  </Col>
                  {/* Bộ lọc thời gian */}
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
                dataSource={getFilteredLichSu()}
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
                  Loại thưởng
                </span>
              }
              key="loaithuong"
            >
              <div style={{ marginBottom: "16px" }}>
                <Row gutter={[16, 16]} align="middle">
                  {/* Nhóm nút Thêm và Xóa */}
                  <Col xs={24} md={16} lg={18}>
                    <Space wrap>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddLoaiThuong}
                      >
                        Thêm loại thưởng
                      </Button>
                      {selectedLoaiThuongKeys.length > 0 && (
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleDeleteMultipleLoaiThuong}
                        >
                          Xóa {selectedLoaiThuongKeys.length} mục đã chọn
                        </Button>
                      )}
                    </Space>
                  </Col>

                  {/* Ô tìm kiếm */}
                  <Col xs={24} md={8} lg={6}>
                    <Search
                      placeholder="Tìm kiếm theo mã hoặc tên loại thưởng..."
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
                columns={loaiThuongColumns}
                dataSource={getFilteredLoaiThuong()}
                rowKey="maLoaiTienThuong"
                rowSelection={loaiThuongRowSelection}
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

        {/* Modal thêm/sửa */}
        <Modal
          title={editingItem ? "Chỉnh sửa" : "Thêm mới"}
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={600}
          okText="Lưu"
          cancelText="Hủy"
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
          <Form
            form={form}
            layout="vertical"
            initialValues={{ ngayThuong: dayjs() }}
          >
            {modalType === "lichsu" ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="maNhanVien"
                      label="Nhân viên"
                      rules={[
                        { required: true, message: "Vui lòng nhập nhân viên!" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn nhân viên"
                        showSearch
                        disabled={editingItem != null}
                        optionFilterProp="label"
                        onChange={handleNhanVienChange}
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={danhSachNhanVien.map((nv) => ({
                          value: nv.maNhanVien,
                          label: `${nv.hoTen} - ${nv.cmnd}`,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="maLoaiTienThuong"
                  label="Loại thưởng"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại thưởng!" },
                  ]}
                >
                  <Select placeholder="Chọn loại thưởng"
                    showSearch
                    disabled={editingItem != null || form.getFieldValue("maNhanVien") == null}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={handleLoaiThuongChange}
                  >
                    {loaiThuongChuaApDung.map((item) => (
                      <Select.Option
                        key={item.maLoaiTienThuong}
                        value={item.maLoaiTienThuong}
                      >
                        {item.tenLoaiTienThuong} - {item.donVi === "%"
                          ? `${item.soTienThuong} %`
                          : `${new Intl.NumberFormat("vi-VN").format(item.soTienThuong)} ${item.donVi}`
                        }
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="soTienThuongKhac" label={
                      <span>
                        {donVi === "%" ? "Phần trăm thưởng mong muốn" : "Số tiền thưởng mong muốn"}{" "}
                        <Tooltip title="Mức thưởng khác, thấp hoặc cao hơn so với loại thưởng gốc (Tùy chọn)">
                          <QuestionCircleOutlined style={{ color: "#1890ff", marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }>
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder={
                          donVi === "%" ? "Nhập phần trăm thưởng" : "Nhập số tiền thưởng"
                        }
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="ngayThuong"
                      label="Ngày thưởng"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn ngày thưởng!",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="lyDo"
                  label="Lý do thưởng"
                  rules={[
                    { required: true, message: "Vui lòng nhập lý do thưởng!" },
                  ]}
                >
                  <TextArea rows={3} placeholder="Nhập lý do thưởng" />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="tenLoaiTienThuong"
                  label="Tên loại thưởng"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên loại thưởng!",
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        const trimmer = value.trim().toLowerCase();
                        const existed = danhSachLoaiTienThuong.some((item) =>
                          item.tenLoaiTienThuong.trim().toLowerCase() === trimmer &&
                          (!editingItem || editingItem.tenLoaiTienThuong.trim().toLowerCase() !== trimmer)
                        );

                        return existed
                          ? Promise.reject("Tên loại thưởng đã tồn tại!")
                          : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên loại thưởng" />
                </Form.Item>

                <Form.Item
                  name="donVi"
                  label="Đơn vị"
                  rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
                >
                  <Select
                    placeholder="Chọn đơn vị"
                    options={[
                      { value: "VND", label: "VND" },
                      { value: "%", label: "%" },
                    ]}
                    onChange={handleDonViChange}
                  />
                </Form.Item>

                <Form.Item
                  name="soTienThuong"
                  label={donVi === "%" ? "Phần trăm thưởng" : "Số tiền thưởng"}
                  rules={[
                    {
                      required: true, message: donVi === "%"
                        ? "Vui lòng nhập phần trăm thưởng!"
                        : "Vui lòng nhập số tiền thưởng!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={
                      donVi === "%" ? "Nhập phần trăm thưởng" : "Nhập số tiền thưởng"
                    }
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    min={0}
                    max={donVi === "%" ? 100 : undefined}
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* Modal lịch sử thưởng */}
        <Modal
          title="Lịch sử thưởng - Chi tiết"
          open={isHistoryModalVisible}
          onCancel={() => setIsHistoryModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsHistoryModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          <div style={{ marginBottom: "16px" }}>
            <Search
              placeholder="Tìm kiếm nhân viên trong lịch sử..."
              allowClear
              style={{ width: "100%" }}
              prefix={<SearchOutlined />}
            />
          </div>

          <Table
            columns={[
              {
                title: "Mã NV",
                dataIndex: "maNhanVien",
                key: "maNhanVien",
                width: 100,
              },
              {
                title: "Tên nhân viên",
                dataIndex: "hoTen",
                key: "hoTen",
              },
              {
                title: "Số lần thưởng",
                key: "soLanThuong",
                render: (_, record) => {
                  const soLan = danhSachLichSuThuong.filter(
                    (item) => item.maNhanVien === record.maNhanVien
                  ).length;
                  return soLan;
                },
              },
              {
                title: "Tổng tiền thưởng",
                key: "tongTienThuong",
                render: (_, record) => {
                  const tongTien = danhSachLichSuThuong
                    .filter((item) => item.maNhanVien === record.maNhanVien)
                    .reduce((sum, item) => sum + item.soTienThuongKhac, 0);
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(tongTien);
                },
              },
            ]}
            dataSource={Array.from(
              new Set(
                dataSourceDanhSachLichSuThuong.map((item) => item.maNhanVien)
              )
            ).map((maNV) => {
              const nhanVien = danhSachNhanVien.find(
                (nv) => nv.maNhanVien === maNV
              );
              return {
                maNhanVien: maNV,
                hoTen: nhanVien?.hoTen || "N/A",
              };
            })}
            rowKey="maNhanVien"
            pagination={{
              pageSize: 5,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} nhân viên`,
            }}
            size="small"
          />
        </Modal>
      </div>
    </div>
  );
}
