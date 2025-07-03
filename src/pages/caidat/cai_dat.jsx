// src/pages/caidat/cai_dat.jsx
import { Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
// Import hasPermission
import { hasPermission } from '../../config/utils/user_permission';

export default function CaiDat() {
    const [isMobile, setIsMobile] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 880)
        }
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    // Định nghĩa tất cả các tab và quyền tương ứng
    const allTabItems = [
        { key: 'he-thong', label: 'Hệ thống', permissionModule: 'heThong', permissionAction: 'view' },
        { key: 'phong-ban', label: 'Phòng ban', permissionModule: 'phongBan', permissionAction: 'view' },
        { key: 'ca-lam', label: 'Ca làm', permissionModule: 'caLam', permissionAction: 'view' },
        { key: 'doi-tuong-uu-tien', label: 'Đối tượng ưu tiên', permissionModule: 'doiTuongUuTien', permissionAction: 'view' },
        { key: 'vai-tro', label: 'Vai trò', permissionModule: 'vaiTro', permissionAction: 'view' },
        { key: 'nghi-le', label: 'Nghỉ lễ', permissionModule: 'ngayLe', permissionAction: 'view' },
        { key: 'thuong', label: 'Thưởng', permissionModule: 'thuong', permissionAction: 'view' },
        { key: 'phat', label: 'Phạt', permissionModule: 'phat', permissionAction: 'view' },
        { key: 'tai-khoan', label: 'Tài khoản', permissionModule: 'taiKhoan', permissionAction: 'view' },
        { key: 'phan-quyen', label: 'Phân quyền', permissionModule: 'phanQuyen', permissionAction: 'view' }, // <-- Quyền cho tab Phân quyền
        { key: 'lich-su-phong-ban', label: 'Lịch Sử Phòng Ban', permissionModule: 'lichSuPhongBan', permissionAction: 'view' },
        { key: 'lich-su-luong', label: 'Lịch Sử Lương', permissionModule: 'lichSuLuong', permissionAction: 'view' }
    ];

    // Lọc ra các tab mà người dùng hiện tại có quyền truy cập
    const tabItems = allTabItems.filter(item => 
        item.permissionModule ? hasPermission(item.permissionModule, item.permissionAction) : true
    );

    const currentTab = location.pathname.split('/').pop();
    // Xác định tab đang hoạt động. Nếu tab hiện tại không có quyền, chuyển về tab đầu tiên có quyền.
    const defaultActiveKey = tabItems.length > 0 ? tabItems[0].key : '';
    const activeKey = tabItems.some(item => item.key === currentTab) ? currentTab : defaultActiveKey;

    useEffect(() => {
        // Nếu URL hiện tại không khớp với bất kỳ tab nào được phép, điều hướng đến tab đầu tiên có quyền
        if (!tabItems.some(item => item.key === currentTab) && tabItems.length > 0) {
            navigate(`/main-layout/caidat/${tabItems[0].key}`, { replace: true });
        } else if (tabItems.length === 0 && currentTab !== 'caidat') { // Nếu không có quyền nào và không phải là đường dẫn gốc /caidat
            // Trường hợp người dùng không có bất kỳ quyền nào để xem các tab cài đặt
            // Có thể hiển thị thông báo hoặc chuyển hướng đến trang khác (ví dụ: trang chủ)
            console.warn("User has no permission to view any settings tabs. Redirecting to home.");
            // navigate('/main-layout/trangchu', { replace: true }); // Bỏ comment nếu muốn tự động chuyển hướng
        }
    }, [location.pathname, tabItems, navigate, currentTab]);


    const onChange = (key) => {
        navigate(`/main-layout/caidat/${key}`)
    }

    if (tabItems.length === 0) {
        return (
            <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
                Bạn không có quyền truy cập vào bất kỳ cài đặt nào.
            </div>
        );
    }

    return (
        <>
            <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 600, display: 'inline-block' }}>
                    <Tabs
                        activeKey={activeKey}
                        items={tabItems.map(item => ({ key: item.key, label: item.label }))} // Chỉ truyền key và label vào items
                        onChange={onChange}
                        tabPosition='top'
                        size={isMobile ? 'small' : 'middle'}
                    />
                </div>
            </div>
            <Outlet />
        </>
    )
}