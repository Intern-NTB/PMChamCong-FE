import React, { useState } from 'react';
import { Table, Modal, Button, Popconfirm, Row, Col, Card, Statistic, Progress } from 'antd'; 
import { ReloadOutlined, EyeOutlined, DeleteOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Pie, Bar } from '@ant-design/charts'; 
import './bao_cao.css'; 

const BaoCao = () => {
  const [data, setData] = useState([
    { key: 1, reportName: 'Báo cáo 1', date: '2025-06-02', status: 'Đã in', description: 'Mô tả chi tiết Báo cáo 1' },
    { key: 2, reportName: 'Báo cáo 2', date: '2025-06-01', status: 'Chưa in', description: 'Mô tả chi tiết Báo cáo 2' },
    { key: 3, reportName: 'Báo cáo 3', date: '2025-06-03', status: 'Đã in', description: 'Mô tả chi tiết Báo cáo 3' },
  ]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  const showModal = (report) => {
    setCurrentReport(report);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false); 
  };

  const handleCancel = () => {
    setIsModalVisible(false); 
  };

  const handleDelete = (key) => {
    setData(data.filter(item => item.key !== key)); 
  };

  const reportStats = {
    totalReports: data.length, 
    printedReports: data.filter(report => report.status === 'Đã in').length, 
    unprintedReports: data.filter(report => report.status === 'Chưa in').length, 
  };

  const dataChart = [
    { type: 'Đã in', value: reportStats.printedReports || 1 },
    { type: 'Chưa in', value: reportStats.unprintedReports || 1 },
  ];

  const dataBarChart = [
    { type: 'Báo cáo Đã In', value: reportStats.printedReports },
    { type: 'Báo cáo Chưa In', value: reportStats.unprintedReports },
  ];

  const columns = [
    { title: 'Tên Báo Cáo', dataIndex: 'reportName', key: 'reportName' },
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
    {
      title: 'Chi Tiết',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => showModal(record)} 
          />
          <Popconfirm 
            title="Bạn có chắc chắn muốn xóa báo cáo này?" 
            onConfirm={() => handleDelete(record.key)}
            okText="Có" 
            cancelText="Không"
          >
            <Button 
              type="link" 
              icon={<DeleteOutlined />} 
              style={{ marginLeft: '8px' }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bao-cao-container">
      <h2 className="bao-cao-title">Báo Cáo</h2>

      {/* Card Thống Kê */}
      <Row gutter={16} className="bao-cao-statistics">
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic 
              title="Tổng Số Báo Cáo" 
              value={reportStats.totalReports} 
              prefix={<FileTextOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic 
              title="Báo Cáo Đã In" 
              value={reportStats.printedReports} 
              prefix={<CheckCircleOutlined />} 
            />
            <Progress percent={(reportStats.printedReports / reportStats.totalReports) * 100} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic 
              title="Báo Cáo Chưa In" 
              value={reportStats.unprintedReports} 
              prefix={<CloseCircleOutlined />} 
            />
            <Progress percent={(reportStats.unprintedReports / reportStats.totalReports) * 100} />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        rowKey="key"
      />

      <Row gutter={16} className="bao-cao-chart">
        <Col span={12}>
          <Card title="Tình Trạng Báo Cáo">
            <Bar
              data={dataBarChart}
              xField="type"
              yField="value"
              color={['#1c5bbf', '#f0ad4e']}
              label={{
                position: 'middle',
                content: '{value}',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Chi Tiết Báo Cáo"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Đóng
          </Button>,
        ]}
      >
        {currentReport && (
          <div>
            <p><strong>Tên Báo Cáo:</strong> {currentReport.reportName}</p>
            <p><strong>Ngày:</strong> {currentReport.date}</p>
            <p><strong>Trạng Thái:</strong> {currentReport.status}</p>
            <p><strong>Mô Tả:</strong> {currentReport.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BaoCao;
