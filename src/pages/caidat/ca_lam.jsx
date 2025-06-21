import React, { useEffect, useState, useCallback } from 'react'; 
import { Table, Button, Modal, Form, Input, TimePicker, Space, Card, Statistic, Row, Col, Typography, Tag, Popconfirm, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TeamOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCaLam } from '../../component/hooks/useCaLam';
import { useAppNotification } from "../../component/ui/notification";
import ModalChiTietCaLam from './modal_chitiet_calam'; 

const { Title, Text } = Typography;
const { Search } = Input;

const fetchShiftDetailsByMaCa = async (maCa) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const allDetails = {
    '1': [
      { NgayTrongTuan: 1, CoLamViec: 0, GioBatDau: null, GioKetThuc: null, GioNghiTruaBatDau: null, GioNghiTruaKetThuc: null, SoGioLamViec: null },
      { NgayTrongTuan: 2, CoLamViec: 1, GioBatDau: "08:00:00", GioKetThuc: "17:00:00", GioNghiTruaBatDau: "12:00:00", GioNghiTruaKetThuc: "13:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 3, CoLamViec: 1, GioBatDau: "08:00:00", GioKetThuc: "17:00:00", GioNghiTruaBatDau: "12:00:00", GioNghiTruaKetThuc: "13:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 4, CoLamViec: 1, GioBatDau: "08:00:00", GioKetThuc: "17:00:00", GioNghiTruaBatDau: "12:00:00", GioNghiTruaKetThuc: "13:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 5, CoLamViec: 1, GioBatDau: "08:00:00", GioKetThuc: "17:00:00", GioNghiTruaBatDau: "12:00:00", GioNghiTruaKetThuc: "13:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 6, CoLamViec: 1, GioBatDau: "09:00:00", GioKetThuc: "18:00:00", GioNghiTruaBatDau: "13:00:00", GioNghiTruaKetThuc: "14:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 7, CoLamViec: 1, GioBatDau: "08:00:00", GioKetThuc: "17:00:00", GioNghiTruaBatDau: "12:00:00", GioNghiTruaKetThuc: "13:00:00", SoGioLamViec: 8.000000 },
    ],
    '2': [
      { NgayTrongTuan: 1, CoLamViec: 0, GioBatDau: null, GioKetThuc: null, GioNghiTruaBatDau: null, GioNghiTruaKetThuc: null, SoGioLamViec: null },
      { NgayTrongTuan: 2, CoLamViec: 1, GioBatDau: "13:00:00", GioKetThuc: "22:00:00", GioNghiTruaBatDau: "17:00:00", GioNghiTruaKetThuc: "18:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 3, CoLamViec: 1, GioBatDau: "13:00:00", GioKetThuc: "22:00:00", GioNghiTruaBatDau: "17:00:00", GioNghiTruaKetThuc: "18:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 4, CoLamViec: 1, GioBatDau: "13:00:00", GioKetThuc: "22:00:00", GioNghiTruaBatDau: "17:00:00", GioNghiTruaKetThuc: "18:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 5, CoLamViec: 1, GioBatDau: "13:00:00", GioKetThuc: "22:00:00", GioNghiTruaBatDau: "17:00:00", GioNghiTruaKetThuc: "18:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 6, CoLamViec: 1, GioBatDau: "13:00:00", GioKetThuc: "22:00:00", GioNghiTruaBatDau: "17:00:00", GioNghiTruaKetThuc: "18:00:00", SoGioLamViec: 8.000000 },
      { NgayTrongTuan: 7, CoLamViec: 0, GioBatDau: null, GioKetThuc: null, GioNghiTruaBatDau: null, GioNghiTruaKetThuc: null, SoGioLamViec: null },
    ],
    '3': [
      { NgayTrongTuan: 1, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
      { NgayTrongTuan: 2, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
      { NgayTrongTuan: 3, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
      { NgayTrongTuan: 4, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
      { NgayTrongTuan: 5, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
      { NgayTrongTuan: 6, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
      { NgayTrongTuan: 7, CoLamViec: 1, GioBatDau: "22:00:00", GioKetThuc: "06:00:00", GioNghiTruaBatDau: "02:00:00", GioNghiTruaKetThuc: "03:00:00", SoGioLamViec: 7.000000 },
    ],
  };
  return allDetails[maCa] || [];
};

export default function CaLamComponent() {
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); 
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null); 
  const [selectedShiftForDetail, setSelectedShiftForDetail] = useState(null); 
  const [shiftDetailsByDay, setShiftDetailsByDay] = useState([]); 
  const [loadingDetails, setLoadingDetails] = useState(false); 
  const [previewHours, setPreviewHours] = useState(0);
  const apiNotification = useAppNotification();
  const { danhSachCaLam, loadingCaLam, createCaLam, updateCaLam, deleteCaLam, getAllCaLam } = useCaLam();

  const [tableScrollY, setTableScrollY] = useState(0);

  useEffect(() => {
    getAllCaLam();

    const calculateTableHeight = () => {
      const headerFooterOffset = 120 + 120 + 60 + 64 + 50;
      setTableScrollY(window.innerHeight - headerFooterOffset);
    };

    calculateTableHeight();
    window.addEventListener('resize', calculateTableHeight);

    return () => {
      window.removeEventListener('resize', calculateTableHeight);
    };
  }, []);

  const calculateWorkingHours = (start, end, breakStart, breakEnd) => {
    const startTime = dayjs(`2000-01-01 ${start}`);
    let endTime = dayjs(`2000-01-01 ${end}`);

    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, 'day');
    }

    const breakStartTime = breakStart ? dayjs(`2000-01-01 ${breakStart}`) : null;
    let breakEndTime = breakEnd ? dayjs(`2000-01-01 ${breakEnd}`) : null;

    if (breakStartTime && breakEndTime && breakEndTime.isBefore(breakStartTime)) {
      breakEndTime = breakEndTime.add(1, 'day');
    }

    const totalHours = endTime.diff(startTime, 'hour', true);
    const breakHours = (breakStartTime && breakEndTime) ? breakEndTime.diff(breakStartTime, 'hour', true) : 0;


    return Math.max(0, Math.round((totalHours - breakHours) * 10) / 10);
  };

  const dataSource = Array.isArray(danhSachCaLam) ? danhSachCaLam.map(cl => ({
    key: cl.maCa,
    maCa: cl.maCa,
    tenCa: cl.tenCa,
    gioBatDau: cl.gioBatDau,
    gioKetThuc: cl.gioKetThuc,
    gioNghiBatDau: cl.gioNghiBatDau,
    gioNghiKetThuc: cl.gioNghiKetThuc,
    soGioLamViec: cl.soGioLamViec,
    originalData: cl
  })) : [];

  const handleSubmit = async (values) => {
    try {
      const shiftData = {
        tenCa: values.tenCa,
        gioBatDau: values.gioBatDau && dayjs(values.gioBatDau).isValid()
          ? dayjs(values.gioBatDau).format('HH:mm:ss')
          : null,
        gioKetThuc: values.gioKetThuc && dayjs(values.gioKetThuc).isValid()
          ? dayjs(values.gioKetThuc).format('HH:mm:ss')
          : null,
        gioNghiBatDau: values.gioNghiBatDau && dayjs(values.gioNghiBatDau).isValid()
          ? dayjs(values.gioNghiBatDau).format('HH:mm:ss')
          : null,
        gioNghiKetThuc: values.gioNghiKetThuc && dayjs(values.gioNghiKetThuc).isValid()
          ? dayjs(values.gioNghiKetThuc).format('HH:mm:ss')
          : null,
      };

      if (currentRecord) {
        shiftData.maCa = currentRecord.maCa;
        await updateCaLam(currentRecord.maCa, shiftData);
        apiNotification.success('Cập nhật ca làm thành công!');
      } else {
        await createCaLam(shiftData);
        apiNotification.success('Thêm ca làm thành công!');
      }
      handleCancel();
    } catch (err) {
      console.error('Error saving shift:', err);
      apiNotification.error('Đã xảy ra lỗi khi lưu ca làm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentRecord(null);
    setIsModalVisible(false);
    setPreviewHours(0);
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      tenCa: record.tenCa,
      gioBatDau: dayjs(record.gioBatDau, 'HH:mm:ss'),
      gioKetThuc: dayjs(record.gioKetThuc, 'HH:mm:ss'),
      gioNghiBatDau: record.gioNghiBatDau ? dayjs(record.gioNghiBatDau, 'HH:mm:ss') : null,
      gioNghiKetThuc: record.gioNghiKetThuc ? dayjs(record.gioNghiKetThuc, 'HH:mm:ss') : null
    });
    if (record.gioBatDau && record.gioKetThuc) {
      setPreviewHours(calculateWorkingHours(record.gioBatDau, record.gioKetThuc, record.gioNghiBatDau, record.gioNghiKetThuc));
    } else {
      setPreviewHours(0);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (maCa) => {
    try {
      await deleteCaLam(maCa);
      apiNotification.success('Xóa ca làm thành công!');
    } catch (err) {
      apiNotification.error('Đã xảy ra lỗi khi xóa ca làm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setPreviewHours(0);
    setIsModalVisible(true);
  };

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    if (values.gioBatDau && values.gioKetThuc) {
      const breakStart = values.gioNghiBatDau ? values.gioNghiBatDau.format('HH:mm:ss') : null;
      const breakEnd = values.gioNghiKetThuc ? values.gioNghiKetThuc.format('HH:mm:ss') : null;

      const hours = calculateWorkingHours(
        values.gioBatDau.format('HH:mm:ss'),
        values.gioKetThuc.format('HH:mm:ss'),
        breakStart,
        breakEnd
      );
      setPreviewHours(hours);
    } else {
      setPreviewHours(0);
    }
  };

  const handleRowClick = useCallback(async (record) => {
    setSelectedShiftForDetail(record);
    setLoadingDetails(true);
    setIsDetailModalVisible(true);
    try {
      const details = await fetchShiftDetailsByMaCa(record.maCa); 
      setShiftDetailsByDay(details);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết ca làm:", error);
      apiNotification.error("Lỗi", "Không thể tải chi tiết ca làm.");
      setShiftDetailsByDay([]); 
    } finally {
      setLoadingDetails(false);
    }
  }, [apiNotification]);

  const mainTableColumns = [
    {
      title: 'Mã Ca',
      dataIndex: 'maCa',
      key: 'maCa',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.maCa?.toString().toLowerCase().includes(value.toLowerCase()) ||
        record.tenCa?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Tên Ca',
      dataIndex: 'tenCa',
      key: 'tenCa',
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {/* Removed EyeOutlined button as per request */}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
                e.stopPropagation(); 
                handleEdit(record);
            }}
            size="middle"
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa ca làm"
            description="Bạn có chắc chắn muốn xóa ca làm này?"
            onConfirm={(e) => {
                e.stopPropagation(); 
                handleDelete(record.maCa);
            }}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined style={{ color: 'red' }} />}
              size="middle"
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalShifts = dataSource.length;
  const averageHours = totalShifts > 0
    ? (dataSource.reduce((acc, shift) => acc + (shift.soGioLamViec || 0), 0) / totalShifts).toFixed(1)
    : 0;
  const totalHours = dataSource.reduce((acc, shift) => acc + (shift.soGioLamViec || 0), 0);

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div style={{ margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title
                level={2}
                style={{
                  marginBottom: 8,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}>
                Quản Lý Ca Làm Việc
              </Title>
              <Text type="secondary">Quản lý và theo dõi các ca làm việc trong công ty</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleAdd}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)'
                }}
              >
                Thêm Ca Làm
              </Button>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng Ca Làm"
                value={totalShifts}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Trung Bình Giờ/Ca"
                value={averageHours}
                suffix="h"
                prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng Giờ Làm"
                value={totalHours}
                suffix="h"
                prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Row style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm theo mã ca hoặc tên ca..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchText}
                onChange={(e) => !e.target.value && setSearchText('')}
              />
            </Col>
          </Row>

          <Table
            columns={mainTableColumns}
            dataSource={dataSource}
            rowKey="maCa"
            loading={loadingCaLam}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} ca làm`,
            }}
            scroll={{ x: 500, y: tableScrollY }}
            size="middle"
            onRow={(record) => {
                return {
                    onClick: () => handleRowClick(record), 
                };
            }}
          />
        </Card>

        {/* Modal for Adding/Editing Shift */}
        <Modal
          centered
          size='large'
          title={
            <Space>
              <ClockCircleOutlined />
              {currentRecord ? 'Chỉnh Sửa Ca Làm' : 'Thêm Ca Làm'}
            </Space>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tên Ca"
                  name="tenCa"
                  rules={[{ required: true, message: 'Vui lòng nhập tên ca!' }]}
                >
                  <Input placeholder="Nhập tên ca (VD: Ca Sáng)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thời Gian Bắt Đầu"
                  name="gioBatDau"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                >
                  <TimePicker
                    format="HH:mm:ss"
                    placeholder="Chọn giờ bắt đầu"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thời Gian Kết Thúc"
                  name="gioKetThuc"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                >
                  <TimePicker
                    format="HH:mm:ss"
                    placeholder="Chọn giờ kết thúc"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Nghỉ Trưa Bắt Đầu"
                  name="gioNghiBatDau"
                >
                  <TimePicker
                    format="HH:mm:ss"
                    placeholder="Chọn giờ bắt đầu nghỉ"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Nghỉ Trưa Kết Thúc"
                  name="gioNghiKetThuc"
                >
                  <TimePicker
                    format="HH:mm:ss"
                    placeholder="Chọn giờ kết thúc nghỉ"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {previewHours > 0 && (
              <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Text strong style={{ color: '#52c41a' }}>
                  Tổng số giờ thực nhận: {previewHours} giờ
                </Text>
              </Card>
            )}

            <Divider />

            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={handleCancel}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  {currentRecord ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Modal for displaying Shift Details (now imported) */}
        <ModalChiTietCaLam
          isVisible={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          shiftData={selectedShiftForDetail}
          shiftDetailsByDay={shiftDetailsByDay}
          loadingDetails={loadingDetails}
        />
      </div>
    </div >
  );
}