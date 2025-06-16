// ===== REACT & Thư viện ngoài =====
import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Thêm plugin này

// Thêm plugin để parse custom format
dayjs.extend(customParseFormat);

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
  ExclamationCircleOutlined, // Import for Modal.confirm
} from "@ant-design/icons";

// ===== STYLES ======
import "./nghi_phep.css"; // Đảm bảo file CSS này tồn tại và được cập nhật

// ===== HOOK Tuỳ Chỉnh ======
import { useNghiPhep } from "../../component/hooks/useNghiPhep";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useAppNotification } from "../../component/ui/notification";

// ===== CONTEXT =====
import { ReloadContext } from "../../context/reloadContext";

// ===== UTILITIES =====
import { NghiPhepPermissions } from "../../config/utils/user_permission";

const { RangePicker } = DatePicker;

// Hàm tiện ích để chuyển đổi chuỗi có dấu thành không dấu
const removeVietnameseDiacritics = (str) => {
  if (!str) return '';
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  return str;
};

// Hàm helper để parse ngày từ backend
const parseDate = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString === "string" && dateString.includes("/")) {
    return dayjs(dateString, "DD/MM/YYYY");
  }
  return dayjs(dateString);
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const parsed = parseDate(dateString);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : dateString;
};

export default function NghiPhep() {
  const {
    danhSachNghiPhep,
    getAllNghiPhep,
    updateNghiPhep,
    deleteNghiPhep,
    createNghiPhep,
  } = useNghiPhep();
  const { danhSachNhanVien } = useNhanVien();

  const api = useAppNotification();

  const { setReload } = useContext(ReloadContext);

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

  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedMonth, setSelectedMonth] = useState(null); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [form] = Form.useForm();

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length > 0 && dates[0] && dates[1]) {
      setSelectedMonth(null); 
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (month) {
      setDateRange([null, null]); 
    }
  };

  const statistics = useMemo(() => {
    if (!dataSourceNghiPhep.length)
      return { total: 0, tinhLuong: 0, tinhPhep: 0 };

    const filtered = dataSourceNghiPhep.filter((item) => {
      const start = parseDate(item.ngayBatDau);
      const end = parseDate(item.ngayKetThuc);

      if (!start.isValid() || !end.isValid()) return false;

      if (dateRange && dateRange[0] && dateRange[1]) {
        return (
          start.isBefore(dateRange[1].endOf("day")) &&
          end.isAfter(dateRange[0].startOf("day"))
        );
      } else if (selectedMonth) {

        const itemStartDate = parseDate(item.ngayBatDau);
        return itemStartDate.isSame(selectedMonth, 'month');
      }

      return true;
    });

    return {
      total: filtered.length,
      tinhLuong: filtered.filter((i) => i.tinhLuong).length,
      tinhPhep: filtered.filter((i) => i.tinhPhep).length,
    };
  }, [dataSourceNghiPhep, dateRange, selectedMonth]);

  const filteredList = useMemo(() => {
    const lowerCaseSearchValueNormalized = removeVietnameseDiacritics(searchValue).toLowerCase();

    return dataSourceNghiPhep.filter((item) => {

      if (!lowerCaseSearchValueNormalized) {
        const start = parseDate(item.ngayBatDau);
        const end = parseDate(item.ngayKetThuc);
        if (!start.isValid() || !end.isValid()) return false;

        if (dateRange && dateRange[0] && dateRange[1]) {
          return (
            start.isBefore(dateRange[1].endOf("day")) &&
            end.isAfter(dateRange[0].startOf("day"))
          );
        } else if (selectedMonth) {
          const itemStartDate = parseDate(item.ngayBatDau);
          return itemStartDate.isSame(selectedMonth, 'month');
        }
        return true;
      }

      const matchesSearch = Object.values(item).some(value => {

        const normalizedItemValue = removeVietnameseDiacritics(String(value || '')).toLowerCase();
        return normalizedItemValue.includes(lowerCaseSearchValueNormalized);
      });

      if (!matchesSearch) return false;

      const start = parseDate(item.ngayBatDau);
      const end = parseDate(item.ngayKetThuc);
      if (!start.isValid() || !end.isValid()) return false;

      if (dateRange && dateRange[0] && dateRange[1]) {
        return (
          start.isBefore(dateRange[1].endOf("day")) &&
          end.isAfter(dateRange[0].startOf("day"))
        );
      } else if (selectedMonth) {
        const itemStartDate = parseDate(item.ngayBatDau);
        return itemStartDate.isSame(selectedMonth, 'month');
      }
      return true;
    });
  }, [dataSourceNghiPhep, searchValue, dateRange, selectedMonth]);


  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingRecord(record.maNghiPhep);
    form.setFieldsValue({
      ...record,
      ngayBatDau: parseDate(record.ngayBatDau),
      ngayKetThuc: parseDate(record.ngayKetThuc),
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      await form.validateFields(); 
      const values = form.getFieldsValue(); 

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
        try {
          await updateNghiPhep(editingRecord, dataToSave);
          api.success({
            message: "Cập nhật nghỉ phép thành công",
          });
          setIsModalVisible(false);
        } catch (error) {
          api.error({
            message: "Cập nhật nghỉ phép không thành công",
            description: error.message || "Đã xảy ra lỗi khi cập nhật",
          });
        }
      } else {
        // Tạo mới
        try {
          await createNghiPhep(dataToSave);
          api.success({
            message: "Thành công",
            description: "Đã thêm thành công đơn nghỉ phép",
          });
          setIsModalVisible(false);
        } catch (error) {
          api.error({
            message: "Có lỗi xảy ra",
            description: error.message || "Đã xảy ra lỗi khi tạo mới",
          });
        }
      }
    }
    // eslint-disable-next-line no-unused-vars
    catch (errorInfo) { 
      api.error({
        message: "Lỗi xác thực",
        description: "Vui lòng kiểm tra lại các trường đã nhập.",
      });
    }
  };

  const handleDelete = (maNghiPhep) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa đơn nghỉ phép này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteNghiPhep(maNghiPhep);
          api.success({
            message: "Xoá dữ liệu thành công",
            description: "Đã xoá đơn nghỉ phép",
          });
        } catch (error) {
          api.error({
            message: "Xoá dữ liệu không thành công",
            description: error.message || "Xoá thất bại",
          });
        }
      },
      onCancel() {
        console.log('Hủy xóa');
      },
    });
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
      render: (date) => formatDateDisplay(date), 
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      width: 120,
      render: (date) => formatDateDisplay(date), 
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
      title: "Trang thái phê duyệt",
      dataIndex: "trangThaiPheDuyet",
      key: "trangThaiPheDuyet",
      width: 100,
      align: "center",
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
              title="Nhân viên nghỉ"
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
              valueStyle={{ color: "#cf1322" }}
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
          <Col xs={24} sm={24} md={8}>
            <Input.Search
              placeholder="Tìm kiếm..."
              allowClear
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              enterButton
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              allowClear
              disabled={!!selectedMonth}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              picker="month"
              style={{ width: "100%" }}
              placeholder="Chọn tháng"
              value={selectedMonth}
              onChange={handleMonthChange}
              format="MM/YYYY"
              allowClear
              disabled={!!(dateRange && dateRange[0] && dateRange[1])}
            />
          </Col>
          <Col xs={24} sm={24} md={4}>
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
        pagination={{ pageSize: 10 }}
        sticky
        className="custom-header-table"
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
          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="ngayKetThuc"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc!" },
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
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
              ></Select>
            </Form.Item>
          )}

          <Form.Item name="tinhLuong" valuePropName="checked">
            <Checkbox>Tính lương</Checkbox>
          </Form.Item>
          <Form.Item name="tinhPhep" valuePropName="checked">
            <Checkbox>Có phép</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}