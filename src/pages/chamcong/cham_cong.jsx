// ===== Thư viện bên ngoài =====
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// ===== Ant Design =====
import {
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
  Modal,
  Form,
  Input,
  message,
  Calendar,
} from "antd";
import {
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

// ===== Hook tùy chỉnh =====
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useChamCong } from "../../component/hooks/useChamCong";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useDuLieuQuetVanTay } from "../../component/hooks/useQuetVanTay";
import { useTangCa } from "../../component/hooks/useTangCa";
// ===== Context =====
import { ReloadContext } from "../../context/reloadContext";

// ===== Component nội bộ =====
import MyAlert from "../../component/ui/alert";
import ModalTangCa from "./tangca/modal_tangcang";
import ModalThemTangCa from "./tangca/modal_them_tang_ca";

// ===== Styles =====

// ===== Cấu hình Day.js =====
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function GiaLapChamCong() {
  // Hooks
  const { createDuLieuQuetVanTay } = useDuLieuQuetVanTay();
  const { danhSachChamCongChiTiet, getAllChamCongDetail } = useChamCong();
  const { danhSachNhanVien } = useNhanVien();
  const { danhSachPhongBan } = usePhongBan();
  const { setReload } = useContext(ReloadContext);
  const { createTangCa } = useTangCa();

  // State
  const [pageSize, setPageSize] = useState(10);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [selectedMonth, setSelectedMonth] = useState(null); // State mới cho tháng
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    selected: false,
    dateValue: null,
  });
  const [selectedPhongBan, setSelectedPhongBan] = useState({
    selected: false,
    phongBanValue: null,
  });
  const [isModalTangCaVisible, setIsModalTangCaVisible] =
    useState(false);
  const [isModalThemTangCaVisible, setIsModalThemTangCaVisible] =
    useState(false);
  const [filteredData, setFilteredData] = useState([]);

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

  const showAlert = useCallback((type, message, description) => {
    setAlert({ visible: true, type, message, description });
    setTimeout(() => setAlert((prev) => ({ ...prev, visible: false })), 3000);
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
    getAllChamCongDetail();
  }, []);

  useEffect(() => {
    let tempFilteredData = danhSachChamCongChiTiet;

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

    if (selectedMonth) {
      tempFilteredData = tempFilteredData.filter((item) => {
        const itemDate = dayjs(item.ngayChamCong);
        return itemDate.month() === selectedMonth.month() && itemDate.year() === selectedMonth.year();
      });
    }

    setFilteredData(tempFilteredData);
  }, [danhSachChamCongChiTiet, dateRange, selectedMonth]); // Thêm selectedMonth vào dependency array

  const handleShowModalTangCa = () => {
    setIsModalTangCaVisible(true);
  };

  const handleShowModalThemTangCa = () => {
    setIsModalThemTangCaVisible(true);
  };

  const onCancelModalTangCa = () => {
    setIsModalTangCaVisible(false);
    getAllChamCongDetail();
  };

  const handleAddRecord = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const thoiGian = `${dayjs(values.ngayChamCong).format("YYYY-MM-DD")}T${
        values.gioVao
      }Z`;
      values.thoiGian = thoiGian;
      console.log("Payload:", JSON.stringify(values), "Thời gian:", thoiGian);

      await createDuLieuQuetVanTay(values);
      await getAllChamCongDetail();
      setIsModalVisible(false);
      form.resetFields();
      message.success("Thêm bản ghi thành công!");
    } catch (error) {
      console.error("Lỗi thêm bản ghi:", error);
      message.error("Thêm bản ghi thất bại!");
    }
  }, [form, createDuLieuQuetVanTay, getAllChamCongDetail]);

  const formatTime = useCallback((text) => {
    if (!text || text === "N/A") return text;
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
        responsive: ["lg"],
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
        filters: [
          { text: "Hoàn tất", value: "Hoàn tất" },
          { text: "Chưa hoàn tất", value: "Chưa hoàn tất" },
          { text: "Tăng ca", value: "Tăng ca" },
          { text: "Tăng ca hoàn tất", value: "Tăng ca hoàn tất" },
        ],
        onFilter: (value, record) => record.trangThai === value,
      },
    ],
    [formatTime, isMobile]
  );

  const mobileColumns = useMemo(
    () => [
      {
        title: "Thông tin",
        key: "info",
        render: (_, record) => (
          <div style={{ padding: "8px 0" }}>
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
                 <span style={{ fontSize: "12px", marginLeft: '8px' }}>
                    Công: {record.cong}
                 </span>
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
    const totalRecords = danhSachChamCongChiTiet.length;
    const workingNow = danhSachChamCongChiTiet.filter(
      (item) =>
        dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today &&
        (item.trangThai === "Chưa hoàn tất" || item.trangThai === "Tăng ca")
    ).length;
    const completedToday = danhSachChamCongChiTiet.filter(
      (item) =>
        dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today &&
        (item.trangThai === "Hoàn tất" ||
          item.trangThai === "Tăng ca hoàn tất" ||
          item.trangThai === "Không tăng ca")
    ).length;

    return { totalRecords, workingNow, completedToday };
  }, [danhSachChamCongChiTiet]);

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
              ? currentTime.format("DD/MM/YYYY\nHH:mm:ss")
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
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={handleDateChange}
                    placeholder="Chọn ngày"
                  />
                </Col>
                <Col span={12}>
                  <Select
                    placeholder="Chọn phòng ban"
                    style={{ width: "100%" }}
                    onChange={handlePhongBanChange}
                    getPopupContainer={() => document.body}
                    options={danhSachPhongBan.map((pb) => ({
                      value: pb.maPhongBan,
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

                <Col span={24}>
                  <Button
                    onClick={() => setIsModalVisible(true)}
                    size="large"
                    block
                  >
                    Thêm bản ghi
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
          <Row gutter={[8, 8]}>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Tổng"
                  value={statistics.totalRecords}
                  valueStyle={{ fontSize: "18px" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Đang làm"
                  value={statistics.workingNow}
                  valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Hoàn thành"
                  value={statistics.completedToday}
                  valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                />
              </Card>
            </Col>
          </Row>
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
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                style={{ width: "100%", marginBottom: '8px' }}
                size="large"
              />
              <span>Chọn tháng:</span> {/* Thêm thanh lọc theo tháng */}
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                format="MM/YYYY"
                style={{ width: "100%" }}
                size="large"
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
              scroll={{ y: 'calc(100vh - 300px)', sticky: true }} 
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
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
              }}
              title="Chấm công"
              extra={<CalendarOutlined />}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <label style={{}}>Chọn ngày tăng ca:</label>

                  <Row gutter={[8, 8]}>
                    
                  </Row>
                </div>
                {alert.visible && (
                  <MyAlert
                    type={alert.type}
                    message={alert.message}
                    description={alert.description}
                    onClose={() =>
                      setAlert((prev) => ({ ...prev, visible: false }))
                    }
                  />
                )}
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    {" "}
                    <Button
                      danger
                      icon={<LogoutOutlined />}
                      onClick={handleShowModalThemTangCa}
                      size="large"
                      style={{ width: "100%" }}
                    >
                      Tăng ca
                    </Button>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={handleShowModalTangCa}
                      size="large"
                      style={{ width: "100%" }}
                    >
                      Xem ngày tăng ca
                    </Button>
                  </Col>

                  <Col span={24}>
                    {" "}
                    <Button
                      onClick={() => setIsModalVisible(true)}
                      style={{ width: "100%" }}
                    >
                      Thêm bản ghi
                    </Button>
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Thống kê">
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
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Lịch sử chấm công">
              <Space style={{ marginBottom: "16px" }}>
                <span>Chọn khoảng thời gian:</span>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
                <span style={{ marginLeft: '16px' }}>Chọn tháng:</span>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  format="MM/YYYY"
                />
              </Space>

              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey={(record) =>
                  `${record.ngayChamCong}_${record.maNhanVien}`
                }
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["10", "20", "50", "100", "200"],
                  onShowSizeChange: handlePageSizeChange,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                scroll={{ y: 'calc(100vh - 300px)', sticky: true }} 
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
      />
      <ModalTangCa
        isVisible={isModalTangCaVisible}
        onCancel={onCancelModalTangCa}
      />

      <Modal
        title="Thêm bản ghi chấm công"
        open={isModalVisible}
        onOk={handleAddRecord}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={isMobile ? "90%" : 520}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="maNhanVien"
            label="Nhân viên"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              size={isMobile ? "large" : "middle"}
            >
              {danhSachNhanVien.map((nv) => (
                <Option key={nv.maNhanVien} value={nv.maNhanVien}>
                  {nv.hoTen} - {nv.tenPhongBan}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ngayChamCong"
            label="Ngày chấm công"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              size={isMobile ? "large" : "middle"}
              placeholder="Chọn ngày chấm công"
            />
          </Form.Item>

          <Form.Item
            name="gioVao"
            label="Giờ"
            rules={[{ required: true, message: "Vui lòng nhập giờ vào!" }]}
          >
            <Input
              placeholder="VD: 08:00:00"
              size={isMobile ? "large" : "middle"}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}