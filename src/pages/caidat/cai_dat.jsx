// src/pages/caidat/cai_dat.jsx
import { Tabs } from 'antd'
import { Children, useEffect, useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

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

    // map tab key to route path
    const tabItems = [
        { key: 'he-thong', label: 'Hệ thống' },
        { key: 'phong-ban', label: 'Phòng ban' },
        { key: 'ca-lam', label: 'Ca làm' },
        { key: 'doi-tuong-uu-tien', label: 'Đối tượng ưu tiên' },
        { key: 'vai-tro', label: 'Vai trò' },
        { key: 'nghi-le', label: 'Nghỉ lễ' },
        { key: 'thuong', label: 'Thưởng' },
        { key: 'phat', label: 'Phạt' },
        { key: 'tai-khoan', label: 'Tài khoản' },
        { key: 'phan-quyen', label: 'Phân quyền' }, // <-- THÊM DÒNG NÀY
        { key: 'lich-su-phong-ban', label: 'Lịch Sử Phòng Ban' },
        { key: 'lich-su-luong', label: 'Lịch Sử Lương' }
    ]

    // Chọn tab hiện tại từ URL
    const currentTab = location.pathname.split('/').pop()

    const onChange = (key) => {
        navigate(`/main-layout/caidat/${key}`)
    }

    return (
        <>
            <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 600, display: 'inline-block' }}>
                    <Tabs
                        activeKey={currentTab}
                        items={tabItems}
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