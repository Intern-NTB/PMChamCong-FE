// ===== Thư viện bên ngoài =====
import { useEffect, useState } from "react"

// ===== Ant Design =====
import { Modal, Form, Row, Col, Button, DatePicker, TimePicker, Select, message } from "antd"
import dayjs from 'dayjs'

// ===== styles =====
import './tangca.css'

const { Option } = Select;

export default function ModalThemTangCa({ onCancel, isVisible, createTangCa, danhSachPhongBan,getAllTangCa,getAllChamCongDetail }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Reset form khi modal đóng/mở
    useEffect(() => {
        if (isVisible) {
            form.resetFields();
        }
    }, [isVisible, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            
            const tangCaData = {
                ngayChamCongTangCa: values.ngayChamCongTangCa.format('YYYY-MM-DD'),
                gioTangCaBatDau: values.gioTangCaBatDau.format('HH:mm'),
                gioTangCaKetThuc: values.gioTangCaKetThuc.format('HH:mm'),
                maPhongBan: values.maPhongBan
            };

            // Kiểm tra giờ bắt đầu phải nhỏ hơn giờ kết thúc
            if (values.gioTangCaBatDau.isAfter(values.gioTangCaKetThuc)) {
                message.error('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
                return;
            }

            await createTangCa(tangCaData);
            await getAllTangCa();
            await getAllChamCongDetail();
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error('Có lỗi xảy ra khi thêm tăng ca!');
            console.error('Error creating tangca:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Thêm Tăng Ca Mới"
            open={isVisible}
            footer={null}
            onCancel={handleCancel}
            centered={true}
            maskClosable={false}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Ngày tăng ca"
                            name="ngayChamCongTangCa"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày tăng ca!' }
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày tăng ca"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Giờ bắt đầu"
                            name="gioTangCaBatDau"
                            rules={[
                                { required: true, message: 'Vui lòng chọn giờ bắt đầu!' }
                            ]}
                        >
                            <TimePicker
                                style={{ width: '100%' }}
                                format="HH:mm"
                                placeholder="Chọn giờ bắt đầu"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Giờ kết thúc"
                            name="gioTangCaKetThuc"
                            rules={[
                                { required: true, message: 'Vui lòng chọn giờ kết thúc!' }
                            ]}
                        >
                            <TimePicker
                                style={{ width: '100%' }}
                                format="HH:mm"
                                placeholder="Chọn giờ kết thúc"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Phòng ban"
                            name="maPhongBan"
                            rules={[
                                { required: true, message: 'Vui lòng chọn phòng ban!' }
                            ]}
                        >
                            <Select
                                placeholder="Chọn phòng ban"
                                style={{ width: '100%' }}
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {danhSachPhongBan.map(phongBan => (
                                    <Option key={phongBan.maPhongBan} value={phongBan.maPhongBan}>
                                        {phongBan.tenPhongBan}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify="end" gutter={8}>
                    <Col>
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                        >
                            Thêm Tăng Ca
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}