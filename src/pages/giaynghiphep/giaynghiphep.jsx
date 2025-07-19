import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Checkbox,
  DatePicker,
  Modal,
  Alert,
  Tag,
  Spin,
  TimePicker,
} from "antd";
import { ExclamationCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { useNghiPhep } from "../../component/hooks/useNghiPhep"; 
import { useNhanVien } from "../../component/hooks/useNhanVien"; 
import { useNgayPhep } from "../../component/hooks/useNgayPhep"; 
import { useAppNotification } from "../../component/ui/notification"; 

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ModalEmail } from "./modalEmail"; 

dayjs.extend(isBetween);

export default function GiayNghiPhep() {
  const { danhSachNghiPhep, getAllNghiPhep, createNghiPhep } = useNghiPhep();
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

  const [isLoadingNhanVien, setIsLoadingNhanVien] = useState(false); 
  const [nhanVienError, setNhanVienError] = useState(null); 

  const dataSourceNghiPhep = React.useMemo(() => {
    return danhSachNghiPhep.map((np) => {
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
  }, [danhSachNghiPhep, danhSachNhanVien]);
  useEffect(() => {
    if (completedInputCCCD.isCompleted && completedInputCCCD.data) {
      const fetchData = async () => {
        setIsLoadingNhanVien(true);
        setNhanVienError(null); 
        try {
          await fetchNhanVienByCCCD(completedInputCCCD.data);
        } catch (error) {
          const errorMessage =
            error.message || "Không tìm thấy nhân viên với CCCD này";
          setNhanVienError(errorMessage);
          api.error({
            message: "Lỗi tìm kiếm nhân viên",
            description: errorMessage,
          });
          form.setFieldsValue({ tenNhanVien: null }); 
        } finally {
          setIsLoadingNhanVien(false);
        }
      };
      fetchData();
    }
  }, [completedInputCCCD, fetchNhanVienByCCCD, api, form]);

  useEffect(() => {
    if (thongTinNhanVien?.maNhanVien) {
      const ngayPhep = danhSachNgayPhep.find(
        (np) => np.maNhanVien === thongTinNhanVien.maNhanVien
      );
      setSoNgayPhepConLai(ngayPhep ? ngayPhep.ngayPhepConLai : 0);
      setNhanVienError(null); 
    } else {
      setSoNgayPhepConLai(0); 
    }
  }, [danhSachNgayPhep, thongTinNhanVien]);

  useEffect(() => {
    if (thongTinNhanVien?.maNhanVien) {
      form.setFieldsValue({
        tenNhanVien: thongTinNhanVien.hoTen,
      });
    } else {
      form.setFieldsValue({
        tenNhanVien: null,
      });
    }
  }, [thongTinNhanVien, form]);

  const laySoGioLamViecTheoCa = useCallback(() => {
    return 8; 
  }, []);

  const calculateLeaveDays = useCallback(
    (startDate, endDate, isPartialMode = false, soGioLamViec = 8) => {
      if (!startDate || !endDate) return 0;

      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isAfter(end, isPartialMode ? "minute" : "day")) {
        return 0;
      }

      if (isPartialMode) {
        if (start.isSame(end, "day")) {
          const hoursOff = end.diff(start, "hour", true); 
          if (hoursOff <= 0) return 0;
          // Quy đổi ra 0.5 ngày hoặc 1 ngày tùy theo số giờ
          return hoursOff < soGioLamViec / 2 ? 0.5 : 1;
        } else {
          const totalHours = end.diff(start, "hour", true);
          return totalHours / soGioLamViec; 
        }
      } else {
        return end.diff(start, "day") + 1; 
      }
    },
    []
  );

  const checkLeaveBalance = useCallback(
    (maNhanVien, leaveDays, isTinhPhep) => {
      if (!isTinhPhep || !maNhanVien) return ""; 

      if (leaveDays > soNgayPhepConLai) {
        return `Số ngày nghỉ có phép (${leaveDays}) vượt quá số ngày phép còn lại (${soNgayPhepConLai}). Bạn có muốn tách thành 2 bản ghi: ${soNgayPhepConLai} ngày có phép và ${
          leaveDays - soNgayPhepConLai
        } ngày không phép?`;
      }
      return "";
    },
    [soNgayPhepConLai]
  );

  const handleDateChange = useCallback(async () => {
    const values = form.getFieldsValue();
    const { ngayBatDau, ngayKetThuc, tinhPhep, startTime, endTime, nghiGiuaNgay } = values;

    let actualNgayBatDau = ngayBatDau;
    let actualNgayKetThuc = ngayKetThuc;

    if (nghiGiuaNgay && ngayBatDau && startTime) {
      actualNgayBatDau = ngayBatDau
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(startTime.second());
    }
    if (nghiGiuaNgay && ngayKetThuc && endTime) {
      actualNgayKetThuc = ngayKetThuc
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(endTime.second());
    }

    const maNhanVien = thongTinNhanVien?.maNhanVien;
    const soGioLamViec = laySoGioLamViecTheoCa();

    if (actualNgayBatDau && actualNgayKetThuc && maNhanVien) {
      const leaveDays = calculateLeaveDays(
        actualNgayBatDau,
        actualNgayKetThuc,
        nghiGiuaNgay,
        soGioLamViec
      );
      if (tinhPhep) {
        const warning = checkLeaveBalance(maNhanVien, leaveDays, true);
        setLeaveWarning(warning);
      } else {
        setLeaveWarning("");
      }
    } else {
      setLeaveWarning(""); 
    }
  }, [form, thongTinNhanVien, laySoGioLamViecTheoCa, calculateLeaveDays, checkLeaveBalance]);

  const validateDateRangeUniqueDB = useCallback(async () => {
    const startDate = form.getFieldValue("ngayBatDau");
    const endDate = form.getFieldValue("ngayKetThuc");
    const maNhanVien = thongTinNhanVien?.maNhanVien;
    const nghiGiuaNgay = form.getFieldValue("nghiGiuaNgay");

    const startTime = form.getFieldValue("startTime");
    const endTime = form.getFieldValue("endTime");

    let actualStartDate = startDate;
    let actualEndDate = endDate;

    if (nghiGiuaNgay && startDate && startTime) {
      actualStartDate = startDate
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(startTime.second());
    }
    if (nghiGiuaNgay && endDate && endTime) {
      actualEndDate = endDate
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(endTime.second());
    }

    if (maNhanVien && actualStartDate && actualEndDate) {
      const start = dayjs(actualStartDate);
      const end = dayjs(actualEndDate);

      const compareUnit = nghiGiuaNgay ? "minute" : "day";

      const isOverlapped = dataSourceNghiPhep.some((record) => {
        if (record.maNhanVien !== maNhanVien ||
            record.trangThaiPheDuyet === "Từ chối" ||
            record.trangThaiPheDuyet === "Hủy") {
            return false;
        }

        const rStart = dayjs(record.ngayBatDau);
        const rEnd = dayjs(record.ngayKetThuc);

        return (
          start.isBetween(rStart, rEnd, compareUnit, "[]") ||
          end.isBetween(rStart, rEnd, compareUnit, "[]") ||
          rStart.isBetween(start, end, compareUnit, "[]") ||
          rEnd.isBetween(start, end, compareUnit, "[]")
        );
      });

      if (isOverlapped) {
        return Promise.reject(
          new Error("Khoảng thời gian nghỉ đã bị trùng với lịch nghỉ trước đó!")
        );
      }
    }
    return Promise.resolve();
  }, [form, thongTinNhanVien, dataSourceNghiPhep]);
  const handleSplitRecord = async () => {
    const values = form.getFieldsValue();

    try {
      const ngayBatDau = values.ngayBatDau;
      const ngayKetThuc = values.ngayKetThuc;
      const startTime = values.startTime;
      const endTime = values.endTime;
      const nghiGiuaNgay = values.nghiGiuaNgay;

      let actualNgayBatDau = ngayBatDau;
      let actualNgayKetThuc = ngayKetThuc;

      if (nghiGiuaNgay && ngayBatDau && startTime) {
        actualNgayBatDau = ngayBatDau
          .hour(startTime.hour())
          .minute(startTime.minute())
          .second(startTime.second());
      }
      if (nghiGiuaNgay && ngayKetThuc && endTime) {
        actualNgayKetThuc = ngayKetThuc
          .hour(endTime.hour())
          .minute(endTime.minute())
          .second(endTime.second());
      }

      let firstRecordEndDate, secondRecordStartDate;
      const soGioLamViec = laySoGioLamViecTheoCa();

      if (nghiGiuaNgay) {
        const paidHoursRemaining = soNgayPhepConLai * soGioLamViec;
        const totalRequestedLeaveHours = actualNgayKetThuc.diff(actualNgayBatDau, 'hour', true);

        if (paidHoursRemaining >= totalRequestedLeaveHours) {
          firstRecordEndDate = actualNgayKetThuc;
          secondRecordStartDate = null; 
        } else {
          firstRecordEndDate = actualNgayBatDau.add(paidHoursRemaining, 'hour');
          secondRecordStartDate = firstRecordEndDate.add(1, 'minute');
        }
      } else {
        firstRecordEndDate = actualNgayBatDau.clone().add(soNgayPhepConLai - 1, "day").endOf("day");
        secondRecordStartDate = actualNgayBatDau.clone().add(soNgayPhepConLai, "day").startOf("day");
      }

      if (secondRecordStartDate && secondRecordStartDate.isAfter(actualNgayKetThuc, nghiGiuaNgay ? 'minute' : 'day')) {
          secondRecordStartDate = null; 
      }

      const firstRecord = {
        ngayBatDau: nghiGiuaNgay
          ? actualNgayBatDau.format("YYYY-MM-DD HH:mm:ss")
          : actualNgayBatDau.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        ngayKetThuc: nghiGiuaNgay
          ? firstRecordEndDate.format("YYYY-MM-DD HH:mm:ss")
          : firstRecordEndDate.format("YYYY-MM-DD HH:mm:ss"),
        tinhLuong: true, 
        tinhPhep: true,
        liDo: values.liDo.trim() + " (Có phép)",
        trangThaiPheDuyet: "Chờ duyệt", 
        maNhanVien: thongTinNhanVien.maNhanVien,
      };

      const secondRecord = secondRecordStartDate ? {
        ngayBatDau: nghiGiuaNgay
          ? secondRecordStartDate.format("YYYY-MM-DD HH:mm:ss")
          : secondRecordStartDate.format("YYYY-MM-DD HH:mm:ss"),
        ngayKetThuc: nghiGiuaNgay
          ? actualNgayKetThuc.format("YYYY-MM-DD HH:mm:ss")
          : actualNgayKetThuc.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        tinhLuong: false, 
        tinhPhep: false,
        liDo: values.liDo.trim() + " (Không phép)",
        trangThaiPheDuyet: "Chờ duyệt", 
        maNhanVien: thongTinNhanVien.maNhanVien,
      } : null;

      await createNghiPhep(firstRecord);
      if (secondRecord) {
        await createNghiPhep(secondRecord);
        api.success({
          message: "Thành công",
          description: "Đã tạo 2 bản ghi nghỉ phép (có phép và không phép)",
        });
      } else {
        api.success({
          message: "Thành công",
          description: "Đã tạo đơn nghỉ phép có phép (đủ ngày phép)",
        });
      }

      await getAllNgayPhep(); 
      setIsModalVisible(false);
      setShowSplitRecordModal(false);
      setLeaveWarning("");
      setIsPartialDay(false); 
      form.resetFields(); 
      setIsSubmitted(true); 
    } catch (error) {
      api.error({
        message: "Có lỗi xảy ra",
        description: error.message || "Không thể tạo bản ghi nghỉ phép",
      });
    }
  };

  const handleUpdateEmail = async (email) => {
    try {
      await updateEmailNhanVien(thongTinNhanVien.maNhanVien, email);
      setIsOpenModalUpdateEmail(false);
      await fetchNhanVienByCCCD(completedInputCCCD.data); 
      api.success({ message: "Cập nhật email thành công" });
    } catch (error) {
      api.error({
        message: "Lỗi cập nhật Email",
        description: error.message || "Không thể cập nhật email.",
      });
    }
  }, [thongTinNhanVien, form]);

  useEffect(() => {
    getAllNghiPhep();
  }, []);

  const handleOk = async () => {
    try {
      // Ép validate lại hai trường ngày trước khi submit
      await form.validateFields(['ngayBatDau', 'ngayKetThuc']);
      const values = await form.validateFields();

      // Kiểm tra trùng ngày nghỉ phép giống nghi_phep.jsx
      const startDate = dayjs(values.ngayBatDau).startOf('day');
      const endDate = dayjs(values.ngayKetThuc).startOf('day');
      for (let d = startDate; d.isSameOrBefore(endDate); d = d.add(1, 'day')) {
        const dStr = d.format('YYYY-MM-DD');
        const trung = dataSourceNghiPhep.some((record) => {
          if (record.maNhanVien !== thongTinNhanVien.maNhanVien) return false;
          const rStart = dayjs(record.ngayBatDau, 'DD/MM/YYYY HH:mm:ss').startOf('day');
          const rEnd = dayjs(record.ngayKetThuc, 'DD/MM/YYYY HH:mm:ss').startOf('day');
          for (let r = rStart; r.isSameOrBefore(rEnd); r = r.add(1, 'day')) {
            if (r.format('YYYY-MM-DD') === dStr) return true;
          }
          return false;
        });
        if (trung) {
          api.error({ message: 'Bạn đã có đơn nghỉ vào ngày này rồi!' });
          return;
        }
      }

      const maNhanVien = thongTinNhanVien?.maNhanVien;

      if (!maNhanVien) {
        api.error({
          message: "Lỗi validation",
          description: `Không có thông tin nhân viên với CCCD: ${completedInputCCCD.data}. Vui lòng kiểm tra lại CCCD hoặc liên hệ quản lý để thêm thông tin nhân viên.`,
        });
        return;
      }
      if (!thongTinNhanVien.email) {
        api.warning({
          message: "Cần cập nhật Email",
          description: "Vui lòng cập nhật email của nhân viên để hoàn tất việc gửi đơn.",
          duration: 5,
        });
        setIsOpenModalUpdateEmail(true);
        return;
      }

      const { ngayBatDau, ngayKetThuc, tinhPhep, startTime, endTime, nghiGiuaNgay } = values;
      let actualNgayBatDau = ngayBatDau;
      let actualNgayKetThuc = ngayKetThuc;

      if (nghiGiuaNgay && ngayBatDau && startTime) {
        actualNgayBatDau = ngayBatDau.hour(startTime.hour()).minute(startTime.minute()).second(startTime.second());
      }
      if (nghiGiuaNgay && ngayKetThuc && endTime) {
        actualNgayKetThuc = ngayKetThuc.hour(endTime.hour()).minute(endTime.minute()).second(endTime.second());
      }

      const leaveDays = calculateLeaveDays(actualNgayBatDau, actualNgayKetThuc, nghiGiuaNgay, laySoGioLamViecTheoCa());
      const currentLeaveWarning = checkLeaveBalance(maNhanVien, leaveDays, tinhPhep);

      if (currentLeaveWarning) {
        setLeaveWarning(currentLeaveWarning); 
        setShowSplitRecordModal(true); 
        return;
      }

      let ngayBatDauFormatted, ngayKetThucFormatted;
      if (nghiGiuaNgay) {
        ngayBatDauFormatted = actualNgayBatDau.format("YYYY-MM-DD HH:mm:ss");
        ngayKetThucFormatted = actualNgayKetThuc.format("YYYY-MM-DD HH:mm:ss");
      } else {
        ngayBatDauFormatted = actualNgayBatDau.startOf("day").format("YYYY-MM-DD HH:mm:ss");
        ngayKetThucFormatted = actualNgayKetThuc.endOf("day").format("YYYY-MM-DD HH:mm:ss");
      }

      const dataToSave = {
        ngayBatDau: ngayBatDauFormatted,
        ngayKetThuc: ngayKetThucFormatted,
        tinhPhep: values.tinhPhep || false, 
        tinhLuong: values.tinhPhep,
        liDo: values.liDo.trim(),
        trangThaiPheDuyet: "Chờ duyệt", 
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
      setCompletedInputCCCD({ isCompleted: false, data: null }); 
      setNhanVienError(null);
      setSoNgayPhepConLai(0);
      setLeaveWarning("");
      setIsPartialDay(false); 
      await getAllNgayPhep(); 
    } catch (errorInfo) {
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        const firstError = errorInfo.errorFields[0];
        api.error({
          message: "Lỗi xác thực",
          description:
            firstError.errors[0] || "Vui lòng kiểm tra lại các trường đã nhập.",
        });
      } else if (errorInfo.message) {
        api.error({
          message: "Lỗi xác thực", 
          description: errorInfo.message,
        });
        if (errorInfo.message.includes("Khoảng thời gian nghỉ đã bị trùng")) {
          form.setFields([
            { name: "ngayBatDau", errors: [errorInfo.message] },
            { name: "ngayKetThuc", errors: [errorInfo.message] },
          ]);
        }
      } else {
        api.error({
          message: "Có lỗi xảy ra",
          description: "Không thể gửi đơn nghỉ phép. Vui lòng thử lại.",
        });
      }
    }
  };

  const handlePartialDayChange = useCallback((e) => {
    const checked = e.target.checked;
    setIsPartialDay(checked); 

    const currentValues = form.getFieldsValue();
    if (!checked) {
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
      form.setFieldsValue({ startTime: null, endTime: null });
    } else {
      if (!currentValues.ngayBatDau || !dayjs(currentValues.ngayBatDau).isValid()) {
        form.setFieldsValue({ ngayBatDau: dayjs() });
      }
      if (!currentValues.ngayKetThuc || !dayjs(currentValues.ngayKetThuc).isValid()) {
        form.setFieldsValue({ ngayKetThuc: dayjs() });
      }

      if (!currentValues.startTime) {
        form.setFieldsValue({ startTime: dayjs().set('hour', 9).set('minute', 0).set('second', 0) }); 
      }
      if (!currentValues.endTime) {
        form.setFieldsValue({
          endTime: dayjs().set('hour', 17).set('minute', 0).set('second', 0), 
        });
      }
    }
    form.validateFields(["ngayBatDau", "ngayKetThuc", "startTime", "endTime", "tinhPhep"])
        .then(() => handleDateChange()) 
        .catch(() => handleDateChange()); 
  }, [form, handleDateChange]);

  const disabledPastDate = useCallback((current) => {
    return current && current.isBefore(dayjs().startOf("day"));
  }, []);
  const disabledEndDate = useCallback((endValue) => {
    const startValue = form.getFieldValue("ngayBatDau");
    if (!endValue || !startValue) {
      return false;
    }

    const isPartialFromForm = form.getFieldValue("nghiGiuaNgay");

    if (isPartialFromForm) {
      const startTime = form.getFieldValue("startTime");
      const endTime = form.getFieldValue("endTime");

      if (startValue.isSame(endValue, "day") && startTime && endTime) {
        const combinedStart = startValue
          .hour(startTime.hour())
          .minute(startTime.minute())
          .second(startTime.second());
        const combinedEnd = endValue
          .hour(endTime.hour())
          .minute(endTime.minute())
          .second(endTime.second());
        return combinedEnd.isBefore(combinedStart); 
      }
      return endValue.isBefore(startValue, "day");
    }
    return endValue.isBefore(startValue.startOf('day'));
  };

  // Validator kiểm tra ngày đã nghỉ
  const validateNgayKhongTrung = (field) => async (_, value) => {
    if (!value || !thongTinNhanVien?.maNhanVien) return Promise.resolve();
    const ngayDaNghi = [];
    dataSourceNghiPhep.forEach((record) => {
      if (record.maNhanVien === thongTinNhanVien.maNhanVien) {
        const start = dayjs(record.ngayBatDau, 'DD/MM/YYYY HH:mm:ss').startOf('day');
        const end = dayjs(record.ngayKetThuc, 'DD/MM/YYYY HH:mm:ss').startOf('day');
        for (let d = start; d.isSameOrBefore(end); d = d.add(1, 'day')) {
          ngayDaNghi.push(d.format('YYYY-MM-DD'));
        }
      }
    });
    const ngayChon = dayjs(value).format('YYYY-MM-DD');
    if (ngayDaNghi.includes(ngayChon)) {
      return Promise.reject(new Error('Bạn đã có đơn nghỉ vào ngày này rồi!'));
    }
    return Promise.resolve();
  };

  return (
    <div className="login-container">
      {/* Inline style cho responsive, có thể tách ra file CSS riêng nếu cần */}
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

      {/* Modal cập nhật Email */}
      <ModalEmail
        isOpen={isOpenModalUpdateEmail}
        updateEmailNhanVien={(email) => handleUpdateEmail(email)}
        onBack={() => setIsOpenModalUpdateEmail(false)}
      />

      {/* Modal chính chứa form tạo đơn nghỉ phép */}
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
          {/* Trường Căn cước công dân */}
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
                    setCompletedInputCCCD({ isCompleted: false, data: null });
                    return Promise.resolve();
                  }
                  if (!/^\d+$/.test(value)) {
                    return Promise.reject(
                      new Error("Căn cước công dân chỉ được chứa số")
                    );
                  }
                  if (value.length !== 12) {
                    setCompletedInputCCCD({ isCompleted: false, data: null });
                    return Promise.reject(
                      new Error("Căn cước công dân bắt buộc phải là 12 số")
                    );
                  }
                  if (
                    completedInputCCCD.data !== value ||
                    !completedInputCCCD.isCompleted
                  ) {
                    setCompletedInputCCCD({ isCompleted: true, data: value });
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              maxLength={12}
              placeholder="Nhập căn cước công dân"
              onChange={(e) => {
                const { value } = e.target;
                const reg = /^-?\d*(\.\d*)?$/; 
                if (
                  (!isNaN(value) && reg.test(value)) ||
                  value === "" ||
                  value === "-"
                ) {
                  form.setFieldsValue({ cccd: value });
                }
              }}
              onBlur={() => { 
                const value = form.getFieldValue("cccd");
                if (
                  value &&
                  value.length === 12 &&
                  completedInputCCCD.data !== value
                ) {
                  setCompletedInputCCCD({ isCompleted: true, data: value });
                }
              }}
            />
          </Form.Item>

          {/* Trường Tên nhân viên (chỉ đọc, hiển thị kết quả tìm kiếm) */}
          <Form.Item name="tenNhanVien" label="Tên nhân viên">
            <Spin spinning={isLoadingNhanVien}>
              <Input
                disabled={true}
                placeholder={
                  isLoadingNhanVien
                    ? "Đang tìm kiếm nhân viên..."
                    : nhanVienError
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

          {/* Checkbox "Nghỉ giữa ngày" */}
          <Form.Item name="nghiGiuaNgay" valuePropName="checked">
            <Checkbox onChange={handlePartialDayChange}>
              Nghỉ giữa ngày (cho phép chọn giờ cụ thể)
            </Checkbox>
          </Form.Item>

          {/* Trường Ngày bắt đầu */}
          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu"
            dependencies={['ngayKetThuc', 'cccd']}
            rules={[
              { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              { validator: validateNgayKhongTrung('ngayBatDau') },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  const endDate = form.getFieldValue("ngayKetThuc");
                  const startTime = form.getFieldValue("startTime");
                  const endTime = form.getFieldValue("endTime");
                  const nghiGiuaNgay = form.getFieldValue("nghiGiuaNgay");

                  let actualStartDate = value;
                  let actualEndDate = endDate;

                  if (nghiGiuaNgay && value && startTime) {
                    actualStartDate = value
                      .hour(startTime.hour())
                      .minute(startTime.minute())
                      .second(startTime.second());
                  }
                  if (nghiGiuaNgay && endDate && endTime) {
                    actualEndDate = endDate
                      .hour(endTime.hour())
                      .minute(endTime.minute())
                      .second(endTime.second());
                  }

                  if (
                    actualEndDate &&
                    actualStartDate.isAfter(
                      actualEndDate,
                      nghiGiuaNgay ? "minute" : "day"
                    )
                  ) {
                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!"
                      )
                    );
                  }

                  if (value.isBefore(dayjs().startOf("day"))) {
                    return Promise.reject(
                      new Error("Không thể chọn ngày trong quá khứ!")
                    );
                  }
                  return validateDateRangeUniqueDB();
                },
              },
            ]}
          >
            <DatePicker
              placeholder="Chọn ngày bắt đầu"
              format={"DD/MM/YYYY"}
              style={{ width: "100%" }}
              onChange={() => {
                handleDateChange(); 
                form.validateFields(["ngayKetThuc", "startTime", "endTime", "tinhPhep"]); 
              }}
              disabledDate={disabledPastDate} 
              inputReadOnly={true}
            />
          </Form.Item>

          {/* Trường Giờ bắt đầu (chỉ hiển thị khi là nghỉ giữa ngày) */}
          {isPartialDay && (
            <Form.Item
              name="startTime"
              label="Giờ bắt đầu"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn giờ bắt đầu!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const startDate = form.getFieldValue("ngayBatDau");
                    const endDate = form.getFieldValue("ngayKetThuc");
                    const endTime = form.getFieldValue("endTime");

                    if (
                      startDate &&
                      endDate &&
                      startDate.isSame(endDate, "day") &&
                      endTime &&
                      value.isAfter(endTime)
                    ) {
                      return Promise.reject(
                        new Error(
                          "Giờ bắt đầu phải nhỏ hơn hoặc bằng giờ kết thúc trên cùng một ngày!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <TimePicker
                format="HH:mm:ss"
                style={{ width: "100%" }}
                onChange={() => {
                  handleDateChange(); 
                  form.validateFields(["endTime", "ngayBatDau", "ngayKetThuc", "tinhPhep"]); 
                }}
                inputReadOnly={true}
              />
            </Form.Item>
          )}

          {/* Trường Ngày kết thúc */}
          <Form.Item
            name="ngayKetThuc"
            label="Ngày kết thúc"
            dependencies={['ngayBatDau', 'cccd']}
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              { validator: validateNgayKhongTrung('ngayKetThuc') },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  const startDate = form.getFieldValue("ngayBatDau");
                  const startTime = form.getFieldValue("startTime");
                  const endTime = form.getFieldValue("endTime");
                  const nghiGiuaNgay = form.getFieldValue("nghiGiuaNgay");

                  let actualStartDate = startDate;
                  let actualEndDate = value;

                  if (nghiGiuaNgay && startDate && startTime) {
                    actualStartDate = startDate
                      .hour(startTime.hour())
                      .minute(startTime.minute())
                      .second(startTime.second());
                  }
                  if (nghiGiuaNgay && value && endTime) {
                    actualEndDate = value
                      .hour(endTime.hour())
                      .minute(endTime.minute())
                      .second(endTime.second());
                  }

                  if (
                    actualStartDate &&
                    actualEndDate.isBefore(
                      actualStartDate,
                      nghiGiuaNgay ? "minute" : "day"
                    )
                  ) {
                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!"
                      )
                    );
                  }
                  const MAX_LEAVE_DAYS = 30;
                  if (actualStartDate && actualEndDate) {
                    const daysDiff = calculateLeaveDays(
                      actualStartDate,
                      actualEndDate,
                      nghiGiuaNgay,
                      laySoGioLamViecTheoCa()
                    );
                    if (daysDiff > MAX_LEAVE_DAYS) {
                      return Promise.reject(
                        new Error(
                          `Khoảng thời gian nghỉ không được quá ${MAX_LEAVE_DAYS} ngày.`
                        )
                      );
                    }
                  }
                  return validateDateRangeUniqueDB();
                },
              },
              {
                validator: validateDateRangeUniqueDB, 
              },
            ]}
          >
            <DatePicker
              placeholder="Chọn ngày kết thúc"
              format={"DD/MM/YYYY"}
              style={{ width: "100%" }}
              onChange={() => {
                handleDateChange(); 
                form.validateFields(["ngayBatDau", "startTime", "endTime", "tinhPhep"]); 
              }}
              disabledDate={disabledEndDate} 
              inputReadOnly={true}
            />
          </Form.Item>

          {/* Trường Giờ kết thúc (chỉ hiển thị khi là nghỉ giữa ngày) */}
          {isPartialDay && (
            <Form.Item
              name="endTime"
              label="Giờ kết thúc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn giờ kết thúc!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const startDate = form.getFieldValue("ngayBatDau");
                    const endDate = form.getFieldValue("ngayKetThuc");
                    const startTime = form.getFieldValue("startTime");

                    if (
                      startDate &&
                      endDate &&
                      startDate.isSame(endDate, "day") &&
                      startTime &&
                      value.isBefore(startTime)
                    ) {
                      return Promise.reject(
                        new Error(
                          "Giờ kết thúc phải lớn hơn hoặc bằng giờ bắt đầu trên cùng một ngày!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <TimePicker
                format="HH:mm:ss"
                style={{ width: "100%" }}
                onChange={() => {
                  handleDateChange(); 
                  form.validateFields(["startTime", "ngayBatDau", "ngayKetThuc", "tinhPhep"]); 
                }}
                inputReadOnly={true}
              />
            </Form.Item>
          )}

          {/* Cảnh báo về số ngày phép */}
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

          {/* Trường Lý do nghỉ */}
          <Form.Item
            name="liDo"
            label="Lý do nghỉ"
            rules={[
              { required: true, message: "Vui lòng nhập lý do nghỉ!" },
              { max: 255, message: "Lý do nghỉ không được quá 255 ký tự." },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {/* Checkbox "Sử dụng phép" và hiển thị số ngày phép còn lại */}
          <Form.Item name="tinhPhep" valuePropName="checked">
            <Checkbox
              onChange={handleDateChange} 
              disabled={thongTinNhanVien?.maNhanVien && soNgayPhepConLai <= 0} 
            >
              Sử dụng phép{" "}
              {thongTinNhanVien?.maNhanVien && (
                <Tag color={soNgayPhepConLai > 0 ? "success" : "error"}>
                  Số ngày phép còn lại trong năm: {soNgayPhepConLai}
                </Tag>
              )}
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thông báo khi tạo đơn thành công */}
      <Modal
        open={isSubmitted}
        centered={true}
        title="Bạn đã gửi đơn nghỉ phép thành công"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={() => setIsSubmitted(false)}
        onOk={() => setIsSubmitted(false)}
      >
        Thông báo sẽ được gửi đến Email :{" "}
        <span style={{ color: "blueviolet" }}>
          {thongTinNhanVien?.email ?? "email@example.com"}
        </span>{" "}
        sau khi được phê duyệt
      </Modal>

      {/* Modal Xác nhận tách bản ghi */}
      <Modal
        centered={true}
        title="Xác nhận tách bản ghi"
        open={showSplitRecordModal}
        onOk={handleSplitRecord} 
        onCancel={() => {
          form.setFieldsValue({ tinhPhep: false }); 
          setShowSplitRecordModal(false);
          setLeaveWarning(""); 
        }}
        okText="Tách thành 2 bản ghi"
        cancelText="Không tách"
        width={500}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <ExclamationCircleOutlined
            style={{ fontSize: "48px", color: "#faad14", marginBottom: "16px" }}
          />
          <p style={{ fontSize: "16px", marginBottom: "16px" }}>
            Số ngày nghỉ có phép vượt quá số ngày phép còn lại!
          </p>
          <p>{leaveWarning}</p> {/* Hiển thị chi tiết cảnh báo */}
        </div>
      </Modal>
    </div>
  );
}