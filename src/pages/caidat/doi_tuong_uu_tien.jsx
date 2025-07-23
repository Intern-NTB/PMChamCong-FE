/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  Divider,
  Select,
  Tabs,
  DatePicker,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useDoiTuongUuTien } from "../../component/hooks/useDoiTuongUuTien";
import { useLichSuUuTien } from "../../component/hooks/useLichSuUuTien";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useWatch } from "antd/es/form/Form";
import { usePhongBan } from "../../component/hooks/usePhongBan";

const { Title } = Typography;
const { Search, TextArea } = Input;
const { TabPane } = Tabs;

export default function DoiTuongUuTienComponent() {
  const [form] = Form.useForm();
  const [historyForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchHistoryText, setSearchHistoryText] = useState("");
  const [selectedHistoryKeys, setSelectedHistoryKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [phongBanNhanVien, setPhongBanNhanVien] = useState(null);
  const {
    danhSachDoiTuongUuTien,
    createDoiTuongUuTien,
    updateDoiTuongUuTien,
    deleteDoiTuongUuTien,
  } = useDoiTuongUuTien();
  const thoiGianHieuLuc = useWatch("thoiGianHieuLuc", form); // theo dõi giá trị
  const soThang = thoiGianHieuLuc ? (thoiGianHieuLuc / 30).toFixed(1) : null;

  const { danhSachNhanVien, updateNhanVien } = useNhanVien();
  const { danhSachPhongBan, loading } = usePhongBan();
  const {
    danhSachLichSuUuTien,
    createLichSuDoiTuongUuTien,
    updateLichSuUuTien,
    deleteLichSuUuTien,
  } = useLichSuUuTien();
  const formatDate = (dateString, outputFormat = "DD/MM/YYYY") => {
    if (!dateString) return "";

    const formats = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD"];

    for (const format of formats) {
      const parsed = dayjs(dateString, format, true);
      if (parsed.isValid()) {
        return parsed.format(outputFormat);
      }
    }

    return "";
  };
  const dataSourceLichSuUuTien = danhSachLichSuUuTien.map((lsut) => {
    const dataNhanVienFind = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === lsut.maNhanVien
    );
    const dataDoiTuongUuTienFilter = danhSachDoiTuongUuTien.find(
      (dtut) => dtut.maUuTien === lsut.maUuTien
    );
    return {
      maNhanVien: lsut.maNhanVien,
      maUuTien: lsut.maUuTien,
      thoiGianHieuLucBatDau: lsut.thoiGianHieuLucBatDau,
      thoiGianHieuLucKetThuc: lsut.thoiGianHieuLucKetThuc,
      hoTen: dataNhanVienFind?.hoTen || "N/A",
      tenUuTien: dataDoiTuongUuTienFilter?.tenUuTien || "N/A",
      phongBan: dataNhanVienFind?.tenPhongBan || "N/A",
    };
  });
  // Data source mapping cho đối tượng ưu tiên
  const dataSource = danhSachDoiTuongUuTien.map((item) => {
    const phongBan = danhSachPhongBan.find(
      (pb) => pb.maPhongBan === item.maPhongBan
    );
    return {
      maUuTien: item.maUuTien,
      tenUuTien: item.tenUuTien,
      thoiGianBatDauCa: item.thoiGianBatDauCa,
      thoiGianKetThucCa: item.thoiGianKetThucCa,
      thoiGianHieuLuc: item.thoiGianHieuLuc,
      maPhongBan: item.maPhongBan,
      tenPhongBan: phongBan?.tenPhongBan || "Không xác định",
    };
  });
  const datasourcePhongBan = danhSachPhongBan.map((pb) => ({
    maPhongBans: pb.maPhongBan,
    tenPhongBans: pb.tenPhongBan,
  }));

  // Hàm lọc dữ liệu cho tìm kiếm lịch sử
  const getFilteredLichSu = () => {
    if (!searchHistoryText) return dataSourceLichSuUuTien;
    return dataSourceLichSuUuTien.filter(
      (item) =>
        item.maNhanVien
          .toLowerCase()
          .includes(searchHistoryText.toLowerCase()) ||
        item.hoTen.toLowerCase().includes(searchHistoryText.toLowerCase()) ||
        item.tenUuTien.toLowerCase().includes(searchHistoryText.toLowerCase())
    );
  };

  // Xử lý select nhiều dòng cho lịch sử
  const historyRowSelection = {
    selectedRowKeys: selectedHistoryKeys,
    onChange: (selectedRowKeys) => {
      setSelectedHistoryKeys(selectedRowKeys);
    },
  };

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (selectedRowKeys) => {
      setSelectedKeys(selectedRowKeys);
    },
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        const formatedValues = {
          ...values,
          maUuTien: editingId,
          thoiGianBatDauCa: values.thoiGianBatDauCa?.format("HH:mm:ss"),
          thoiGianKetThucCa: values.thoiGianKetThucCa?.format("HH:mm:ss"),
          thoiGianHieuLuc: parseInt(values.thoiGianHieuLuc),
          phongBan: values.phongBan,
        };
        await updateDoiTuongUuTien(formatedValues);
      } else {
        const formatedValues = {
          ...values,
          thoiGianBatDauCa: values.thoiGianBatDauCa?.format("HH:mm:ss"),
          thoiGianKetThucCa: values.thoiGianKetThucCa?.format("HH:mm:ss"),
          thoiGianHieuLuc: parseInt(values.thoiGianHieuLuc),
          phongBan: values.phongBan,
        };
        await createDoiTuongUuTien(formatedValues);
      }
      handleCancel();
    } catch (error) {
      console.error("Lỗi khi lưu đối tượng ưu tiên:", error);
    }
  };

  const onHistoryFinish = async (values) => {
    const formattedValues = {
      ...values,
      thoiGianHieuLucBatDau: values.thoiGianHieuLucBatDau
        ? dayjs(values.thoiGianHieuLucBatDau).format("YYYY-MM-DD")
        : null,
    };

    try {
      if (editingHistoryId) {
        await updateLichSuUuTien(
          editingHistoryId,
          formattedValues.maNhanVien,
          formattedValues
        );
      } else {
        await createLichSuDoiTuongUuTien(formattedValues);
      }
      handleHistoryCancel();
    } catch (error) {
      console.error("Lỗi khi xử lý lịch sử ưu tiên:", error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleAddHistory = () => {
    setEditingHistoryId(null);
    historyForm.resetFields();
    setIsHistoryModalVisible(true);
  };

  const handleEdit = useCallback(
    (record) => {
      setEditingId(record.maUuTien);
      form.setFieldsValue({
        tenUuTien: record.tenUuTien,
        thoiGianBatDauCa: record.thoiGianBatDauCa
          ? dayjs(record.thoiGianBatDauCa, "HH:mm:ss")
          : null,
        thoiGianKetThucCa: record.thoiGianKetThucCa
          ? dayjs(record.thoiGianKetThucCa, "HH:mm:ss")
          : null,
        thoiGianHieuLuc: record.thoiGianHieuLuc,
        maPhongBan: record.maPhongBan,
      });
      setIsModalVisible(true);
    },
    [form]
  );

  const handleEditHistory = useCallback(
    (record) => {
      setEditingHistoryId(record.maUuTien);
      historyForm.setFieldsValue({
        maNhanVien: record.maNhanVien,
        hoTen: record.hoTen,
        maUuTien: record.maUuTien,
        thoiGianHieuLucBatDau: record.thoiGianHieuLucBatDau
          ? dayjs(record.thoiGianHieuLucBatDau, "DD/MM/YYYY")
          : null,
        thoiGianHieuLucKetThuc: record.thoiGianHieuLucKetThuc
          ? dayjs(record.thoiGianHieuLucKetThuc, "DD/MM/YYYY")
          : null,
        lyDo: record.lyDo,
        trangThai: record.trangThai,
      });
      setIsHistoryModalVisible(true);
    },
    [historyForm]
  );

  const handleDelete = async (maUuTien) => {
    try {
      await deleteDoiTuongUuTien(maUuTien);
    } catch (error) {
      console.error("Lỗi khi xóa đối tượng ưu tiên:", error);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await Promise.all(selectedKeys.map((key) => deleteDoiTuongUuTien(key)));
      setSelectedKeys([]);
    } catch (error) {
      console.error("Lỗi khi xóa nhiều đối tượng ưu tiên:", error);
    }
  };

  const handleDeleteHistory = async (maNhanVien, maUuTien) => {
    try {
      await deleteLichSuUuTien(maNhanVien, maUuTien);
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử ưu tiên:", error);
    }
  };

  const handleDeleteMultipleHistory = async () => {
    try {
      await Promise.all(
        selectedHistoryKeys.map((key) => {
          const record = dataSourceLichSuUuTien.find(
            (item) => `${item.maNhanVien}-${item.maUuTien}` === key
          );
          if (record) {
            return deleteLichSuUuTien(record.maNhanVien, record.maUuTien);
          }
          return Promise.resolve();
        })
      );
      setSelectedHistoryKeys([]);
    } catch (error) {
      console.error("Lỗi khi xóa nhiều lịch sử ưu tiên:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleHistoryCancel = () => {
    setIsHistoryModalVisible(false);
    setEditingHistoryId(null);
    historyForm.resetFields();
  };

  const handleChangeNhanVien = (value) => {
    const nhanVien = danhSachNhanVien.find((nv) => nv.maNhanVien === value);
    setPhongBanNhanVien(nhanVien?.maPhongBan || null);
    historyForm.setFieldsValue({ maNhanVien: value });
  };


  useEffect(() => {
    if (editingHistoryId && historyForm.getFieldValue("maNhanVien")) {
      const maNV = historyForm.getFieldValue("maNhanVien");
      const nhanVien = danhSachNhanVien.find((nv) => nv.maNhanVien === maNV);
      setPhongBanNhanVien(nhanVien?.maPhongBan || null);
    }
  }, [editingHistoryId, historyForm, danhSachNhanVien]);

  const { Text } = Typography;

  const columns = [
    {
      title: "Tên đối tượng",
      dataIndex: "tenUuTien",
      key: "tenUuTien",
      width: 150,
      render: (text) => (text ? <Text strong>{text}</Text> : "N/A"),
    },
    {
      title: "Thời gian vào trễ",
      dataIndex: "thoiGianBatDauCa",
      key: "thoiGianBatDauCa",
      width: 150,
      render: (text) => {
        const time = dayjs(text, "HH:mm:ss", true);
        return time.isValid() ? time.format("HH:mm:ss") : "Không hợp lệ";
      },
      sorter: (a, b) => {
        const timeA = dayjs(a.thoiGianBatDauCa, "HH:mm:ss", true);
        const timeB = dayjs(b.thoiGianBatDauCa, "HH:mm:ss", true);
        return timeA.isValid() && timeB.isValid()
          ? timeA.unix() - timeB.unix()
          : 0;
      },
    },
    {
      title: "Thời gian ra sớm",
      dataIndex: "thoiGianKetThucCa",
      key: "thoiGianKetThucCa",
      width: 150,
      render: (text) => {
        const time = dayjs(text, "HH:mm:ss", true);
        return time.isValid() ? time.format("HH:mm:ss") : "Không hợp lệ";
      },
      sorter: (a, b) => {
        const timeA = dayjs(a.thoiGianKetThucCa, "HH:mm:ss", true);
        const timeB = dayjs(b.thoiGianKetThucCa, "HH:mm:ss", true);
        return timeA.isValid() && timeB.isValid()
          ? timeA.unix() - timeB.unix()
          : 0;
      },
    },

    {
      title: "Thời gian hiệu lực (ngày)",
      dataIndex: "thoiGianHieuLuc",
      key: "thoiGianHieuLuc",
      width: 150,
      sorter: (a, b) => a.thoiGianHieuLuc - b.thoiGianHieuLuc,
    },

    {
      title: "Thao tác",
      key: "action",
      width: 120,
      //fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="middle"
          />
          <Popconfirm
            title="Xóa đối tượng ưu tiên"
            description="Bạn có chắc chắn muốn xóa đối tượng ưu tiên này?"
            onConfirm={() => handleDelete(record.maUuTien)}
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

  // Columns cho bảng lịch sử ưu tiên
  const historyColumns = [
    {
      title: "Tên nhân viên",
      dataIndex: "hoTen",
      key: "hoTen",
      width: 150,
      render: (text) => (text ? <Text strong>{text}</Text> : "N/A"),
    },
    {
      title: "Đối tượng ưu tiên",
      dataIndex: "tenUuTien",
      key: "tenUuTien",
      width: 150,
      render: (text) => (text ? <Text strong>{text}</Text> : "N/A"),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "thoiGianHieuLucBatDau",
      key: "thoiGianHieuLucBatDau",
      width: 120,
      render: (date) => formatDate(date, "DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "thoiGianHieuLucKetThuc",
      key: "thoiGianHieuLucKetThuc",
      width: 120,
      render: (date) => formatDate(date, "DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      //fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditHistory(record)}
            size="middle"
          />
          <Popconfirm
            title="Xóa lịch sử ưu tiên"
            description="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() =>
              handleDeleteHistory(record.maNhanVien, record.maUuTien)
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
              icon={<DeleteOutlined style={{ color: "red" }} />}
              size="middle"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tính toán thống kê
  const totalObjects = dataSource.length;
  // Assuming 'status' is a property of your doiTuongUuTien items.
  // If not, you might need to adjust how 'activeObjects' is determined.
  const activeObjects = dataSource.filter(
    (item) => item.status === "Hoạt động"
  ).length;

  // Assuming 'trangThai' is a property of your lichSuUuTien items.
  const activeHistoryCount = dataSourceLichSuUuTien.filter(
    (item) => item.trangThai === "Đang áp dụng"
  ).length;
  const totalHistoryCount = dataSourceLichSuUuTien.length;

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
            Quản Lý Đối Tượng Ưu Tiên
          </Title>
          <Text type="secondary">
            Quản lý và phân loại các đối tượng được ưu tiên trong hệ thống
          </Text>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={6}>
            <Card style={{ height: "100%" }}>
              <Statistic
                title="Tổng Đối Tượng"
                value={totalObjects}
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ height: "100%" }}>
              <Statistic
                title="Đang Hoạt Động"
                value={activeObjects}
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ height: "100%" }}>
              <Statistic
                title="Lịch Sử Đang Áp Dụng"
                value={activeHistoryCount}
                prefix={<HistoryOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ height: "100%" }}>
              <Statistic
                title="Tổng Lịch Sử"
                value={totalHistoryCount}
                prefix={<CalendarOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content with Tabs */}
        <Card>
          <Tabs defaultActiveKey="lich-su">
            <TabPane
              tab={
                <span>
                  <HistoryOutlined style={{ marginRight: 8 }} />
                  Lịch sử ưu tiên
                </span>
              }
              key="lich-su"
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
                    width={50}
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddHistory()}
                  >
                    Thêm Ưu tiên
                  </Button>
                  {selectedHistoryKeys.length > 0 && (
                    <Popconfirm
                      title="Xóa các mục lịch sử ưu tiên"
                      description={`Bạn có chắc chắn muốn xóa ${selectedHistoryKeys.length} mục đã chọn?`}
                      onConfirm={handleDeleteMultipleHistory}
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
                      <Button type="primary" danger icon={<DeleteOutlined />}>
                        Xóa {selectedHistoryKeys.length} mục đã chọn
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
                <Search
                  placeholder="Tìm kiếm theo mã NV, tên, đối tượng ưu tiên..."
                  allowClear
                  style={{ width: 350 }}
                  onChange={(e) => setSearchHistoryText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </div>

              <Table
                columns={historyColumns}
                dataSource={getFilteredLichSu()}
                rowKey={(record) => `${record.maNhanVien}-${record.maUuTien}`}
                rowSelection={historyRowSelection}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                scroll={{ x: 1200 }}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Đối tượng ưu tiên
                </span>
              }
              key="doi-tuong"
            >
              <Row style={{ marginBottom: "16px" }} justify="space-between">
                <Col>
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
                        onClick={handleAdd}
                      >
                        Thêm Đối Tượng Ưu Tiên
                      </Button>
                      {selectedKeys.length > 0 && (
                        <Popconfirm
                          title="Xóa các đối tượng ưu tiên"
                          description={`Bạn có chắc chắn muốn xóa ${selectedKeys.length} mục đã chọn?`}
                          onConfirm={handleDeleteMultiple}
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
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa {selectedKeys.length} mục đã chọn
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                    <Search
                      placeholder="Tìm kiếm theo mã, tên hoặc ghi chú..."
                      allowClear
                      style={{ width: 350 }}
                      onChange={(e) => setSearchText(e.target.value)}
                      prefix={<SearchOutlined />}
                    />
                  </div>
                </Col>
              </Row>

              <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="maUuTien"
                rowSelection={rowSelection}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} đối tượng ưu tiên`,
                }}
                scroll={{ x: 1200 }}
                size="middle"
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Modal Form cho Đối tượng ưu tiên */}
        <Modal
          centered
          title={
            <div
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              <Space wrap style={{ justifyContent: "center" }}>
                <UserOutlined style={{ color: "black" }} />
                {editingId
                  ? "Chỉnh Sửa Đối Tượng Ưu Tiên"
                  : "Thêm Đối Tượng Ưu Tiên"}
              </Space>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ thoiGianHieuLuc: 30 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tên đối tượng ưu tiên"
                  name="tenUuTien"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên đối tượng ưu tiên!",
                    },
                    { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input placeholder="Nhập tên đối tượng ưu tiên" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <Space>
                      <span>Thời gian hiệu lực (Ngày)</span>
                      {soThang && (
                        <Text type="secondary" style={{ fontWeight: "normal" }}>
                          (~ {soThang} tháng)
                        </Text>
                      )}
                    </Space>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thời gian hiệu lực ",
                    },
                  ]}
                  name="thoiGianHieuLuc"
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thời gian vào muộn"
                  name="thoiGianBatDauCa"
                  rules={[
                    {
                      required: true,
                      message:
                        "Vui lòng nhập thời gian đối tượng được vào muộn",
                    },
                  ]}
                >
                  <TimePicker
                    placeholder="Chọn thời gian vào ca muộn"
                    format={"HH:mm:ss"}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thời gian ra sớm"
                  name="thoiGianKetThucCa"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thời gian ra ca sớm",
                    },
                  ]}
                >
                  <TimePicker
                    placeholder="Chọn thời gian ra ca sớm"
                    format={"HH:mm:ss"}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                  }}
                >
                  {editingId ? "Cập Nhật" : "Thêm Mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Form cho Lịch sử ưu tiên */}
        <Modal
          centered
          title={
            <div
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              <Space wrap style={{ justifyContent: "center" }}>
                <HistoryOutlined style={{ color: "black" }} />
                {editingHistoryId
                  ? "Chỉnh Sửa Lịch Sử Ưu Tiên"
                  : "Thêm Lịch Sử Ưu Tiên"}
              </Space>
            </div>
          }
          open={isHistoryModalVisible}
          onCancel={handleHistoryCancel}
          footer={null}
        >
          <Form form={historyForm} layout="vertical" onFinish={onHistoryFinish}>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  label="Họ tên nhân viên"
                  name="maNhanVien"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn nhân viên!",
                    },
                  ]}
                >
                  <Select
                    disabled={editingHistoryId ? true : false}
                    placeholder="Họ tên nhân viên"
                    showSearch
                    optionFilterProp="label"
                    style={{ width: "100%" }}
                    onChange={handleChangeNhanVien}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={danhSachNhanVien.map((nv) => ({
                      value: nv.maNhanVien,
                      label: `${nv.hoTen} - ${nv.cmnd}`,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  label="Đối tượng ưu tiên"
                  name="maUuTien"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn đối tượng ưu tiên!",
                    },
                  ]}
                >
                  <Select
                    disabled={editingHistoryId ? false : false} 
                    placeholder="Chọn đối tượng ưu tiên"
                    showSearch
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    filterOption={(input, option) =>
                      (option?.children ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {danhSachDoiTuongUuTien.map((item) => (
                      <Select.Option key={item.maUuTien} value={item.maUuTien}>
                        {item.tenUuTien}
                      </Select.Option>  
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  label="Ngày bắt đầu"
                  name="thoiGianHieuLucBatDau"
                  rules={[
                    {
                      required: editingHistoryId ? true : false, // Assuming it's always required when adding/editing history.
                      message: "Vui lòng chọn ngày bắt đầu!",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày bắt đầu"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleHistoryCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                  }}
                >
                  {editingHistoryId ? "Cập Nhật" : "Thêm Mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
