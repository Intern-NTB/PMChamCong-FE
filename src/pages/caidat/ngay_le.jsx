import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  Typography,
  Input,
  Select,
  DatePicker,
  Form,
  Row,
  Col,
  Space,
  Button as AntButton,
  Checkbox,
  Card,
  Tag,
  Modal,
  Empty,
  Pagination,
} from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// ===== CONTEXT =====
import { ReloadContext } from "../../context/reloadContext";

// === Hook ===
import { useNgayLe } from "../../component/hooks/useNgayLe";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

export default function NgayLeComponent() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalConfirmVisible, setIsModalConfirmVisible] = useState({
    visible: false,
    data: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const {
    danhSachNgayLe,
    getAllNgayLe,
    createNgayLe,
    updateNgayLe,
    deleteNgayLe,
  } = useNgayLe();

  // CONTEXT
  const { setReload } = useContext(ReloadContext);

  useEffect(() => {
    setReload(() => getAllNgayLe);
  }, []);

  // Ensure danhSachNgayLe is an array before mapping
  const mappedDanhSachNgayLe = Array.isArray(danhSachNgayLe)
    ? danhSachNgayLe.map((ngl) => ({
        key: ngl.maNgayLe,
        maNgayLe: ngl.maNgayLe,
        tenNgayLe: ngl.tenNgayLe,
        ngayBatDau: ngl.ngayBatDau,
        ngayKetThuc: ngl.ngayKetThuc,
        soNgayNghi: ngl.soNgayNghi,
      }))
    : [];

  // Filter data
  const filteredData = mappedDanhSachNgayLe.filter((item) => {
    const matchSearch = item.tenNgayLe
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const onFinish = async (values) => {
    const formData = {
      ...values,
      ngayBatDau: values.dateRange
        ? values.dateRange[0].format("YYYY-MM-DD")
        : null,
      ngayKetThuc: values.dateRange
        ? values.dateRange[1].format("YYYY-MM-DD")
        : null,
    };
    delete formData.dateRange;

    try {
      if (editingId) {
        const updatedItem = {
          maNgayLe: editingId,
          ...formData,
          updatedDate: new Date().toISOString().split("T")[0],
        };
        await updateNgayLe(updatedItem);
      } else {
        const newItem = {
          maNgayLe: Date.now(),
          ...formData,
          status: "Hoạt động",
          createdDate: new Date().toISOString().split("T")[0],
        };
        await createNgayLe(newItem);
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving holiday:", error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = useCallback(
    (data) => {
      setEditingId(data.maNgayLe);
      form.setFieldsValue({
        ...data,
        dateRange:
          data.ngayBatDau && data.ngayKetThuc
            ? [dayjs(data.ngayBatDau), dayjs(data.ngayKetThuc)]
            : null,
      });
      setIsModalVisible(true);
    },
    [form]
  );

  const handleDelete = useCallback(
    (data) => {
      setIsModalConfirmVisible({
        visible: true,
        data: data,
      });
    },
    []
  );

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      // Không cần notification warning nữa - người dùng sẽ thấy button disabled
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await deleteNgayLe(id);
      }
      setSelectedRowKeys([]); // Clear selection after successful bulk delete
      // Success notification sẽ tự động hiển thị qua axios interceptor
    } catch (error) {
      console.error("Error bulk deleting:", error);
      // Error notification sẽ tự động hiển thị qua axios interceptor
    } finally {
      setIsModalConfirmVisible({ visible: false, data: null });
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = useCallback(async () => {
    try {
      if (isModalConfirmVisible.data) {
        await deleteNgayLe(isModalConfirmVisible.data.maNgayLe);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsModalConfirmVisible({ visible: false, data: null });
    }
  }, [isModalConfirmVisible.data, deleteNgayLe]);

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleCardSelect = (maNgayLe, checked) => {
    if (checked) {
      setSelectedRowKeys((prev) => [...prev, maNgayLe]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((key) => key !== maNgayLe));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(paginatedData.map((item) => item.maNgayLe));
    } else {
      setSelectedRowKeys([]);
    }
  };

  //Kiểm tra lịch nghỉ lễ bị trùng
  const isOverlapping = (newStart, newEnd, existingList, currentId = null) => {
    const start = dayjs(newStart).startOf("day");
    const end = dayjs(newEnd).endOf("day");

    return existingList.some((item) => {
      if (currentId && item.maNgayLe === currentId) {
        return false; // ignore the current item being edited
      }
      const existingStart = dayjs(item.ngayBatDau).startOf("day");
      const existingEnd = dayjs(item.ngayKetThuc).endOf("day");

      // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
      return start.isSameOrBefore(existingEnd) && end.isSameOrAfter(existingStart);
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dayjs(dateStr).format("DD/MM/YYYY");
  };

  const renderNgayLeCard = (item) => (
    <Col xs={24} sm={12} md={8} lg={6} key={item.maNgayLe}>
      <Card
        hoverable
        style={{
          marginBottom: 16,
          borderRadius: 12,
          height: "auto",
          minHeight: "280px",
          boxShadow: selectedRowKeys.includes(item.maNgayLe)
            ? "0 4px 20px rgba(24, 144, 255, 0.3)"
            : "0 2px 12px rgba(0,0,0,0.08)",
          border: selectedRowKeys.includes(item.maNgayLe)
            ? "2px solid #1890ff"
            : "1px solid #f0f0f0",
          background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
          transition: "all 0.3s ease",
        }}
        bodyStyle={{ padding: "20px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <Checkbox
            checked={selectedRowKeys.includes(item.maNgayLe)}
            onChange={(e) => handleCardSelect(item.maNgayLe, e.target.checked)}
            style={{ transform: "scale(1.1)" }}
          />
        </div>

        {/* Main Content */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <CalendarOutlined
            style={{
              fontSize: 32,
              color: "#1890ff",
              marginBottom: 12,
              display: "block",
            }}
          />
          <Title
            level={4}
            style={{
              margin: 0,
              marginBottom: 8,
              color: "#262626",
              fontSize: "16px",
              lineHeight: "1.4",
            }}
          >
            {item.tenNgayLe}
          </Title>
        </div>

        {/* Details */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              fontSize: "13px",
            }}
          >
            <ClockCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} />
            <Text strong>Số ngày nghỉ: </Text>
            <Tag color="green" style={{ marginLeft: 4, borderRadius: 6 }}>
              {item.soNgayNghi} ngày
            </Tag>
          </div>

          <div style={{ fontSize: "12px", color: "#666" }}>
            <div
              style={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Text>Từ: {formatDate(item.ngayBatDau)} </Text>-
              <Text> Đến: {formatDate(item.ngayKetThuc)}</Text>
            </div>
          </div>

          {item.note && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 12px",
                background: "#f8f9fa",
                borderRadius: 6,
                fontSize: "12px",
                color: "#666",
                fontStyle: "italic",
              }}
            >
              {item.note}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            borderTop: "1px solid #f0f0f0",
            paddingTop: 12,
            marginTop: 12,
          }}
        >
          <AntButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(item)}
            size="middle"
          >
            Sửa
          </AntButton>
          <AntButton
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(item)}
            size="middle"
          >
            Xóa
          </AntButton>
        </div>
      </Card>
    </Col>
  );

  return (
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header Section */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
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
                  Quản lý Ngày lễ
                </Title>
                <Text type="secondary">Quản lý các ngày nghỉ lễ trong năm</Text>
              </div>
            </div>
          </Col>
          <Col>
            <Space wrap>
              {selectedRowKeys.length > 0 && (
                <AntButton
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                  style={{ borderRadius: 8 }}
                >
                  Xóa đã chọn ({selectedRowKeys.length})
                </AntButton>
              )}
              <AntButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                size="large"
                style={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                }}
              >
                Thêm ngày lễ
              </AntButton>
            </Space>
          </Col>
        </Row>

        {/* Filter Section */}
        <Row
          gutter={[16, 16]}
          style={{ marginBottom: 24, alignItems: "center" }}
        >
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm ngày lễ..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={setSearchTerm}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={24} sm={4} md={10}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Checkbox
                checked={
                  paginatedData.length > 0 &&
                  selectedRowKeys.length === paginatedData.length
                }
                indeterminate={
                  selectedRowKeys.length > 0 &&
                  selectedRowKeys.length < paginatedData.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                Chọn tất cả
              </Checkbox>
            </div>
          </Col>
        </Row>

        {/* Cards Section */}
        {paginatedData.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>{paginatedData.map(renderNgayLeCard)}</Row>

            {/* Pagination */}
            {filteredData.length > pageSize && (
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <Pagination
                  current={currentPage}
                  total={filteredData.length}
                  pageSize={pageSize}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} ngày lễ`
                  }
                  style={{ marginTop: 16 }}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description="Không tìm thấy ngày lễ nào"
            style={{
              margin: "60px 0",
              padding: "40px",
              background: "#fafafa",
              borderRadius: 12,
            }}
          />
        )}

        {/* Modal Confirm Delete */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DeleteOutlined style={{ color: "#ff4d4f" }} />
              Xác nhận xóa
            </div>
          }
          open={isModalConfirmVisible.visible}
          centered
          width={400}
          onCancel={() =>
            setIsModalConfirmVisible({ visible: false, data: null })
          }
          footer={[
            <Space style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <AntButton
                key="cancel"
                onClick={() =>
                  setIsModalConfirmVisible({ visible: false, data: null })
                }
                size="large"
              >
                Hủy
              </AntButton>
              <AntButton
                key="delete"
                type="primary"
                danger
                onClick={handleConfirmDelete}
                size="large"
              >
                Xóa
              </AntButton>
            </Space>,
          ]}
        >
          <div style={{ padding: "16px 0" }}>
            <Text style={{ fontSize: 16 }}>
              Bạn có chắc chắn muốn xóa{" "}
              <Text strong style={{ color: "#ff4d4f" }}>
                "{isModalConfirmVisible.data?.tenNgayLe}"
              </Text>{" "}
              ra khỏi danh sách ngày lễ không ?
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
              Hành động này không thể hoàn tác.
            </Text>
          </div>
        </Modal>

        {/* Modal Form */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              {editingId ? "Sửa ngày lễ" : "Thêm ngày lễ"}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
          style={{ borderRadius: 16 }}
        >
          <Form
            form={form}
            name="ngayLeform"
            onFinish={onFinish}
            layout="vertical"
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="tenNgayLe"
              label="Tên ngày lễ"
              rules={[
                { required: true, message: "Vui lòng nhập tên ngày lễ!" },
                { min: 2, message: "Tên ngày lễ phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input
                placeholder="Nhập tên ngày lễ"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="Thời gian nghỉ lễ"
              rules={[
                {
                  required: true,
                  validator: (_, value) => {
                    if (!value || value.length !== 2) {
                      return Promise.reject("Vui lòng chọn thời gian nghỉ lễ!");
                    }
                    const [newStart, newEnd] = value;

                    if (isOverlapping(newStart, newEnd, danhSachNgayLe, editingId)) {
                      return Promise.reject(
                        "Khoảng thời gian đã trùng với kỳ nghỉ lễ khác!"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <RangePicker
                style={{ width: "100%", borderRadius: 8 }}
                size="large"
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                dropdownClassName="one-calendar-only"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <Space
                style={{ width: "100%", justifyContent: "flex-end" }}
              >
                <AntButton
                  onClick={handleCancel}
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  Hủy
                </AntButton>
                <AntButton
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1890ff, #36cfc9)",
                    border: "none",
                  }}
                >
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </AntButton>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

