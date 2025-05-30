import React, { useEffect, useState } from 'react';
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
  message,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

export const CaLamComponent = () => {
  const [shifts, setShifts] = useState([
    {
      id: 1,
      maCa: 'CA001',
      tenCa: 'Ca Sáng',
      thoiGianBatDau: '08:00',
      thoiGianKetThuc: '17:00',
      gioNghiTruaBatDau: '12:00',
      gioNghiTruaKetThuc: '13:00',
      tongSoGioThucNhan: 8
    },
    {
      id: 2,
      maCa: 'CA002',
      tenCa: 'Ca Chiều',
      thoiGianBatDau: '13:00',
      thoiGianKetThuc: '22:00',
      gioNghiTruaBatDau: '17:00',
      gioNghiTruaKetThuc: '18:00',
      tongSoGioThucNhan: 8
    },
    {
      id: 3,
      maCa: 'CA003',
      tenCa: 'Ca Đêm',
      thoiGianBatDau: '22:00',
      thoiGianKetThuc: '06:00',
      gioNghiTruaBatDau: '02:00',
      gioNghiTruaKetThuc: '03:00',
      tongSoGioThucNhan: 7
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isMobile,setIsMobile] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const checkScreenSize = () => {

    }


  })

  // Tính toán tổng số giờ thực nhận
  const calculateWorkingHours = (start, end, breakStart, breakEnd) => {
    const startTime = dayjs(`2000-01-01 ${start}`);
    let endTime = dayjs(`2000-01-01 ${end}`);
    
    // Xử lý ca đêm (qua ngày)
    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, 'day');
    }
    
    const breakStartTime = dayjs(`2000-01-01 ${breakStart}`);
    let breakEndTime = dayjs(`2000-01-01 ${breakEnd}`);
    
    // Xử lý giờ nghỉ qua ngày
    if (breakEndTime.isBefore(breakStartTime)) {
      breakEndTime = breakEndTime.add(1, 'day');
    }

    const totalHours = endTime.diff(startTime, 'hour', true);
    const breakHours = breakEndTime.diff(breakStartTime, 'hour', true);
    
    return Math.max(0, Math.round((totalHours - breakHours) * 10) / 10);
  };

  const handleSubmit = (values) => {
    const tongSoGioThucNhan = calculateWorkingHours(
      values.thoiGianBatDau.format('HH:mm'),
      values.thoiGianKetThuc.format('HH:mm'),
      values.gioNghiTruaBatDau.format('HH:mm'),
      values.gioNghiTruaKetThuc.format('HH:mm')
    );

    const shiftData = {
      maCa: values.maCa,
      tenCa: values.tenCa,
      thoiGianBatDau: values.thoiGianBatDau.format('HH:mm'),
      thoiGianKetThuc: values.thoiGianKetThuc.format('HH:mm'),
      gioNghiTruaBatDau: values.gioNghiTruaBatDau.format('HH:mm'),
      gioNghiTruaKetThuc: values.gioNghiTruaKetThuc.format('HH:mm'),
      tongSoGioThucNhan
    };

    if (editingShift) {
      setShifts(shifts.map(shift => 
        shift.id === editingShift.id 
          ? { ...shiftData, id: editingShift.id }
          : shift
      ));
      message.success('Cập nhật ca làm thành công!');
    } else {
      const newShift = {
        ...shiftData,
        id: Date.now()
      };
      setShifts([...shifts, newShift]);
      message.success('Thêm ca làm thành công!');
    }

    handleCancel();
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingShift(null);
    setIsModalVisible(false);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    form.setFieldsValue({
      maCa: shift.maCa,
      tenCa: shift.tenCa,
      thoiGianBatDau: dayjs(shift.thoiGianBatDau, 'HH:mm'),
      thoiGianKetThuc: dayjs(shift.thoiGianKetThuc, 'HH:mm'),
      gioNghiTruaBatDau: dayjs(shift.gioNghiTruaBatDau, 'HH:mm'),
      gioNghiTruaKetThuc: dayjs(shift.gioNghiTruaKetThuc, 'HH:mm')
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setShifts(shifts.filter(shift => shift.id !== id));
    message.success('Xóa ca làm thành công!');
  };

  const handleAdd = () => {
    setEditingShift(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Tính toán preview giờ làm trong form
  const [previewHours, setPreviewHours] = useState(0);
  
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    if (values.thoiGianBatDau && values.thoiGianKetThuc && 
        values.gioNghiTruaBatDau && values.gioNghiTruaKetThuc) {
      const hours = calculateWorkingHours(
        values.thoiGianBatDau.format('HH:mm'),
        values.thoiGianKetThuc.format('HH:mm'),
        values.gioNghiTruaBatDau.format('HH:mm'),
        values.gioNghiTruaKetThuc.format('HH:mm')
      );
      setPreviewHours(hours);
    }
  };

  // Cấu hình columns cho Table
  const columns = [
    {
      title: 'Mã Ca',
      dataIndex: 'maCa',
      key: 'maCa',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.maCa.toLowerCase().includes(value.toLowerCase()) ||
        record.tenCa.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Tên Ca',
      dataIndex: 'tenCa',
      key: 'tenCa',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'thoiGianBatDau',
      key: 'thoiGianBatDau',
      width: 120,
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Giờ Kết Thúc',
      dataIndex: 'thoiGianKetThuc',
      key: 'thoiGianKetThuc',
      width: 120,
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Nghỉ Trưa',
      key: 'nghiTrua',
      width: 150,
      render: (_, record) => (
        <Text type="secondary">
          {record.gioNghiTruaBatDau} - {record.gioNghiTruaKetThuc}
        </Text>
      ),
    },
    {
      title: 'Tổng Giờ',
      dataIndex: 'tongSoGioThucNhan',
      key: 'tongSoGioThucNhan',
      width: 100,
      render: (hours) => <Tag color="green">{hours}h</Tag>,
      sorter: (a, b) => a.tongSoGioThucNhan - b.tongSoGioThucNhan,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Xóa ca làm"
            description="Bạn có chắc chắn muốn xóa ca làm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tính toán thống kê
  const totalShifts = shifts.length;
  const averageHours = totalShifts > 0 
    ? (shifts.reduce((acc, shift) => acc + shift.tongSoGioThucNhan, 0) / totalShifts).toFixed(1)
    : 0;
  const totalHours = shifts.reduce((acc, shift) => acc + shift.tongSoGioThucNhan, 0);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{  margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
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
              >
                Thêm Ca Làm
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
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

        {/* Search and Table */}
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
            columns={columns}
            dataSource={shifts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} ca làm`,
            }}
            scroll={{ x: 800 }}
            size="middle"
          />
        </Card>

        {/* Modal Form */}
        <Modal
          title={
            <Space>
              <ClockCircleOutlined />
              {editingShift ? 'Chỉnh Sửa Ca Làm' : 'Thêm Ca Làm Mới'}
            </Space>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
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
                  name="thoiGianBatDau"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Chọn giờ bắt đầu"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thời Gian Kết Thúc"
                  name="thoiGianKetThuc"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                >
                  <TimePicker
                    format="HH:mm"
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
                  name="gioNghiTruaBatDau"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ nghỉ trưa!' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Chọn giờ bắt đầu nghỉ"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Nghỉ Trưa Kết Thúc"
                  name="gioNghiTruaKetThuc"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc nghỉ!' }]}
                >
                  <TimePicker
                    format="HH:mm"
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
                  {editingShift ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </div>
  );
};
