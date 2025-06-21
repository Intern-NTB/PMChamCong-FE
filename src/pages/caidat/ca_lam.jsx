import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, TimePicker, Space, Card, Statistic, Row, Col, Typography, Tag, Popconfirm, Divider, Select } from 'antd'; // Thêm Select nếu cần cho ngày trong tuần
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TeamOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'; 
import { useCaLam } from '../../component/hooks/useCaLam';
import { useAppNotification } from "../../component/ui/notification";

dayjs.extend(customParseFormat); 

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select; 

export default function CaLamComponent() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [previewHours, setPreviewHours] = useState(0);
  const apiNotification = useAppNotification();
  const { danhSachCaLam, loadingCaLam, createCaLam, updateCaLam, deleteCaLam, getAllCaLam } = useCaLam();

  useEffect(() => {
    getAllCaLam();
  }, []);

  const calculateWorkingHours = (start, end, breakStart, breakEnd) => {
    const startTime = dayjs(start, 'HH:mm');
    let endTime = dayjs(end, 'HH:mm');

    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, 'day');
    }

    const breakStartTime = breakStart ? dayjs(breakStart, 'HH:mm') : null;
    let breakEndTime = breakEnd ? dayjs(breakEnd, 'HH:mm') : null;

    if (breakStartTime && breakEndTime && breakEndTime.isBefore(breakStartTime)) {
      breakEndTime = breakEndTime.add(1, 'day');
    }

    const totalHours = endTime.diff(startTime, 'minute', true) / 60; 
    let breakHours = 0;
    if (breakStartTime && breakEndTime) {
      breakHours = breakEndTime.diff(breakStartTime, 'minute', true) / 60;
    }

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
    ngayTrongTuan: cl.ngayTrongTuan,
    coLamViec: cl.coLamViec,
    originalData: cl
  })) : [];

  const handleSubmit = async (values) => {
    console.log(`values : ${JSON.stringify(values)}`);
    try {
      const shiftData = {
        tenCa: values.tenCa,
        gioBatDau: values.gioBatDau ? dayjs(values.gioBatDau).format('HH:mm') : null,
        gioKetThuc: values.gioKetThuc ? dayjs(values.gioKetThuc).format('HH:mm') : null,
        gioNghiBatDau: values.gioNghiBatDau ? dayjs(values.gioNghiBatDau).format('HH:mm') : null,
        gioNghiKetThuc: values.gioNghiKetThuc ? dayjs(values.gioNghiKetThuc).format('HH:mm') : null,
        ngayTrongTuan: values.ngayTrongTuan || null, 
        coLamViec: values.coLamViec === true ? 1 : 0, 
      };

      if (shiftData.gioBatDau && shiftData.gioKetThuc) {
        shiftData.soGioLamViec = calculateWorkingHours(
          shiftData.gioBatDau,
          shiftData.gioKetThuc,
          shiftData.gioNghiBatDau,
          shiftData.gioNghiKetThuc
        );
      } else {
        shiftData.soGioLamViec = 0;
      }

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
      gioBatDau: record.gioBatDau ? dayjs(record.gioBatDau, 'HH:mm') : null,
      gioKetThuc: record.gioKetThuc ? dayjs(record.gioKetThuc, 'HH:mm') : null,
      gioNghiBatDau: record.gioNghiBatDau ? dayjs(record.gioNghiBatDau, 'HH:mm') : null,
      gioNghiKetThuc: record.gioNghiKetThuc ? dayjs(record.gioNghiKetThuc, 'HH:mm') : null,
      ngayTrongTuan: record.ngayTrongTuan,
      coLamViec: record.coLamViec === 1 ? true : false,
    });
    const values = form.getFieldsValue();
    if (values.gioBatDau && values.gioKetThuc) {
      const hours = calculateWorkingHours(
        values.gioBatDau.format('HH:mm'),
        values.gioKetThuc.format('HH:mm'),
        values.gioNghiBatDau ? values.gioNghiBatDau.format('HH:mm') : null,
        values.gioNghiKetThuc ? values.gioNghiKetThuc.format('HH:mm') : null
      );
      setPreviewHours(hours);
    } else {
      setPreviewHours(0);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (maCa) => {
    console.log("Attempting to delete maCa:", maCa); 
    try {
      await deleteCaLam(maCa);
      apiNotification.success('Xóa ca làm thành công!');
    } catch (error) {
      console.error('Error deleting shift:', error); 
      apiNotification.error('Đã xảy ra lỗi khi xóa ca làm: ' + (error.response?.data?.message || error.message));
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
      const hours = calculateWorkingHours(
        values.gioBatDau.format('HH:mm'),
        values.gioKetThuc.format('HH:mm'),
        values.gioNghiBatDau ? values.gioNghiBatDau.format('HH:mm') : null,
        values.gioNghiKetThuc ? values.gioNghiKetThuc.format('HH:mm') : null
      );
      setPreviewHours(hours);
    } else {
      setPreviewHours(0);
    }
  };

  const daysOfWeekOptions = [
    { value: 1, label: 'Thứ Hai' },
    { value: 2, label: 'Thứ Ba' },
    { value: 3, label: 'Thứ Tư' },
    { value: 4, label: 'Thứ Năm' },
    { value: 5, label: 'Thứ Sáu' },
    { value: 6, label: 'Thứ Bảy' },
    { value: 7, label: 'Chủ Nhật' },
  ];

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
      sorter: (a, b) => a.maCa - b.maCa, 
    },
    {
      title: 'Tên Ca', 
      dataIndex: 'tenCa',
      key: 'tenCa',
      width: 150,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => record.tenCa?.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.tenCa.localeCompare(b.tenCa), 
    },
    {
      title: 'Ngày Trong Tuần',
      dataIndex: 'ngayTrongTuan',
      key: 'ngayTrongTuan',
      width: 150,
      sorter: (a, b) => a.ngayTrongTuan - b.ngayTrongTuan,
      render: (text) => {
        const day = daysOfWeekOptions.find(d => d.value === text);
        return day ? <Tag color="geekblue">{day.label}</Tag> : <Text type="secondary">Không xác định</Text>;
      },
      filters: daysOfWeekOptions.map(day => ({ text: day.label, value: day.value })), // Thêm filter cho Ngày Trong Tuần
      onFilter: (value, record) => record.ngayTrongTuan === value,
    },
    {
      title: 'Có Làm Việc',
      dataIndex: 'coLamViec',
      key: 'coLamViec',
      width: 120,
      render: (text) => (
        text === 1 ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>
      ),
      filters: [
        { text: 'Có', value: 1 },
        { text: 'Không', value: 0 },
      ],
      onFilter: (value, record) => record.coLamViec === value,
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'gioBatDau',
      key: 'gioBatDau',
      width: 120,
      render: (text) => text ? <Tag color="green">{dayjs(text, 'HH:mm').format('HH:mm')}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Giờ Kết Thúc',
      dataIndex: 'gioKetThuc',
      key: 'gioKetThuc',
      width: 120,
      render: (text) => text ? <Tag color="red">{dayjs(text, 'HH:mm').format('HH:mm')}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Giờ Nghỉ Trưa Bắt Đầu',
      dataIndex: 'gioNghiBatDau',
      key: 'gioNghiBatDau',
      width: 170,
      render: (text) => text ? <Tag color="orange">{dayjs(text, 'HH:mm').format('HH:mm')}</Tag> : <Text type="secondary">Không có</Text>,
    },
    {
      title: 'Giờ Nghỉ Trưa Kết Thúc',
      dataIndex: 'gioNghiKetThuc',
      key: 'gioNghiKetThuc',
      width: 170,
      render: (text) => text ? <Tag color="orange">{dayjs(text, 'HH:mm').format('HH:mm')}</Tag> : <Text type="secondary">Không có</Text>,
    },
    {
      title: 'Số Giờ Làm Việc',
      dataIndex: 'soGioLamViec',
      key: 'soGioLamViec',
      width: 150,
      render: (text) => <Statistic value={text} suffix="h" precision={2} valueStyle={{ fontSize: '16px' }} />,
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
            size="middle"
          />
          <Popconfirm
            title="Xóa ca làm"
            description="Bạn có chắc chắn muốn xóa ca làm này?"
            onConfirm={() => handleDelete(record.maCa)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined style={{ color: 'red' }} />}
              size="middle"
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
                  backgroundImage: 'linear-gradient(45deg, #667eea, #764ba2)', // Sử dụng backgroundImage
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
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
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>

        <Modal
          centered
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
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Ngày Trong Tuần"
                  name="ngayTrongTuan"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày trong tuần!' }]}
                >
                  <Select
                    placeholder="Chọn ngày trong tuần"
                    allowClear
                  >
                    {daysOfWeekOptions.map(day => (
                      <Option key={day.value} value={day.value}>{day.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Bắt Đầu"
                  name="gioBatDau"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    className="w-full"
                    placeholder="Chọn giờ bắt đầu"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Kết Thúc"
                  name="gioKetThuc"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    className="w-full"
                    placeholder="Chọn giờ kết thúc"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Nghỉ Bắt Đầu (Tùy chọn)"
                  name="gioNghiBatDau"
                >
                  <TimePicker
                    format="HH:mm"
                    className="w-full"
                    placeholder="Chọn giờ nghỉ bắt đầu"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ Nghỉ Kết Thúc (Tùy chọn)"
                  name="gioNghiKetThuc"
                >
                  <TimePicker
                    format="HH:mm"
                    className="w-full"
                    placeholder="Chọn giờ nghỉ kết thúc"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Có Làm Việc"
                  name="coLamViec"
                  valuePropName="checked" 
                >
                  <Select
                    placeholder="Chọn trạng thái làm việc"
                    allowClear
                  >
                    <Option value={true}>Có</Option>
                    <Option value={false}>Không</Option>
                  </Select>
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
    </div >
  );
};