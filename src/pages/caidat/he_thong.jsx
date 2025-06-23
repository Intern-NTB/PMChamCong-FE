import { Card, Form, InputNumber, Button, Spin, message } from "antd";
import { useHeThong } from "../../component/hooks/useHeThong";
import { useEffect } from "react";

import { TimePicker } from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import { useAppNotification } from "../../component/ui/notification";

export default function HeThongComponent() {
    const apiNotification = useAppNotification();

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
    }, [danhSachHeThong]);

    const onFinish = async (values) => {
        const rawTime = values.khoangCachGiuaCacLanChamCong;
        const minutes = rawTime.hour() * 60 + rawTime.minute();

        const dataToSend = {
            ...values,
            khoangCachGiuaCacLanChamCong: rawTime.format("HH:mm:ss"),
            congNgayChuNhat: Number(values.congNgayChuNhat),
            soNgayPhepTrongNam: Number(values.soNgayPhepTrongNam),
            nguongThoiGianPheDuyetNgayNghi: Number(values.nguongThoiGianPheDuyetNgayNghi),
        };

        try {
            await updateHeThong(dataToSend);
            apiNotification.success({
                message: "Thành công",
                description: "Lưu cấu hình thành công!",
            });
        } catch {
            apiNotification.error({
                message: "Thất bại",
                description: "Không thể lưu vào hệ thống!",
            });
        }
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
                        label="Khoảng cách giữa các lần chấm công (phút)"
                        rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
                    >
                        <TimePicker format="HH:mm:ss" minuteStep={5} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="congNgayChuNhat"
                        label="Công ngày Chủ Nhật"
                        rules={[{ required: true, message: "Vui lòng nhập số" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="soNgayPhepTrongNam"
                        label="Số ngày phép trong năm"
                        rules={[{ required: true, message: "Vui lòng nhập số" }]}
                    >
                        <InputNumber min={0} max={12} style={{ width: "50%" }} addonAfter="ngày"/>
                    </Form.Item>

                    <Form.Item
                        name="nguongThoiGianPheDuyetNgayNghi"
                        label="Ngưỡng thời gian phê duyệt ngày nghỉ (giờ)"
                        rules={[{ required: true, message: "Vui lòng nhập số giờ" }]}
                    >
                        <InputNumber min={0} max={24} style={{ width: "50%" }} addonAfter="giờ"/>
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