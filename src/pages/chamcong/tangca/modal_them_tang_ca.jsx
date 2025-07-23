// ===== Thư viện bên ngoài =====
import { useEffect, useState } from "react";

// ===== HOOKS TUỲ CHỈNH =====
import { useCaLamTrongTuan } from "../../../component/hooks/useCaLamTrongTuan";

// ===== Ant Design =====
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  DatePicker,
  TimePicker,
  Select,
  message,
  ConfigProvider,
  Tag,
} from "antd";
import dayjs from "dayjs";
import locale from "antd/locale/vi_VN";
dayjs.locale("vi");

// ===== styles =====
import "./tangca.css";
import { Badge } from "antd/lib";

const { Option } = Select;

export default function ModalThemTangCa({
  onCancel,
  isVisible,
  createTangCa,
  danhSachPhongBan,
  getAllTangCa,
  getAllChamCongDetail,
}) {
  // ==== HOOKS ====
  const { danhSachCaLamTrongTuanTheoPhongBan, getAllCaLamTrongTuanByPhongBan } =
    useCaLamTrongTuan();
  // ==== STATE ====
  const [isSelectedPhongBan, setIsSelectedPhongBan] = useState(0);
  const [isSelectedDateTangCa, setIsSelectedDateTangCa] = useState(dayjs());
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (isVisible) {
      form.resetFields();
      setIsSelectedPhongBan(0);
      setIsSelectedDateTangCa(dayjs());
    }
  }, [isVisible, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const tangCaData = {
        ngayChamCongTangCa: values.ngayChamCongTangCa.format("YYYY-MM-DD"),
        gioTangCaBatDau: values.gioTangCaBatDau.format("HH:mm"),
        gioTangCaKetThuc: values.gioTangCaKetThuc.format("HH:mm"),
        maPhongBan: values.maPhongBan,
      };

      // Kiểm tra giờ bắt đầu phải nhỏ hơn giờ kết thúc
      if (values.gioTangCaBatDau.isAfter(values.gioTangCaKetThuc)) {
        message.error("Giờ bắt đầu phải nhỏ hơn giờ kết thúc!");
        return;
      }

      await createTangCa(tangCaData);
      await getAllTangCa();
      await getAllChamCongDetail();
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm tăng ca!");
      console.error("Error creating tangca:", error);
    } finally {
      setLoading(false);
    }
  };
  const date = new Date(isSelectedDateTangCa);
  const dayOfWeek = date.getDay() + 1;

  const danhSachCaLamTrongTuanFind = danhSachCaLamTrongTuanTheoPhongBan.find(
    (cltt) =>
    cltt.ngayTrongTuan === dayOfWeek
  );

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  //  ===== VALIDATE ====
  const validateGioBatDau = (_, value) => {
    // Giữ nguyên dayjs object, không format
    const valueConvert = dayjs(value);
    const gioKetThucCa = dayjs(
      danhSachCaLamTrongTuanFind.gioKetThuc,
      "HH:mm:ss"
    );

    console.log("Trước giờ kết thúc ca: ", valueConvert.isBefore(gioKetThucCa));

    if (valueConvert.isBefore(gioKetThucCa)) {
      return Promise.reject(
        "Thời gian không hợp lệ! Giờ bắt đầu tăng ca phải lớn hơn giờ kết thúc ca "
      );
    }

    return Promise.resolve();
  };

  const validateGioKetThuc = (_, value) => {
    // Giữ nguyên dayjs object, không format
    const valueConvert = dayjs(value);
    const gioKetThucCa = dayjs(
      danhSachCaLamTrongTuanFind.gioKetThuc,
      "HH:mm:ss"
    );

    console.log("Trước giờ kết thúc ca: ", valueConvert.isBefore(gioKetThucCa));

    if (valueConvert.isBefore(gioKetThucCa)) {
      return Promise.reject(
        "Thời gian không hợp lệ! Giờ kết thúc tăng ca phải lớn hơn giờ kết thúc ca"
      );
    }

    if (
      valueConvert.isBefore(form.getFieldValue("gioTangCaBatDau")) ||
      valueConvert.isSame(form.getFieldValue("gioTangCaBatDau"))
    ) {
      return Promise.reject(
        "Thời gian không hợp lệ! Giờ kết thúc tăng ca phải lớn hơn giờ tăng ca bắt đầu"
      );
    }

    return Promise.resolve();
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
        initialValues={{
          ngayChamCongTangCa: isSelectedDateTangCa,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Ngày tăng ca"
              name="ngayChamCongTangCa"
              rules={[
                { required: true, message: "Vui lòng chọn ngày tăng ca!" },
              ]}
            >
              <ConfigProvider locale={locale}>
                <DatePicker
                  value={isSelectedDateTangCa}
                  onChange={(value) => {
                    setIsSelectedDateTangCa(dayjs(value));
                    form.setFieldValue("ngayChamCongTangCa", value);
                  }}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày tăng ca"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </ConfigProvider>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giờ bắt đầu"
              name="gioTangCaBatDau"
              rules={[
                { required: true, message: "Vui lòng chọn giờ bắt đầu!" },
                { validator: validateGioBatDau },
              ]}
            >
              <TimePicker
                disabled={isSelectedPhongBan === 0 ? true : false}
                style={{ width: "100%" }}
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
                { required: true, message: "Vui lòng chọn giờ kết thúc!" },
                { validator: validateGioKetThuc },
              ]}
            >
              <TimePicker
                disabled={
                  isSelectedPhongBan === 0 ||
                  form.getFieldValue("gioTangCaBatDau") === undefined
                    ? true
                    : false
                }
                style={{ width: "100%" }}
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
              rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
            >
              <Select
                onChange={(value) => {
                  console.log("value: ", value);
                  setIsSelectedPhongBan(value);
                }}
                placeholder="Chọn phòng ban"
                style={{ width: "100%" }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {danhSachPhongBan.map((phongBan) => (
                  <Option key={phongBan.maPhongBan} value={phongBan.maPhongBan}>
                    {phongBan.tenPhongBan}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <div>
              {isSelectedPhongBan !== 0 ? (
                danhSachCaLamTrongTuanFind?.coLamViec === 0 ? (
                  <Tag color="red">
                    Hôm nay không có ca làm ({weekdays[date.getDay()]})
                  </Tag>
                ) : (
                  <Tag color="green">
                    Ca làm việc {weekdays[date.getDay()]}:{" "}
                    {danhSachCaLamTrongTuanFind?.gioBatDau ?? 0} -{" "}
                    {danhSachCaLamTrongTuanFind?.gioKetThuc ?? 0}
                  </Tag>
                )
              ) : null}
            </div>
          </Col>
        </Row>

        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={handleCancel}>Hủy</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm Tăng Ca
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
