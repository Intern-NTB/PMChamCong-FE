import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Space,
  Row,
  Col,
  Select,
  InputNumber,
} from "antd";
import { useEffect } from "react";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useVaiTro } from "../../component/hooks/useVaiTro";
import { useDoiTuongUuTien } from "../../component/hooks/useDoiTuongUuTien";
import dayjs from "dayjs";
import { toLocalISOString } from "../../component/utils/format_date_iso";

const Popup = ({
  visible,
  onCancel,
  onOk,
  initialValues,
  maPhongBan,
  maVaiTro,
  title,
}) => {
  const { danhSachPhongBan } = usePhongBan();
  const { danhSachVaiTro, loadingVaiTro, getAllVaiTro } = useVaiTro();
  const { danhSachDoiTuongUuTien, loadingDoiTuongUuTien } = useDoiTuongUuTien();
  const [form] = Form.useForm();

  const dataSourceVaiTro = danhSachVaiTro.map((vt) => ({
    maVaiTro: vt.maVaiTro,
    tenVaiTro: vt.tenVaiTro,
  }));

  // Reset form khi initialValues thay đổi
  useEffect(() => {
    if (initialValues) {
      const parsedDate = parseDate(initialValues.ngaySinh);
      form.setFieldsValue({
        ...initialValues,
        ngaySinh: parsedDate,
        maPhongBan: initialValues.maPhongBan ?? maPhongBan ?? null,
        maVaiTro: initialValues.maVaiTro ?? maVaiTro ?? null,
        maUuTien: initialValues.maUuTien > 0 ? initialValues.maUuTien : null,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseDate = (dateString) => {
    return dateString ? dayjs(dateString) : null;
  };

  // Xử lý khi thay đổi ngày sinh
  const handleDateChange = (date, dateString) => {
    console.log("Date changed:", date, dateString);
    // Chỉ update khi date là dayjs object hợp lệ
    if (date && dayjs.isDayjs(date) && date.isValid()) {
      form.setFieldValue("ngaySinh", date);
    } else if (!date) {
      // Trường hợp clear date
      form.setFieldValue("ngaySinh", null);
    }
  };

  // Xử lý khi nhấn OK
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Format ngày sinh về dạng YYYY-MM-DD, kiểm tra tính hợp lệ
        if (
          values.ngaySinh &&
          dayjs.isDayjs(values.ngaySinh) &&
          values.ngaySinh.isValid()
        ) {
          values.ngaySinh = values.ngaySinh.format("YYYY-MM-DD");
        } else {
          values.ngaySinh = null;
        }
        console.log("Ngày sinh ", values.ngaySinh);

        values.diaChi = values.diaChi || null;
        values.soDienThoai = values.soDienThoai || null;
        values.maPhongBan = Number(values.maPhongBan) || null;
        values.maVaiTro = Number(values.maVaiTro) || null;
        values.maUuTien = Number(values.maUuTien) || null;
        values.luongCoBan = Number(values.luongCoBan) || null;
        values.heSoTangCa = Number(values.heSoTangCa) || null;
        values.cmnd = String(values.CCCD) || null;
        values.hoTen = values.hoTen || null;

        // Thêm thời gian hiện tại
        values.ngayVaoLam = toLocalISOString();
        console.log("Dữ liệu gửi lên API:", values);
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validation failed:", info);
      });
  };

  // Xử lý thay đổi phòng ban
  const handleChange = (value) => {
    console.log("Selected Phòng ban:", value);
    form.setFieldValue("maPhongBan", value);
    getAllVaiTro(value);
    form.setFieldValue("maVaiTro", null);
  };

  // Kiểm tra giá trị hiển thị cho Select Ưu tiên
  const getUuTienValue = () => {
    const currentMaUuTien = form.getFieldValue("maUuTien");
    return currentMaUuTien && currentMaUuTien > 0 ? currentMaUuTien : undefined;
  };

  return (
    <Modal
      style={{
        width: "50vh",
      }}
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            onCancel();
          }}
        >
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Lưu
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="editForm"
        initialValues={initialValues || {}}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hoTen" label="Họ Tên">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ngaySinh" label="Ngày Sinh">
              <Space>
                <DatePicker
                  onChange={handleDateChange}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Space>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="luongCoBan" label="Lương Cơ bản">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="heSoTangCa" label="Hệ số tăng ca">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              tooltip="Chọn phòng ban để thay đổi vai trò"
              name="maVaiTro"
              label="Vai Trò"
            >
              <Select
                placeholder="Chọn vai trò"
                loading={loadingVaiTro}
                options={dataSourceVaiTro.map((item) => ({
                  value: item.maVaiTro,
                  label: item.tenVaiTro,
                }))}
              />
            </Form.Item>
            <Form.Item name="maUuTien" label="Ưu tiên">
              <Select
                placeholder="Chọn ưu tiên"
                style={{ width: "100%" }}
                loading={loadingDoiTuongUuTien}
                value={getUuTienValue()}
                options={danhSachDoiTuongUuTien.map((dtut) => ({
                  value: dtut.maUuTien,
                  label: dtut.tenUuTien,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maPhongBan" label="Phòng ban">
              <Select
                placeholder="Chọn phòng ban"
                style={{ width: "100%" }}
                onChange={handleChange}
                options={
                  Array.isArray(danhSachPhongBan)
                    ? danhSachPhongBan.map((pb) => ({
                        value: pb.maPhongBan,
                        label: pb.tenPhongBan,
                      }))
                    : []
                }
              />
            </Form.Item>
            <Form.Item
              name="cmnd"
              label="Căn cước công dân"
              rules={[
                {
                  pattern: /^\d{12}$/,
                  message: "Căn cước gồm 12 chữ số",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="diaChi" label="Địa chỉ">
              <Input />
            </Form.Item>
            <Form.Item
              name="soDienThoai"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^\d{10}$/,
                  message: "Số điện thoại gồm 10 chữ số",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Popup;
