import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  TimePicker,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useCaLam } from "../../../component/hooks/useCaLam";
import { useCaLamTrongTuan } from "../../../component/hooks/useCaLamTrongTuan";
import { useAppNotification } from "../../../component/ui/notification";
import ModalChiTietCaLam from "./modal_chitiet_calam";

const { Title, Text } = Typography;
const { Search } = Input;

export default function CaLamComponent() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedShiftForDetail, setSelectedShiftForDetail] = useState(null);
  const [shiftDetailsByDay, setShiftDetailsByDay] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const apiNotification = useAppNotification();

  // Sử dụng hook useCaLam cho quản lý ca làm cơ bản
  const { danhSachCaLam, loadingCaLam, createCaLam, updateCaLam, deleteCaLam } =
    useCaLam();

  const {
    danhSachCaLamTrongTuanTheoPhongBan,
    loadingCaLamTrongTuan,
    getAllCaLamTrongTuanByPhongBan,
    updateCaLamTrongTuan,
    createCaLamTrongTuan,
  } = useCaLamTrongTuan();

  const [tableScrollY, setTableScrollY] = useState(0);

  useEffect(() => {
    if (!searchText || searchText.trim() === "") {
      setFilteredList(danhSachCaLam || []);
    } else {
      const filtered = (danhSachCaLam || []).filter(
        (dscl) =>
          dscl.tenCa.toLowerCase().includes(searchText.toLowerCase()) ||
          dscl.maCa.toString().toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchText, danhSachCaLam]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const calculateTableHeight = () => {
      const headerFooterOffset = 120 + 120 + 60 + 64 + 50;
      setTableScrollY(window.innerHeight - headerFooterOffset);
    };

    calculateTableHeight();
    window.addEventListener("resize", calculateTableHeight);

    return () => {
      window.removeEventListener("resize", calculateTableHeight);
    };
  }, []);

  const fetchAndSetShiftDetails = useCallback(
    async (maCa) => {
      setLoadingDetails(true);
      try {
        await getAllCaLamTrongTuanByPhongBan(maCa);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết ca làm:", error);
        apiNotification.error(
          "Không thể tải chi tiết ca làm. Vui lòng thử lại."
        );
        setShiftDetailsByDay([]);
      } finally {
        setLoadingDetails(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiNotification]
  );

  useEffect(() => {
    if (
      danhSachCaLamTrongTuanTheoPhongBan &&
      Array.isArray(danhSachCaLamTrongTuanTheoPhongBan)
    ) {
      setShiftDetailsByDay(danhSachCaLamTrongTuanTheoPhongBan);
    }
  }, [danhSachCaLamTrongTuanTheoPhongBan]);

  // Cập nhật chi tiết ca làm hàng ngày
  const handleSaveDailyShiftDetails = async (maCa, updatedDetails) => {
    try {
      await updateCaLamTrongTuan(maCa, updatedDetails);
      apiNotification.success("Cập nhật chi tiết ca làm thành công!");
      // Refresh lại dữ liệu sau khi save
      await fetchAndSetShiftDetails(maCa);
    } catch (error) {
      console.error("Lỗi khi lưu chi tiết ca làm:", error);
      apiNotification.error(
        "Lưu chi tiết ca làm thất bại: " +
          (error.response?.data?.message || error.message)
      );
      throw error;
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      let shiftData = {};
      if (currentRecord) {
        shiftData = {
          maCa: currentRecord.maCa,
          tenCa: values.tenCa,
        };
        await updateCaLam(currentRecord.maCa, shiftData);
        apiNotification.success("Cập nhật ca làm thành công!");
      } else {
        // Tạo ca làm mới
        shiftData = {
          tenCa: values.tenCa,
        };
        await createCaLam(shiftData);
        apiNotification.success("Thêm ca làm thành công!");
      }
      handleCancel();
    } catch (err) {
      console.error("Error saving shift:", err);
      apiNotification.error(
        "Đã xảy ra lỗi khi lưu ca làm: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Hủy form
  const handleCancel = () => {
    form.resetFields();
    setCurrentRecord(null);
    setIsModalVisible(false);
  };

  // Chỉnh sửa ca làm
  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      tenCa: record.tenCa,
    });
    setIsModalVisible(true);
  };

  // FIX: Xóa ca làm - sử dụng đúng field maCa
  const handleDelete = async (maCa) => {
    try {
      console.log("DEBUG CALAM : MÃ CA: ", maCa);
      await deleteCaLam(maCa);
      apiNotification.success({ message: "Xóa ca làm thành công!" });
    } catch (err) {
      console.error("Error deleting shift:", err);
      apiNotification.error({
        message:
          "Đã xảy ra lỗi khi xóa ca làm: " +
          (err.response?.data?.message || err.message),
      });
    }
  };

  // Thêm ca làm mới
  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // FIX: Xử lý click vào cell để xem chi tiểt - đảm bảo data được truyền đúng
  const handleCellClickForDetail = useCallback(
    async (record, e) => {
      if (e.target.closest(".ant-btn")) {
        return;
      }

      console.log("Selected record for detail:", record); // Debug log

      setSelectedShiftForDetail(record);
      setIsDetailModalVisible(true);

      // Reset trước khi fetch mới
      setShiftDetailsByDay([]);
      await fetchAndSetShiftDetails(record.maCa);
    },
    [fetchAndSetShiftDetails]
  );

  // Cấu hình cột cho bảng chính
  const mainTableColumns = [
    {
      title: "Mã Ca",
      dataIndex: "maCa",
      key: "maCa",
      width: 100,
      render: (text, record) => (
        <Tag
          color="blue"
          onClick={(e) => handleCellClickForDetail(record, e)}
          style={{ cursor: "pointer" }}
        >
          {text}
        </Tag>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.maCa?.toString().toLowerCase().includes(value.toLowerCase()) ||
        record.tenCa?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Tên Ca",
      dataIndex: "tenCa",
      key: "tenCa",
      width: 200,
      render: (text, record) => (
        <Text
          strong
          onClick={(e) => handleCellClickForDetail(record, e)}
          style={{ cursor: "pointer" }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 150,
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
            title="Xóa ca làm việc"
            description="Bạn có chắc chắn muốn xóa ca làm việc này?"
            onConfirm={() => handleDelete(record.maCa)}
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

  // Tính toán thống kê
  const totalShifts = Array.isArray(filteredList) ? filteredList.length : 0;
  // const totalHours = filteredList.reduce(
  //   (acc, shift) => acc + (shift.soGioLamViec || 0),
  //   0
  // );
  // const averageHours =
  //   totalShifts > 0 ? (totalHours / totalShifts).toFixed(1) : 0;

  return (
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <div style={{ margin: "0 auto" }}>
        <Card style={{ marginBottom: "24px" }}>
          <Row justify="space-between" align="middle">
            <Col>
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
                Quản Lý Ca Làm Việc
              </Title>
              <Text type="secondary">
                Quản lý và theo dõi các ca làm việc trong công ty
              </Text>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng Ca Làm"
                value={totalShifts}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          {/* <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Trung Bình Giờ/Ca"
                value={averageHours}
                suffix="h"
                prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng Giờ Làm"
                value={totalHours.toFixed(1)}
                suffix="h"
                prefix={<ClockCircleOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col> */}
        </Row>

        <Card>
          <Row style={{ marginBottom: "16px" }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm theo mã ca hoặc tên ca..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => setSearchText(value)}
                onChange={handleSearchChange}
              />
            </Col>
          </Row>

          <Table
            columns={mainTableColumns}
            dataSource={filteredList}
            rowKey="maCa"
            loading={loadingCaLam}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} ca làm`,
            }}
            scroll={{ x: 800, y: tableScrollY }}
            size="middle"
          />

          <Row justify="end" style={{ marginTop: "16px" }}>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  border: "none",
                }}
                size="middle"
              >
                Thêm Ca Mới
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Modal for Adding/Editing Shift */}
        <Modal
          centered
          title={
            <Space>
              <ClockCircleOutlined />
              {currentRecord ? "Chỉnh Sửa Ca Làm" : "Thêm Ca Làm Mới"}
            </Space>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Tên Ca"
                  name="tenCa"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên ca!" },
                    { min: 2, message: "Tên ca phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên ca (VD: Ca Sáng, Ca Chiều, Ca Đêm)"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={handleCancel}>Hủy</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  {currentRecord ? "Cập Nhật" : "Thêm Mới"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Modal for displaying Shift Details */}
        <ModalChiTietCaLam
          isVisible={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false);
            setShiftDetailsByDay([]);
            setSelectedShiftForDetail(null);
          }}
          shiftData={selectedShiftForDetail}
          shiftDetailsByDay={shiftDetailsByDay}
          loadingDetails={loadingDetails || loadingCaLamTrongTuan}
          onSaveDailyShiftDetails={handleSaveDailyShiftDetails}
          fetchShiftDetailsByMaCa={fetchAndSetShiftDetails}
          createCaLamTrongTuan={createCaLamTrongTuan}
          updateCaLamTrongTuan={updateCaLamTrongTuan}
        />
      </div>
    </div>
  );
}
