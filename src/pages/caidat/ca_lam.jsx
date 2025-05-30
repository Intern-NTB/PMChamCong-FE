import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, TimePicker, Space, Card, Statistic, Row, Col, Typography, Tag, Popconfirm, message, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TeamOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCaLam } from '../../component/hooks/useCaLam';

const { Title, Text } = Typography;
const { Search } = Input;

export const CaLamComponent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [previewHours, setPreviewHours] = useState(0);

  const { danhSachCaLam, loadingCaLam, createCaLam, updateCaLam, deleteCaLam, getAllCaLam } = useCaLam();

  // Load data on component mount
  useEffect(() => {
    getAllCaLam();
  }, []);

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

  // Data source mapping
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
    console.log(`values : ${JSON.stringify(values)}`)
    try {
      const shiftData = {
        tenCa: values.tenCa,
        gioBatDau: values.gioBatDau && dayjs(values.gioBatDau).isValid()
          ? dayjs(values.gioBatDau).format('HH:mm')
          : null,
        gioKetThuc: values.gioKetThuc && dayjs(values.gioKetThuc).isValid()
          ? dayjs(values.gioKetThuc).format('HH:mm')
          : null,
        gioNghiBatDau: values.gioNghiBatDau && dayjs(values.gioNghiBatDau).isValid()
          ? dayjs(values.gioNghiBatDau).format('HH:mm')
          : null,
        gioNghiKetThuc: values.gioNghiKetThuc && dayjs(values.gioNghiKetThuc).isValid()
          ? dayjs(values.gioNghiKetThuc).format('HH:mm')
          : null,
      };

      if (currentRecord) {
        shiftData.maCa = currentRecord.maCa;
        await updateCaLam(currentRecord.maCa, shiftData);
        message.success('Cập nhật ca làm thành công!');
      } else {
        await createCaLam(shiftData);
        message.success('Thêm ca làm thành công!');
      }
      handleCancel();
    } catch (err) {
      console.error('Error saving shift:', err);
      message.error('Đã xảy ra lỗi khi lưu ca làm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    // form.resetFields();
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
      gioNghiBatDau: record.gioNghiBatDau === 'Invalid Date' ? null : dayjs(record.gioNghiBatDau, 'HH:mm:ss'),
      gioNghiKetThuc: record.gioNghiKetThuc === 'Invalid Date' ? null : dayjs(record.gioNghiKetThuc, 'HH:mm:ss')
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (maCa) => {
    console.log(maCa)
    try {
      await deleteCaLam(maCa);
      message.success('Xóa ca làm thành công!');
    } catch (error) {
      message.error('Đã xảy ra lỗi khi xóa ca làm');
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setPreviewHours(0);
    setIsModalVisible(true);
  };

  // Tính toán preview giờ làm trong form
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    if (values.gioBatDau && values.gioKetThuc &&
      values.gioNghiBatDau && values.gioNghiKetThuc) {
      const hours = calculateWorkingHours(
        values.gioBatDau.format('HH:mm:ss'),
        values.gioKetThuc.format('HH:mm:ss'),
        values.gioNghiBatDau.format('HH:mm:ss'),
        values.gioNghiKetThuc.format('HH:mm:ss')
      );
      setPreviewHours(hours);
    }
  };

  const columns = [
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
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'gioBatDau',
      key: 'gioBatDau',
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
      dataIndex: 'gioKetThuc',
      key: 'gioKetThuc',
      width: 120,
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Giờ Nghỉ',
      key: 'gioNghi',
      width: 150,
      render: (_, record) => (
        <Text type="secondary">
          {record.gioNghiBatDau} - {record.gioNghiKetThuc}
        </Text>
      ),
    },
    {
      title: 'Tổng Giờ',
      dataIndex: 'soGioLamViec',
      key: 'soGioLamViec',
      width: 100,
      render: (hours) => <Tag color="green">{hours}h</Tag>,
      sorter: (a, b) => a.soGioLamViec - b.soGioLamViec,
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
            onConfirm={() => handleDelete(record.maCa)}
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
  const totalShifts = dataSource.length;
  const averageHours = totalShifts > 0
    ? (dataSource.reduce((acc, shift) => acc + (shift.soGioLamViec || 0), 0) / totalShifts).toFixed(1)
    : 0;
  const totalHours = dataSource.reduce((acc, shift) => acc + (shift.soGioLamViec || 0), 0);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ margin: '0 auto' }}>
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
            scroll={{ x: 800 }}
            size="middle"
          />
        </Card>

        {/* Modal Form */}
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
      </div>
    </div>
  );
};