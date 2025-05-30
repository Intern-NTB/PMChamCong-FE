import { Table, Button, Space, Input, Select, Card, Row, Col, Dropdown, Tag, Statistic, Badge, Menu, AutoComplete, Tooltip } from 'antd';
import { useEffect, useState, useContext, useMemo } from 'react';
import { SearchOutlined, FilterOutlined, MoreOutlined, UserOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined, HistoryOutlined, StarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import Popup from './popup';
import { useNhanVien } from '../../component/hooks/useNhanVien';
import { ReloadContext } from '../../context/reloadContext';
import './employee.css';
import MyAlert from '../../component/ui/alert';

const { Option } = Select;
const { Search } = Input;

export default function NhanVien() {
    const { danhSachNhanVien, loading, statusCreateNhanVien, statusDeleteNhanVien, statusUpdateNhanVien, fetchNhanVien, addNhanVien, deleteNhanVien, updateNhanVien } = useNhanVien();
    const { setReload } = useContext(ReloadContext);

    // States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalCreateNhanVienVisible, setIsModalCreateNhanVienVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [isMobile, setIsMobile] = useState(false);
    const [alert, setAlert] = useState({
        visible: false,
        type: 'success',
        message: '',
        description: ''
    });

    // Search and filter states
    const [globalSearchValue, setGlobalSearchValue] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);
    const [currentFilter, setCurrentFilter] = useState({
        phongBan: null,
        vaiTro: null,
        trangThai: null
    });
    const [highlightedText, setHighlightedText] = useState('');

    useEffect(() => {
        setReload(() => fetchNhanVien);

        // Check screen size
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 880);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Load saved data from localStorage
    useEffect(() => {
        const savedSearchHistory = localStorage.getItem('employeeSearchHistory');
        const savedFiltersData = localStorage.getItem('employeeSavedFilters');

        if (savedSearchHistory) {
            setSearchHistory(JSON.parse(savedSearchHistory));
        }
        if (savedFiltersData) {
            setSavedFilters(JSON.parse(savedFiltersData));
        }
    }, []);

    // Transform data with filtering and searching
    const processedData = useMemo(() => {
        if (!Array.isArray(danhSachNhanVien)) return [];

        let filtered = danhSachNhanVien.map(nhanVien => ({
            key: nhanVien.maNhanVien,
            hoTen: nhanVien.hoTen || 'N/A',
            CCCD: nhanVien.cmnd || 'N/A',
            ngaySinh: nhanVien.ngaySinh || 'N/A',
            diaChi: nhanVien.diaChi || 'N/A',
            soDienThoai: nhanVien.soDienThoai || 'N/A',
            trangThai: nhanVien.trangThai || 'N/A',
            ngayVaoLam: nhanVien.ngayVaoLam || 'N/a',
            luongCoBan: nhanVien.luongCoBan || 'N/A',
            heSoTangCa: nhanVien.heSoTangCa || 'N/A',
            maVaiTro: nhanVien.maVaiTro || 'N/A',
            maPhongBan: nhanVien.maPhongBan || 'N/a',
            maUuTien: nhanVien.maUuTien || 'N/A',
            tenPhongBan: nhanVien.tenPhongBan || 'N/A',
            tenVaiTro: nhanVien.tenVaiTro || 'N/A',
            tenUuTien: nhanVien.tenUuTien || 'N/A',
            originalData: nhanVien
        }));

        // Apply filters
        if (currentFilter.phongBan) {
            filtered = filtered.filter(item => item.tenPhongBan === currentFilter.phongBan);
        }
        if (currentFilter.vaiTro) {
            filtered = filtered.filter(item => item.tenVaiTro === currentFilter.vaiTro);
        }
        if (currentFilter.trangThai) {
            filtered = filtered.filter(item => item.trangThai === currentFilter.trangThai);
        }

        // Apply global search
        if (globalSearchValue) {
            const searchLower = globalSearchValue.toLowerCase();
            filtered = filtered.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchLower)
                )
            );
            setHighlightedText(globalSearchValue);
        } else {
            setHighlightedText('');
        }

        return filtered;
    }, [danhSachNhanVien, currentFilter, globalSearchValue]);

    // Calculate statistics
    const statistics = useMemo(() => {
        if (!Array.isArray(danhSachNhanVien)) return {};

        const total = danhSachNhanVien.length;
        const active = danhSachNhanVien.filter(nv => nv.trangThai === 'Đang làm' || nv.trangThai === 'Mới đăng ký').length;
        const inactive = total - active;

        // Group by department
        const byDepartment = danhSachNhanVien.reduce((acc, nv) => {
            const dept = nv.tenPhongBan || 'Chưa phân bổ';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            active,
            inactive,
            byDepartment
        };
    }, [danhSachNhanVien]);

    // Get unique values for filters
    const filterOptions = useMemo(() => {
        if (!Array.isArray(danhSachNhanVien)) return { departments: [], roles: [], statuses: [] };

        const departments = [...new Set(danhSachNhanVien.map(nv => nv.tenPhongBan).filter(Boolean))];
        const roles = [...new Set(danhSachNhanVien.map(nv => nv.tenVaiTro).filter(Boolean))];
        const statuses = [...new Set(danhSachNhanVien.map(nv => nv.trangThai).filter(Boolean))];

        return { departments, roles, statuses };
    }, [danhSachNhanVien]);

    // Highlight search text
    const highlightText = (text) => {
        if (!highlightedText || !text) return text;

        const regex = new RegExp(`(${highlightedText})`, 'gi');
        const parts = String(text).split(regex);

        return parts.map((part, index) =>
            regex.test(part) ?
                <span key={index} style={{ backgroundColor: '#fff566', fontWeight: 'bold' }}>{part}</span> :
                part
        );
    };

    // Desktop columns
    const desktopColumns = [
        {
            title: 'Họ Tên',
            dataIndex: 'hoTen',
            key: 'hoTen',
            width: 150,
            render: (text) => highlightText(text),
            sorter: {
                compare: (a, b) => a.hoTen.localeCompare(b.hoTen, 'vi', { numeric: true }),
                multiple: 1,
            },
        },
        {
            title: 'CCCD',
            dataIndex: 'CCCD',
            key: 'CCCD',
            width: 120,
            render: (text) => highlightText(text),
        },
        {
            title: 'Chức vụ',
            dataIndex: 'tenVaiTro',
            key: 'tenVaiTro',
            width: 120,
            render: (text) => highlightText(text),
        },
        {
            title: 'Phòng ban',
            dataIndex: 'tenPhongBan',
            key: 'tenPhongBan',
            width: 120,
            render: (text) => highlightText(text),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            width: 120,
            render: (status) => (
                <Tag
                    color={status === 'Đang làm' ? 'green' : status === 'Không còn làm' ? 'red' : status === 'Mới đăng ký' ? 'cyan' : 'orange'}
                    icon={status === 'Đang làm' || status === 'Mới đăng ký' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                    {status}
                </Tag>
            ),
            filters: filterOptions.statuses.map(status => ({
                text: status,
                value: status,
            })),
            onFilter: (value, record) => record.trangThai === value,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'soDienThoai',
            key: 'soDienThoai',
            width: 120,
            render: (text) => highlightText(text),
        },
        {
            title: 'Lương CB',
            dataIndex: 'luongCoBan',
            key: 'luongCoBan',
            width: 120,
            render: (salary) => salary ? `${salary.toLocaleString()} VNĐ` : 'N/A',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (text, record) => (
                <Dropdown
                    overlay={getActionMenu(record)}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    // Mobile columns
    const mobileColumns = [
        {
            title: 'Thông tin nhân viên',
            key: 'info',
            render: (_, record) => (
                <div style={{ padding: '8px 0' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {highlightText(record.hoTen)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        CCCD: {highlightText(record.CCCD)}
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        {highlightText(record.tenVaiTro)} - {highlightText(record.tenPhongBan)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        SĐT: {highlightText(record.soDienThoai)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Tag
                            color={record.trangThai === 'Đang làm' ? 'green' :
                                record.trangThai === 'Không còn làm' ? 'red' :
                                    record.trangThai === 'Mới đăng ký' ? 'cyan' : 'orange'}
                            icon={record.trangThai === 'Đang làm' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        >
                            {record.trangThai}
                        </Tag>
                        <Dropdown
                            overlay={getActionMenu(record)}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button type="text" icon={<MoreOutlined />} size="small" />
                        </Dropdown>
                    </div>
                </div>
            ),
        }
    ];

    // Action menu for each row
    const getActionMenu = (record) => (
        <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                Chỉnh sửa
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record.key)}
            >
                Xóa
            </Menu.Item>
        </Menu>
    );

    // Event handlers
    const handleGlobalSearch = (value) => {
        setGlobalSearchValue(value);
        if (value && !searchHistory.includes(value)) {
            const newHistory = [value, ...searchHistory.slice(0, 9)];
            setSearchHistory(newHistory);
            localStorage.setItem('employeeSearchHistory', JSON.stringify(newHistory));
        }
    };

    const handleFilterChange = (filterType, value) => {
        setCurrentFilter(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setCurrentFilter({ phongBan: null, vaiTro: null, trangThai: null });
        setGlobalSearchValue('');
    };

    const showAlert = (type, message, description) => {
        setAlert({ visible: true, type, message, description });
        setTimeout(() => setAlert({ ...alert, visible: false }), 3000);
    };

    const handleSaveCreateNhanVien = async (values) => {
        try {
            await addNhanVien(values);
            showAlert('success', 'Thành công', 'Thêm nhân viên thành công!');
            setIsModalCreateNhanVienVisible(false);
            await fetchNhanVien();
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
        }
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (maNhanVien) => {
        try {
            await deleteNhanVien(maNhanVien);
            showAlert('success', 'Thành công', 'Xoá nhân viên thành công!');
            await fetchNhanVien();
        } catch (error) {
            console.error('Lỗi khi xóa nhân viên:', error);
        }
    };

    const handleSave = async (values) => {
        try {
            await updateNhanVien(currentRecord.key, values);
            showAlert('success', 'Thành công', 'Cập nhật nhân viên thành công!');
            setIsModalVisible(false);
            await fetchNhanVien();
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            await Promise.all(selectedRowKeys.map(maNhanVien => deleteNhanVien(maNhanVien)));
            await fetchNhanVien();
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Lỗi khi xóa nhiều nhân viên:', error);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    // Mobile Stats Component
    const MobileStats = () => (
        <Row gutter={[8, 8]}>
            <Col span={8}>
                <Card size="small">
                    <Statistic
                        title="Tổng NV"
                        value={statistics.total}
                        valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card size="small">
                    <Statistic
                        title="Đang làm"
                        value={statistics.active}
                        valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card size="small">
                    <Statistic
                        title="Nghỉ việc"
                        value={statistics.inactive}
                        valueStyle={{ fontSize: '18px', color: '#ff4d4f' }}
                        prefix={<CloseCircleOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );

    // Mobile Search and Actions Component
    const MobileSearchActions = () => (
        <Card title="Quản lý nhân viên" size="small" extra={<UserOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <AutoComplete
                    style={{ width: '100%' }}
                    options={searchHistory.map(item => ({ value: item || '' }))}
                    onSearch={handleGlobalSearch}
                    onSelect={handleGlobalSearch}
                    size="large"
                >
                    <Input
                        placeholder="Tìm kiếm nhân viên..."
                        prefix={<SearchOutlined />}
                    />
                </AutoComplete>

                <Row gutter={[8, 8]}>
                    <Col span={8}>
                        <Select
                            placeholder="Phòng ban"
                            style={{ width: '100%' }}
                            allowClear
                            size="large"
                            value={currentFilter.phongBan}
                            onChange={(value) => handleFilterChange('phongBan', value)}
                        >
                            {filterOptions.departments.map(dept => (
                                <Option key={dept} value={dept}>{dept}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Chức vụ"
                            style={{ width: '100%' }}
                            allowClear
                            size="large"
                            value={currentFilter.vaiTro}
                            onChange={(value) => handleFilterChange('vaiTro', value)}
                        >
                            {filterOptions.roles.map(role => (
                                <Option key={role} value={role}>{role}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            allowClear
                            size="large"
                            value={currentFilter.trangThai}
                            onChange={(value) => handleFilterChange('trangThai', value)}
                        >
                            {filterOptions.statuses.map(status => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalCreateNhanVienVisible(true)}
                            size="large"
                            block
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Thêm NV
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            onClick={clearFilters}
                            size="large"
                            block
                        >
                            Xóa bộ lọc
                        </Button>
                    </Col>
                    {selectedRowKeys.length > 0 && (
                        <Col span={24}>
                            <Badge count={selectedRowKeys.length}>
                                <Button
                                    danger
                                    onClick={handleDeleteMultiple}
                                    size="large"
                                    block
                                >
                                    Xóa nhiều nhân viên
                                </Button>
                            </Badge>
                        </Col>
                    )}
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
            {alert.visible && (
                <MyAlert
                    type={alert.type}
                    message={alert.message}
                    description={alert.description}
                    onClose={() => setAlert({ ...alert, visible: false })}
                />
            )}

            {isMobile ? (
                // Mobile Layout
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <MobileSearchActions />
                    <MobileStats />

                    <Card title="Danh sách nhân viên" size="small">
                        <Table
                            dataSource={processedData}
                            rowSelection={rowSelection}
                            columns={mobileColumns}
                            loading={loading}
                            rowKey="key"
                            pagination={{
                                pageSize: pageSize,
                                pageSizeOptions: ['8', '20', '50', '100'],
                                size: 'small',
                                showSizeChanger: true,
                                showQuickJumper: true,
                                onShowSizeChange: (current, size) => {
                                    setPageSize(size)
                                },
                                total: processedData.length,
                            }}
                            size="small"
                            scroll={{ x: 300 }}
                        />
                    </Card>
                </Space>
            ) : (
                // Desktop Layout
                <Row gutter={[16, 16]}>
                    {/* Statistics Header */}
                    <Col span={24}>
                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng nhân viên"
                                        value={statistics.total}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Đang hoạt động"
                                        value={statistics.active}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Nghỉ việc"
                                        value={statistics.inactive}
                                        prefix={<CloseCircleOutlined />}
                                        valueStyle={{ color: '#ff4d4f' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Phòng ban"
                                        value={Object.keys(statistics.byDepartment || {}).length}
                                        prefix={<TeamOutlined />}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Search and Filter */}
                    <Col span={24}>
                        <Card title="Tìm kiếm và lọc" extra={<FilterOutlined />}>
                            <Row gutter={[16, 16]} wrap align="middle">
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <AutoComplete
                                        style={{ width: '100%' }}
                                        options={searchHistory.map(item => ({ value: item || '' }))}
                                        onSearch={handleGlobalSearch}
                                        onSelect={handleGlobalSearch}
                                    >
                                        <Input
                                            placeholder="Tìm kiếm toàn bộ..."
                                            prefix={<SearchOutlined />}
                                        />
                                    </AutoComplete>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={4}>
                                    <Select
                                        placeholder="Phòng ban"
                                        style={{ width: '100%' }}
                                        allowClear
                                        value={currentFilter.phongBan}
                                        onChange={(value) => handleFilterChange('phongBan', value)}
                                    >
                                        {filterOptions.departments.map(dept => (
                                            <Option key={dept} value={dept}>{dept}</Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={4}>
                                    <Select
                                        placeholder="Chức vụ"
                                        style={{ width: '100%' }}
                                        allowClear
                                        value={currentFilter.vaiTro}
                                        onChange={(value) => handleFilterChange('vaiTro', value)}
                                    >
                                        {filterOptions.roles.map(role => (
                                            <Option key={role} value={role}>{role}</Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={4}>
                                    <Select
                                        placeholder="Trạng thái"
                                        style={{ width: '100%' }}
                                        allowClear
                                        value={currentFilter.trangThai}
                                        onChange={(value) => handleFilterChange('trangThai', value)}
                                    >
                                        {filterOptions.statuses.map(status => (
                                            <Option key={status} value={status}>{status}</Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={6}>
                                    <Space wrap>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => setIsModalCreateNhanVienVisible(true)}
                                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                        >
                                            Thêm nhân viên
                                        </Button>
                                        <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                                        {selectedRowKeys.length > 0 && (
                                            <Badge count={selectedRowKeys.length}>
                                                <Button danger onClick={handleDeleteMultiple}>Xóa nhiều</Button>
                                            </Badge>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>


                    {/* Table */}
                    <Col span={24}>
                        <Card title="Danh sách nhân viên">
                            <Table
                                dataSource={processedData}
                                rowSelection={rowSelection}
                                columns={desktopColumns}
                                loading={loading}
                                rowKey="key"
                                pagination={{
                                    pageSize: pageSize,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    pageSizeOptions: ['10', '20', '50', '100', '200'],
                                    onShowSizeChange: (current, size) => {
                                        setPageSize(size)
                                    },
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} trong ${total} nhân viên`,
                                }}
                                scroll={{ x: 1000 }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Modals */}
            <Popup
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleSave}
                initialValues={currentRecord?.originalData}
                maPhongBan={currentRecord?.maPhongBan}
                maVaiTro={currentRecord?.maVaiTro}
                title='Chỉnh sửa nhân viên'
            />

            <Popup
                visible={isModalCreateNhanVienVisible}
                onCancel={() => setIsModalCreateNhanVienVisible(false)}
                onOk={handleSaveCreateNhanVien}
                title='Thêm nhân viên'
                initialValues={{}}
            />
        </div>
    );
}