// routes.js
import MainLayout from '../component/layout/mainLayout.jsx';
import NhanVien from '../pages/employee/employee.jsx';
import ChamCong from '../pages/chamcong/cham_cong.jsx';
import NghiPhep from '../pages/nghiphep/nghi_phep.jsx';
import Luong from '../pages/luong/luong.jsx';
import CaiDat from '../pages/caidat/cai_dat.jsx';
import DoiTuongUuTienComponent from '../pages/caidat/doi_tuong_uu_tien.jsx';
import NgayLeComponent from '../pages/caidat/ngay_le.jsx';
import ThuongComponent from '../pages/caidat/thuong.jsx';
import PhatComponent from '../pages/caidat/phat.jsx';
import PhongBanComponent from '../pages/caidat/phong_ban.jsx';
import CaLamComponent from '../pages/caidat/ca-lam/ca_lam.jsx';
import VaiTroComponent from '../pages/caidat/vai_tro.jsx';
import TaiKhoanComponent from '../pages/caidat/tai_khoan.jsx';
import LichSuPhongBanComponent from '../pages/caidat/lich_su_phong_ban.jsx';
import LichSuLuongComponent from '../pages/caidat/lich_su_luong.jsx';
import HeThongComponent from '../pages/caidat/he_thong.jsx';
import PhuCapComponent from '../pages/caidat/phu_cap.jsx';
import MayChamCong from '../pages/maychamcong/maychamcong.jsx'; 

export const privateRoutes = [
    {
        path: '/main-layout',
        element: <MainLayout />,
        children: [
            { index: true, element: <ChamCong />, requiredPermission: 'attendance:view_attendance' },
            { path: 'nhanvien', element: <NhanVien />, requiredPermission: 'profile:view_employee' },
            { path: 'chamcong', element: <ChamCong />, requiredPermission: 'attendance:view_attendance' },
            { path: 'maychamcong', element: <MayChamCong />, requiredPermission: 'attendance:view_timekeeper' },
            { path: 'nghiphep', element: <NghiPhep />, requiredPermission: 'profile:view_leave_request' },
            { path: 'luong', element: <Luong />, requiredPermission: 'payroll:view_salary' },
            {
                path: 'caidat',
                element: <CaiDat />,
                children: [
                    {
                        path: 'he-thong',
                        element: <HeThongComponent />,
                        requiredPermission: 'system:view_system_settings'
                    },
                    {
                        path: 'phong-ban',
                        element: <PhongBanComponent />,
                        requiredPermission: 'system:view_department'
                    },
                    {
                        path: 'ca-lam',
                        element: <CaLamComponent />,
                        requiredPermission: 'system:view_shift'
                    },
                    {
                        path: 'doi-tuong-uu-tien',
                        element: <DoiTuongUuTienComponent />,
                        requiredPermission: 'system:view_priority'
                    },
                    {
                        path: 'vai-tro',
                        element: <VaiTroComponent />,
                        requiredPermission: 'system:view_role'
                    },
                    {
                        path: 'nghi-le',
                        element: <NgayLeComponent />,
                        requiredPermission: 'system:view_holiday'
                    },
                    {
                        path: 'thuong',
                        element: <ThuongComponent />,
                        requiredPermission: 'system:view_bonus'
                    },
                    {
                        path: 'phat',
                        element: <PhatComponent />,
                        requiredPermission: 'system:view_punishment'
                    },
                    {
                        path: 'tai-khoan',
                        element: <TaiKhoanComponent />,
                        requiredPermission: 'system:view_account'
                    },
                    {
                        path: 'lich-su-phong-ban',
                        element: <LichSuPhongBanComponent />,
                        requiredPermission: 'system:view_department_history'
                    },
                    {
                        path: 'lich-su-luong',
                        element: <LichSuLuongComponent />,
                        requiredPermission: 'system:view_salary_history'
                    },
                    {
                        path: 'phu-cap',
                        element: <PhuCapComponent />,
                        requiredPermission: 'system:view_allowance'
                    }
                ]
            },
        ]
    },
]