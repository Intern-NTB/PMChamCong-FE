/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
  message,
  Switch,
} from "antd";
import { useEffect, useCallback, useState } from "react";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useVaiTro } from "../../component/hooks/useVaiTro";
import { useDoiTuongUuTien } from "../../component/hooks/useDoiTuongUuTien";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { toLocalISOString } from "../../component/utils/format_date_iso";

dayjs.extend(customParseFormat);

const { Option } = Select;

const Popup = ({
  visible,
  onCancel,
  onOk,
  initialValues,
  maPhongBan,
  maVaiTro,
  title,
  formFields,
  isEditMode,
}) => {
  const [form] = Form.useForm();
  const [soDienThoaiWarning, setSoDienThoaiWarning] = useState(null);
  const [hasPriority, setHasPriority] = useState(false);

  const { danhSachPhongBan } = usePhongBan();
  const { danhSachVaiTro, loadingVaiTro, getAllVaiTro } = useVaiTro();
  const { danhSachDoiTuongUuTien, loadingDoiTuongUuTien } =
    useDoiTuongUuTien();
  const { danhSachNhanVien } = useNhanVien();

  const parseDate = useCallback((dateString) => {
    if (!dateString) {
      return undefined;
    }

    const formats = [
      "YYYY-MM-DDTHH:mm:ss.SSSZ",
      "YYYY-MM-DDTHH:mm:ssZ",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD",
      "DD/MM/YYYY",
      "MM/DD/YYYY",
      "DD-MM-YYYY",
    ];

    let parsed = null;
    for (const format of formats) {
      parsed = dayjs(dateString, format, true);
      if (parsed.isValid()) {
        return parsed;
      }
    }

    parsed = dayjs(dateString);
    if (parsed.isValid()) {
      return parsed;
    }

    console.warn(
      "parseDate: Could not parse date string:",
      dateString,
      "using any known format."
    );
    return undefined;
  }, []);

  useEffect(() => {
    if (visible) {
      form.resetFields();

      if (initialValues && isEditMode) {
        const parsedNgaySinh = parseDate(initialValues.ngaySinh);
        const parsedNgayVaoLam = parseDate(initialValues.ngayVaoLam);

        setHasPriority(initialValues.maUuTien > 0);

        const fieldsToSet = {
          ...initialValues,
          ngaySinh: parsedNgaySinh,
          ngayVaoLam: parsedNgayVaoLam,
          maPhongBan: initialValues.maPhongBan,
          maVaiTro: initialValues.maVaiTro,
          maUuTien:
            initialValues.maUuTien > 0 ? initialValues.maUuTien : undefined,
        };
        form.setFieldsValue(fieldsToSet);

        if (initialValues.maPhongBan) {
          getAllVaiTro(initialValues.maPhongBan);
        }
      } else {
        setSoDienThoaiWarning(null);
        setHasPriority(false);

        if (maPhongBan) {
          form.setFieldValue("maPhongBan", maPhongBan);
          getAllVaiTro(maPhongBan);
        } else {
          form.setFieldsValue({ maPhongBan: undefined, maVaiTro: undefined });
        }
      }
    } else {
      form.resetFields();
      setSoDienThoaiWarning(null);
      setHasPriority(false);
    }
  }, [
    visible,
    initialValues,
    isEditMode,
    maPhongBan,
    maVaiTro,
    getAllVaiTro,
    parseDate,
    form,
  ]);

  useEffect(() => {
    if (visible && form) {
      // Chạy kiểm tra trùng lặp ban đầu khi popup mở
      const initialSoDienThoai = form.getFieldValue("soDienThoai");
      checkDuplicatePhone(initialSoDienThoai);
    }
  }, [visible, form, danhSachNhanVien, initialValues?.maNhanVien]);

  const checkDuplicatePhone = useCallback(
    (value) => {
      if (!value) {
        setSoDienThoaiWarning(null);
        return;
      }

      const isDuplicate = danhSachNhanVien.some(
        (nv) =>
          nv.maNhanVien !== initialValues?.maNhanVien &&
          nv.soDienThoai === value
      );

      if (isDuplicate) {
        setSoDienThoaiWarning("Số điện thoại này đã tồn tại trong hệ thống.");
      } else {
        setSoDienThoaiWarning(null);
      }
    },
    [danhSachNhanVien, initialValues?.maNhanVien]
  );

  const handleDateChange = useCallback(
    (date) => {
      form.setFieldValue("ngaySinh", date);
    },
    [form]
  );

  const validateCmnd = useCallback(
    async (_, value) => {
      if (!value) {
        return Promise.resolve();
      }
      if (!/^\d{12}$/.test(value)) {
        return Promise.reject("Căn cước công dân phải gồm 12 chữ số.");
      }

      const isDuplicate = danhSachNhanVien.some(
        (nv) => nv.maNhanVien !== initialValues?.maNhanVien && nv.cmnd === value
      );

      if (isDuplicate) {
        return Promise.reject(
          "CCCD này đã tồn tại trong hệ thống. Vui lòng nhập CCCD khác."
        );
      }
      return Promise.resolve();
    },
    [danhSachNhanVien, initialValues?.maNhanVien]
  );

  const validateSoDienThoaiFormat = useCallback(async (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (!/^\d{10}$/.test(value)) {
      return Promise.reject("Số điện thoại phải gồm 10 chữ số.");
    }
    return Promise.resolve();
  }, []);

  const validateEmail = useCallback(
    async (_, value) => {
      if (!value) {
        return Promise.resolve();
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return Promise.reject("Vui lòng nhập định dạng email hợp lệ.");
      }

      const isDuplicate = danhSachNhanVien.some(
        (nv) => nv.maNhanVien !== initialValues?.maNhanVien && nv.email === value
      );
      if (isDuplicate) {
        return Promise.reject("Email này đã tồn tại trong hệ thống.");
      }

      return Promise.resolve();
    },
    [danhSachNhanVien, initialValues?.maNhanVien]
  );

  const handleOk = useCallback(() => {
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

        if (!isEditMode) {
          values.ngayVaoLam = toLocalISOString().split("T")[0];
        } else if (
          values.ngayVaoLam &&
          dayjs.isDayjs(values.ngayVaoLam) &&
          values.ngayVaoLam.isValid()
        ) {
          values.ngayVaoLam = values.ngayVaoLam.format("YYYY-MM-DD");
        } else {
          values.ngayVaoLam = null;
        }

        values.diaChi = values.diaChi || null; // Ensure diaChi is set to null if empty
        values.soDienThoai = values.soDienThoai || null;
        values.hoTen = values.hoTen || null;
        values.cmnd = values.cmnd || null;
        values.email = values.email || null;

        values.maPhongBan = values.maPhongBan
          ? Number(values.maPhongBan)
          : null;
        values.maVaiTro = values.maVaiTro ? Number(values.maVaiTro) : null;
        values.luongCoBan = values.luongCoBan
          ? Number(values.luongCoBan)
          : null;
        values.heSoTangCa = values.heSoTangCa
          ? Number(values.heSoTangCa)
          : null;

        values.maUuTien =
          hasPriority && values.maUuTien ? Number(values.maUuTien) : null;

        onOk(values);
      })
      .catch((info) => {
        console.warn("Validation failed:", info);
        message.error({
          content: "Vui lòng kiểm tra lại thông tin nhập liệu và các trường bị lỗi.",
          duration: 3,
          key: 'validation-error-message'
        });
      });
  }, [form, onOk, isEditMode, hasPriority]);

  const handleChangePhongBan = useCallback(
    (value) => {
      form.setFieldValue("maPhongBan", value);
      getAllVaiTro(value);
      form.setFieldValue("maVaiTro", undefined);
    },
    [form, getAllVaiTro]
  );

  const handlePriorityToggle = useCallback(
    (checked) => {
      setHasPriority(checked);
      if (!checked) {
        form.setFieldsValue({ maUuTien: undefined });
      }
    },
    [form]
  );

  const dataSourceVaiTro = Array.isArray(danhSachVaiTro)
    ? danhSachVaiTro.map((vt) => ({
        value: vt.maVaiTro,
        label: vt.tenVaiTro,
      }))
    : [];

  return (
    <Modal
      style={{ width: "500px" }}
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
      }}
      footer={
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 8,
            paddingTop: 8,
          }}
        >
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" onClick={handleOk}>Lưu</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" name="employeeForm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hoTen"
              label="Họ Tên"
              rules={[{ required: true, message: "Vui lòng nhập Họ Tên!" }]}
            >
              <Input placeholder="Nhập họ tên" />
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
                {
                  required: true,
                  message: "Vui lòng nhập lương cơ bản cho nhân viên",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Vui lòng nhập số hợp lệ và không âm!",
                  transform: (value) =>
                    value === "" || value === undefined || value === null
                      ? null
                      : Number(value),
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập lương cơ bản"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="heSoTangCa"
              label="Hệ số tăng ca"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "Vui lòng nhập số hợp lệ và không âm!",
                  transform: (value) =>
                    value === "" || value === undefined || value === null
                      ? null
                      : Number(value),
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập hệ số tăng ca"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              tooltip="Chọn phòng ban để thay đổi vai trò"
              name="maPhongBan"
              label="Phòng ban"
              rules={[{ required: true, message: "Vui lòng chọn Phòng ban!" }]}
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
          </Col>
          <Col span={12}>
            <Form.Item
              name="maVaiTro"
              label="Vai Trò"
              rules={[{ required: true, message: "Vui lòng chọn Vai trò!" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                loading={loadingVaiTro}
                options={dataSourceVaiTro}
                disabled={!form.getFieldValue("maPhongBan")}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Ưu tiên">
              <Switch
                checked={hasPriority}
                onChange={handlePriorityToggle}
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maUuTien" label="Loại ưu tiên">
              <Select
                placeholder="Chọn ưu tiên"
                style={{ width: "100%" }}
                loading={loadingDoiTuongUuTien}
                allowClear
                disabled={!hasPriority}
              >
                {Array.isArray(danhSachDoiTuongUuTien) &&
                danhSachDoiTuongUuTien.length > 0 ? (
                  danhSachDoiTuongUuTien.map((dtut) => (
                    <Option key={dtut.maUuTien} value={dtut.maUuTien}>
                      {dtut.tenUuTien}
                    </Option>
                  ))
                ) : (
                  <Option value={null} disabled>
                    Không có dữ liệu ưu tiên
                  </Option>
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {/* New Row to group CMND, So Dien Thoai, and Email */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cmnd"
              label="Căn cước công dân"
              rules={[{ validator: validateCmnd }]}
            >
              <Input placeholder="Nhập số cmnd" maxLength={12} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="soDienThoai"
              label="Số điện thoại"
              rules={[{ validator: validateSoDienThoaiFormat }]}
            >
              <Input placeholder="Nhập số điện thoại" maxLength={10} />
            </Form.Item>
            {/* The warning message is kept outside the Form.Item to manage its own spacing */}
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.soDienThoai !== currentValues.soDienThoai
              }
              noStyle // Important: Remove default Form.Item spacing for this one
            >
              {({ getFieldValue }) => {
                const sdt = getFieldValue("soDienThoai");

                const isDuplicate = danhSachNhanVien.some(
                  (nv) =>
                    nv.maNhanVien !== initialValues?.maNhanVien &&
                    nv.soDienThoai === sdt &&
                    sdt
                );

                if (isDuplicate) {
                  return (
                    <div
                      style={{
                        color: "orange",
                        marginTop: "-15px", // Adjust as needed
                        marginBottom: "5px", // Reduced from 15px to tighten
                      }}
                    >
                      Số điện thoại này đã tồn tại trong hệ thống.
                    </div>
                  );
                }
                return null;
              }}
            </Form.Item>
          </Col>
          <Col span={24}> {/* Email takes full width within this row */}
            <Form.Item
              name="email"
              label="Email"
              rules={[{ validator: validateEmail }]}
              // No need for marginBottom style here if it's within the same row as the previous fields
            >
              <Input placeholder="Nhập email" type="email" />
            </Form.Item>
          </Col>
        </Row>

        {/* Dia chi field remains in its own row, as it's typically a separate block */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="diaChi" label="Địa chỉ">
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>
        </Row>

        {isEditMode && initialValues?.ngayVaoLam && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngayVaoLam" label="Ngày Vào Làm">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

export default Popup;