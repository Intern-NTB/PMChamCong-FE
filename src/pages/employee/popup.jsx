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
  Switch,
} from "antd";
import { useEffect, useState } from "react";
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

  const [hasPriority, setHasPriority] = useState(false);

  const dataSourceVaiTro = danhSachVaiTro.map((vt) => ({
    maVaiTro: vt.maVaiTro,
    tenVaiTro: vt.tenVaiTro,
  }));

  const parseDate = (dateString) => {
    return dateString ? dayjs(dateString) : null;
  };

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        const parsedDate = parseDate(initialValues.ngaySinh);
        const initialMaUuTien = initialValues.maUuTien;

        const initialHasPriority = initialMaUuTien && initialMaUuTien > 0;
        setHasPriority(initialHasPriority);

        form.setFieldsValue({
          ...initialValues,
          ngaySinh: parsedDate,
          maPhongBan: initialValues.maPhongBan ?? maPhongBan ?? null,
          maVaiTro: initialValues.maVaiTro ?? maVaiTro ?? null,
          maUuTien: initialHasPriority ? initialMaUuTien : undefined,
        });
      } else {
        form.resetFields();
        setHasPriority(false);
      }
    }
  }, [visible, initialValues, maPhongBan, maVaiTro, form]);

  const handleDateChange = (date) => {
    form.setFieldValue("ngaySinh", date);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (
          values.ngaySinh &&
          dayjs.isDayjs(values.ngaySinh) &&
          values.ngaySinh.isValid()
        ) {
          values.ngaySinh = values.ngaySinh.format("YYYY-MM-DD");
        } else {
          values.ngaySinh = null;
        }

        values.diaChi = values.diaChi || null;
        values.soDienThoai = values.soDienThoai || null;
        values.maPhongBan = Number(values.maPhongBan) || null;
        values.maVaiTro = Number(values.maVaiTro) || null;
        values.luongCoBan = Number(values.luongCoBan) || null;
        values.heSoTangCa = Number(values.heSoTangCa) || null;
        values.cmnd = String(values.CCCD) || null;
        values.hoTen = values.hoTen || null;

        if (hasPriority) {
          values.maUuTien = Number(values.maUuTien) || null;
        } else {
          values.maUuTien = null;
        }

        values.ngayVaoLam = toLocalISOString();

        onOk(values);
      })
      .catch((info) => {
        console.log("Validation failed:", info);
      });
  };

  const handleChangePhongBan = (value) => {
    form.setFieldValue("maPhongBan", value);
    getAllVaiTro(value);
    form.setFieldValue("maVaiTro", undefined);
  };

  const handlePrioritySwitchChange = (checked) => {
    setHasPriority(checked);
    if (!checked) {
      form.setFieldValue("maUuTien", undefined);
      form.setFields([{ name: 'maUuTien', errors: [] }]);
    }
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
        form.resetFields();
        setHasPriority(false);
        onCancel();
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            form.resetFields();
            setHasPriority(false);
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
      <Form form={form} layout="vertical" name="editForm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hoTen"
              label="Họ Tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ngaySinh" label="Ngày Sinh">
              <DatePicker
                onChange={handleDateChange}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="luongCoBan"
              label="Lương Cơ bản"
              rules={[
                { required: true, message: "Vui lòng nhập lương cơ bản!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="heSoTangCa"
              label="Hệ số tăng ca"
              rules={[
                { required: true, message: "Vui lòng nhập hệ số tăng ca!" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}> {/* Cột bên trái: Phòng ban, Vai trò */}
            <Form.Item
              name="maPhongBan"
              label="Phòng ban"
              rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
            >
              <Select
                placeholder="Chọn phòng ban"
                style={{ width: "100%" }}
                onChange={handleChangePhongBan}
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
              tooltip="Chọn phòng ban để thay đổi vai trò"
              name="maVaiTro"
              label="Vai Trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
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
          </Col>
          <Col span={12}> {/* Cột bên phải: CCCD, Chế độ ưu tiên, Loại ưu tiên */}
            <Form.Item
              name="CCCD"
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
            {/* Chế độ ưu tiên (Switch) */}
            <Form.Item label="Chế độ ưu tiên">
              <Switch
                checked={hasPriority}
                onChange={handlePrioritySwitchChange}
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </Form.Item>
            {/* Loại ưu tiên (Select) - Luôn hiển thị, disable khi hasPriority là false */}
            <Form.Item
              name="maUuTien"
              label="Loại ưu tiên"
              rules={[
                {
                  required: hasPriority, // Bắt buộc chọn khi switch ưu tiên bật
                  message: "Vui lòng chọn loại ưu tiên!",
                },
              ]}
            >
              <Select
                placeholder="Chọn loại ưu tiên"
                style={{ width: "100%" }}
                loading={loadingDoiTuongUuTien}
                allowClear
                disabled={!hasPriority} // Vô hiệu hóa khi hasPriority là false
                options={danhSachDoiTuongUuTien.map((dtut) => ({
                  value: dtut.maUuTien,
                  label: dtut.tenUuTien,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
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