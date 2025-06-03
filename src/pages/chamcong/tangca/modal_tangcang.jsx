// ===== Thư viện bên ngoài =====
import { useEffect, useMemo, useRef, useState } from "react"

// ===== Hook tùy chỉnh =====
import { useTangCa } from "../../../component/hooks/useTangCa"
import { usePhongBan } from "../../../component/hooks/usePhongBan"
import { useChamCong } from "../../../component/hooks/useChamCong"

// ===== Ant Design =====
import { Modal, Form, Row, Col, Button, Table } from "antd"

// ===== styles =====
import './tangca.css'

// ===== components ======
import ModalChinhSuaTangCa from "./modal_chinh_sua_tangca"

export default function ModalTangCa({ onCancel, isVisible }) {
    const { danhSachTangCa, loadingTangCa, isCreatedTangCa, isDeletedTangCa, isUpdatedTangCa, getAllTangCa, updateTangCa, deleteTangCa, createTangCa } = useTangCa()
    const { danhSachPhongBan } = usePhongBan()

    // ==== State ====
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [recordEditing, setRecordEditing] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const openEditModal = (record) => {
        setRecordEditing(record);
        setIsEditModalVisible(true);
    };

    const closeEditModal = () => {
        setIsEditModalVisible(false);
        setRecordEditing(null);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = clearFilters => {
        clearFilters();
        setSearchText('');
    };

    const handleEventRemoveTangCa = async (value) => {
        await deleteTangCa(value.ngayChamCongTangCa, value.maPhongBan)
    }

    const dataSourceTangCa = danhSachTangCa.map(tc => {
        const phongBan = danhSachPhongBan.find(pb => pb.maPhongBan === tc.maPhongBan)

        return {
            ngayChamCongTangCa: tc.ngayChamCongTangCa,
            gioTangCaBatDau: tc.gioTangCaBatDau,
            gioTangCaKetThuc: tc.gioTangCaKetThuc,
            maPhongBan: tc.maPhongBan,
            tenPhongBan: phongBan ? phongBan.tenPhongBan : 'Không xác định'
        }
    })


    const desktopColumn = useMemo(() => [
        {
            title: 'Ngày tăng ca',
            dataIndex: 'ngayChamCongTangCa',
            key: 'ngayChamCongTangCa',
        },
        {
            title: 'Giờ tăng ca bắt đầu',
            dataIndex: 'gioTangCaBatDau',
            key: 'gioTangCaBatDau',
        },
        {
            title: 'Giờ tăng ca kết thúc',
            dataIndex: 'gioTangCaKetThuc',
            key: 'gioTangCaKetThuc',
        },
        {
            title: 'Tên phòng ban',
            dataIndex: 'tenPhongBan',
            key: 'tenPhongBan',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{display:'flex', justifyContent:'center'}}>
                    <Button type="link" onClick={() => openEditModal(record) } style={{marginRight:8}}>
                        Sửa
                    </Button>
                    <Button danger onClick={() => handleEventRemoveTangCa(record)}>
                        xoá
                    </Button>
                </div>


            )
        }

    ])

    useEffect(() => {
        getAllTangCa()
    }, [isUpdatedTangCa, isDeletedTangCa, isCreatedTangCa])

    return (
        <>
            <Modal
                title='Chi Tiết tăng ca'
                open={isVisible}
                footer={[
                    <Row gutter={8} justify={'end'}>
                        <Col span={8}>
                            <Button onClick={onCancel}>
                                Quay về
                            </Button>
                        </Col>
                    </Row>
                ]}
                centered={true}
                maskClosable={true}
                width="90%"  // Đặt width mặc định cho modal trên mobile
                style={{padding: '10px'}}
            >
                <Table dataSource={dataSourceTangCa} columns={desktopColumn} scroll={{ x: 'max-content' }}>

                </Table>

            </Modal>
            <ModalChinhSuaTangCa
                isVisible={isEditModalVisible}
                onCancel={closeEditModal}
                record={recordEditing}
                updateTangCa={updateTangCa}
                danhSachPhongBan={danhSachPhongBan}
            />

        </>

    )
}