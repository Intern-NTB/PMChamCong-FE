import { useEffect } from "react";
import { Modal, Form, DatePicker, TimePicker, Select, Button, message } from "antd";
import dayjs from "dayjs";
export default function ModalChinhSuaTangCa({
    isVisible,
    onCancel,
    record,         // bản ghi cần chỉnh sửa
    updateTangCa,   // hàm gọi update từ hook/service
    danhSachPhongBan
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (record) {
            form.setFieldsValue({
                ngayChamCongTangCa: dayjs(record.ngayChamCongTangCa),
                gioTangCaBatDau: dayjs(record.gioTangCaBatDau, "HH:mm"),
                gioTangCaKetThuc: dayjs(record.gioTangCaKetThuc, "HH:mm"),
                maPhongBan: record.maPhongBan,
            });
        } else {
            form.resetFields();
        }
    }, [record, form]);


    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const start = values.gioTangCaBatDau;
            const end = values.gioTangCaKetThuc;

            if (start.isSameOrAfter(end)) {
                message.error("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
                return;
            }

            // Chuẩn bị dữ liệu gửi lên API
            const payload = {
                ...record,
                ngayChamCongTangCa: values.ngayChamCongTangCa.format("YYYY-MM-DD"),
                gioTangCaBatDau: values.gioTangCaBatDau.format("HH:mm:ss"),
                gioTangCaKetThuc: values.gioTangCaKetThuc.format("HH:mm:ss"),
                maPhongBan: values.maPhongBan
            };


            await updateTangCa(payload);
            onCancel();
        } catch (errorInfo) {
            console.log("Validate Failed:", errorInfo);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa tăng ca"
            open={isVisible}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
            centered
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Ngày tăng ca"
                    name="ngayChamCongTangCa"
                    rules={[{ required: true, message: "Vui lòng chọn ngày tăng ca" }]}
                >
                    <DatePicker style={{ width: "100%" }} disabled={true} />
                </Form.Item>

                <Form.Item
                    label="Giờ tăng ca bắt đầu"
                    name="gioTangCaBatDau"
                    rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
                >
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Giờ tăng ca kết thúc"
                    name="gioTangCaKetThuc"
                    rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
                >
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Phòng ban"
                    name="maPhongBan"
                    rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}

                >
                    <Select
                        disabled={true}
                        placeholder="Chọn phòng ban"
                        options={danhSachPhongBan.map(pb => ({
                            value: pb.maPhongBan,
                            label: pb.tenPhongBan,
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
