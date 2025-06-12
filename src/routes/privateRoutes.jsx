// routes.js
import Dashboard from '../pages/baocao/bao_cao.jsx';
import TrangChu from '../pages/home/home.jsx';
import MainLayout from '../component/layout/mainLayout.jsx';
import NhanVien from '../pages/employee/employee.jsx';
import ChamCong from '../pages/chamcong/cham_cong.jsx';
import NghiPhep from '../pages/nghiphep/nghi_phep.jsx';
import Luong from '../pages/luong/luong.jsx';
import CaiDat from '../pages/caidat/cai_dat.jsx';
import BaoCao from '../pages/baocao/bao_cao.jsx';
import DoiTuongUuTienComponent from '../pages/caidat/doi_tuong_uu_tien.jsx';
import NgayLeComponent from '../pages/caidat/ngay_le.jsx';
import ThuongComponent from '../pages/caidat/thuong.jsx';
import PhatComponent from '../pages/caidat/phat.jsx';
import PhongBanComponent from '../pages/caidat/phong_ban.jsx';
import CaLamComponent from '../pages/caidat/ca_lam.jsx';
import VaiTroComponent from '../pages/caidat/vai_tro.jsx';
// Thêm import cho thành phần Máy chấm công
import MayChamCong from '../pages/maychamcong/maychamcong.jsx'; // Đảm bảo đường dẫn này đúng

export const privateRoutes = [
    {
        path: '/main-layout',
        element: <MainLayout />,
        children: [
            { index: true, element: <TrangChu /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'trangchu', element: <TrangChu /> },
            { path: 'nhanvien', element: <NhanVien /> },
            { path: 'chamcong', element: <ChamCong /> },
            // Thêm tuyến đường cho Máy chấm công tại đây
            { path: 'maychamcong', element: <MayChamCong /> }, // Đường dẫn: /main-layout/maychamcong
            { path: 'nghiphep', element: <NghiPhep /> },
            { path: 'luong', element: <Luong /> },
            {
                path: 'caidat',
                element: <CaiDat />,
                children: [
                    {
                        index: true,
                        element: <PhongBanComponent />
                    },
                    {
                        path: 'phong-ban',
                        element: <PhongBanComponent />
                    },
                    {
                        path: 'ca-lam',
                        element: <CaLamComponent />
                    },
                    {
                        path: 'doi-tuong-uu-tien',
                        element: <DoiTuongUuTienComponent />
                    },
                    {
                        path: 'vai-tro',
                        element: <VaiTroComponent />
                    },
                    {
                        path: 'nghi-le',
                        element: <NgayLeComponent />
                    },
                    {
                        path: 'thuong',
                        element: <ThuongComponent />
                    },
                    {
                        path: 'phat',
                        element: <PhatComponent />
                    }
                ]
            },
            { path: 'baocao', element: <BaoCao /> },
        ]
    },
]