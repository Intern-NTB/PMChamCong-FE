import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Checkbox,
  Tooltip,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './nghi_phep.css';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

export default function NghiPhep() {
  // dữ liệu tạm 
  const [nghiPhepList, setNghiPhepList] = useState([
    {
      id: 1,
      maNhanVien: 'NV001',
      ngayBatDau: '2023-05-01',
      ngayKetThuc: '2023-05-03',
      lyDo: 'Ốm',
      tinhLuong: true,
      coPhep: true,
    },
    {
      id: 2,
      maNhanVien: 'NV002',
      ngayBatDau: '2023-05-02',
      ngayKetThuc: '2023-05-02',
      lyDo: 'Nghỉ phép',
      tinhLuong: false,
      coPhep: false,
    },
  ]);

  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [form] = Form.useForm();

  // hàm thống kê
  const statistics = useMemo(() => {
    if (!nghiPhepList.length) return { total: 0, tinhLuong: 0, coPhep: 0 };
    const filtered = nghiPhepList.filter(item => {
      if (!dateRange[0] || !dateRange[1]) return true;
      const start = dayjs(item.ngayBatDau);
      const end = dayjs(item.ngayKetThuc);
      return start.isBefore(dateRange[1].endOf('day')) && end.isAfter(dateRange[0].startOf('day'));
    });
    return {
      total: filtered.length,
      tinhLuong: filtered.filter(i => i.tinhLuong).length,
      coPhep: filtered.filter(i => i.coPhep).length,
    };
  }, [nghiPhepList, dateRange]);

//
  const filteredList = useMemo(() => {
    return nghiPhepList.filter(item => {
      const matchesSearch = item.maNhanVien.toLowerCase().includes(searchValue.toLowerCase());
      if (!matchesSearch) return false;
      if (!dateRange[0] || !dateRange[1]) return true;
      const start = dayjs(item.ngayBatDau);
      const end = dayjs(item.ngayKetThuc);
      return start.isBefore(dateRange[1].endOf('day')) && end.isAfter(dateRange[0].startOf('day'));
    });
  }, [nghiPhepList, searchValue, dateRange]);

  //thêm/sửa
  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = record => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      ngayBatDau: dayjs(record.ngayBatDau),
      ngayKetThuc: dayjs(record.ngayKetThuc),
    });
    setIsModalVisible(true);
  };

  // form 
  const handleOk = () => {
    form.validateFields().then(values => {
      const dataToSave = {
        ...values,
        ngayBatDau: values.ngayBatDau.format('YYYY-MM-DD'),
        ngayKetThuc: values.ngayKetThuc.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        confirm({
          title: 'Xác nhận cập nhật',
          icon: <ExclamationCircleOutlined />,
          content: 'Bạn có chắc chắn muốn cập nhật bản ghi nghỉ phép này?',
          onOk() {
            setNghiPhepList(prev =>
              prev.map(item => (item.id === editingRecord.id ? { ...item, ...dataToSave } : item))
            );
            message.success('Cập nhật thành công!');
            setIsModalVisible(false);
          },
          onCancel() {},
        });
      } else {
        confirm({
          title: 'Xác nhận thêm mới',
          icon: <ExclamationCircleOutlined />,
          content: 'Bạn có chắc chắn muốn thêm bản ghi nghỉ phép này?',
          onOk() {
            setNghiPhepList(prev => [
              ...prev,
              { id: Date.now(), ...dataToSave }
            ]);
            message.success('Thêm mới thành công!');
            setIsModalVisible(false);
          },
          onCancel() {},
        });
      }
    });
  };

  // form xacs nhận 
  const handleDelete = record => {
    confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa bản ghi nghỉ phép của NV ${record.maNhanVien}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setNghiPhepList(prev => prev.filter(item => item.id !== record.id));
        message.success('Xóa thành công!');
      },
      onCancel() {},
    });
  };

  const columns = [
    { title: 'STT', render: (_, __, idx) => idx + 1, width: 60, align: 'center' },
    { title: 'Mã nhân viên', dataIndex: 'maNhanVien', key: 'maNhanVien', width: 120 },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngayBatDau',
      key: 'ngayBatDau',
      width: 120,
      render: text => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngayKetThuc',
      key: 'ngayKetThuc',
      width: 120,
      render: text => dayjs(text).format('DD/MM/YYYY')
    },
    { title: 'Lý do nghỉ', dataIndex: 'lyDo', key: 'lyDo', width: 180 },
    {
      title: 'Tính lương',
      dataIndex: 'tinhLuong',
      key: 'tinhLuong',
      width: 100,
      align: 'center',
      render: value => value ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : null
    },
    {
      title: 'Có phép',
      dataIndex: 'coPhep',
      key: 'coPhep',
      width: 100,
      align: 'center',
      render: value => value ? <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} /> : null
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-column" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={16} style={{ marginBottom: 20, textAlign: 'center' }}>
        <Col xs={24} sm={8}>
          <Statistic
            title="Nhân viên nghỉ"
            value={statistics.total}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Tính lương"
            value={statistics.tinhLuong}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Có phép"
            value={statistics.coPhep}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#108ee9' }}
          />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20, alignItems: 'center' }}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="Tìm mã nhân viên..."
            allowClear
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            enterButton
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <RangePicker
            style={{ width: '320px' }}
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            allowClear
          />
        </Col>
        <Col xs={24} sm={24} md={4}>
          <Button type="primary" icon={<PlusOutlined />} block onClick={showAddModal}>
            Tạo đơn xin nghỉ
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredList}
        rowKey="id"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingRecord ? 'Sửa đơn nghỉ phép' : 'Tạo đơn xin nghỉ'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tinhLuong: false,
            coPhep: false,
          }}
        >
          <Form.Item
            name="maNhanVien"
            label="Mã nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="ngayKetThuc"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="lyDo"
            label="Lý do nghỉ"
            rules={[{ required: true, message: 'Vui lòng nhập lý do nghỉ!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="tinhLuong" valuePropName="checked">
            <Checkbox>Tính lương</Checkbox>
          </Form.Item>
          <Form.Item name="coPhep" valuePropName="checked">
            <Checkbox>Có phép</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}