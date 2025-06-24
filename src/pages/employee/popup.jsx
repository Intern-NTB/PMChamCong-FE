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
import customParseFormat from 'dayjs/plugin/customParseFormat';
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
}) => {
  const [form] = Form.useForm();
  const [soDienThoaiWarning, setSoDienThoaiWarning] = useState(null);
  const [hasPriority, setHasPriority] = useState(false); // New state for priority toggle

  const { danhSachPhongBan } = usePhongBan();
  const { danhSachVaiTro, loadingVaiTro, getAllVaiTro } = useVaiTro();
  const { danhSachDoiTuongUuTien, loadingDoiTuongUuTien } = useDoiTuongUuTien();
  const { danhSachNhanVien } = useNhanVien();

  const parseDate = useCallback((dateString) => {
    console.log("parseDate: Input dateString:", dateString);
    if (!dateString) {
      console.log("parseDate: dateString is empty/null, returning undefined.");
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
        console.log(`parseDate: Successfully parsed '${dateString}' with format '${format}' to:`, parsed.format('YYYY-MM-DD'));
        return parsed;
      }
    }

    parsed = dayjs(dateString);
    if (parsed.isValid()) {
        console.warn(`parseDate: Parsed '${dateString}' without explicit format. This might be less reliable. Result:`, parsed.format('YYYY-MM-DD'));
        return parsed;
    }

    console.error("parseDate: Could not parse date string:", dateString, "using any known format. Returning undefined.");
    return undefined;
  }, []);

  useEffect(() => {
    if (visible) {
      console.log("Popup useEffect: visible is true. InitialValues:", initialValues);
      if (initialValues) {
        console.log("Popup useEffect: initialValues.ngaySinh before parsing:", initialValues.ngaySinh);
        const parsedNgaySinh = parseDate(initialValues.ngaySinh);
        console.log("Popup useEffect: parsedNgaySinh after parsing:", parsedNgaySinh);

        const cmndToSet = initialValues.cmnd || null;

        setHasPriority(initialValues.maUuTien > 0); 

        const fieldsToSet = {
          ...initialValues,
          ngaySinh: parsedNgaySinh,
          maPhongBan: initialValues.maPhongBan ?? maPhongBan ?? null,
          maVaiTro: initialValues.maVaiTro ?? maVaiTro ?? null,
          maUuTien: initialValues.maUuTien > 0 ? initialValues.maUuTien : undefined,
          cmnd: cmndToSet,
        };
        console.log("Popup useEffect: Setting form fields with:", fieldsToSet);
        form.setFieldsValue(fieldsToSet);

        const effectiveMaPhongBan = initialValues.maPhongBan ?? maPhongBan;
        if (effectiveMaPhongBan) {
          getAllVaiTro(effectiveMaPhongBan);
        } else {
          form.setFieldValue("maVaiTro", null);
        }
      } else {
        console.log("Popup useEffect: No initialValues, resetting form.");
        form.resetFields();
        setSoDienThoaiWarning(null);
        setHasPriority(false); 
        if (maPhongBan) {
          form.setFieldValue("maPhongBan", maPhongBan);
          getAllVaiTro(maPhongBan);
        }
      }
    } else {
        console.log("Popup useEffect: visible is false, skipping form setup.");
    }
  }, [visible, initialValues, maPhongBan, maVaiTro, getAllVaiTro, parseDate, form]);

  useEffect(() => {
    if (!visible) return;

    const checkDuplicatePhone = (value) => {
      if (!value) {
        setSoDienThoaiWarning(null);
        return;
      }

      const isDuplicate = danhSachNhanVien.some(nv =>
        nv.maNhanVien !== initialValues?.maNhanVien &&
        nv.soDienThoai === value
      );

      if (isDuplicate) {
        setSoDienThoaiWarning("Số điện thoại này đã tồn tại trong hệ thống. Vẫn có thể lưu.");
      } else {
        setSoDienThoaiWarning(null);
      }
    };

    const soDienThoaiValue = form.getFieldValue('soDienThoai');
    checkDuplicatePhone(soDienThoaiValue);

    const timer = setTimeout(() => {
      const currentSoDienThoai = form.getFieldValue('soDienThoai');
      if (currentSoDienThoai !== soDienThoaiValue) {
        checkDuplicatePhone(currentSoDienThoai);
      }
    }, 300);

    return () => clearTimeout(timer);

  }, [form, danhSachNhanVien, initialValues?.maNhanVien, visible]);

  const handleDateChange = useCallback((date) => {
    console.log("handleDateChange: Selected date:", date);
    if (date && dayjs.isDayjs(date) && date.isValid()) {
      form.setFieldValue("ngaySinh", date);
      console.log("handleDateChange: Set ngaySinh to valid date.");
    } else {
      form.setFieldValue("ngaySinh", undefined);
      console.log("handleDateChange: Set ngaySinh to undefined (cleared).");
    }
  }, [form]);

  const validatecmnd = useCallback(async (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (!/^\d{12}$/.test(value)) {
      return Promise.reject("Căn cước công dân phải gồm 12 chữ số.");
    }

    const isDuplicate = danhSachNhanVien.some(nv =>
      nv.maNhanVien !== initialValues?.maNhanVien &&
      (nv.cmnd === value)
    );

    if (isDuplicate) {
      return Promise.reject("cmnd này đã tồn tại trong hệ thống. Vui lòng nhập cmnd khác.");
    }
    return Promise.resolve();
  }, [danhSachNhanVien, initialValues?.maNhanVien]);

  const validateSoDienThoaiFormat = useCallback(async (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (!/^\d{10}$/.test(value)) {
      return Promise.reject("Số điện thoại phải gồm 10 chữ số.");
    }
    return Promise.resolve();
  }, []);

  const handleOk = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        if (soDienThoaiWarning) {
            console.log("Submitting with phone number warning.");
        }

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
        values.hoTen = values.hoTen || null;

        values.maPhongBan = values.maPhongBan ? Number(values.maPhongBan) : null;
        values.maVaiTro = values.maVaiTro ? Number(values.maVaiTro) : null;
        values.maUuTien = hasPriority && values.maUuTien ? Number(values.maUuTien) : null;
        values.luongCoBan = values.luongCoBan ? Number(values.luongCoBan) : null;
        values.heSoTangCa = values.heSoTangCa ? Number(values.heSoTangCa) : null;

        values.cmnd = values.cmnd ? String(values.cmnd) : null;
        if (!initialValues?.maNhanVien) {
          values.ngayVaoLam = toLocalISOString();
        }
        console.log("Data submitted to API:", values);
        onOk(values);
        form.resetFields();
        setSoDienThoaiWarning(null);
        setHasPriority(false); 
      })
      .catch((info) => {
        console.warn("Validation failed:", info);
        message.error("Vui lòng kiểm tra lại thông tin nhập liệu và các trường bị lỗi.");
      });
  }, [form, onOk, initialValues?.maNhanVien, soDienThoaiWarning, hasPriority]); 

  const handleChangePhongBan = useCallback((value) => {
    form.setFieldValue("maPhongBan", value);
    getAllVaiTro(value);
    form.setFieldValue("maVaiTro", null);
  }, [form, getAllVaiTro]);

  const getUuTienValue = useCallback(() => {
    const currentMaUuTien = form.getFieldValue("maUuTien");
    return hasPriority && currentMaUuTien > 0 ? currentMaUuTien : undefined;
  }, [form, hasPriority]); 
  const handlePriorityToggle = useCallback((checked) => {
    setHasPriority(checked);
    if (!checked) {
      form.setFieldsValue({ maUuTien: undefined });
    }
  }, [form]);

  const dataSourceVaiTro = danhSachVaiTro.map((vt) => ({
    value: vt.maVaiTro,
    label: vt.tenVaiTro,
  }));

  return (
    <Modal
      style={{ width: "500px" }}
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setSoDienThoaiWarning(null);
        setHasPriority(false); 
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            onCancel();
            form.resetFields();
            setSoDienThoaiWarning(null);
            setHasPriority(false); 
          }}
        >
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="employeeForm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hoTen" label="Họ Tên" rules={[{ required: true, message: "Vui lòng nhập Họ Tên!" }]}>
              <Input placeholder="Nhập họ tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ngaySinh" label="Ngày Sinh">
              <Space style={{ width: "100%" }}>
                <DatePicker
                  onChange={handleDateChange}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  value={form.getFieldValue("ngaySinh")}
                />
              </Space>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="luongCoBan"
              label="Lương Cơ bản"
              rules={[
                {required:true,message: "Vui lòng nhập lương cơ bản cho nhân viên"},
                {
                  type: 'number',
                  min: 0,
                  message: 'Vui lòng nhập số hợp lệ và không âm!',
                  transform: (value) => (value === '' || value === undefined || value === null) ? null : Number(value),
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
                  type: 'number',
                  min: 0,
                  message: 'Vui lòng nhập số hợp lệ và không âm!',
                  transform: (value) => (value === '' || value === undefined || value === null) ? null : Number(value),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} placeholder="Nhập hệ số tăng ca" />
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
              />
            </Form.Item>
          </Col>

          {/* New row for Priority toggle and Select */}
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
                value={getUuTienValue()}
                allowClear
                disabled={!hasPriority}
              >
                {Array.isArray(danhSachDoiTuongUuTien) ? (
                  danhSachDoiTuongUuTien.map((dtut) => (
                    <Option key={dtut.maUuTien} value={dtut.maUuTien}>
                      {dtut.tenUuTien}
                    </Option>
                  ))
                ) : (
                  <Option value={null} disabled>Đang tải...</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          {/* End new row */}

          <Col span={12}>
            <Form.Item
              name="cmnd"
              label="Căn cước công dân"
              rules={[
                { validator: validatecmnd },
              ]}
            >
              <Input placeholder="Nhập số cmnd" maxLength={12} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="diaChi" label="Địa chỉ">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
            <Form.Item
              name="soDienThoai"
              label="Số điện thoại"
              rules={[
                { validator: validateSoDienThoaiFormat },
              ]}
              validateStatus={soDienThoaiWarning ? "warning" : undefined}
              help={soDienThoaiWarning}
            >
              <Input
                placeholder="Nhập số điện thoại"
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value;
                  form.setFieldsValue({ soDienThoai: value });
                  const isDuplicate = danhSachNhanVien.some(nv =>
                    nv.maNhanVien !== initialValues?.maNhanVien &&
                    nv.soDienThoai === value
                  );
                  if (isDuplicate) {
                    setSoDienThoaiWarning("Số điện thoại này đã tồn tại trong hệ thống!");
                  } else {
                    setSoDienThoaiWarning(null);
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Popup;