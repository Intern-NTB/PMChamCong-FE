import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Checkbox,
  DatePicker,
  Modal,
  Alert,
  Tag,
  Spin,
} from "antd";
import { ExclamationCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { useNghiPhep } from "../../component/hooks/useNghiPhep";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useNgayPhep } from "../../component/hooks/useNgayPhep";
import { useAppNotification } from "../../component/ui/notification";

import dayjs from "dayjs";
import { ModalEmail } from "./modalEmail";

export default function GiayNghiPhep() {
  const { danhSachNghiPhep, createNghiPhep } = useNghiPhep(false);
  const {
    danhSachNhanVien,
    thongTinNhanVien,
    fetchNhanVienByCCCD,
    updateEmailNhanVien,
  } = useNhanVien(false);
  const { danhSachNgayPhep, getAllNgayPhep } = useNgayPhep();

  const api = useAppNotification();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isPartialDay, setIsPartialDay] = useState(false);
  const [form] = Form.useForm();

  const [leaveWarning, setLeaveWarning] = useState("");
  const [showSplitRecordModal, setShowSplitRecordModal] = useState(false);
  const [soNgayPhepConLai, setSoNgayPhepConLai] = useState(0);
  const [completedInputCCCD, setCompletedInputCCCD] = useState({
    isCompleted: false,
    data: null,
  });
  const [isOpenModalUpdateEmail, setIsOpenModalUpdateEmail] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Thêm state để quản lý loading
  const [isLoadingNhanVien, setIsLoadingNhanVien] = useState(false);
  const [nhanVienError, setNhanVienError] = useState(null);

  // Tạo dataSourceNghiPhep để sử dụng trong các hàm khác
  const dataSourceNghiPhep = danhSachNghiPhep.map((np) => {
    const nhanVien = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === np.maNhanVien
    );

    return {
      maNghiPhep: np.maNghiPhep,
      ngayBatDau: np.ngayBatDau,
      ngayKetThuc: np.ngayKetThuc,
      liDo: np.liDo,
      tinhLuong: np.tinhLuong,
      tinhPhep: np.tinhPhep,
      trangThaiPheDuyet: np.trangThaiPheDuyet,
      maNhanVien: np.maNhanVien,
      hoTen: nhanVien ? nhanVien.hoTen : "Không xác định",
    };
  });

  // Sửa lại useEffect để xử lý loading và error
  useEffect(() => {
    if (completedInputCCCD.isCompleted) {
      const fetchData = async () => {
        setIsLoadingNhanVien(true);
        setNhanVienError(null);

        try {
          await fetchNhanVienByCCCD(completedInputCCCD.data);
        } catch (error) {
          setNhanVienError(
            error.message || "Không tìm thấy nhân viên với CCCD này"
          );
          api.error({
            message: "Lỗi tìm kiếm nhân viên",
            description:
              error.message || "Không tìm thấy nhân viên với CCCD này",
          });
        } finally {
          setIsLoadingNhanVien(false);
        }
      };

      fetchData();
    }
  }, [completedInputCCCD, fetchNhanVienByCCCD, api]);

  // Hàm để tính số ngày phép còn lại
  useEffect(() => {
    if (thongTinNhanVien?.maNhanVien) {
      const ngayPhep = danhSachNgayPhep.find(
        (np) => np.maNhanVien === thongTinNhanVien.maNhanVien
      );
      setSoNgayPhepConLai(ngayPhep ? ngayPhep.ngayPhepConLai : 0);
      setNhanVienError(null);
    }
  }, [danhSachNgayPhep, thongTinNhanVien]);

  // Hàm tính số ngày nghỉ dựa trên ngày bắt đầu và kết thúc
  const calculateLeaveDays = (
    startDate,
    endDate,
    isPartial = false,
    soGioLamViec = 8
  ) => {
    if (!startDate || !endDate) return 0;

    if (isPartial) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isSame(end, "day")) {
        const hoursOff = end.diff(start, "hour", true);
        return hoursOff < soGioLamViec * 0.5 ? 0.5 : 1;
      } else {
        return end.diff(start, "day") + 1;
      }
    } else {
      const start = dayjs(startDate).startOf("day");
      const end = dayjs(endDate).startOf("day");
      return end.diff(start, "day") + 1;
    }
  };

  const laySoGioLamViecTheoCa = (maNhanVien) => {
    const caLamNhanVien = dataSourceNghiPhep.find(
      (nhanVienNghiPhep) => nhanVienNghiPhep.maNhanVien === maNhanVien
    );
    return caLamNhanVien?.soGioLamViec || 8;
  };

  // Hàm kiểm tra và cảnh báo về số ngày phép
  const checkLeaveBalance = (maNhanVien, leaveDays, isTinhPhep) => {
    if (!isTinhPhep || !maNhanVien) return "";

    if (leaveDays > soNgayPhepConLai) {
      return `Số ngày nghỉ có phép (${leaveDays}) vượt quá số ngày phép còn lại (${soNgayPhepConLai}). Bạn có muốn tách thành 2 bản ghi: ${soNgayPhepConLai} ngày có phép và ${
        leaveDays - soNgayPhepConLai
      } ngày không phép?`;
    }

    return "";
  };

  // Xử lý khi thay đổi ngày trong form
  const handleDateChange = async () => {
    const values = form.getFieldsValue();
    const { ngayBatDau, ngayKetThuc, tinhPhep } = values;

    const maNhanVien = thongTinNhanVien?.maNhanVien;
    const soGioLamViec = laySoGioLamViecTheoCa(maNhanVien);

    if (ngayBatDau && ngayKetThuc && maNhanVien) {
      const leaveDays = calculateLeaveDays(
        ngayBatDau,
        ngayKetThuc,
        isPartialDay,
        soGioLamViec
      );
      if (tinhPhep) {
        const warning = checkLeaveBalance(maNhanVien, leaveDays, true);
        setLeaveWarning(warning);
      }
    }
  };

  const validateDateRangeUniqueDB = async () => {
    const startDate = form.getFieldValue("ngayBatDau");
    const endDate = form.getFieldValue("ngayKetThuc");
    const maNhanVien = thongTinNhanVien?.maNhanVien;

    if (maNhanVien) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      const isOverlapped = dataSourceNghiPhep.some((record) => {
        const rStart = dayjs(record.ngayBatDau, "DD/MM/YYYY HH:mm:ss");
        const rEnd = dayjs(record.ngayKetThuc, "DD/MM/YYYY HH:mm:ss");
        return (
          record.maNhanVien === maNhanVien &&
          (start.isBetween(rStart, rEnd, "[]") ||
            end.isBetween(rStart, rEnd, "[]") ||
            rStart.isBetween(start, end, "[]") ||
            rEnd.isBetween(start, end, "[]"))
        );
      });

      if (isOverlapped) {
        return Promise.reject(
          new Error("Khoảng thời gian nghỉ đã bị trùng với lịch nghỉ trước đó!")
        );
      }
    }

    return Promise.resolve();
  };

  // Hàm tạo 2 bản ghi khi tách phép
  const handleSplitRecord = async () => {
    const values = form.getFieldsValue();

    try {
      const ngayBatDau = values.ngayBatDau;
      const ngayKetThuc = values.ngayKetThuc;

      const ngayKetThucBanGhi1 = ngayBatDau
        .clone()
        .add(soNgayPhepConLai - 1, "day");
      const ngayBatDauBanGhi2 = ngayBatDau.clone().add(soNgayPhepConLai, "day");

      const firstRecord = {
        ngayBatDau: isPartialDay
          ? ngayBatDau.format("YYYY-MM-DD HH:mm:ss")
          : ngayBatDau.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        ngayKetThuc: isPartialDay
          ? ngayKetThucBanGhi1.format("YYYY-MM-DD HH:mm:ss")
          : ngayKetThucBanGhi1.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        tinhLuong: true,
        tinhPhep: true,
        liDo: values.liDo + " (Có phép)",
        trangThaiPheDuyet: values.trangThaiPheDuyet || "Chờ duyệt",
        maNhanVien: thongTinNhanVien.maNhanVien,
      };

      const secondRecord = {
        ngayBatDau: isPartialDay
          ? ngayBatDauBanGhi2.format("YYYY-MM-DD HH:mm:ss")
          : ngayBatDauBanGhi2.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        ngayKetThuc: isPartialDay
          ? ngayKetThuc.format("YYYY-MM-DD HH:mm:ss")
          : ngayKetThuc.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        tinhLuong: false,
        tinhPhep: false,
        liDo: values.liDo + " (Không phép)",
        trangThaiPheDuyet: values.trangThaiPheDuyet || "Chờ duyệt",
        maNhanVien: thongTinNhanVien.maNhanVien,
      };

      await createNghiPhep(firstRecord);
      await createNghiPhep(secondRecord);
      await getAllNgayPhep();

      api.success({
        message: "Thành công",
        description: "Đã tạo 2 bản ghi nghỉ phép (có phép và không phép)",
      });

      setIsModalVisible(false);
      setShowSplitRecordModal(false);
      setLeaveWarning("");
      setIsPartialDay(false);
      form.resetFields();
    } catch (error) {
      api.error({
        message: "Có lỗi xảy ra",
        description: error.message || "Không thể tạo bản ghi nghỉ phép",
      });
    }
  };

  const handleUpdateEmail = async (email) => {
    try {
      console.log("email: ", email);
      // Gọi API để cập nhật email
      //await updateEmailNhanVien(thongTinNhanVien.maNhanVien,email)
      setIsOpenModalUpdateEmail(false);
      // GỌi API để lấy lại thông tin nhân viên
      await fetchNhanVienByCCCD(completedInputCCCD.data);
      api.success({ message: "Cập nhật email thành công" });
    } catch (error) {
      api.error(error);
    }
  };

  //  Xử lý khi có thông tin nhân viên từ API - hiển thị tên thay vì mã
  useEffect(() => {
    if (thongTinNhanVien?.maNhanVien) {
      // Set giá trị hoTen vào form thay vì maNhanVien
      form.setFieldsValue({
        tenNhanVien: thongTinNhanVien.hoTen, // Hiển thị tên nhân viên
      });
    }
  }, [thongTinNhanVien, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const maNhanVien = thongTinNhanVien?.maNhanVien;

      if (!maNhanVien) {
        api.error({
          message: "Lỗi validation",
          description: `Không có thông tin nhân viên với - CCCD : ${completedInputCCCD.data}`,
        });
        return;
      }
      // if (!thongTinNhanVien.email) {
      //   setIsOpenModalUpdateEmail(true);
      //   return;
      // }

      if (!values.ngayBatDau || !values.ngayKetThuc) {
        api.error({
          message: "Lỗi validation",
          description: "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc",
        });
        return;
      }

      if (!values.liDo || values.liDo.trim() === "") {
        api.error({
          message: "Lỗi validation",
          description: "Vui lòng nhập lý do nghỉ",
        });
        return;
      }

      if (leaveWarning) {
        setShowSplitRecordModal(true);
        return;
      }

      let ngayBatDauFormatted, ngayKetThucFormatted;
      const isPartialFromForm = values.nghiGiuaNgay || isPartialDay;

      if (isPartialFromForm) {
        ngayBatDauFormatted = values.ngayBatDau.format("YYYY-MM-DD HH:mm:ss");
        ngayKetThucFormatted = values.ngayKetThuc.format("YYYY-MM-DD HH:mm:ss");
      } else {
        ngayBatDauFormatted = values.ngayBatDau
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ss");
        ngayKetThucFormatted = values.ngayKetThuc
          .endOf("day")
          .format("YYYY-MM-DD HH:mm:ss");
      }

      const dataToSave = {
        ngayBatDau: ngayBatDauFormatted,
        ngayKetThuc: ngayKetThucFormatted,
        tinhPhep: values.tinhPhep || false,
        tinhLuong: values.tinhPhep,
        liDo: values.liDo.trim(),
        trangThaiPheDuyet: values.trangThaiPheDuyet || "Chờ duyệt",
        maNhanVien: maNhanVien,
      };

      await createNghiPhep(dataToSave);
      api.success({
        message: "Thành công",
        description: "Đã gửi thành công đơn nghỉ phép",
      });
      setIsSubmitted(true);
      setIsModalVisible(false);
      form.resetFields();
    } catch (errorInfo) {
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        const firstError = errorInfo.errorFields[0];
        api.error({
          message: "Lỗi xác thực",
          description:
            firstError.errors[0] || "Vui lòng kiểm tra lại các trường đã nhập.",
        });
      } else {
        api.error({
          message: "Lỗi xác thực",
          description:
            errorInfo.message || "Vui lòng kiểm tra lại các trường đã nhập.",
        });
      }
    }
  };

  // Xử lý khi thay đổi checkbox "Nghỉ giữa ngày"
  const handlePartialDayChange = (e) => {
    const checked = e.target.checked;
    setIsPartialDay(checked);

    if (!checked) {
      const currentValues = form.getFieldsValue();
      if (currentValues.ngayBatDau) {
        form.setFieldsValue({
          ngayBatDau: dayjs(currentValues.ngayBatDau).startOf("day"),
        });
      }
      if (currentValues.ngayKetThuc) {
        form.setFieldsValue({
          ngayKetThuc: dayjs(currentValues.ngayKetThuc).endOf("day"),
        });
      }
    }
    setTimeout(handleDateChange, 100);
  };

  return (
    <div className="login-container">
      <style>
        {`
    @media screen and (max-width: 768px) {
      .ant-input,
      .ant-input-number-input,
      .ant-select-selection-search-input,
      .ant-picker-input > input {
        font-size: 16px !important;
        -webkit-appearance: none;
        appearance: none;
      }
    }
  `}
      </style>

      <ModalEmail
        isOpen={isOpenModalUpdateEmail}
        updateEmailNhanVien={(email) => handleUpdateEmail(email)}
        onBack={() => setIsOpenModalUpdateEmail(false)}
      />
      <Modal
        title={"Tạo đơn xin nghỉ"}
        open={isModalVisible}
        onOk={handleOk}
        okText="Tạo đơn"
        width={600}
        closable={false}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tinhLuong: false,
            tinhPhep: false,
            nghiGiuaNgay: false,
          }}
        >
          <Form.Item
            name="cccd"
            label="Căn cước công dân"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập căn cước công dân",
              },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (value.length !== 12) {
                    return Promise.reject(
                      new Error("Căn cước công dân bắt buộc phải là 12 số")
                    );
                  }

                  setCompletedInputCCCD({ isCompleted: true, data: value });
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" placeholder="Nhập căn cước công dân" />
          </Form.Item>

          <Form.Item name="tenNhanVien" label="Tên nhân viên">
            <Spin spinning={isLoadingNhanVien}>
              <Input
                disabled={true}
                placeholder={
                  nhanVienError
                    ? nhanVienError
                    : thongTinNhanVien?.hoTen ||
                      "Nhập căn cước công dân để hiển thị tên"
                }
                status={nhanVienError ? "error" : ""}
                style={{
                  color: nhanVienError ? "#ff4d4f" : undefined,
                }}
              />
            </Spin>
          </Form.Item>

          <Form.Item name="nghiGiuaNgay" valuePropName="checked">
            <Checkbox onChange={handlePartialDayChange}>
              Nghỉ giữa ngày (cho phép chọn giờ cụ thể)
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày bắt đầu!",
              },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }

                  const endDate = form.getFieldValue("ngayKetThuc");
                  if (endDate && value.isAfter(endDate)) {
                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              placeholder="Chọn ngày bắt đầu"
              format={isPartialDay ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
              style={{ width: "100%" }}
              showTime={isPartialDay ? { format: "HH:mm:ss" } : false}
              onChange={(date) => {
                if (date && !isPartialDay) {
                  const startOfDay = dayjs(date).startOf("day");
                  form.setFieldsValue({ ngayBatDau: startOfDay });
                }
                setTimeout(handleDateChange, 100);
              }}
            />
          </Form.Item>

          <Form.Item
            name="ngayKetThuc"
            label="Ngày kết thúc"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày kết thúc!",
              },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }

                  const startDate = form.getFieldValue("ngayBatDau");
                  if (startDate && value.isBefore(startDate)) {
                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              },
              {
                validator: () => validateDateRangeUniqueDB(),
                message:
                  "Khoảng thời gian nghỉ đã bị trùng với lịch nghỉ trước đó!",
              },
            ]}
          >
            <DatePicker
              placeholder="Chọn ngày kết thúc"
              format={isPartialDay ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
              style={{ width: "100%" }}
              showTime={isPartialDay ? { format: "HH:mm:ss" } : false}
              onChange={(date) => {
                if (date && !isPartialDay) {
                  const endOfDay = dayjs(date).endOf("day");
                  form.setFieldsValue({ ngayKetThuc: endOfDay });
                }
                setTimeout(handleDateChange, 100);
              }}
            />
          </Form.Item>

          {leaveWarning && (
            <Alert
              message="Cảnh báo về số ngày phép"
              description={leaveWarning}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="liDo"
            label="Lý do nghỉ"
            rules={[{ required: true, message: "Vui lòng nhập lý do nghỉ!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="tinhPhep" valuePropName="checked">
            <Checkbox disabled={soNgayPhepConLai <= 0}>
              Sử dụng phép{" "}
              {thongTinNhanVien?.maNhanVien && (
                <Tag color="success">
                  Số ngày phép còn lại trong năm: {soNgayPhepConLai}
                </Tag>
              )}
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/** Modal Thông báo khi tạo đơn thành công */}
      <Modal
        open={isSubmitted}
        centered={true}
        title="Bạn đã gửi đơn nghỉ phép thành công"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ style: { display: "none" } }}
      >
        Thông báo sẽ được gửi đến Email :{" "}
        <span style={{ color: "blueviolet" }}>
          {thongTinNhanVien?.email ?? "email@example.com"}
        </span>{" "}
        sau khi được phê duyệt
      </Modal>

      <Modal
        centered={true}
        title="Xác nhận tách bản ghi"
        open={showSplitRecordModal}
        onOk={handleSplitRecord}
        onCancel={() => {
          setIsPartialDay(false);
          setShowSplitRecordModal(false);
        }}
        okText="Tách thành 2 bản ghi"
        cancelText="Nhập lại"
        width={500}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <ExclamationCircleOutlined
            style={{ fontSize: "48px", color: "#faad14", marginBottom: "16px" }}
          />
          <p style={{ fontSize: "16px", marginBottom: "16px" }}>
            Số ngày nghỉ có phép vượt quá số ngày phép còn lại!
          </p>
          <p>Bạn có muốn tách thành 2 bản ghi?</p>
        </div>
      </Modal>
    </div>
  );
}
