import Dashboard from '../pages/baocao/bao_cao.jsx'
import TrangChu from '../pages/home/home.jsx'
import MainLayout from '../component/layout/mainLayout.jsx'
import NhanVien from '../pages/employee/employee.jsx'
import ChamCong from '../pages/chamcong/cham_cong.jsx'
import NghiPhep from '../pages/nghiphep/nghi_phep.jsx'
import Luong from '../pages/luong/luong.jsx'
import CaiDat from '../pages/caidat/cai_dat.jsx'

export const privateRoutes = [
    {
        path: '/main-layout', element: <MainLayout />, children: [
             { index: true, element: <TrangChu /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'trangchu', element: <TrangChu /> },
            { path: 'nhanvien', element: <NhanVien /> },
            { path: 'chamcong', element: <ChamCong /> },
            { path: 'nghiphep', element: <NghiPhep /> },
            { path: 'luong', element: <Luong /> },
            { path: 'caidat', element: <CaiDat />},
        ]
    },

]
