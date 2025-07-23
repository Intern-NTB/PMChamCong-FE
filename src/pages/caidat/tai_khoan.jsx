import React, { useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  Divider,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useTaiKhoan } from "../../component/hooks/useTaiKhoan";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { Button as AntButton } from "antd";
const { Title, Text } = Typography;
const { Search } = Input;

export default function TaiKhoanComponent() {
  const {
    danhsachTaiKhoan,
    loadingTaiKhoan,
    createTaiKhoan,
    deleteTaikhoan,
    updateTaiKhoan,
  } = useTaiKhoan(true);
  const { danhSachNhanVien, loading } = useNhanVien();
  const [editingId, setEditingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleAdd = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (data) => {
      setEditingId(data.maNhanVien);
      form.setFieldsValue({
        maNhanVien: data.maNhanVien,
        tenDangNhap: data.tenDangNhap,
        matKhau: data.matKhau,
      });
      setIsModalVisible(true);
    },
    [form]
  );

  const handleDelete = async (maNhanVien) => {
    try {
      await deleteTaikhoan(maNhanVien);
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
    }
  };

  const dataSource = Array.isArray(danhsachTaiKhoan)
    ? danhsachTaiKhoan.map((tk) => {
        const nhanVien = danhSachNhanVien.find(
          (nv) => nv.maNhanVien === tk.maNhanVien
        );
        return {
          key: tk.maNhanVien,
          maNhanVien: tk.maNhanVien,
          tenDangNhap: tk.tenDangNhap,
          matKhau: tk.matKhau,
          tenNhanVien: nhanVien ? nhanVien.hoTen : "Không rõ",
        };
      })
    : [];

  const dataSourceNhanVien = danhSachNhanVien.map((nv) => ({
    maNhanViens: nv.maNhanVien,
    tenNhanViens: nv.hoTen,
  }));

  const togglePasswordVisibility = (maNhanVien) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [maNhanVien]: !prev[maNhanVien],
    }));
  };

  // Custom validator để kiểm tra tên đăng nhập trùng lặp
  const validateTenDangNhap = useCallback(
    (_, value) => {
      if (!value) return Promise.resolve();

      // Kiểm tra tên đăng nhập trùng lặp cho cả tạo mới và cập nhật
      const isExisting = danhsachTaiKhoan.some((tk) => {
        // Nếu đang chỉnh sửa, loại trừ bản ghi hiện tại khỏi việc kiểm tra
        if (editingId && tk.maNhanVien === editingId) {
          return false;
        }
        return tk.tenDangNhap.toLowerCase() === value.toLowerCase();
      });

      if (isExisting) {
        return Promise.reject("Tên đăng nhập đã tồn tại!");
      }

      return Promise.resolve();
    },
    [danhsachTaiKhoan, editingId]
  );

  // Handle form submission
  const onFinish = useCallback(
    async (values) => {
      try {
        if (editingId) {
          const updatedData = {
            maNhanVien: Number(editingId),
            ...values,
          };
          await updateTaiKhoan(updatedData);
        } else {
          await createTaiKhoan(values);
        }
        handleCancel();
      } catch (error) {
        console.error("Lỗi khi gửi form tài khoản:", error);
      }
    },
    [createTaiKhoan, editingId, handleCancel, updateTaiKhoan]
  );

  const columns = [
    {
      title: "Mã Nhân Viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
      onFilter: (value, record) =>
        record.maNhanVien
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        record.tenDangNhap?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Tên Nhân Viên",
      dataIndex: "tenNhanVien",
      key: "tenNhanVien",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tên Đăng Nhập",
      dataIndex: "tenDangNhap",
      key: "tenDangNhap",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Mật khẩu",
      dataIndex: "matKhau",
      key: "matKhau",
      width: 150,
      render: (text, record) => {
        const isVisible = visiblePasswords[record.maNhanVien];
        return (
          <span>
            <Text strong>{isVisible ? text : "••••••••"}</Text>
            {isVisible ? (
              <EyeInvisibleOutlined
                style={{ marginLeft: 8, cursor: "pointer" }}
                onClick={() => togglePasswordVisibility(record.maNhanVien)}
              />
            ) : (
              <EyeOutlined
                style={{ marginLeft: 8, cursor: "pointer" }}
                onClick={() => togglePasswordVisibility(record.maNhanVien)}
              />
            )}
          </span>
        );
      },
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 120,
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
            title="Xóa tài khoản"
            description="Bạn có chắc chắn muốn xóa tài khoản này?"
            onConfirm={() => handleDelete(record.maNhanVien)}
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

  return (
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <div style={{ margin: "0 auto" }}>
        {/* Header */}
        <Card style={{ marginBottom: "24px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title
                background
                level={2}
                style={{
                  marginBottom: 8,
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                }}
              >
                Quản Lý Tài Khoản
              </Title>
              <Text type="secondary">Quản lý tài khoản của phần mềm</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleAdd}
                style={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                }}
              >
                Thêm Tài Khoản
              </Button>
            </Col>
          </Row>
        </Card>
        <Card>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="maNhanVien"
            loading={loadingTaiKhoan}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} tài khoản`,
            }}
            scroll={{ x: 800 }}
            size="middle"
          />
        </Card>

        {/* Modal Form */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {editingId ? <EditOutlined /> : <PlusOutlined />}
              {editingId ? "Sửa tài khoản" : "Thêm tài khoản"}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={form}
            name="taiKhoanForm"
            onFinish={onFinish}
            layout="vertical"
            style={{ marginTop: 24 }}
            size="large"
          >
            {!editingId && (
              <Form.Item
                name="maNhanVien"
                label={<Text strong>Chọn nhân viên</Text>}
                rules={[
                  { required: true, message: "Vui lòng chọn nhân viên!" },
                ]}
              >
                <Select
                  placeholder="Chọn nhân viên"
                  size="large"
                  loading={loading}
                  options={dataSourceNhanVien.map((item) => ({
                    value: item.maNhanViens,
                    label: item.tenNhanViens,
                  }))}
                />
              </Form.Item>
            )}

            <Form.Item
              name="tenDangNhap"
              label={<Text strong>Tên tài khoản</Text>}
              rules={[
                { required: true, message: "Vui lòng nhập tên tài khoản!" },
                { min: 2, message: "Tên tài khoản phải có ít nhất 2 ký tự!" },
                {
                  validator: validateTenDangNhap,
                },
              ]}
            >
              <Input
                placeholder="Nhập tên tài khoản"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="matKhau"
              label={<Text strong>Mật khẩu</Text>}
              rules={[
                ...(!editingId
                  ? [{ required: true, message: "Vui lòng nhập mật khẩu!" }]
                  : []),
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                  message:
                    "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt!",
                },
              ]}
            >
              <Input.Password
                placeholder={
                  editingId
                    ? "Nhập mật khẩu mới (nếu muốn đổi)"
                    : "Nhập mật khẩu"
                }
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  paddingTop: 16,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <AntButton
                  onClick={handleCancel}
                  size="large"
                  style={{ minWidth: 100 }}
                >
                  Hủy
                </AntButton>
                <AntButton
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    minWidth: 120,
                    background: editingId
                      ? "linear-gradient(45deg, #52c41a, #389e0d)"
                      : "linear-gradient(45deg, #667eea, #764ba2)",
                    borderColor: "transparent",
                  }}
                >
                  {editingId ? "Cập nhật" : "Tạo tài khoản"}
                </AntButton>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}