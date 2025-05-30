import { useState, useEffect } from 'react';
import { Card, Button, Table, DatePicker, Select, Row, Col, Statistic, Tag, Space, Modal, Form, Input, message } from 'antd';
import { ClockCircleOutlined, LoginOutlined, LogoutOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNhanVien } from '../../component/hooks/useNhanVien';
import { useChamCong } from '../../component/hooks/useChamCong';
import MyAlert from '../../component/ui/alert';
const { RangePicker } = DatePicker;
const { Option } = Select;
import { ReloadContext } from '../../context/reloadContext';
import { useContext } from 'react';
import { useDuLieuQuetVanTay } from '../../component/hooks/useQuetVanTay'
import { toLocalISOString } from '../../component/utils/format_date_iso';
import './cham_cong.css'

export default function GiaLapChamCong() {


    // Hooks
    const { createDuLieuQuetVanTay } = useDuLieuQuetVanTay()
    const { danhSachChamCong, danhSachChamCongChiTiet, loadingChamCong, getAllChamCong, getAllChamCongDetail } = useChamCong()
    const { danhSachNhanVien, loading } = useNhanVien()
    const { setReload } = useContext(ReloadContext);

    // State
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [dateRange, setDateRange] = useState([dayjs().startOf('day'),    // 00:00:00 hôm nay
    dayjs().endOf('day')]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Component
    const [alert, setAlert] = useState({
        visible: false,
        type: 'success',
        message: '',
        description: ''
    });
    const [form] = Form.useForm();




    useEffect(() => {
        setReload(() => getAllChamCongDetail);
    }, [])
    const showAlert = (type, message, description) => {
        setAlert({ visible: true, type, message, description });
        setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
    };

    // Kiểm tra kích thước màn hình
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 900);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Cập nhật thời gian hiện tại mỗi giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load dữ liệu chấm công từ Hooks
    useEffect(() => {
        getAllChamCongDetail()
    }, []);

    // Lọc dữ liệu theo khoảng thời gian
    useEffect(() => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            const filtered = danhSachChamCongChiTiet.filter(item => {
                const itemDate = dayjs(item.ngayChamCong);
                return itemDate.isAfter(dateRange[0].startOf('day')) &&
                    itemDate.isBefore(dateRange[1].endOf('day'));
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(danhSachChamCongChiTiet);
        }
    }, [danhSachChamCongChiTiet, dateRange]);

    // Chấm công vào
    const chamCongVao = async () => {
        if (!selectedEmployee) {
            showAlert('error', 'Thiếu thông tin', 'Vui lòng chọn nhân viên!');
            return;
        }

        const today = dayjs().format('DD-MM-YYYY');
        const existingRecord = danhSachChamCongChiTiet.find(
            item => item.maNhanVien === selectedEmployee && dayjs(item.ngayChamCong).format('DD-MM-YYYY') === today
        );

        if (existingRecord && existingRecord.thoiGianVao) {
            showAlert('info', 'Thông báo', 'Nhân viên đã chấm công vào hôm nay!');
            return;
        }

        try {
            const dateiso = toLocalISOString();
            const duLieuQuetVanTay = {
                thoiGian: dateiso,
                maNhanVien: selectedEmployee
            };
            console.log(duLieuQuetVanTay)
            await createDuLieuQuetVanTay(duLieuQuetVanTay);
            showAlert('success', 'Thành công', 'Chấm công vào thành công!');
            await getAllChamCongDetail()

        } catch (error) {
            console.error('Lỗi khi chấm công vào:', error);
            showAlert('error', 'Lỗi', 'Không thể chấm công vào. Vui lòng thử lại!');
        }
    };

    // Trong chamCongRa
    const chamCongRa = async () => {
        if (!selectedEmployee) {
            showAlert('error', 'Thiếu thông tin', 'Vui lòng chọn nhân viên!');
            return;
        }

        const today = dayjs().format('DD-MM-YYYY');
        const existingRecord = danhSachChamCongChiTiet.find(
            item => item.maNhanVien === selectedEmployee && dayjs(item.ngayChamCong).format('DD-MM-YYYY') === today
        );

        if (!existingRecord || !existingRecord.thoiGianVao) {
            showAlert('info', 'Thông báo', 'Nhân viên chưa chấm công vào!');
            return;
        }

        if (existingRecord.thoiGianRa) {
            showAlert('info', 'Thông báo', 'Nhân viên đã chấm công ra hôm nay!');
            return;
        }

        try {
            const dateiso = toLocalISOString();
            const duLieuQuetVanTay = {
                thoiGian: dateiso,
                maNhanVien: selectedEmployee
            };
            await createDuLieuQuetVanTay(duLieuQuetVanTay);
            showAlert('success', 'Thành công', 'Nhân viên đã chấm công ra thành công!');
            getAllChamCongDetail(); // Làm mới danh sách chấm công
        } catch (error) {
            console.error('Lỗi khi chấm công ra:', error);
            showAlert('error', 'Lỗi', 'Không thể chấm công ra. Vui lòng thử lại!');
        }
    };
    // Thêm bản ghi chấm công thủ công
    const handleAddRecord = () => {
        form.validateFields().then(values => {
            setIsModalVisible(false);
            form.resetFields();
            message.success('Thêm bản ghi thành công!');
        });
    };

    const dataSource = Array.isArray(danhSachChamCongChiTiet)
        ? danhSachChamCongChiTiet.map(dscc => ({
            ngayChamCong: dscc.ngayChamCong,
            thoiGianVao: dscc.thoiGianVao,
            thoiGianRa: dscc.thoiGianRa || 'N/A',
            soGioThucTe: dscc.soGioThucTe || 'N/A',
            trangThai: dscc.trangThai || 'N/A',
            cong: dscc.cong,
            maNhanVien: dscc.maNhanVien,
            hoTen: dscc.hoTen,
            maPhongBan: dscc.maPhongBan,
            tenPhongBan: dscc.tenPhongBan
        }))
        : []

    // Cột của bảng cho desktop
    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'ngayChamCong',
            key: 'ngayChamCong',
            sorter: {
                compare: (a, b) => dayjs(a.ngayChamCong).unix() - dayjs(b.ngayChamCong).unix(),
                multiple: 1,
            },
            render: (text) => {
                return dayjs(text).format('DD/MM/YYYY');
            },
            showSorterTooltip: {
                title: 'Sắp xếp theo ngày'

            },
            sortDirections: ['ascend', 'descend'],

        },
        {
            title: 'Nhân viên',
            dataIndex: 'hoTen',
            key: 'hoTen',
            sorter: {
                compare: (a, b) => a.hoTen.localeCompare(b.hoTen, 'vi', { numeric: true }),
                multiple: 2,
            },
            showSorterTooltip: {
                title: 'Sắp xếp theo tên nhân viên ',
            },
            sortDirections: ['ascend', 'descend'],

        },
        {
            title: 'Phòng ban',
            dataIndex: 'tenPhongBan',
            key: 'tenPhongBan',
            responsive: ['lg'],
        },
        {
            title: 'Giờ vào',
            dataIndex: 'thoiGianVao',
            key: 'thoiGianVao',
            render: (text) => {
                if (typeof text === 'string' && text.includes('T')) {
                    const timePart = text.split('T')[1];
                    const timeOnly = timePart.split('.')[0];
                    return timeOnly;
                }
            }
        },
        {
            title: 'Giờ ra',
            dataIndex: 'thoiGianRa',
            key: 'thoiGianRa',
            render: (text) => {
                if (text === 'N/A') return 'N/A';

                if (typeof text === 'string' && text.includes('T')) {
                    const timePart = text.split('T')[1];
                    const timeOnly = timePart.split('.')[0];
                    return timeOnly;
                }
            }
        },
        {
            title: 'Tổng giờ',
            dataIndex: 'soGioThucTe',
            key: 'soGioThucTe',
            responsive: ['md'],
        },
        {
            title: 'Công',
            dataIndex: 'cong',
            key: 'cong',
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            render: (status) => {
                const color =
                    status === 'Chưa hoàn tất' || status === 'Tăng ca'
                        ? 'error'
                        : status === 'Tăng ca hoàn tất' || status === 'Hoàn tất'
                            ? 'success'
                            : 'warning';
                return <Tag color={color}>{isMobile ? status.slice(0, 8) + '...' : status}</Tag>;
            },
            filters: [
                {
                    text: 'Hoàn tất',
                    value: 'Hoàn tất',
                },
                {
                    text: 'Chưa hoàn tất',
                    value: 'Chưa hoàn tất',
                },
                {
                    text: 'Tăng ca',
                    value: 'Tăng ca',
                },
                {
                    text: 'Tăng ca hoàn tất',
                    value: 'Tăng ca hoàn tất',
                },
            ],
            onFilter: (value, record) => record.trangThai === value,
        }

    ];

    // Cột cho mobile
    const mobileColumns = [
        {
            title: 'Thông tin',
            key: 'info',
            render: (_, record) => (
                <div style={{ padding: '8px 0' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {dayjs(record.ngayChamCong).format('DD/MM/YYYY')}
                    </div>
                    <div style={{ marginBottom: '4px' }}>{record.hoTen}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.tenPhongBan}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                        <Space size="small">
                            <span style={{ fontSize: '12px' }}>
                                Vào: {typeof record.thoiGianVao === 'string' && record.thoiGianVao.includes('T')
                                    ? record.thoiGianVao.split('T')[1].split('.')[0]
                                    : record.thoiGianVao}
                            </span>
                            <span style={{ fontSize: '12px' }}>
                                Ra: {record.thoiGianRa === 'N/A' ? 'N/A' :
                                    typeof record.thoiGianRa === 'string' && record.thoiGianRa.includes('T')
                                        ? record.thoiGianRa.split('T')[1].split('.')[0]
                                        : record.thoiGianRa}
                            </span>
                        </Space>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                        <Tag color={record.trangThai === 'Chưa hoàn tất' || record.trangThai === 'Tăng ca' ? 'error' :
                            record.trangThai === 'Tăng ca hoàn tất' || record.trangThai === 'Hoàn tất' ? 'success' : 'warning'}>
                            {record.trangThai}
                        </Tag>
                    </div>
                </div>
            ),
            filters: [
                {
                    text: 'Hoàn tất',
                    value: 'Hoàn tất',
                },
                {
                    text: 'Chưa hoàn tất',
                    value: 'Chưa hoàn tất',
                },
                {
                    text: 'Tăng ca',
                    value: 'Tăng ca',
                },
                {
                    text: 'Tăng ca hoàn tất',
                    value: 'Tăng ca hoàn tất',
                },
            ],
            onFilter: (value, record) => record.trangThai === value,
        }
    ];

    // Thống kê
    const totalRecords = danhSachChamCongChiTiet.length;
    const workingNow = danhSachChamCongChiTiet.filter(item =>
        dayjs(item.ngayChamCong).format('DD/MM/YYYY') === dayjs().format('DD/MM/YYYY') && (item.trangThai === 'Chưa hoàn tất' || item.trangThai === 'Tăng ca')
    ).length;
    const completedToday = danhSachChamCongChiTiet.filter(item =>
        dayjs(item.ngayChamCong).format('DD/MM/YYYY') === dayjs().format('DD/MM/YYYY') &&
        (item.trangThai === 'Hoàn tất' || item.trangThai === 'Tăng ca hoàn tất')
    ).length;

    // Component thống kê cho mobile
    const MobileStats = () => (
        <Row gutter={[8, 8]}>
            <Col span={8}>
                <Card size="small">
                    <Statistic
                        title="Tổng"
                        value={totalRecords}
                        valueStyle={{ fontSize: '18px' }}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card size="small">
                    <Statistic
                        title="Đang làm"
                        value={workingNow}
                        valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card size="small">
                    <Statistic
                        title="Hoàn thành"
                        value={completedToday}
                        valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                    />
                </Card>
            </Col>
        </Row>
    );

    // Component chấm công cho mobile
    const MobileAttendance = () => (
        <Card
            title="Chấm công"
            size="small"
            extra={<CalendarOutlined />}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                    <label style={{ marginBottom: '8px', display: 'block' }}>Chọn nhân viên:</label>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Chọn nhân viên"
                        onChange={setSelectedEmployee}
                        value={selectedEmployee}
                        size="large"
                    >
                        {danhSachNhanVien.map(nv => (
                            <Option key={nv.maNhanVien} value={nv.maNhanVien}>
                                <div>
                                    <div>{nv.hoTen}</div>
                                    <small style={{ color: '#666' }}>{nv.tenPhongBan}</small>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </div>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            onClick={chamCongVao}
                            size="large"
                            block
                        >
                            Vào
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            danger
                            icon={<LogoutOutlined />}
                            onClick={chamCongRa}
                            size="large"
                            block
                        >
                            Ra
                        </Button>
                    </Col>
                    <Col span={24}>
                        <Button
                            onClick={() => setIsModalVisible(true)}
                            size="large"
                            block
                        >
                            Thêm bản ghi
                        </Button>
                    </Col>
                </Row>
            </Space>
        </Card>
    );

    return (
        <div style={{
            padding: isMobile ? '12px' : '24px',
            background: '#f0f2f5',
            minHeight: '100vh'
        }}>
            {/* Header với thời gian */}
            <Card style={{ marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                    <ClockCircleOutlined style={{
                        fontSize: isMobile ? '20px' : '24px',
                        marginRight: '8px'
                    }} />
                    <span style={{
                        fontSize: isMobile ? '16px' : '24px',
                        fontWeight: 'bold'
                    }}>
                        {isMobile
                            ? currentTime.format('DD/MM/YYYY\nHH:mm:ss')
                            : currentTime.format('dddd, DD/MM/YYYY - HH:mm:ss')
                        }
                    </span>
                </div>
            </Card>

            {isMobile ? (
                // Layout cho mobile
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <MobileAttendance />
                    <MobileStats />
                    {alert.visible && (
                        <MyAlert
                            type={alert.type}
                            message={alert.message}
                            description={alert.description}
                            onClose={() => setAlert({ ...alert, visible: false })}
                        />
                    )}
                    <Card title="Lịch sử chấm công" size="small">
                        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                size="large"
                            />
                        </Space>

                        <Table
                            columns={mobileColumns}
                            dataSource={filteredData}
                            rowKey={record => `${record.ngayChamCong}_${record.maNhanVien}`}
                            pagination={{
                                pageSize: pageSize,
                                pageSizeOptions: ['8', '20', '50', '100'],
                                size: 'small',
                                showSizeChanger: true,
                                showQuickJumper: true,
                                onShowSizeChange: (current, size) => {
                                    setPageSize(size)
                                },
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]}/${total}`,

                            }}
                            size="small"
                            scroll={{ x: 300 }}
                        />
                    </Card>
                </Space>
            ) : (
                // Layout cho desktop
                <Row gutter={[16, 16]}>
                    {/* Chấm công */}
                    <Col span={16} >
                        <Card style={{
                            height: '100%',
                            display:'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-evenly'
                        }} title="Chấm công" extra={<CalendarOutlined />}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <label>Chọn nhân viên:</label>
                                    <Select
                                        style={{ width: '100%', marginTop: '8px' }}
                                        placeholder="Chọn nhân viên"
                                        onChange={setSelectedEmployee}
                                        value={selectedEmployee}
                                    >
                                        {danhSachNhanVien.map(nv => (
                                            <Option key={nv.maNhanVien} value={nv.maNhanVien}>
                                                {nv.hoTen} - {nv.tenPhongBan}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                {alert.visible && (
                                    <MyAlert
                                        type={alert.type}
                                        message={alert.message}
                                        description={alert.description}
                                        onClose={() => setAlert({ ...alert, visible: false })}
                                    />
                                )}
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<LoginOutlined />}
                                        onClick={chamCongVao}
                                        size="large"
                                    >
                                        Chấm công vào
                                    </Button>
                                    <Button
                                        danger
                                        icon={<LogoutOutlined />}
                                        onClick={chamCongRa}
                                        size="large"
                                    >
                                        Chấm công ra
                                    </Button>
                                    <Button
                                        onClick={() => setIsModalVisible(true)}
                                    >
                                        Thêm bản ghi
                                    </Button>
                                </Space>
                            </Space>
                        </Card>
                    </Col>

                    {/* Thống kê */}
                    <Col span={8}>
                        <Card title="Thống kê">
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Statistic
                                        title="Tổng bản ghi"
                                        value={totalRecords}
                                        prefix={<UserOutlined />}
                                    />
                                </Col>
                                <Col span={24} style={{ marginTop: '16px' }}>
                                    <Statistic
                                        title="Đang làm việc"
                                        value={workingNow}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={24} style={{ marginTop: '16px' }}>
                                    <Statistic
                                        title="Hoàn thành hôm nay"
                                        value={completedToday}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Lọc dữ liệu */}
                    <Col span={24}>
                        <Card title="Lịch sử chấm công">
                            <Space style={{ marginBottom: '16px' }}>
                                <span>Chọn khoảng thời gian:</span>
                                <RangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    format="DD/MM/YYYY"
                                />
                            </Space>

                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                rowKey={record => `${record.ngayChamCong}_${record.maNhanVien}`}
                                pagination={{
                                    pageSize: pageSize,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    pageSizeOptions: ['10', '20', '50', '100', '200'],
                                    onShowSizeChange: (current, size) => {
                                        setPageSize(size)
                                    },
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} của ${total} bản ghi`,
                                }}
                                scroll={{ x: 800 }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Modal thêm bản ghi */}
            <Modal
                title="Thêm bản ghi chấm công"
                open={isModalVisible}
                onOk={handleAddRecord}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={isMobile ? '90%' : 520}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="maNhanVien"
                        label="Nhân viên"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
                    >
                        <Select placeholder="Chọn nhân viên" size={isMobile ? 'large' : 'middle'}>
                            {danhSachNhanVien.map(nv => (
                                <Option key={nv.maNhanVien} value={nv.maNhanVien}>
                                    {nv.hoTen} - {nv.tenPhongBan}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="ngayChamCong"
                        label="Ngày chấm công"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            size={isMobile ? 'large' : 'middle'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="gioVao"
                        label="Giờ vào"
                        rules={[{ required: true, message: 'Vui lòng nhập giờ vào!' }]}
                    >
                        <Input
                            placeholder="VD: 08:00:00"
                            size={isMobile ? 'large' : 'middle'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="gioRa"
                        label="Giờ ra"
                    >
                        <Input
                            placeholder="VD: 17:00:00 (có thể để trống)"
                            size={isMobile ? 'large' : 'middle'}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}