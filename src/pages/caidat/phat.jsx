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
  HistoryOutlined,
  SearchOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";

// ==== HOOKS TUỲ CHỈNH ====
import { useLoaiTienTru } from "../../component/hooks/useLoaiTienTru";
import { useLichSuTru } from "../../component/hooks/useLichSuTienTru";
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

export default function TruComponent() {
  // Hooks
  const {
    danhSachLoaiTienTru,
    updateLoaiTienTru,
    deleteLoaiTienTru,
    createLoaiTienTru,
    getAllLoaiTienTru,
  } = useLoaiTienTru();
  const {
    danhSachLichSuTru,
    updateLichSuTru,
    createLichSuTru,
    deleteLichSuTru,
  } = useLichSuTru();
  const { danhSachNhanVien } = useNhanVien();
  // state
  const { setReload } = useContext(ReloadContext);
  const [donViTru, setDonViTru] = useState("VND");
  const [loaiPhatChuaApDung, setLoaiPhatChuaApDung] = useState([]);

  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Data Source
  const dataSourceDanhSachLichSuTru = danhSachLichSuTru.map((dsltt) => {
    const danhSachNhanVienFind = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === dsltt.maNhanVien
    );
    const danhSachLoaiTienTruFind = danhSachLoaiTienTru.find(
      (ltt) => ltt.maLoaiTienTru === dsltt.maLoaiTienTru
    );

    let quyDoi = 0;
    if (dsltt.soTienTruKhac && dsltt.soTienTruKhac > 0) {
      quyDoi = dsltt.soTienTruKhac;
    } else if (danhSachLoaiTienTruFind && danhSachLoaiTienTruFind.donVi) {
      // Dùng đúng biến danhSachLoaiTienTruFind thay vì loaiTienTru
      if (danhSachLoaiTienTruFind.donVi === "%") {
        // Cần lấy luongCoBan của nhân viên, phòng trường hợp undefined thì 0
        const luongCoBan = danhSachNhanVienFind?.luongCoBan || 0;
        quyDoi = (luongCoBan * danhSachLoaiTienTruFind.soTienTru) / 100;
      } else {
        quyDoi = danhSachLoaiTienTruFind.soTienTru;
      }
    }
    return {
      ...dsltt,
      hoTen: danhSachNhanVienFind?.hoTen || "N/A",
      tenLoaiTienTru: danhSachLoaiTienTruFind?.tenLoaiTienTru || "N/A",
      soTienTru: danhSachLoaiTienTruFind?.soTienTru || 0,
      donVi: danhSachLoaiTienTruFind?.donVi || "N/A",
      luongCoBan: danhSachNhanVienFind?.luongCoBan || 0,
      quyDoi,
    };
  });

  useEffect(() => {
    setReload(() => getAllLoaiTienTru);
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(""); // 'lichsu' hoặc 'loaiphat'
  const [form] = Form.useForm();

  // State cho tìm kiếm
  const [searchTextLichSu, setSearchTextLichSu] = useState("");
  const [searchTextLoaiTru, setSearchTextLoaiTru] = useState("");

  // State cho select nhiều dòng
  const [selectedLichSuKeys, setSelectedLichSuKeys] = useState([]);
  const [selectedLoaiTruKeys, setSelectedLoaiTruKeys] = useState([]);

  useEffect(() => {
    if (editingItem?.maNhanVien) {
      handleNhanVienChangePhat(editingItem.maNhanVien);
      form.setFieldsValue(editingItem);
      setDonViTru(editingItem.donVi || "VND");
    }
  }, [editingItem]);

  // Tính toán thống kê
  const tongSoNhanVienBiTru = new Set(
    danhSachLichSuTru.map((item) => item.maNhanVien)
  ).size;

  // Hàm lọc dữ liệu cho tìm kiếm, lọc theo thời gian( ngày, tháng )
  const getFilteredLichSu = () => {
  let filteredData = dataSourceDanhSachLichSuTru;

  // Lọc khoảng thời gian
  if (dateRange && dateRange[0] && dateRange[1]) { // Thêm kiểm tra cho chính dateRange
    filteredData = filteredData.filter((item) => {
      const itemDate = dayjs(item.ngayTru);
      return itemDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
    });
  }

  // Lọc tháng
  if (selectedMonth) {
    filteredData = filteredData.filter((item) => {
      const itemDate = dayjs(item.ngayTru);
      return (
        itemDate.month() === selectedMonth.month() &&
        itemDate.year() === selectedMonth.year()
      );
    });
  }

  // ... các phần còn lại của hàm của bạn ...
  // Lọc từ khóa tìm kiếm
  if (searchTextLichSu) {
    const searchLower = searchTextLichSu.toLowerCase();
    filteredData = filteredData.filter((item) => {
      const maNhanVienStr = item.maNhanVien?.toString().toLowerCase() || "";
      const hoTenStr = item.hoTen?.toLowerCase() || "";
      const lyDoStr = item.lyDo?.toLowerCase() || "";
      const loaiTruNameStr =
        getLoaiTruName(item.maLoaiTienTru)?.toLowerCase() || "";

      return (
        maNhanVienStr.includes(searchLower) ||
        hoTenStr.includes(searchLower) ||
        loaiTruNameStr.includes(searchLower) ||
        lyDoStr.includes(searchLower)
      );
    });
  }

  return filteredData;
};

  // Hàm tính tổng số lần trừ dựa trên danh sách đã lọc
  const getTotalLanTruFromFiltered = () => {
    const filteredList = getFilteredLichSu();
    return filteredList.length;
  };

  // Hàm tính tổng dựa trên danh sách đã lọc
  const getTotalFromFiltered = () => {
    const filteredList = getFilteredLichSu();

    // Giả sử muốn tính tổng trường soTienTru (cập nhật theo dữ liệu bạn có)
    return filteredList.reduce((total, item) => {
      // item.soTienTru có thể là số hoặc chuỗi, convert sang số
      const value = Number(item.quyDoi) || 0;
      return total + value;
    }, 0);
  };

  const getFilteredLoaiTru = () => {
    if (!searchTextLoaiTru) return danhSachLoaiTienTru;
    return danhSachLoaiTienTru.filter(
      (item) =>
        item.tenLoaiTru
          .toLowerCase()
          .includes(searchTextLoaiTru.toLowerCase()) ||
        item.maLoaiTienTru.toString().includes(searchTextLoaiTru)
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

  const loaiTruRowSelection = {
    selectedRowKeys: selectedLoaiTruKeys,
    onChange: (selectedRowKeys) => {
      setSelectedLoaiTruKeys(selectedRowKeys);
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

  const handleDeleteMultipleLoaiTru = () => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa ${selectedLoaiTruKeys.length} loại phạt đã chọn?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          // Gọi API xóa nhiều loại phạt
          await Promise.all(
            selectedLoaiTruKeys.map(maLoaiTienTru => deleteLoaiTienTru(maLoaiTienTru))
          );
          setSelectedLoaiTruKeys([]);
          // Success notification sẽ tự động hiển thị qua axios interceptor
        } catch (error) {
          console.error("Lỗi khi xóa nhiều loại phạt:", error);
          // Error notification sẽ tự động hiển thị qua axios interceptor
        }
      },
    });
  };

  // Hàm xử lý CRUD cho Lịch sử phạt
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
    form.setFieldsValue({
      ...record,
      ngayTru: dayjs(record.ngayTru),
    });
  };

  const handleDeleteLichSuTru = async (maNhanVien, maLoaiTienTru) => {
    try {
      await deleteLichSuTru(maNhanVien, maLoaiTienTru);
      // Success notification sẽ tự động hiển thị qua axios interceptor
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử trừ:", error);
      // Error notification sẽ tự động hiển thị qua axios interceptor
    }
  };

  // Hàm xử lý CRUD cho Loại phạt
  const handleAddLoaiTru = () => {
    setEditingItem(null);
    setModalType("loaiphat");
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditLoaiTru = (record) => {
    setEditingItem(record);
    setModalType("loaiphat");
    setIsModalVisible(true);
    setDonViTru(record.donVi);
    form.setFieldsValue(record);
  };

  const handleDeleteLoaiTru = async (maLoaiTienTru) => {
    const isBeingUsed = dataSourceDanhSachLichSuTru.some(
      (item) => item.maLoaiTienTru === maLoaiTienTru
    );

    if (isBeingUsed) {
      // Hiển thị warning với notification system - có thể dùng helper function
      console.warn("Loại tiền trừ này đang được áp dụng");
      return;
    }

    try {
      await deleteLoaiTienTru(maLoaiTienTru);
      // Success notification sẽ tự động hiển thị qua axios interceptor
      getAllLoaiTienTru();
    } catch (error) {
      console.error("Lỗi khi xóa loại tiền trừ:", error);
      // Error notification sẽ tự động hiển thị qua axios interceptor
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === "lichsu") {
        const formattedValues = {
          ...values,
          soTienTru: values.soTienTru ?? null,
          ngayTru: values.ngayTru.format("YYYY-MM-DD"),
        };

        if (editingItem) {
          await updateLichSuTru(values);
          // Success notification sẽ tự động hiển thị qua axios interceptor
        } else {
          await createLichSuTru(formattedValues);
          // Success notification sẽ tự động hiển thị qua axios interceptor
        }
      } else {
        if (editingItem) {
          const updateValues = {
            ...values,
            maLoaiTienTru: editingItem.maLoaiTienTru,
          };
          await updateLoaiTienTru(updateValues);
          // Success notification sẽ tự động hiển thị qua axios interceptor
        } else {
          await createLoaiTienTru(values);
          // Success notification sẽ tự động hiển thị qua axios interceptor
        }
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
      // Error notification sẽ tự động hiển thị qua axios interceptor
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

  const getLoaiTruName = (maLoaiTienTru) => {
    const loaiTru = dataSourceDanhSachLichSuTru.find(
      (item) => item.maLoaiTienTru === maLoaiTienTru
    );
    return loaiTru ? loaiTru.tenLoaiTru : "Không xác định";
  };

  //Xử lý lọc theo mã nhân viên các loại phạt đã áp dụng trước đó
  const handleNhanVienChangePhat = (maNhanVienChon) => {
    form.setFieldValue("maNhanVien", maNhanVienChon);

    const loc = danhSachLoaiTienTru.filter((loai) => {
      const daApDung = dataSourceDanhSachLichSuTru.some(
        (lichSu) =>
          lichSu.maNhanVien === maNhanVienChon &&
          lichSu.maLoaiTienTru === loai.maLoaiTienTru
      );

      // Nếu đang sửa thì giữ loại đang được sửa
      if (editingItem?.maLoaiTienTru === loai.maLoaiTienTru) return true;

      return !daApDung;
    });

    setLoaiPhatChuaApDung(loc);
    form.setFieldValue("maLoaiTienTru", null); // reset nếu đã chọn trước đó
  };

  // Columns cho bảng Lịch sử phạt
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
      title: "Loại phạt",
      dataIndex: "tenLoaiTienTru",
      key: "tenLoaiTienTru",
      filters: danhSachLoaiTienTru.map((loaiPhat) => ({
        text: loaiPhat.tenLoaiTienTru,
        value: loaiPhat.tenLoaiTienTru,
      })),
      onFilter: (value, record) => record.tenLoaiTienTru === value,
    },
    {
      title: "Số tiền phạt cơ bản",
      key: "soTienTruFull",
      render: (_, record) => {
        const { soTienTru, donVi } = record;

        return donVi === "%"
          ? `${soTienTru} %`
          : `${new Intl.NumberFormat("vi-VN").format(soTienTru)} ${donVi}`;
      },
    },
    {
      title: "Số tiền phạt mong muốn",
      key: "soTienTruKhacFull",
      render: (_, record) => {
        const { soTienTruKhac, donVi } = record;

        return donVi === "%"
          ? `${soTienTruKhac ?? 0} %`
          : `${new Intl.NumberFormat("vi-VN").format(soTienTruKhac ?? 0)} ${donVi}`;
      },
    },
    {
      title: "Ngày phạt",
      dataIndex: "ngayTao",
      key: "ngayTao",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Lý do",
      dataIndex: "liDo",
      key: "liDo",
      ellipsis: true,
    },
    {
      title: "Số tiền quy đổi",
      dataIndex: "quyDoi",
      key: "quyDoi",
      render: (soTienQuyDoi) => new Intl.NumberFormat('vi-vn').format(soTienQuyDoi),
      sorter: (a, b) => a.quyDoi - b.quyDoi,
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
              handleDeleteLichSuTru(record.maNhanVien, record.maLoaiTienTru)
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

  // Columns cho bảng Loại phạt
  const loaiTruColumns = [
    {
      title: "Tên loại phạt",
      dataIndex: "tenLoaiTienTru",
      key: "tenLoaiTienTru",
    },
    {
      title: "Số tiền phạt",
      key: "soTienTruDayDu",
      render: (_, record) => {
        const { soTienTru, donVi } = record;

        if (donVi === "%") {
          return `${soTienTru} %`;
        }

        return `${new Intl.NumberFormat("vi-VN").format(soTienTru)} ${donVi}`;
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
            onClick={() => handleEditLoaiTru(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteLoaiTru(record.maLoaiTienTru)}
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
              background: "linear-gradient(45deg, #ff6b6b, #ee5a52)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            Quản lý tiền phạt
          </Title>
          <Text style={{ color: "grey", fontSize: 14 }}>
            Quản lý thông tin phạt và lịch sử phạt nhân viên
          </Text>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={24} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng nhân viên bị phạt"
                value={tongSoNhanVienBiTru}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#ff4d4f", cursor: "pointer" }}
                onClick={() => setIsHistoryModalVisible(true)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số tiền phạt"
                value={getTotalFromFiltered()}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#ff7a45" }}
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
                title="Tổng lần phạt"
                value={getTotalLanTruFromFiltered()}
                valueStyle={{ color: "#fa541c" }}
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
                  Lịch sử phạt
                </span>
              }
              key="lichsu"
            >
              <div style={{ marginBottom: "16px" }}>
                <Row gutter={[16, 16]} align="middle">
                  {/* Nút thêm và xóa */}
                  <Col xs={24} md={12} lg={16}>
                    <Space wrap>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddLichSu}
                        danger
                      >
                        Thêm phạt cho nhân viên
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
                      placeholder="Tìm kiếm theo mã NV, tên, loại phạt, lý do..."
                      allowClear
                      prefix={<SearchOutlined />}
                      onChange={(e) => setSearchTextLichSu(e.target.value)}
                      style={{
                        width: "100%",
                        maxWidth: 350,
                        marginLeft: "auto",
                      }}
                    />
                  </Col>

                  {/* Bộ lọc tháng + khoảng thời gian */}
                  <Col xs={20} sm={20} md={18} lg={16} xl={12}>
                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                      <span style={{ marginBottom: 8 }}>Chọn khoảng thời gian:</span>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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

            <TabPane tab={<span>Loại phạt</span>} key="loaiphat">
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={24} md={16}>
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddLoaiTru}
                      danger
                    >
                      Thêm loại phạt
                    </Button>
                    {selectedLoaiTruKeys.length > 0 && (
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteMultipleLoaiTru}
                      >
                        Xóa {selectedLoaiTruKeys.length} mục đã chọn
                      </Button>
                    )}
                  </Space>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Search
                    placeholder="Tìm kiếm theo mã hoặc tên loại phạt..."
                    allowClear
                    style={{ width: "100%" }}
                    onChange={(e) => setSearchTextLoaiTru(e.target.value)}
                    prefix={<SearchOutlined />}
                  />
                </Col>
              </Row>

              {selectedLoaiTruKeys.length > 0 && (
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
                    Đã chọn {selectedLoaiTruKeys.length} mục
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setSelectedLoaiTruKeys([])}
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>
              )}

              <Table
                columns={loaiTruColumns}
                dataSource={getFilteredLoaiTru()}
                rowKey="maLoaiTienTru"
                rowSelection={loaiTruRowSelection}
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
            initialValues={{ ngayTru: dayjs() }}
          >
            {modalType === "lichsu" ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="maNhanVien"
                      label="Nhân viên"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập  nhân viên!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn nhân viên"
                        showSearch
                        disabled={editingItem != null}
                        onChange={handleNhanVienChangePhat}
                        optionFilterProp="label"
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
                  name="maLoaiTienTru"
                  label="Loại phạt"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại phạt!" },
                  ]}
                >
                  <Select placeholder="Chọn loại phạt"
                    showSearch
                    disabled={editingItem != null || form.getFieldValue("maNhanVien") == null}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                    }>
                    {loaiPhatChuaApDung.map((item) => (
                      <Select.Option
                        key={item.maLoaiTienTru}
                        value={item.maLoaiTienTru}
                      >
                        {item.tenLoaiTienTru} - {" "}
                        {item.donVi === "%"
                          ? `${item.soTienTru} %`
                          : `${new Intl.NumberFormat("vi-VN").format(item.soTienTru)} ${item.donVi}`}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="soTienTruKhac"
                      label={
                        <span>
                          {donViTru === "%" ? "Phần trăm trừ mong muốn" : "Số tiền trừ mong muốn"} {" "}
                          <Tooltip title="Khoản trừ cụ thể hoặc theo phần trăm so với mức trừ cơ bản (tùy chọn)">
                            <QuestionCircleOutlined style={{ color: "#1890ff", marginLeft: 4 }} />
                          </Tooltip>
                        </span>
                      }>
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Nhập số tiền phạt"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="ngayTru"
                      label="Ngày phạt"
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày phạt!" },
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
                  name="liDo"
                  label="Lý do phạt"
                  rules={[
                    { required: true, message: "Vui lòng nhập lý do phạt!" },
                  ]}
                >
                  <TextArea rows={3} placeholder="Nhập lý do phạt" />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="tenLoaiTienTru"
                  label="Tên loại phạt"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên loại phạt!" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        const tenDaTonTai = danhSachLoaiTienTru.some(
                          (item) =>
                            item.tenLoaiTienTru.trim().toLowerCase() === value.trim().toLowerCase() &&
                            item.maLoaiTienTru !== editingItem?.maLoaiTienTru // bỏ qua nếu đang sửa chính nó
                        );

                        return tenDaTonTai
                          ? Promise.reject("Tên loại phạt đã tồn tại!")
                          : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên loại phạt" />
                </Form.Item>

                <Form.Item
                  name="donVi"
                  label="Đơn vị"
                  rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
                >
                  <Select
                    placeholder="Chọn đơn vị"
                    onChange={(value) => { setDonViTru(value); form.setFieldValue("soTienTru", null); }}
                    options={[
                      { value: "%", label: "%" },
                      { value: "VND", label: "VND" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="soTienTru"
                  label={donViTru === "%" ? "Phần trăm trừ" : "Số tiền trừ"}
                  rules={[
                    { required: true, message: "Vui lòng nhập số tiền!" },
                  ]}
                >
                  <InputNumber
                    key={donViTru}
                    style={{ width: "100%" }}
                    placeholder={
                      donViTru === "%" ? "Nhập phần trăm trừ" : "Nhập số tiền trừ"
                    }
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    min={0}
                    max={donViTru === "%" ? 100 : undefined}
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* Modal lịch sử phạt */}
        <Modal
          title="Lịch sử phạt - Chi tiết"
          open={isHistoryModalVisible}
          onCancel={() => setIsHistoryModalVisible(false)}
          footer={null}
          width={1000}
        >
          <Table
            columns={lichSuColumns.filter((col) => col.key !== "action")}
            dataSource={danhSachLichSuTru}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Modal>
      </div>
    </div>
  );
}
