import { Card, Form, InputNumber, Button, Spin } from "antd";
import { useHeThong } from "../../component/hooks/useHeThong";
import { useEffect, useState } from "react";

import { TimePicker } from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export default function HeThongComponent() {

    const [selectedTime, setSelectedTime] = useState(null);

    const {
        danhSachHeThong,
        loadingHeThong,
        updateHeThong,
    } = useHeThong();

    const [form] = Form.useForm();

    useEffect(() => {
        if (danhSachHeThong?.length > 0) {
            const item = danhSachHeThong[0];
            form.setFieldsValue({
                ...item,
                khoangCachGiuaCacLanChamCong: dayjs(item.khoangCachGiuaCacLanChamCong, "HH:mm:ss"),
            });
        }
        const initialTime = form.getFieldValue("khoangCachGiuaCacLanChamCong");
        if (initialTime) {
            setSelectedTime(initialTime);
        }
    }, [danhSachHeThong, form]);

    const onFinish = async (values) => {
        const rawTime = values.khoangCachGiuaCacLanChamCong;
        const dataToSend = {
            ...values,
            khoangCachGiuaCacLanChamCong: rawTime.format("HH:mm:ss"),
            congNgayChuNhat: Number(values.congNgayChuNhat),
            soNgayPhepTrongNam: Number(values.soNgayPhepTrongNam),
            nguongThoiGianPheDuyetNgayNghi: Number(values.nguongThoiGianPheDuyetNgayNghi),
        };

        try {
            // Chỉ cần thêm showNotification: true để hiện success
            await updateHeThong(dataToSend);
            // Notification sẽ tự động hiển thị!
        } catch (error) {
            // Error notification cũng tự động hiển thị!
            console.error("Failed to update system configuration:", error);
        }
    };

    const handleChange = (value) => {
        setSelectedTime(value);
    };
    const convertToDecimalHours = (value) => {
        if (!value) return "";
        const hours = value.hour();
        const minutes = value.minute();
        const seconds = value.second();
        const decimalHours = (hours + minutes / 60 + seconds / 3600).toFixed(2);
        return `${parseFloat(decimalHours)} giờ`;
    };

    return (
        <Card title="Cài đặt hệ thống">
            {loadingHeThong ? (
                <Spin />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                        <Form.Item
                            name="khoangCachGiuaCacLanChamCong"
                            label={
                                <>
                                    Khoảng cách giữa các lần chấm công (<span style={{ color: "#888" }}>
                                        {selectedTime ? convertToDecimalHours(selectedTime) : " (giờ)"}
                                    </span>)
                                    
                                </>
                            }
                            rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
                        >
                            <TimePicker
                                format="HH:mm:ss"
                                minuteStep={1}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>

                    <Form.Item
                        name="congNgayChuNhat"
                        label="Công ngày Chủ Nhật"
                        rules={[{ required: true, message: "Vui lòng nhập số" }]}
                    >
                        <InputNumber min={0.1} step={0.1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="soNgayPhepTrongNam"
                        label="Số ngày phép trong năm"
                        rules={[{ required: true, message: "Vui lòng nhập số" }]}
                    >
                        <InputNumber min={1} style={{ width: "50%" }} addonAfter="ngày"/>
                    </Form.Item>

                    <Form.Item
                        name="nguongThoiGianPheDuyetNgayNghi"
                        label="Ngưỡng thời gian phê duyệt ngày nghỉ (ngày)"
                        rules={[{ required: true, message: "Vui lòng nhập số ngày" }]}
                    >
                        <InputNumber min={1} max={365} style={{ width: "50%" }} addonAfter="ngày"/>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Lưu cấu hình
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
}