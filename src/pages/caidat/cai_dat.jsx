import { Tabs, Space, Row, Col } from "antd"
import { PhongBanComponent } from "./phong_ban";
import { useEffect, useState } from "react";
import './cai_dat.css'
import { DoiTuongUuTienComponent } from "./doi_tuong_uu_tien";
import { CaLamComponent } from './ca_lam.jsx'

export default function CaiDat() {
    // State
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check screen size
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 880);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const itemProps = [
        {
            key: '1',
            label: 'Phòng ban',
            children: <PhongBanComponent />
        },
        {
            key: '2',
            label: 'Ca làm',
            children: <CaLamComponent />
        },
        {
            key: '3',
            label: 'Đối tượng ưu tiên',
            children: <DoiTuongUuTienComponent />
        },
        {
            key: '4',
            label: 'Vai trò', // Sửa label trùng lặp
            children: 'content of Tab pane 4'
        },
    ]

    return (
        <div className='container-column'>
            <Row>
                <Col span={24}>
                    <Tabs
                        style={{ width: '100%' }}
                        defaultActiveKey="1"
                        items={itemProps}
                        tabPosition={isMobile ? 'top' : 'top'}
                        size={isMobile ? 'small' : 'middle'}
                    />
                </Col>
            </Row>

        </div>
    )
}