import React from 'react';
import { Modal, Space, Typography, Tag, Table } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ModalChiTietCaLam = ({ isVisible, onCancel, shiftData, shiftDetailsByDay, loadingDetails }) => {
  const getDayName = (dayNumber) => {
    const days = {
      1: 'Chủ Nhật',
      2: 'Thứ Hai',
      3: 'Thứ Ba',
      4: 'Thứ Tư',
      5: 'Thứ Năm',
      6: 'Thứ Sáu',
      7: 'Thứ Bảy',
    };
    return days[dayNumber] || `Ngày ${dayNumber}`;
  };

  const detailColumns = [
    {
      title: 'Thứ',
      dataIndex: 'NgayTrongTuan',
      key: 'NgayTrongTuan',
      width: 100,
      render: (dayNumber) => <Tag color="geekblue">{getDayName(dayNumber)}</Tag>,
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Có Làm Việc',
      dataIndex: 'CoLamViec',
      key: 'CoLamViec',
      width: 110,
      render: (coLamViec) => (
        <Tag color={coLamViec === 1 ? 'green' : 'red'}>
          {coLamViec === 1 ? 'Có' : 'Không'}
        </Tag>
      ),
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'GioBatDau',
      key: 'GioBatDau',
      width: 110,
      render: (text) => text || '-', 
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Giờ Kết Thúc',
      dataIndex: 'GioKetThuc',
      key: 'GioKetThuc',
      width: 110,
      render: (text) => text || '-', 
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Giờ Nghỉ Trưa',
      key: 'GioNghiTrua',
      width: 200,
      render: (record) => {
        const start = record.GioNghiTruaBatDau;
        const end = record.GioNghiTruaKetThuc;
        if (start && end) {
          return `${start} - ${end}`;
        }
        return '-';
      },
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Số Giờ Làm Việc',
      dataIndex: 'SoGioLamViec',
      key: 'SoGioLamViec',
      width: 120,
      render: (hours) => hours !== null ? <Tag color="green">{hours}h</Tag> : '-', 
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
  ];

  return (
    <Modal
      title={
        <Space style={{ fontFamily: 'Times New Roman' }}>
          <EyeOutlined />
          Chi Tiết Ca Làm: {shiftData?.tenCa} (Mã Ca: {shiftData?.maCa})
        </Space>
      }
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      centered
      width={900}
    >
      <div style={{ padding: '16px 0', fontFamily: 'Times New Roman' }}>
        {shiftData ? (
          <Table
            columns={detailColumns}
            dataSource={shiftDetailsByDay}
            rowKey="NgayTrongTuan"
            pagination={false}
            loading={loadingDetails}
            size="small"
            scroll={{ x: 'max-content' }}
            rowClassName={(record) => {
              return record.NgayTrongTuan === 1 ? 'sunday-row' : '';
            }}
          />
        ) : (
          <Text>Không có dữ liệu chi tiết ca làm.</Text>
        )}
      </div>
    </Modal>
  );
};

export default ModalChiTietCaLam;