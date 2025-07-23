import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Select,
  Tag,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";

// Import hook useCaLam (giống modal thêm)
import { useCaLamTrongTuan } from "../../../component/hooks/useCaLamTrongTuan";

export default function ModalChinhSuaTangCa({
  isVisible,
  onCancel,
  record, // bản ghi cần chỉnh sửa
  updateTangCa, // hàm gọi update từ hook/service
  danhSachPhongBan,
}) {
  const [form] = Form.useForm();

  // ==== HOOKS ====
  const { danhSachCaLamTrongTuanTheoPhongBan, getAllCaLamTrongTuanByPhongBan } =
    useCaLamTrongTuan();

  // ==== STATE ====
  const [isSelectedPhongBan, setIsSelectedPhongBan] = useState(0);
  const [isSelectedDateTangCa, setIsSelectedDateTangCa] = useState(null);

  // ===== VARIABLE ====
  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  // Gọi Api để lấy ca làm việc trong tuần
  useEffect(() => {
    if (isSelectedPhongBan !== 0 && isSelectedDateTangCa !== null) {
      // Tìm phòng ban đã chọn để lấy maCa
      const phongBanSelected = danhSachPhongBan.find(
        (pb) => pb.maPhongBan === isSelectedPhongBan
      );
      if (phongBanSelected && phongBanSelected.maCa) {
        getAllCaLamTrongTuanByPhongBan(phongBanSelected.maCa);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectedPhongBan, isSelectedDateTangCa, danhSachPhongBan]);

  useEffect(() => {
    if (record) {
      const ngayChamCong = dayjs(record.ngayChamCongTangCa);
      setIsSelectedPhongBan(record.maPhongBan);
      setIsSelectedDateTangCa(ngayChamCong);

      form.setFieldsValue({
        ngayChamCongTangCa: ngayChamCong,
        gioTangCaBatDau: dayjs(record.gioTangCaBatDau, "HH:mm"),
        gioTangCaKetThuc: dayjs(record.gioTangCaKetThuc, "HH:mm"),
        maPhongBan: record.maPhongBan,
      });
    } else {
      form.resetFields();
      setIsSelectedPhongBan(0);
      setIsSelectedDateTangCa(null);
    }
  }, [record, form]);

  // Tính toán ca làm trong tuần
  const date = isSelectedDateTangCa ? new Date(isSelectedDateTangCa) : null;
  const dayOfWeek = date ? date.getDay() + 1 : null;

  const danhSachCaLamTrongTuanTheoPhongBanFind =
    danhSachCaLamTrongTuanTheoPhongBan.find((cltt) => {
      return cltt.ngayTrongTuan === dayOfWeek;
    });

  //  ===== VALIDATE ====
  const validateGioBatDau = (_, value) => {
    if (!danhSachCaLamTrongTuanTheoPhongBanFind) {
      return Promise.resolve();
    }

    // Giữ nguyên dayjs object, không format
    const valueConvert = dayjs(value);
    const gioKetThucCa = dayjs(
      danhSachCaLamTrongTuanTheoPhongBanFind.gioKetThuc,
      "HH:mm:ss"
    );

    if (valueConvert.isBefore(gioKetThucCa)) {
      return Promise.reject(
        "Thời gian không hợp lệ! Giờ bắt đầu tăng ca phải lớn hơn giờ kết thúc ca"
      );
    }

    return Promise.resolve();
  };

  const validateGioKetThuc = (_, value) => {
    if (!danhSachCaLamTrongTuanTheoPhongBanFind) {
      return Promise.resolve();
    }

    // Giữ nguyên dayjs object, không format
    const valueConvert = dayjs(value);
    const gioKetThucCa = dayjs(
      danhSachCaLamTrongTuanTheoPhongBanFind.gioKetThuc,
      "HH:mm:ss"
    );

    // Kiểm tra giờ kết thúc tăng ca phải lớn hơn giờ kết thúc ca
    if (
      valueConvert.isBefore(gioKetThucCa) ||
      valueConvert.isSame(gioKetThucCa)
    ) {
      return Promise.reject(
        "Thời gian không hợp lệ! Giờ kết thúc tăng ca phải lớn hơn giờ kết thúc ca"
      );
    }

    // Kiểm tra giờ kết thúc tăng ca phải lớn hơn giờ bắt đầu tăng ca
    const gioBatDau = form.getFieldValue("gioTangCaBatDau");
    if (
      gioBatDau &&
      (valueConvert.isBefore(dayjs(gioBatDau)) ||
        valueConvert.isSame(dayjs(gioBatDau)))
    ) {
      return Promise.reject(
        "Thời gian không hợp lệ! Giờ kết thúc tăng ca phải lớn hơn giờ tăng ca bắt đầu"
      );
    }

    return Promise.resolve();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Chuẩn bị dữ liệu gửi lên API
      const payload = {
        ...record,
        ngayChamCongTangCa: values.ngayChamCongTangCa.format("YYYY-MM-DD"),
        gioTangCaBatDau: values.gioTangCaBatDau.format("HH:mm:ss"),
        gioTangCaKetThuc: values.gioTangCaKetThuc.format("HH:mm:ss"),
        maPhongBan: values.maPhongBan,
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
      width={600}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Ngày tăng ca"
              name="ngayChamCongTangCa"
              rules={[
                { required: true, message: "Vui lòng chọn ngày tăng ca" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabled={true}
                format="DD/MM/YYYY"
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
                { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                { validator: validateGioBatDau },
              ]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn giờ bắt đầu"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Giờ kết thúc"
              name="gioTangCaKetThuc"
              rules={[
                { required: true, message: "Vui lòng chọn giờ kết thúc" },
                { validator: validateGioKetThuc },
              ]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
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
              rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
            >
              <Select
                disabled={true}
                placeholder="Chọn phòng ban"
                options={danhSachPhongBan.map((pb) => ({
                  value: pb.maPhongBan,
                  label: pb.tenPhongBan,
                }))}
              />
            </Form.Item>

            {/* Hiển thị thông tin ca làm việc */}
            <div>
              {isSelectedPhongBan !== 0 && date ? (
                danhSachCaLamTrongTuanTheoPhongBanFind?.coLamViec === 0 ? (
                  <Tag color="red">
                    Hôm nay không có ca làm ({weekdays[date.getDay()]})
                  </Tag>
                ) : (
                  <Tag color="green">
                    Ca làm việc {weekdays[date.getDay()]}:{" "}
                    {danhSachCaLamTrongTuanTheoPhongBanFind?.gioBatDau ??
                      "Không có"}{" "}
                    -{" "}
                    {danhSachCaLamTrongTuanTheoPhongBanFind?.gioKetThuc ??
                      "Không có"}
                  </Tag>
                )
              ) : null}
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
