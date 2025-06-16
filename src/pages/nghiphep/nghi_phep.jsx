// ===== REACT & Thư viện ngoài =====
import React, { useState, useMemo, useEffect, useContext } from "react";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
// Thêm plugin để parse custom format
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
// ===== ANT DESIGN =====
import {
  Card,
  Table,
  Button,
  Input,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Select,
  Checkbox,
  Tooltip,
  Tag,
} from "antd";
import {
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// ===== STYLES ======
import "./nghi_phep.css";

// ===== HOOK Tuỳ Chỉnh ======
import { useNghiPhep } from "../../component/hooks/useNghiPhep";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useAppNotification } from "../../component/ui/notification";

// ===== CONTEXT =====
import { ReloadContext } from "../../context/reloadContext";

// ===== UTILITIES =====
import { NghiPhepPermissions } from "../../config/utils/user_permission";

const { RangePicker } = DatePicker;

// Hàm helper để parse ngày từ backend - FIX
const parseDate = (dateString) => {
  if (!dateString) return null;

  // Thử parse với nhiều format khác nhau
  const formats = [
    "DD/MM/YYYY HH:mm:ss",
    "DD/MM/YYYY",
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD",
  ];

  for (const format of formats) {
    const parsed = dayjs(dateString, format, true); // strict mode
    if (parsed.isValid()) {
      return parsed;
    }
  }

  // Fallback - parse thông thường
  const fallback = dayjs(dateString);
  return fallback.isValid() ? fallback : null;
};

export default function NghiPhep() {
  // HOOK
  const {
    danhSachNghiPhep,
    getAllNghiPhep,
    updateNghiPhep,
    deleteNghiPhep,
    createNghiPhep,
  } = useNghiPhep();
  const { danhSachNhanVien } = useNhanVien();

  // STATE
  const api = useAppNotification();
  const [selectedMonth, setSelectedMonth] = useState(null); // FIX: đặt null để không filter theo tháng mặc định
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [disableTinhLuong, setDisableTinhLuong] = useState(false);
  const [isPartialDay, setIsPartialDay] = useState(false);

  // CONTEXT
  const { setReload } = useContext(ReloadContext);

  // PHÂN QUYỀN - Sử dụng utility functions
  const canEditStatus = NghiPhepPermissions.canEditStatus();
  const canDelete = NghiPhepPermissions.canDelete();

  useEffect(() => {
    setReload(() => getAllNghiPhep);
  }, []);

  const dataSourceNghiPhep = danhSachNghiPhep.map((np) => {
    const nhanVien = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === np.maNhanVien
    );
    return {
      maNghiPhep: np.maNghiPhep,
      ngayBatDau: np.ngayBatDau,
      ngayKetThuc: np.ngayKetThuc,
      liDo: np.liDo,
      tinhLuong: np.tinhLuong,
      tinhPhep: np.tinhPhep,
      trangThaiPheDuyet: np.trangThaiPheDuyet,
      maNhanVien: np.maNhanVien,
      hoTen: nhanVien ? nhanVien.hoTen : "Không xác định",
    };
  });

  const [form] = Form.useForm();

  // hàm thống kê - Fix date parsing
  const statistics = useMemo(() => {
    if (!dataSourceNghiPhep.length)
      return { total: 0, tinhLuong: 0, tinhPhep: 0 };
    const filtered = dataSourceNghiPhep.filter((item) => {
      if (!dateRange[0] || !dateRange[1]) return true;

      const start = parseDate(item.ngayBatDau);
      const end = parseDate(item.ngayKetThuc);

      // Kiểm tra validity trước khi so sánh
      if (!start || !end || !start.isValid() || !end.isValid()) return false;

      return (
        start.isBefore(dateRange[1].endOf("day")) &&
        end.isAfter(dateRange[0].startOf("day"))
      );
    });
    return {
      total: filtered.length,
      tinhLuong: filtered.filter((i) => i.tinhLuong).length,
      tinhPhep: filtered.filter((i) => i.tinhPhep).length,
    };
  }, [dataSourceNghiPhep, dateRange]);
  // Xử lý khi thay đổi checkbox "Nghỉ giữa ngày"
  const handlePartialDayChange = (e) => {
    const checked = e.target.checked;
    setIsPartialDay(checked);

    if (!checked) {
      // Nếu bỏ tick "nghỉ giữa ngày", set về thời gian mặc định
      const currentValues = form.getFieldsValue();
      if (currentValues.ngayBatDau) {
        form.setFieldsValue({
          ngayBatDau: dayjs(currentValues.ngayBatDau).startOf("day"), // 00:00:00
        });
      }
      if (currentValues.ngayKetThuc) {
        form.setFieldsValue({
          ngayKetThuc: dayjs(currentValues.ngayKetThuc).endOf("day"), // 23:59:59
        });
      }
    }
  };
  const onMonthChange = (value) => {
    setSelectedMonth(value);
    console.log("Chọn tháng:", value ? value.format("MM/YYYY") : "Tất cả");
  };

  // Filter list - FIX logic lọc
  const filteredList = useMemo(() => {
    return dataSourceNghiPhep.filter((item) => {
      const maNhanVien = item.maNhanVien
        ? String(item.maNhanVien).toLowerCase()
        : "";

      const hoTen = item.hoTen ? String(item.hoTen).toLowerCase() : "";

      const matchesSearch =
        maNhanVien.includes(searchValue.toLowerCase()) ||
        hoTen.includes(searchValue.toLowerCase());

      if (!matchesSearch) return false;

      // Nếu không có ngày bắt đầu/kết thúc => bỏ qua dòng này
      if (!item.ngayBatDau || !item.ngayKetThuc) return false;

      const start = parseDate(item.ngayBatDau);
      const end = parseDate(item.ngayKetThuc);

      if (!start || !end || !start.isValid() || !end.isValid()) return false;

      // Lọc theo khoảng ngày nếu có - PRIORITY CAO HỠN
      if (dateRange?.[0] && dateRange?.[1]) {
        const isInDateRange =
          start.isBetween(dateRange[0], dateRange[1], "day", "[]") ||
          end.isBetween(dateRange[0], dateRange[1], "day", "[]") ||
          (start.isBefore(dateRange[0]) && end.isAfter(dateRange[1]));

        if (!isInDateRange) return false;
      }

      // Lọc theo tháng chỉ khi KHÔNG có date range
      if (selectedMonth && (!dateRange?.[0] || !dateRange?.[1])) {
        const startOfMonth = selectedMonth.clone().startOf("month");
        const endOfMonth = selectedMonth.clone().endOf("month");

        const isInSelectedMonth =
          start.isBetween(startOfMonth, endOfMonth, "day", "[]") ||
          end.isBetween(startOfMonth, endOfMonth, "day", "[]") ||
          (start.isBefore(startOfMonth) && end.isAfter(endOfMonth));

        if (!isInSelectedMonth) return false;
      }

      return true;
    });
  }, [dataSourceNghiPhep, searchValue, dateRange, selectedMonth]);

  //thêm/sửa
  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingRecord(record.maNghiPhep);
    form.setFieldsValue({
      ...record,
      // Fix date parsing khi set vào form
      ngayBatDau: parseDate(record.ngayBatDau),
      ngayKetThuc: parseDate(record.ngayKetThuc),
    });
    setIsModalVisible(true);
  };

  // form
  const handleOk = async () => {
    try {
      await form.validateFields(); // Chờ xác thực các trường
      const values = form.getFieldsValue(); // Lấy tất cả giá trị từ form

      const dataToSave = {
        ngayBatDau: values.ngayBatDau.format("YYYY-MM-DD"),
        ngayKetThuc: values.ngayKetThuc.format("YYYY-MM-DD"),
        tinhLuong: values.tinhLuong || false,
        tinhPhep: values.tinhPhep || false,
        liDo: values.liDo,
        trangThaiPheDuyet: values.trangThaiPheDuyet || "Chờ duyệt",
        maNhanVien: values.maNhanVien,
      };

      if (editingRecord) {
        // Cập nhật
        try {
          await updateNghiPhep(editingRecord, dataToSave);
          api.success({
            message: "Cập nhật nghỉ phép thành công",
          });
          setIsModalVisible(false);
        } catch {
          api.error({
            message: "Cập nhật nghỉ phép không thành công",
          });
        }
      } else {
        // Tạo mới
        await createNghiPhep(dataToSave);
        api.success({
          message: "Thành công",
          description: "Đã thêm thành công đơn nghỉ phép",
        });
        setIsModalVisible(false);
      }
    } catch (error) {
      api.error({
        message: "Có lỗi xảy ra",
        description: error.message,
      });
    }
  };

  // form xác nhận
  const handleDelete = async (maNghiPhep) => {
    try {
      await deleteNghiPhep(maNghiPhep);
      api.success({
        message: "Xoá dữ liệu thành công",
        description: "Đã xoá đơn nghỉ phép",
      });
    } catch {
      api.error({
        message: "Xoá dữ liệu không thành công",
        description: "Xoá thất bại",
      });
    }
  };

  const columns = [
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      width: 120,
    },
    { title: "Tên nhân viên", dataIndex: "hoTen", key: "hoTen", width: 120 },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      width: 120,
      render: (text) => {
        const parsed = parseDate(text);
        return parsed && parsed.isValid()
          ? parsed.format("DD/MM/YYYY HH:mm:ss")
          : text;
      },
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      width: 120,
      render: (text) => {
        const parsed = parseDate(text);
        return parsed && parsed.isValid()
          ? parsed.format("DD/MM/YYYY HH:mm:ss")
          : text;
      },
    },
    { title: "Lý do nghỉ", dataIndex: "liDo", key: "liDo", width: 180 },
    {
      title: "Tính lương",
      dataIndex: "tinhLuong",
      key: "tinhLuong",
      width: 100,
      align: "center",
      render: (value) =>
        value ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: 20 }} />
        ),
    },
    {
      title: "Có phép",
      dataIndex: "tinhPhep",
      key: "tinhPhep",
      width: 100,
      align: "center",
      render: (value) =>
        value ? (
          <CheckCircleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: 20 }} />
        ),
    },
    {
      title: "Trạng thái phê duyệt",
      dataIndex: "trangThaiPheDuyet",
      key: "trangThaiPheDuyet",
      width: 100,
      align: "center",
      defaultSortOrder: "ascend", // mặc định sort theo chiều tăng dần
      sorter: (a, b) => {
        const order = {
          "Chờ duyệt": 0,
          "Đã duyệt": 1,
          "Từ chối": 2,
        };
        return (
          (order[a.trangThaiPheDuyet] ?? 99) -
          (order[b.trangThaiPheDuyet] ?? 99)
        );
      },
      render: (status) => {
        const color =
          status === "Đã duyệt"
            ? "green"
            : status === "Chờ duyệt"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              disabled={canDelete ? false : true}
              danger
              shape="circle"
              icon={<DeleteOutlined style={{ color: "red" }} />}
              onClick={() => handleDelete(record.maNghiPhep)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      className="container-column"
      style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Row gutter={16} style={{ marginBottom: 20, textAlign: "center" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số phép"
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tính lương"
              value={statistics.tinhLuong}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Có phép"
              value={statistics.tinhPhep}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#108ee9" }}
            />
          </Card>
        </Col>
      </Row>
      <Card
        style={{
          marginBottom: 12,
        }}
      >
        <Row gutter={16} style={{ marginBottom: 20, alignItems: "center" }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm kiếm Mã nhân viên, Tên nhân viên..."
              allowClear
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              enterButton
            />
          </Col>
          <Col xs={24} sm={12} md={12}>
            <RangePicker
              value={dateRange}
              onChange={(values) => {
                // Nếu clear, values sẽ là null → set lại về [null, null] để tránh lỗi
                if (!Array.isArray(values)) {
                  setDateRange([null, null]);
                } else {
                  setDateRange(values);
                }
              }}
              format="DD/MM/YYYY"
              allowClear
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={4}>
            <ConfigProvider locale={viVN}>
              <DatePicker
                picker="month"
                onChange={onMonthChange}
                value={selectedMonth}
                style={{ width: "100%" }}
                format="MM/YYYY"
                placeholder="Chọn tháng"
                allowClear
              />
            </ConfigProvider>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              onClick={showAddModal}
            >
              Tạo đơn xin nghỉ
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredList}
        rowKey={(record) => record.maNghiPhep}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingRecord ? "Sửa đơn nghỉ phép" : "Tạo đơn xin nghỉ"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tinhLuong: false,
            tinhPhep: false,
            nghiGiuaNgay: false,
          }}
        >
          <Form.Item
            name="maNhanVien"
            label="Mã nhân viên"
            rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
          >
            <Select
              disabled={editingRecord ? true : false}
              options={danhSachNhanVien.map((nv) => ({
                value: nv.maNhanVien,
                label: `${nv.hoTen} - ${nv.cmnd}`,
              }))}
            />
          </Form.Item>

          {/* Checkbox nghỉ giữa ngày */}
          <Form.Item name="nghiGiuaNgay" valuePropName="checked">
            <Checkbox onChange={handlePartialDayChange}>
              Nghỉ giữa ngày (cho phép chọn giờ cụ thể)
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
          >
            <DatePicker
              placeholder="Chọn ngày bắt đầu"
              format={isPartialDay ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
              style={{ width: "100%" }}
              showTime={isPartialDay ? { format: "HH:mm:ss" } : false}
              onChange={(date) => {
                if (date && !isPartialDay) {
                  // Nếu không phải nghỉ giữa ngày, tự động set thời gian là 00:00:00
                  const startOfDay = dayjs(date).startOf("day");
                  form.setFieldsValue({ ngayBatDau: startOfDay });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="ngayKetThuc"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc!" },
            ]}
          >
            <DatePicker
              placeholder="Chọn ngày kết thúc"
              format={isPartialDay ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
              style={{ width: "100%" }}
              showTime={isPartialDay ? { format: "HH:mm:ss" } : false}
              onChange={(date) => {
                if (date && !isPartialDay) {
                  // Nếu không phải nghỉ giữa ngày, tự động set thời gian là 23:59:59
                  const endOfDay = dayjs(date).endOf("day");
                  form.setFieldsValue({ ngayKetThuc: endOfDay });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="liDo"
            label="Lý do nghỉ"
            rules={[{ required: true, message: "Vui lòng nhập lý do nghỉ!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {canEditStatus && editingRecord && (
            <Form.Item name="trangThaiPheDuyet">
              <Select
                placeholder="Trạng thái phê duyệt"
                options={[
                  { value: "Chờ duyệt", label: "Chờ duyệt" },
                  { value: "Từ chối", label: "Từ chối" },
                  { value: "Đã duyệt", label: "Đã duyệt" },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item name="tinhLuong" valuePropName="checked">
            <Checkbox disabled={disableTinhLuong}>Tính lương</Checkbox>
          </Form.Item>

          <Form.Item name="tinhPhep" valuePropName="checked">
            <Checkbox
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  form.setFieldsValue({ tinhLuong: true });
                  setDisableTinhLuong(true);
                } else {
                  form.setFieldsValue({ tinhLuong: false });
                  setDisableTinhLuong(false);
                }
              }}
            >
              Có phép{" "}
              <Tag color="success">Số ngày phép còn lại trong năm : {}</Tag>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
