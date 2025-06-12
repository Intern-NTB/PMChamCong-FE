import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Table, Row, Col, message, Modal } from 'antd';
import {
    WifiOutlined,
    UploadOutlined,
    DownloadOutlined,
    DeleteOutlined,
    LockOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import './maychamcong.css'; 

const { Title, Text } = Typography;

const MayChamCong = () => {
    const staticDbEmployees = [
        { maNhanVien: 101, hoTen: 'Nguyễn Văn A', trangThai: 'Đang làm việc', key: 101 },
        { maNhanVien: 102, hoTen: 'Trần Thị B', trangThai: 'Đang làm việc', key: 102 },
        { maNhanVien: 103, hoTen: 'Lê Văn C', trangThai: 'Nghỉ việc', key: 103 },
        { maNhanVien: 104, hoTen: 'Phạm Thị D', trangThai: 'Đang làm việc', key: 104 },
        { maNhanVien: 105, hoTen: 'Đinh Công E', trangThai: 'Đang làm việc', key: 105 },
        { maNhanVien: 106, hoTen: 'Vũ Thị F', trangThai: 'Đang làm việc', key: 106 },
    ];

    const staticDeviceEmployees = [
        { maNhanVien: 101, hoTen: 'Nguyễn Văn A', trangThai: 'Đã có trên máy', key: 101 },
        { maNhanVien: 105, hoTen: 'Đinh Công E', trangThai: 'Đã có trên máy', key: 105 },
        { maNhanVien: 201, hoTen: 'Zang Xiao', trangThai: 'Mới trên máy', key: 201 },
    ];

    const [ipAddress, setIpAddress] = useState('192.168.1.201');
    const [port, setPort] = useState('4370');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Chưa kết nối');
    const [isConnecting, setIsConnecting] = useState(false);

    const [logs, setLogs] = useState([]);
    const [isFunctionEnabled, setIsFunctionEnabled] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    const [dbEmployees, setDbEmployees] = useState([]);
    const [deviceEmployees, setDeviceEmployees] = useState([]);
    const [selectedDbEmployees, setSelectedDbEmployees] = useState([]);

    useEffect(() => {
        setDbEmployees(staticDbEmployees);
        setDeviceEmployees(staticDeviceEmployees);
    }, []);

    const handleConnect = async () => {
        setLogs(prev => [...prev, `Đang cố gắng kết nối đến ${ipAddress}:${port}...`]);
        setConnectionStatus('Đang kết nối...');
        setIsConnecting(true);
        setIsConnected(false);
        setIsFunctionEnabled(false);

        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsConnected(true);
        setIsFunctionEnabled(true);
        setConnectionStatus('Đã kết nối thành công');
        setLogs(prev => [...prev, 'Kết nối thành công!']);
        message.success('Kết nối máy chấm công thành công!');

        setIsConnecting(false);
    };


    const fetchDeviceEmployees = async () => {
        setLogs(prev => [...prev, 'Đang tải danh sách nhân viên từ máy chấm công (dữ liệu tĩnh)...']);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDeviceEmployees(staticDeviceEmployees);
        setLogs(prev => [...prev, 'Đã tải xong danh sách nhân viên từ máy chấm công.']);
        message.success('Tải danh sách nhân viên từ máy thành công!');
    };

    const handleUploadEmployees = async () => {
        if (selectedDbEmployees.length === 0) {
            message.warning('Vui lòng chọn nhân viên từ bảng trong DB để gửi lên máy.');
            return;
        }

        setLogs(prev => [...prev, `Đang gửi ${selectedDbEmployees.length} nhân viên lên máy chấm công (giả lập)...`]);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newDeviceEmployees = [...deviceEmployees];
        selectedDbEmployees.forEach(emp => {
            if (!newDeviceEmployees.some(devEmp => devEmp.maNhanVien === emp.maNhanVien)) {
                newDeviceEmployees.push({ ...emp, trangThai: 'Đã có trên máy' });
            }
        });
        setDeviceEmployees(newDeviceEmployees);


        setLogs(prev => [...prev, `Đã gửi ${selectedDbEmployees.length} nhân viên thành công lên máy chấm công.`]);
        message.success('Gửi nhân viên lên máy chấm công thành công!');
        setShowEmployeeModal(false);
        setSelectedDbEmployees([]);
    };

    const handleUploadFingerprints = async () => {
        setLogs(prev => [...prev, 'Đang gửi dữ liệu vân tay từ DB lên máy chấm công (giả lập)...']);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLogs(prev => [...prev, 'Dữ liệu vân tay đã được gửi thành công lên máy chấm công.']);
        message.success('Gửi vân tay lên máy chấm công thành công!');
    };

    const handleDownloadAttendance = async () => {
        setLogs(prev => [...prev, 'Đang tải dữ liệu chấm công từ máy chấm công về DB (giả lập)...']);
        await new Promise(resolve => setTimeout(resolve, 4000));
        setLogs(prev => [...prev, 'Dữ liệu chấm công đã được tải và lưu thành công vào DB.']);
        message.success('Tải dữ liệu chấm công thành công!');
    };

    const handleDownloadFingerprints = async () => {
        setLogs(prev => [...prev, 'Đang tải dữ liệu vân tay từ máy chấm công về DB (giả lập)...']);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLogs(prev => [...prev, 'Dữ liệu vân tay đã được tải và lưu thành công vào DB.']);
        message.success('Tải dữ liệu vân tay về DB thành công!');
    };

    const handleDeleteEmployee = async () => {
        const confirmDelete = await Modal.confirm({
            title: 'Xác nhận xóa nhân viên trên máy?',
            icon: <WarningOutlined />,
            content: 'Bạn có chắc chắn muốn xóa nhân viên khỏi máy chấm công? Thao tác này không thể hoàn tác.',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
        });

        if (confirmDelete) {
            setLogs(prev => [...prev, 'Đang xóa nhân viên trên máy chấm công (giả lập)...']);
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (deviceEmployees.length > 0) {
                const updatedDeviceEmployees = deviceEmployees.slice(1);
                setDeviceEmployees(updatedDeviceEmployees);
                setLogs(prev => [...prev, 'Nhân viên đã được xóa thành công khỏi máy chấm công.']);
                message.success('Xóa nhân viên trên máy chấm công thành công!');
            } else {
                setLogs(prev => [...prev, 'Không có nhân viên trên máy để xóa.']);
                message.info('Không có nhân viên trên máy để xóa.');
            }
        }
    };

    const handleDeleteFingerprints = async () => {
        const confirmDelete = await Modal.confirm({
            title: 'Xác nhận xóa vân tay trên máy và DB?',
            icon: <WarningOutlined />,
            content: 'Bạn có chắc chắn muốn xóa dữ liệu vân tay trên cả máy chấm công và trong DB? Thao tác này không thể hoàn tác.',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
        });

        if (confirmDelete) {
            setLogs(prev => [...prev, 'Đang xóa dữ liệu vân tay trên máy chấm công và DB (giả lập)...']);
            await new Promise(resolve => setTimeout(resolve, 3000));
            setLogs(prev => [...prev, 'Dữ liệu vân tay đã được xóa thành công trên máy chấm công và DB.']);
            message.success('Xóa vân tay trên máy và DB thành công!');
        }
    };

    const employeeColumns = [
        { title: 'Mã Nhân viên', dataIndex: 'maNhanVien', key: 'maNhanVien', width: 120 },
        { title: 'Họ Tên', dataIndex: 'hoTen', key: 'hoTen' },
        { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 150 },
    ];

    const rowSelection = {
        selectedRowKeys: selectedDbEmployees.map(emp => emp.key),
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedDbEmployees(selectedRows);
        },
        getCheckboxProps: (record) => ({
            disabled: record.trangThai === 'Nghỉ việc',
        }),
    };

    return (
        <div className="pageContainer">
            <Card title="Cấu hình Kết nối Máy Chấm Công" className="card">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        addonBefore="Địa chỉ IP"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="VD: 192.168.1.100"
                        disabled={isConnecting}
                    />
                    <Input
                        addonBefore="Port"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="VD: 4370"
                        disabled={isConnecting}
                    />
                    <Button
                        type="primary"
                        icon={<WifiOutlined />}
                        onClick={handleConnect}
                        loading={isConnecting}
                        block
                        className="button"
                    >
                        {isConnecting ? 'Đang kết nối...' : 'Kết nối'}
                    </Button>
                    <Alert
                        message={`Trạng thái: ${connectionStatus}`}
                        type={isConnected ? 'success' : isConnecting ? 'info' : 'error'}
                        showIcon
                    />
                </Space>
            </Card>

            <Card title={<Title level={3} className="menuCardTitle">Chức năng Quản lý Máy Chấm Công</Title>} className="card">
                <Space size="middle" wrap style={{ marginBottom: 16 }}>
                    <Button
                        icon={<UploadOutlined />}
                        onClick={() => {
                            setShowEmployeeModal(true);
                            fetchDeviceEmployees();
                        }}
                        disabled={!isFunctionEnabled}
                        className="button"
                    >
                        Tải Nhân viên lên máy
                    </Button>
                    <Button
                        icon={<LockOutlined />}
                        onClick={handleUploadFingerprints}
                        disabled={!isFunctionEnabled}
                        className="button"
                    >
                        Tải Vân tay lên máy
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadAttendance}
                        disabled={!isFunctionEnabled}
                        className="button"
                    >
                        Lưu Dữ liệu Chấm công về DB
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadFingerprints}
                        disabled={!isFunctionEnabled}
                        className="button"
                    >
                        Lưu Vân tay về DB
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteEmployee}
                        disabled={!isFunctionEnabled}
                        className="button dangerButton"
                    >
                        Xóa Nhân viên (trên máy)
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteFingerprints}
                        disabled={!isFunctionEnabled}
                        className="button dangerButton"
                    >
                        Xóa Vân tay (trên máy & DB)
                    </Button>
                </Space>

                <Title level={4}>Log Thao tác</Title>
                <div className="logContainer">
                    {logs.length === 0 ? (
                        <Text type="secondary">Chưa có thao tác nào.</Text>
                    ) : (
                        logs.map((log, index) => (
                            <p key={index} className="logEntry">
                                <ClockCircleOutlined className="logIcon" />
                                {log}
                            </p>
                        ))
                    )}
                </div>
            </Card>

            <Modal
                title="Tải Nhân viên lên Máy Chấm Công"
                open={showEmployeeModal}
                onCancel={() => setShowEmployeeModal(false)}
                footer={[
                    <Button key="back" onClick={() => setShowEmployeeModal(false)} className="button">
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleUploadEmployees}
                        disabled={selectedDbEmployees.length === 0}
                        className="button"
                    >
                        Gửi Nhân viên đã chọn lên máy ({selectedDbEmployees.length})
                    </Button>,
                ]}
                width={1000}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Title level={5} className="modalTableTitle">Nhân viên trong hệ thống (DB)</Title>
                        <Table
                            rowSelection={rowSelection}
                            columns={employeeColumns}
                            dataSource={dbEmployees}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            scroll={{ y: 300 }}
                            locale={{ emptyText: 'Không có dữ liệu nhân viên trong DB.' }}
                        />
                    </Col>
                    <Col span={12}>
                        <Title level={5} className="modalTableTitle">Nhân viên trên Máy Chấm Công</Title>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchDeviceEmployees}
                            className="button"
                            style={{ marginBottom: 12 }}
                            size="small"
                        >
                            Tải lại từ máy
                        </Button>
                        <Table
                            columns={employeeColumns}
                            dataSource={deviceEmployees}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            scroll={{ y: 300 }}
                            locale={{ emptyText: 'Không có dữ liệu nhân viên trên máy.' }}
                        />
                    </Col>
                </Row>
                {selectedDbEmployees.length > 0 && (
                    <Alert
                        message={`Đã chọn ${selectedDbEmployees.length} nhân viên để gửi lên máy.`}
                        type="info"
                        showIcon
                        className="alertInfo"
                    />
                )}
            </Modal>
        </div>
    );
};

export default MayChamCong;