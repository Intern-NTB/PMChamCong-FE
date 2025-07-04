/* eslint-disable no-undef */
import React, { useState, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Space,
  Divider,
  Modal,
  Button as AntButton,
  Card,
  Checkbox,
  Typography,
  Empty,
  Pagination,
  Badge,
  Tabs,
  Switch 
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useVaiTro } from "../../component/hooks/useVaiTro";
import { useQuyenHan } from "../../component/hooks/useQuyenHan";
import { useAppNotification } from "../../component/ui/notification";

const { Text, Title } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

export default function VaiTroComponent() {
  const { danhSachVaiTro, deleteVaiTro, createVaiTro, updateVaiTro, ganQuyenChoVaiTro, goQuyenKhoiVaiTro, } = useVaiTro();
  const { danhSachQuyenHan } = useQuyenHan();  
  const { danhSachNhanVien } = useNhanVien();
  const [danhSachQuyenTheoVaiTro, setDanhSachQuyenTheoVaiTro] = useState({});
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
  const [pageSize, setPageSize] = useState(12);
  const apiNotification = useAppNotification();

  // Lấy dữ liệu từ API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dataSource = Array.isArray(danhSachVaiTro)
    ? danhSachVaiTro.map((vt) => {
      const tongNguoiDangDuocGan = Array.isArray(danhSachNhanVien)
        ? danhSachNhanVien.filter((nv) => nv.maVaiTro === vt.maVaiTro).length
        : 0;

      return {
        maVaiTro: vt.maVaiTro,
        tenVaiTro: vt.tenVaiTro || "",
        tongNguoiDangDuocGan,
      };
    })
    : [];
  
  //Dữ liệu quyền hạn.
  const permissionsOptions = Array.isArray(danhSachQuyenHan)
    ? danhSachQuyenHan.map((qh) => ({
      key: qh.MaQuyenHan,
      MaQuyenHan: String(qh.MaQuyenHan),
      TenQuyenHan: qh.TenQuyenHan,
      MoTa: qh.MoTa,
    }))
    : [];

  // Filter data
  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const searchText = searchTerm.toLowerCase();
      const matchSearch =
        (item.tenVaiTro ? item.tenVaiTro.toLowerCase() : "").includes(
          searchText
        ) ||
        (item.note ? item.note.toLowerCase() : "").includes(searchText) ||
        // Thêm các thuộc tính khác nếu cần
        false; // Giá trị mặc định nếu không có thuộc tính nào khớp
      return matchSearch;
    });
  }, [dataSource, searchTerm]);

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const onFinish = async (values) => {
    console.log(values);
    const { tenVaiTro, ...quyenForm } = values;
    
    const danhSachQuyenDuocChon = Object.entries(quyenForm)
      .filter(([_, isChecked]) => isChecked)
      .map(([MaQuyenHan]) => MaQuyenHan);
    console.log("✅ Các quyền được chọn:", danhSachQuyenDuocChon);
    try {
      if (editingId) {
        // Cập nhật tên vai trò
        await updateVaiTro(editingId, tenVaiTro);

        // Lấy danh sách quyền hiện tại đã gán (nếu bạn có dữ liệu)
        const quyenTruocDo = danhSachQuyenTheoVaiTro[editingId] || [];

        const quyenCanThem = danhSachQuyenDuocChon.filter(
          (q) => !quyenTruocDo.includes(q)
        );
        const quyenCanXoa = quyenTruocDo.filter(
          (q) => !danhSachQuyenDuocChon.includes(q)
        );

        if (quyenCanThem.length > 0) {
          await ganQuyenChoVaiTro(editingId, quyenCanThem);
        }
        if (quyenCanXoa.length > 0) {
          await goQuyenKhoiVaiTro(editingId, quyenCanXoa);
        }

        apiNotification.success({ message: "Cập nhật vai trò thành công!" });
      } else {
        const newVaiTro = await createVaiTro(tenVaiTro);
        const maVaiTro = newVaiTro.MaVaiTro;

        if (danhSachQuyenDuocChon.length > 0) {
          await ganQuyenChoVaiTro(maVaiTro, danhSachQuyenDuocChon);
        }

        apiNotification.success({ message: "Thêm vai trò thành công!" });
      }
      handleCancel();
    } catch (error) {
      apiNotification.error({ message: "Thao tác thất bại!" });
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = useCallback(
    (data) => {
      const quyenOfVaiTro = danhSachQuyenTheoVaiTro[data.maVaiTro] || [];

      const permissionChecked = {};
      quyenOfVaiTro.forEach((id) => {
        permissionChecked[id] = true;
      });

      form.setFieldsValue({
        tenVaiTro: data.tenVaiTro,
        ...permissionChecked,
      });

      setEditingId(data.maVaiTro);
      setIsModalVisible(true);
    },
    [form, danhSachQuyenTheoVaiTro]
  );

  const handleDelete = useCallback((data) => {
    setIsModalConfirmVisible({
      visible: true,
      data: data,
    });
  }, []);

  const handleDeleteVaiTro = async () => {
    try {
      await deleteVaiTro(isModalConfirmVisible.data.maVaiTro);
      apiNotification.success({ message: "Xoá vai trò thành công" });
      setIsModalConfirmVisible({
        visible: false,
        data: [],
      });
    } catch {
      apiNotification.error({ message: "Lỗi khi xoá vai trò" });
    }
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      apiNotification.warning("Vui lòng chọn ít nhất một vai trò để xóa!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa nhiều",
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} vai trò đã chọn?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: () => {
        setVaiTroList((prev) =>
          prev.filter((item) => !selectedRowKeys.includes(item.id))
        );
        setSelectedRowKeys([]);
        apiNotification.success(
          `Đã xóa ${selectedRowKeys.length} vai trò thành công!`
        );
      },
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleCardSelect = (id, checked) => {
    if (checked) {
      setSelectedRowKeys((prev) => [...prev, id]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(paginatedData.map((item) => item.id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const renderVaiTroCard = (item) => (
    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
      <Card
        hoverable
        style={{
          marginBottom: 16,
          borderRadius: 12,
          boxShadow: selectedRowKeys.includes(item.id)
            ? "0 4px 20px rgba(24, 144, 255, 0.3)"
            : "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: selectedRowKeys.includes(item.id)
            ? "2px solid #1890ff"
            : "1px solid #f0f0f0",
          transition: "all 0.3s ease",
          background: selectedRowKeys.includes(item.id)
            ? "linear-gradient(145deg, #f6fcff, #ffffff)"
            : "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <Checkbox
            checked={selectedRowKeys.includes(item.maVaiTro)}
            onChange={(e) => handleCardSelect(item.maVaiTro, e.target.checked)}
          />
          <Badge
            color="#52c41a"
            text={
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>
                {item.tongNguoiDangDuocGan} nhân viên
              </Text>
            }
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 40%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px auto",
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: 20 }} />
          </div>

          <Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 4,
              color: "#1a1a1a",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {item.tenVaiTro}
          </Title>

          <Text
            style={{
              color: "#8c8c8c",
              fontSize: 12,
              background: "#f5f5f5",
              padding: "2px 8px",
              borderRadius: 4,
              fontFamily: "monospace",
              fontWeight: 500,
            }}
          >
            {item.maVaiTro}
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            paddingTop: 12,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <AntButton
            icon={<EditOutlined />}
            onClick={() => handleEdit(item)}
            size="middle"
            title="Chỉnh sửa"
          />

          <AntButton
            y
            danger
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onClick={() => handleDelete(item)}
            size="middle"
            title="Xóa"
          />
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
      {/* Header Section */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "24px 32px",
          marginBottom: 24,
          color: "white",
        }}
      >
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
              Quản lý Vai trò
            </Title>
            <Text style={{ color: "grey", fontSize: 14 }}>
              Tổng cộng {filteredData.length} vai trò
            </Text>
          </Col>
          <Col>
            <Space wrap>
              {selectedRowKeys.length > 0 && (
                <AntButton
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                  style={{
                    color: "white",
                    background: "#ff4d4f",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
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
                Thêm vai trò mới
              </AntButton>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filter Section */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Search
              placeholder="Tìm kiếm theo mã hoặc tên vai trò..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={setSearchTerm}
              size="large"
              style={{
                borderRadius: 8,
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
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
              style={{ fontWeight: 500 }}
            >
              Chọn tất cả trang này
            </Checkbox>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ textAlign: "right" }}>
            <Text type="secondary">
              Hiển thị {paginatedData.length} / {filteredData.length} vai trò
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Cards Section */}
      {paginatedData.length > 0 ? (
        <Row gutter={[16, 16]}>{paginatedData.map(renderVaiTroCard)}</Row>
      ) : (
        <Card style={{ textAlign: "center", borderRadius: 12 }}>
          <Empty
            description={
              <Text type="secondary" style={{ fontSize: 16 }}>
                {searchTerm
                  ? "Không tìm thấy vai trò phù hợp"
                  : "Chưa có vai trò nào"}
              </Text>
            }
            style={{ margin: "40px 0" }}
          />
        </Card>
      )}

      {/* Pagination */}
      {filteredData.length > pageSize && (
        <Row justify="center" style={{ marginTop: 32 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} vai trò`
            }
            pageSizeOptions={["8", "12", "16", "24"]}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
            style={{
              padding: "16px",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          />
        </Row>
      )}

      {/* Modal Confirm Delete */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <DeleteOutlined
              style={{ color: "#ff4d4f", fontSize: 24, marginBottom: 8 }}
            />
            <div>Xác nhận xóa vai trò</div>
          </div>
        }
        open={isModalConfirmVisible.visible}
        centered
        width={420}
        onCancel={() =>
          setIsModalConfirmVisible({ visible: false, data: null })
        }
        footer={[
          <Space style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <AntButton
              key="cancel"
              onClick={() =>
                setIsModalConfirmVisible({ visible: false, data: null })
              }
              style={{ borderRadius: 6 }}
            >
              Hủy bỏ
            </AntButton>
            <AntButton
              key="delete"
              type="primary"
              danger
              onClick={() => handleDeleteVaiTro()}
              style={{ borderRadius: 6 }}
            >
              Xóa vai trò
            </AntButton>
          </Space>
        ]}
        bodyStyle={{ textAlign: "center", padding: "24px" }}
      >
        <p style={{ fontSize: 16, margin: "16px 0" }}>
          Bạn có chắc chắn muốn xóa vai trò
        </p>
        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: 8,
            margin: "16px 0",
          }}
        >
          <Text strong style={{ color: "#1890ff" }}>
            {isModalConfirmVisible.data?.maVaiTro}
          </Text>
          <div>
            <Text>{isModalConfirmVisible.data?.tenVaiTro}</Text>
          </div>
        </div>
        <Text type="danger">Hành động này không thể hoàn tác!</Text>
      </Modal>

      {/* Modal Form */}
      <Modal
        title={
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <UserOutlined
              style={{
                fontSize: 24,
                color: "#1890ff",
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {editingId ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        centered
        bodyStyle={{ padding: "24px 32px" }}
      >
        <Form
          form={form}
          name="vaiTroForm"
          onFinish={onFinish}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Thông tin chung" key="1">
              <Form.Item
                name="tenVaiTro"
                label={<Text strong>Tên vai trò</Text>}
                rules={[
                  { required: true, message: "Vui lòng nhập tên vai trò!" },
                  { min: 2, message: "Tên vai trò phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input
                  placeholder="VD: Trưởng phòng IT"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="Chi tiết quyền" key="2">
              <Divider orientation="left">Quyền chung</Divider>
              {permissionsOptions.map((item) => (
                <Form.Item
                  key={item.MaQuyenHan}
                  name={item.MaQuyenHan.toString()}
                  valuePropName="checked"
                  initialValue={false}
                  style={{ marginBottom: 20 }}
                  label={
                    <div>
                      <strong>{item.TenQuyenHan}</strong>
                      <div style={{ fontSize: 12, color: "#888" }}>{item.MoTa}</div>
                    </div>
                  }
                >
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>
              ))}
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <Space style={{ width: "100%", justifyContent: "center", gap: 16 }}>
              <AntButton
                onClick={handleCancel}
                size="large"
                style={{ borderRadius: 8, minWidth: 100 }}
              >
                Hủy bỏ
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: 8,
                  minWidth: 100,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
  );
}
