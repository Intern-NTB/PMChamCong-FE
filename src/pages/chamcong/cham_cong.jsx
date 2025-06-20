/* eslint-disable no-unused-vars */
// ===== Thư viện bên ngoài =====
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import viVN from "antd/es/locale/vi_VN";

// ===== Ant Design =====
import {
  ConfigProvider,
  Card,
  Button,
  Table,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Form,
  Typography,
  Input,
} from "antd";
import {
  ClockCircleOutlined,
  LogoutOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "dayjs/locale/vi";

// ===== Hook tùy chỉnh =====
import { useChamCong } from "../../component/hooks/useChamCong";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useTangCa } from "../../component/hooks/useTangCa";
import { useNhanVien } from "../../component/hooks/useNhanVien";
// ===== Context =====
import { ReloadContext } from "../../context/reloadContext";

// ===== Component nội bộ =====
import MyAlert from "../../component/ui/alert";
import ModalTangCa from "./tangca/modal_tangcang";
import ModalThemTangCa from "./tangca/modal_them_tang_ca";
import ModalChinhSuaTangCa from "./tangca/modal_chinh_sua_tangca";
import ModalChiTietChamCong from "./modal_chi_tiet_cham_cong";

// ===== Styles =====

// ===== Cấu hình Day.js =====
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("vi");
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

export default function GiaLapChamCong() {
  const customLocale = {
    ...viVN,
    DatePicker: {
      ...viVN.DatePicker,
      lang: {
        ...viVN.DatePicker.lang,
        placeholder: "Chọn ngày",
        rangePlaceholder: ["Ngày bắt đầu", "Ngày kết thúc"], // Tùy chỉnh placeholder cho RangePicker
        today: "Hôm nay",
        now: "Bây giờ",
        backToToday: "Quay lại hôm nay",
        ok: "OK",
        clear: "Xóa",
        month: "Tháng",
        year: "Năm",
        timeSelect: "Chọn thời gian",
        dateSelect: "Chọn ngày",
        monthSelect: "Chọn tháng",
        yearSelect: "Chọn năm",
        decadeSelect: "Chọn thập kỷ",
        yearFormat: "YYYY",
        dateFormat: "DD/MM/YYYY",
        dayFormat: "DD",
        dateTimeFormat: "DD/MM/YYYY HH:mm:ss",
        monthBeforeYear: true,
      },
    },
  };
  // Hooks
  const { danhSachChamCongChiTiet, getAllChamCongDetail } = useChamCong();
  const { danhSachPhongBan } = usePhongBan();
  const { danhSachNhanVien } = useNhanVien();
  const { setReload } = useContext(ReloadContext);
  const {
    danhSachTangCa,
    createTangCa,
    getAllTangCa,
    updateTangCa,
    deleteTangCa,
  } = useTangCa();

  // State
  const [pageSize, setPageSize] = useState(10);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    selected: false,
    dateValue: null,
  });
  const [searchText, setSearchText] = useState("");
  const [selectedPhongBan, setSelectedPhongBan] = useState({
    selected: false,
    phongBanValue: null,
  });
  const [isModalTangCaVisible, setIsModalTangCaVisible] = useState(false);
  const [isModalThemTangCaVisible, setIsModalThemTangCaVisible] =
    useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const [isModalChiTietVisible, setIsModalChiTietVisible] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);

  // Component
  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    message: "",
    description: "",
  });
  const [form] = Form.useForm();

  useEffect(() => {
    setReload(() => getAllChamCongDetail);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let tempFilteredData = danhSachChamCongChiTiet;

    // Lọc theo khoảng thời gian
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dayjs(dateRange[0]).startOf("day");
      const endDate = dayjs(dateRange[1]).endOf("day");
      tempFilteredData = tempFilteredData.filter((item) => {
        const itemDate = dayjs(item.ngayChamCong);
        return (
          itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate)
        );
      });
    }

    // Lọc theo tháng
    if (selectedMonth) {
      tempFilteredData = tempFilteredData.filter((item) => {
        const itemDate = dayjs(item.ngayChamCong);
        return (
          itemDate.month() === selectedMonth.month() &&
          itemDate.year() === selectedMonth.year()
        );
      });
    }

    if (searchText.trim()) {
      tempFilteredData = tempFilteredData.filter(
        (item) =>
          item.hoTen.toLowerCase().includes(searchText.toLowerCase()) ||
          String(item.maNhanVien)
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    setFilteredData(tempFilteredData);
  }, [danhSachChamCongChiTiet, dateRange, selectedMonth, searchText]);

  const handleSearch = useCallback((value) => {
    setSearchText(value);
  }, []);

  const handleShowModalTangCa = () => {
    setIsModalTangCaVisible(true);
  };

  const handleRowClick = useCallback((record) => {
    console.log(record);
    setSelectedNhanVien(record);
    setIsModalChiTietVisible(true);
  }, []);

  const handleShowModalThemTangCa = () => {
    setIsModalThemTangCaVisible(true);
  };

  const onCancelModalTangCa = () => {
    setIsModalTangCaVisible(false);
    getAllChamCongDetail();
  };

  const formatTime = useCallback((text) => {
    // Nếu text là null, undefined, chuỗi rỗng, "N/A" HOẶC "Invalid Date", trả về "00:00:00"
    if (!text || text === "N/A" || text === "Invalid Date")
      return "Chưa chấm công ra";
    if (typeof text === "string" && text.includes("T")) {
      const timePart = text.split("T")[1];
      return timePart.split(".")[0];
    }
    return text;
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "ngayChamCong",
        key: "ngayChamCong",
        sorter: {
          compare: (a, b) =>
            dayjs(a.ngayChamCong).unix() - dayjs(b.ngayChamCong).unix(),
          multiple: 1,
        },
        render: (text) => dayjs(text).format("DD/MM/YYYY"),
        showSorterTooltip: {
          title: "Sắp xếp theo ngày",
        },
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Nhân viên",
        dataIndex: "hoTen",
        key: "hoTen",
        sorter: {
          compare: (a, b) =>
            a.hoTen.localeCompare(b.hoTen, "vi", { numeric: true }),
          multiple: 2,
        },
        showSorterTooltip: {
          title: "Sắp xếp theo tên nhân viên",
        },
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Phòng ban",
        dataIndex: "tenPhongBan",
        key: "tenPhongBan",
        filters: danhSachPhongBan.map((pb) => ({
          text: pb.tenPhongBan,
          value: pb.tenPhongBan,
        })),
        onFilter: (value, record) => record.tenPhongBan === value,
        sorter: (a, b) => a.tenPhongBan.localeCompare(b.tenPhongBan),
      },
      {
        title: "Giờ vào",
        dataIndex: "thoiGianVao",
        key: "thoiGianVao",
        render: formatTime,
      },
      {
        title: "Giờ ra",
        dataIndex: "thoiGianRa",
        key: "thoiGianRa",
        render: formatTime,
      },
      {
        title: "Tổng giờ",
        dataIndex: "soGioThucTe",
        key: "soGioThucTe",
        responsive: ["md"],
      },
      {
        title: "Công",
        dataIndex: "cong",
        key: "cong",
        responsive: ["md"],
        width: 80,
      },
      {
        title: "Trạng thái",
        dataIndex: "trangThai",
        key: "trangThai",
        render: (status) => {
          const color =
            status === "Chưa hoàn tất" || status === "Tăng ca"
              ? "error"
              : status === "Tăng ca hoàn tất" || status === "Hoàn tất"
              ? "success"
              : "warning";
          return (
            <Tag color={color}>
              {isMobile ? status.slice(0, 8) + "..." : status}
            </Tag>
          );
        },
        sorter: (a, b) => {
          const priority = {
            "Chưa hoàn tất": 1,
            "Tăng ca": 2,
            "Hoàn tất": 3,
            "Tăng ca hoàn tất": 4,
          };
          return priority[a.trangThai] - priority[b.trangThai];
        },
        filters: [
          { text: "Chưa hoàn tất", value: "Chưa hoàn tất" },
          { text: "Tăng ca", value: "Tăng ca" },
          { text: "Hoàn tất", value: "Hoàn tất" },
          { text: "Tăng ca hoàn tất", value: "Tăng ca hoàn tất" },
        ],
        onFilter: (value, record) => record.trangThai === value,
      },
    ],
    [formatTime, isMobile, danhSachPhongBan]
  );

  const mobileColumns = useMemo(
    () => [
      {
        title: "Thông tin",
        key: "info",
        render: (_, record) => (
          <div
            style={{ padding: "8px 0" }}
            onClick={() => {
              setSelectedNhanVien(record);
              setIsModalChiTietVisible(true);
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {dayjs(record.ngayChamCong).format("DD/MM/YYYY")}
            </div>
            <div style={{ marginBottom: "4px" }}>{record.hoTen}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.tenPhongBan}
            </div>
            <div style={{ marginTop: "8px" }}>
              <Space size="small">
                <span style={{ fontSize: "12px" }}>
                  Vào: {formatTime(record.thoiGianVao)}
                </span>
                <span style={{ fontSize: "12px" }}>
                  Ra: {formatTime(record.thoiGianRa)}
                </span>
                <span style={{ fontSize: "12px" }}>
                  Giờ: {record.soGioThucTe}
                </span>
                <span style={{ fontSize: "12px" }}>Công: {record.cong}</span>
              </Space>
            </div>
            <div style={{ marginTop: "4px" }}>
              <Tag
                color={
                  record.trangThai === "Chưa hoàn tất" ||
                  record.trangThai === "Tăng ca"
                    ? "error"
                    : record.trangThai === "Tăng ca hoàn tất" ||
                      record.trangThai === "Hoàn tất"
                    ? "success"
                    : "warning"
                }
              >
                {record.trangThai}
              </Tag>
            </div>
          </div>
        ),
        sorter: (a, b) =>
          dayjs(a.ngayChamCong).unix() - dayjs(b.ngayChamCong).unix(),
        filters: [
          { text: "Hoàn tất", value: "Hoàn tất" },
          { text: "Chưa hoàn tất", value: "Chưa hoàn tất" },
          { text: "Tăng ca", value: "Tăng ca" },
          { text: "Tăng ca hoàn tất", value: "Tăng ca hoàn tất" },
        ],
        onFilter: (value, record) => record.trangThai === value,
      },
    ],
    [formatTime]
  );

  const statistics = useMemo(() => {
    const today = dayjs().format("DD/MM/YYYY");

    const nhanVienTheoPhongBan =
      selectedPhongBan && selectedPhongBan.phongBanValue
        ? danhSachNhanVien.filter(
            (nv) => nv.tenPhongBan === selectedPhongBan.phongBanValue
          )
        : danhSachNhanVien;

    const chamCongTheoPhongBan =
      selectedPhongBan && selectedPhongBan.phongBanValue
        ? danhSachChamCongChiTiet.filter(
            (cc) => cc.tenPhongBan === selectedPhongBan.phongBanValue
          )
        : danhSachChamCongChiTiet;

    const totalRecords = chamCongTheoPhongBan.filter(
      (item) => dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today
    ).length;

    const workingNow = chamCongTheoPhongBan.filter(
      (item) =>
        dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today &&
        (item.trangThai === "Chưa hoàn tất" || item.trangThai === "Tăng ca")
    ).length;

    const completedToday = chamCongTheoPhongBan.filter(
      (item) =>
        dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today &&
        ["Hoàn tất", "Tăng ca hoàn tất", "Không tăng ca"].includes(
          item.trangThai
        )
    ).length;

    const vangMatCount = nhanVienTheoPhongBan.filter(
      (nv) =>
        !chamCongTheoPhongBan.some(
          (cc) =>
            cc.maNhanVien === nv.maNhanVien &&
            dayjs(cc.ngayChamCong).format("DD/MM/YYYY") === today
        )
    ).length;

    const tongSoGioTangCaThang = danhSachTangCa.reduce((total, tc) => {
      const ngayTangCa = dayjs(tc.ngayChamCongTangCa);
      const thang = ngayTangCa.month();
      const nam = ngayTangCa.year();

      const thangHienTai = (selectedMonth ?? dayjs()).month();
      const namHienTai = (selectedMonth ?? dayjs()).year();

      if (thang === thangHienTai && nam === namHienTai) {
        const gioBatDau = dayjs(tc.gioTangCaBatDau, "HH:mm");
        const gioKetThuc = dayjs(tc.gioTangCaKetThuc, "HH:mm");

        const soPhutTangCa = gioKetThuc.diff(gioBatDau, "minute");
        return total + (soPhutTangCa / 60 || 0);
      }

      return total;
    }, 0);

    return {
      totalRecords,
      workingNow,
      completedToday,
      vangMatCount,
      tongSoGioTangCaThang,
    };
  }, [
    selectedPhongBan,
    selectedMonth,
    danhSachNhanVien,
    danhSachChamCongChiTiet,
    danhSachTangCa,
  ]);

  const handleDateChange = useCallback((value) => {
    setSelectedDate({
      selected: true,
      dateValue: value,
    });
  }, []);

  const handlePhongBanChange = useCallback((value) => {
    setSelectedPhongBan({
      selected: true,
      phongBanValue: value,
    });
  }, []);

  const handleDateRangeChange = useCallback((dates) => {
    setDateRange(dates);
    setSelectedMonth(null);
  }, []);

  const handleMonthChange = useCallback((month) => {
    setSelectedMonth(month);
    setDateRange([null, null]);
  }, []);

  const handlePageSizeChange = useCallback((current, size) => {
    setPageSize(size);
  }, []);

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "24px",
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <ClockCircleOutlined
            style={{
              fontSize: isMobile ? "20px" : "24px",
              marginRight: "8px",
            }}
          />
          <span
            style={{
              fontSize: isMobile ? "16px" : "24px",
              fontWeight: "bold",
            }}
          >
            {isMobile
              ? currentTime.format("DD/MM/YYYY HH:mm:ss")
              : currentTime.format("dddd, DD/MM/YYYY - HH:mm:ss")}
          </span>
        </div>
      </Card>

      {isMobile ? (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Card title="Chấm công" size="small" extra={<CalendarOutlined />}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Select
                    placeholder="Chọn phòng ban"
                    style={{ width: "100%" }}
                    onChange={handlePhongBanChange}
                    getPopupContainer={() => document.body}
                    options={danhSachPhongBan.map((pb) => ({
                      value: pb.tenPhongBan,
                      label: pb.tenPhongBan,
                    }))}
                  />
                </Col>
              </Row>

              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleShowModalThemTangCa}
                    size="large"
                    block
                  >
                    Tăng ca
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={handleShowModalTangCa}
                    size="large"
                    block
                  >
                    Xem ngày tăng ca
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>

          <Card
            title={`Thống kê hôm nay (${dayjs().format("DD/MM/YYYY")})`}
            size="small"
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Tổng bản ghi"
                    value={statistics.totalRecords}
                    prefix={<UserOutlined />}
                    valueStyle={{ fontSize: "16px" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Đang làm việc"
                    value={statistics.workingNow}
                    valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Hoàn thành hôm nay"
                    value={statistics.completedToday}
                    valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Nhân viên vắng"
                    value={statistics.vangMatCount}
                    valueStyle={{ color: "red", fontSize: "16px" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {alert.visible && (
            <MyAlert
              type={alert.type}
              message={alert.message}
              description={alert.description}
              onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
            />
          )}

          <Card title="Lịch sử chấm công" size="small">
            <Space
              direction="vertical"
              style={{ width: "100%", marginBottom: "16px" }}
            >
              <span>Chọn khoảng thời gian:</span>
              <ConfigProvider locale={customLocale}>
                <Space style={{ marginBottom: "16px" }}>
                  <span>Chọn khoảng thời gian:</span>
                  <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                  />
                  <span style={{ marginLeft: "16px" }}>Chọn tháng:</span>
                  <DatePicker
                    placeholder="Chọn tháng"
                    picker="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    format="MM/YYYY"
                  />
                  <Input.Search
                    placeholder="Tìm kiếm theo mã nhân viên hoặc tên"
                    onSearch={handleSearch}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: "250px" }}
                    allowClear
                  />
                </Space>
              </ConfigProvider>

              <Input.Search
                placeholder="Tìm kiếm theo tên hoặc mã nhân viên"
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                style={{ width: "100%" }}
                size="large"
                allowClear
              />
            </Space>

            <Table
              columns={mobileColumns}
              dataSource={filteredData}
              rowKey={(record) => `${record.ngayChamCong}_${record.maNhanVien}`}
              pagination={{
                pageSize: pageSize,
                pageSizeOptions: ["8", "20", "50", "100"],
                size: "small",
                showSizeChanger: true,
                showQuickJumper: true,
                onShowSizeChange: handlePageSizeChange,
                showTotal: (total, range) => `${range[0]}-${range[1]}/${total}`,
              }}
              size="small"
              scroll={{ y: "calc(100vh - 300px)", sticky: true }}
              onChange={(pagination, filters) => {
                const pb = filters.tenPhongBan?.[0];
                setSelectedPhongBan({
                  selected: true,
                  phongBanValue: pb.tenPhongBan || null,
                });
              }}
            />
          </Card>
        </Space>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba",
                border: "1px solid #f0f0f0",
              }}
              styles={{ body: { padding: "24px" } }}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  Chấm công
                </div>
              }
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {/* Header Section */}
                <div>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "16px",
                      display: "block",
                    }}
                  >
                    Quản lý thời gian làm việc
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    Chọn ngày tăng ca và theo dõi lịch làm việc của bạn
                  </Text>
                </div>

                {/* Alert Section */}
                {alert.visible && (
                  <MyAlert
                    type={alert.type}
                    message={alert.message}
                    description={alert.description}
                    onClose={() =>
                      setAlert((prev) => ({ ...prev, visible: false }))
                    }
                    style={{ marginBottom: "8px" }}
                  />
                )}

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Button
                      danger
                      icon={<LogoutOutlined />}
                      onClick={handleShowModalThemTangCa}
                      size="large"
                      style={{
                        width: "100%",
                        height: "50px",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      ghost
                    >
                      Đăng ký tăng ca
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={handleShowModalTangCa}
                      size="large"
                      style={{
                        width: "100%",
                        height: "50px",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background:
                          "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        border: "none",
                      }}
                    >
                      Xem lịch tăng ca
                    </Button>
                  </Col>
                </Row>

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Row gutter={[16, 8]} justify={"center"}>
                    <Col span={12}>
                      <div style={{ textAlign: "center" }}>
                        <Statistic
                          title="Giờ tăng ca tháng này"
                          value={statistics.tongSoGioTangCaThang.toFixed(2)}
                          valueStyle={{ color: "green", fontSize: "24px" }}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card title={`Thống kê hôm nay (${dayjs().format("DD/MM/YYYY")})`}>
              <Row gutter={16}>
                <Col span={24}>
                  <Statistic
                    title="Tổng bản ghi"
                    value={statistics.totalRecords}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={24} style={{ marginTop: "16px" }}>
                  <Statistic
                    title="Đang làm việc"
                    value={statistics.workingNow}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={24} style={{ marginTop: "16px" }}>
                  <Statistic
                    title="Hoàn thành hôm nay"
                    value={statistics.completedToday}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col span={24} style={{ marginTop: "16px" }}>
                  <Statistic
                    title="Nhân viên vắng trong ngày"
                    value={statistics.vangMatCount}
                    valueStyle={{ color: "red" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Lịch sử chấm công">
              <ConfigProvider locale={customLocale}>
                <Space style={{ marginBottom: "16px" }}>
                  <span>Chọn khoảng thời gian:</span>
                  <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                  />
                  <span style={{ marginLeft: "16px" }}>Chọn tháng:</span>
                  <DatePicker
                    placeholder="Chọn tháng"
                    picker="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    format="MM/YYYY"
                  />
                  <Input.Search
                    placeholder="Tìm kiếm theo mã nhân viên hoặc tên"
                    onSearch={handleSearch}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: "250px" }}
                    allowClear
                  />
                </Space>
              </ConfigProvider>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey={(record) =>
                  `${record.maNhanVien}_${record.ngayChamCong}`
                }
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["10", "20", "50", "100", "200"],
                  onShowSizeChange: handlePageSizeChange,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                scroll={{ y: "calc(100vh - 300px)", sticky: true }}
                onChange={(pagination, filters) => {
                  const pb = filters.tenPhongBan?.[0];
                  setSelectedPhongBan({
                    selected: true,
                    phongBanValue: pb || null,
                  });
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <ModalThemTangCa
        isVisible={isModalThemTangCaVisible}
        danhSachPhongBan={danhSachPhongBan}
        createTangCa={createTangCa}
        onCancel={() => setIsModalThemTangCaVisible(false)}
        getAllChamCongDetail={getAllChamCongDetail}
        getAllTangCa={getAllTangCa}
      />
      <ModalTangCa
        isVisible={isModalTangCaVisible}
        onCancel={onCancelModalTangCa}
        danhSachTangCa={danhSachTangCa}
        updateTangCa={updateTangCa}
        deleteTangCa={deleteTangCa}
        danhSachPhongBan={danhSachPhongBan}
        formInstance={form}
      />

      <ModalChiTietChamCong
        key={selectedNhanVien?.maNhanVien}
        isVisible={isModalChiTietVisible}
        onCancel={() => {
          setIsModalChiTietVisible(false);
          setSelectedNhanVien(null);
        }}
        selectedNhanVien={selectedNhanVien}
        danhSachChamCongChiTiet={danhSachChamCongChiTiet}
      />
    </div>
  );
}
