import React, { useEffect, useState, useContext } from "react";
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
  message,
  Row,
  Col,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// ==== HOOKS TUỲ CHỈNH ====
import { useLoaiTienThuong } from "../../component/hooks/useLoaiTienThuong";
import { useLichSuThuong } from "../../component/hooks/useLichSuTienThuong";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useAppNotification } from "../../component/ui/notification";

// ==== CONTEXT ====
import { ReloadContext } from "../../context/reloadContext";

import dayjs from "dayjs";

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
  const api = useAppNotification();
  const { setReload } = useContext(ReloadContext);

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

  // Tính toán thống kê
  const tongSoNhanVienDuocThuong = new Set(
    danhSachLichSuThuong.map((item) => item.maNhanVien)
  ).size;
  const tongSoTienThuong = dataSourceDanhSachLichSuThuong.reduce(
    (sum, item) => sum + (item.quyDoi || 0),
    0
  );
  const tongSoLanThuong = danhSachLichSuThuong.length;

  // Hàm lọc dữ liệu cho tìm kiếm
  const getFilteredLichSu = () => {
    if (!searchTextLichSu) return dataSourceDanhSachLichSuThuong;
    return dataSourceDanhSachLichSuThuong.filter(
      (item) =>
        item.maNhanVien
          .toLowerCase()
          .includes(searchTextLichSu.toLowerCase()) ||
        item.hoTen.toLowerCase().includes(searchTextLichSu.toLowerCase()) ||
        getLoaiThuongName(item.maLoaiTienThuong)
          .toLowerCase()
          .includes(searchTextLichSu.toLowerCase()) ||
        item.lyDo.toLowerCase().includes(searchTextLichSu.toLowerCase())
    );
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
  const handleDeleteMultipleLichSu = () => {};

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
        message.success(`Đã xóa ${selectedLoaiThuongKeys.length} loại thưởng!`);
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
    form.setFieldsValue({
      ...record,
      ngayThuong: dayjs(record.ngayThuong),
    });
  };

  const handleDeleteLichSuThuong = async (maNhanVien, maLoaiTienThuong) => {
    try {
      await deleteLichSuThuong(maNhanVien, maLoaiTienThuong);
      api.success({ message: "Xoá thành công" });
    } catch (error) {
      api.error({ message: "Xoá thất bại", descriptions: error });
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
    form.setFieldsValue(record);
  };

  const handleDeleteLoaiThuong = (maLoaiTienThuong) => {
    dataSourceDanhSachLichSuThuong.filter(
      (item) => item.maLoaiTienThuong !== maLoaiTienThuong
    );
    message.success("Xóa thành công!");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === "lichsu") {
        const formattedValues = {
          ...values,
          ngayThuong: values.ngayThuong.format("YYYY-MM-DD"),
        };

        if (editingItem) {
          await updateLichSuThuong(values);
          api.success({ message: "Cập nhật lịch sử thưởng thành công!" });
        } else {
          await createLichSuThuong(formattedValues);
          api.success({ message: "Thêm lịch sử thưởng thành công!" });
        }
      } else {
        if (editingItem) {
          const updateValues = {
            ...values,
            maLoaiTienThuong: editingItem.maLoaiTienThuong,
          };
          try {
            await updateLoaiTienThuong(updateValues);
            api.success({ message: "Cập nhật thành công!" });
          } catch (error) {
            api.error({
              message: "Cập nhật không thành công!",
              descriptions: error,
            });
          }
        } else {
          try {
            await createLoaiTienThuong(values);
            api.success({ message: "Thêm thành công!" });
          } catch (error) {
            api.error({
              message: "Thêm Không thành công!",
              descriptions: error,
            });
          }
        }
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const getLoaiThuongName = (maLoaiTienThuong) => {
    const loaiThuong = dataSourceDanhSachLichSuThuong.find(
      (item) => item.maLoaiTienThuong === maLoaiTienThuong
    );
    return loaiThuong ? loaiThuong.tenLoaiTienThuong : "Không xác định";
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
      title: "Số tiền thưởng",
      dataIndex: "soTienThuong",
      key: "soTienThuong",
      render: (amount) => new Intl.NumberFormat("vi-VN").format(amount),
    },
    {
      title: "Số tiền thưởng khác",
      dataIndex: "soTienThuongKhac",
      key: "soTienThuongKhac",
      render: (amount) => new Intl.NumberFormat("vi-VN").format(amount),
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
      key: "donVi",
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
      title: "Số tiền",
      dataIndex: "soTienThuong",
      key: "soTienThuong",
      render: (amount) => new Intl.NumberFormat("vi-VN").format(amount),
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
      key: "donVi",
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
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <Space>
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
                <Search
                  placeholder="Tìm kiếm theo mã NV, tên, loại thưởng, lý do..."
                  allowClear
                  style={{ width: 350 }}
                  onChange={(e) => setSearchTextLichSu(e.target.value)}
                  prefix={<SearchOutlined />}
                />
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
                rowKey="id"
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
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <Space>
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
                <Search
                  placeholder="Tìm kiếm theo mã hoặc tên loại thưởng..."
                  allowClear
                  style={{ width: 350 }}
                  onChange={(e) => setSearchTextLoaiThuong(e.target.value)}
                  prefix={<SearchOutlined />}
                />
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
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ ngayThuong: dayjs() }}
          >
            {modalType === "lichsu" ? (
              <>
                <Form.Item
                  name="maLoaiTienThuong"
                  label="Loại thưởng"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại thưởng!" },
                  ]}
                >
                  <Select placeholder="Chọn loại thưởng">
                    {danhSachLoaiTienThuong.map((item) => (
                      <Select.Option
                        key={item.maLoaiTienThuong}
                        value={item.maLoaiTienThuong}
                      >
                        {item.tenLoaiTienThuong}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

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
                        options={danhSachNhanVien.map((nv) => ({
                          value: nv.maNhanVien,
                          label: `${nv.hoTen} - ${nv.cmnd}`,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="soTienThuongKhac" label="Số tiền thưởng">
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Nhập số tiền thưởng"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
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
                  ]}
                >
                  <Input placeholder="Nhập tên loại thưởng" />
                </Form.Item>

                <Form.Item
                  name="soTienThuong"
                  label="Số tiền"
                  rules={[
                    { required: true, message: "Vui lòng nhập số tiền!" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập số tiền"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>

                <Form.Item
                  name="donVi"
                  label="Đơn vị"
                  rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
                >
                  <Select
                    placeholder=""
                    options={[
                      { value: "%", label: "%" },
                      { value: "VND", label: "VND" },
                    ]}
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
