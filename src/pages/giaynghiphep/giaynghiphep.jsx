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

      // Nếu là cùng một ngày, tính theo giờ
      if (start.isSame(end, "day")) {
        const hoursOff = end.diff(start, "hour", true);
        if (hoursOff <= 0) return 0; // Tránh trường hợp giờ kết thúc trước giờ bắt đầu
        return hoursOff < soGioLamViec * 0.5 ? 0.5 : 1; // Giả sử nếu nghỉ ít hơn nửa ngày thì tính 0.5 ngày phép, ngược lại là 1 ngày
      } else {
        // Nếu khác ngày, tính số ngày đầy đủ giữa 2 ngày (bao gồm cả ngày bắt đầu và kết thúc)
        return end.diff(start, "day") + 1;
      }
    } else {
      const start = dayjs(startDate).startOf("day");
      const end = dayjs(endDate).startOf("day");
      return end.diff(start, "day") + 1;
    }
  };

  const laySoGioLamViecTheoCa = () => {
    return 8; // Mặc định là 8 giờ nếu không tìm thấy
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
    // Gọi hàm không cần truyền maNhanVien nếu nó đã được lấy từ thongTinNhanVien
    const soGioLamViec = laySoGioLamViecTheoCa(); 

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
      } else {
        setLeaveWarning(""); // Xóa cảnh báo nếu không tính phép
      }
    } else {
      setLeaveWarning(""); // Xóa cảnh báo nếu chưa đủ thông tin
    }
  };

  const validateDateRangeUniqueDB = async () => {
    const startDate = form.getFieldValue("ngayBatDau");
    const endDate = form.getFieldValue("ngayKetThuc");
    const maNhanVien = thongTinNhanVien?.maNhanVien;

    if (maNhanVien && startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      const isOverlapped = dataSourceNghiPhep.some((record) => {
        // Chuyển đổi sang dayjs và đảm bảo định dạng đúng để so sánh
        const rStart = dayjs(record.ngayBatDau);
        const rEnd = dayjs(record.ngayKetThuc);

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

      // Ngày kết thúc bản ghi có phép
      let ngayKetThucBanGhi1;
      // Ngày bắt đầu bản ghi không phép
      let ngayBatDauBanGhi2;

      // Xử lý trường hợp nghỉ giữa ngày
      if (isPartialDay && ngayBatDau.isSame(ngayKetThuc, 'day')) {
          // Nếu chỉ nghỉ trong một ngày và là nghỉ giữa ngày, thì không thể tách thành 2 bản ghi ngày đầy đủ.
          // Cần xác định rõ logic tách cho trường hợp này.
          // Tạm thời, nếu là nghỉ giữa ngày và số ngày phép còn lại đủ cho một phần ngày,
          // hoặc vượt quá một phần ngày nhưng không đủ một ngày đầy đủ,
          // thì có thể xem xét tách theo giờ.
          // Tuy nhiên, logic này phức tạp hơn và cần business rules cụ thể.
          // Hiện tại, nếu leaveWarning xuất hiện khi isPartialDay và same day,
          // sẽ xử lý như sau:
          // Bản ghi 1: nghỉ có phép theo số giờ còn lại trong ngày (tối đa bằng tổng số giờ nghỉ hoặc số giờ tương ứng với soNgayPhepConLai nếu ít hơn)
          // Bản ghi 2: nghỉ không phép theo số giờ còn lại
          api.error({
            message: "Không thể tách bản ghi nghỉ giữa ngày",
            description: "Tính năng tách bản ghi cho nghỉ giữa ngày trong cùng một ngày hiện chưa được hỗ trợ hoặc cần logic cụ thể hơn.",
          });
          setShowSplitRecordModal(false);
          return;
      } else {
        // Trường hợp nghỉ cả ngày hoặc nghỉ giữa ngày kéo dài nhiều ngày
        ngayKetThucBanGhi1 = ngayBatDau
          .clone()
          .add(soNgayPhepConLai - 1, "day");
        ngayBatDauBanGhi2 = ngayBatDau.clone().add(soNgayPhepConLai, "day");
      }
      
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
        tinhLuong: false, // Không tính lương cho phần không phép
        tinhPhep: false, // Không tính phép cho phần không phép
        liDo: values.liDo + " (Không phép)",
        trangThaiPheDuyet: values.trangThaiPheDuyet || "Chờ duyệt",
        maNhanVien: thongTinNhanVien.maNhanVien,
      };

      // Đảm bảo rằng ngày bắt đầu của bản ghi thứ 2 không đứng trước ngày kết thúc của bản ghi thứ nhất
      if (dayjs(secondRecord.ngayBatDau).isBefore(dayjs(firstRecord.ngayKetThuc), isPartialDay ? 'minute' : 'day')) {
        api.error({
          message: "Lỗi logic tách bản ghi",
          description: "Ngày bắt đầu của bản ghi không phép đang trùng hoặc đứng trước ngày kết thúc của bản ghi có phép. Vui lòng kiểm tra lại logic tính ngày.",
        });
        return;
      }


      // Kiểm tra nếu ngày bắt đầu của bản ghi thứ hai lớn hơn ngày kết thúc của bản gốc,
      // điều này có nghĩa là không còn ngày nào để tạo bản ghi thứ hai (tức là toàn bộ ngày nghỉ đều có thể được tính phép).
      // Trong trường hợp này, chỉ tạo một bản ghi có phép.
      if (dayjs(secondRecord.ngayBatDau).isAfter(dayjs(ngayKetThuc), isPartialDay ? 'minute' : 'day')) {
        await createNghiPhep(firstRecord);
        api.success({
          message: "Thành công",
          description: "Đã tạo đơn nghỉ phép có phép (đủ ngày phép)",
        });
      } else {
        await createNghiPhep(firstRecord);
        await createNghiPhep(secondRecord);
        api.success({
          message: "Thành công",
          description: "Đã tạo 2 bản ghi nghỉ phép (có phép và không phép)",
        });
      }
      
      await getAllNgayPhep(); // Cập nhật lại số ngày phép sau khi tạo đơn

      setIsModalVisible(false);
      setShowSplitRecordModal(false);
      setLeaveWarning("");
      setIsPartialDay(false);
      form.resetFields();
      setIsSubmitted(true); // Hiển thị modal thông báo gửi đơn thành công
    } catch (error) {
      api.error({
        message: "Có lỗi xảy ra",
        description: error.message || "Không thể tạo bản ghi nghỉ phép",
      });
    }
  };

  const handleUpdateEmail = async (email) => {
    try {
      console.log(
        "thongTinNhanVien.maNhanVien,email: ",
        thongTinNhanVien.maNhanVien,
        email
      );
      // Gọi API để cập nhật email
      await updateEmailNhanVien(thongTinNhanVien.maNhanVien, email);
      setIsOpenModalUpdateEmail(false);
      // GỌi API để lấy lại thông tin nhân viên
      await fetchNhanVienByCCCD(completedInputCCCD.data);
      api.success({ message: "Cập nhật email thành công" });
    } catch (error) {
      api.error(error);
    }
  };

  useEffect(() => {
    if (thongTinNhanVien?.maNhanVien) {
      // Set giá trị hoTen vào form thay vì maNhanVien
      form.setFieldsValue({
        tenNhanVien: thongTinNhanVien.hoTen, // Hiển thị tên nhân viên
      });
    } else {
        form.setFieldsValue({
            tenNhanVien: null, // Xóa tên nhân viên nếu không tìm thấy CCCD
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
          description: `Không có thông tin nhân viên với - CCCD : ${completedInputCCCD.data}. Vui lòng kiểm tra lại CCCD hoặc liên hệ quản lý để thêm thông tin nhân viên.`,
        });
        return;
      }
      if (!thongTinNhanVien.email) {
        Modal.confirm({
          title: "Thiếu thông tin Email",
          icon: <ExclamationCircleOutlined />,
          content: "Nhân viên chưa có thông tin Email. Bạn có muốn cập nhật Email ngay bây giờ không?",
          okText: "Cập nhật Email",
          cancelText: "Hủy",
          onOk: () => setIsOpenModalUpdateEmail(true),
          onCancel: () => {
            api.warning({
              message: "Cảnh báo",
              description: "Đơn nghỉ phép sẽ không được gửi thông báo qua Email nếu bạn không cập nhật Email.",
            });
          },
        });
        return;
      }

      if (leaveWarning) {
        setShowSplitRecordModal(true);
        return;
      }

      let ngayBatDauFormatted, ngayKetThucFormatted;
      const isPartialFromForm = values.nghiGiuaNgay; // Sử dụng giá trị từ form
      
      // Đảm bảo ngày bắt đầu không lớn hơn ngày kết thúc trước khi format
      if (values.ngayBatDau.isAfter(values.ngayKetThuc, isPartialFromForm ? 'minute' : 'day')) {
        api.error({
          message: "Lỗi validation",
          description: "Ngày bắt đầu không được sau ngày kết thúc!",
        });
        return;
      }


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
        tinhLuong: values.tinhPhep, // Nếu tính phép thì tính lương, nếu không thì không
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
      setCompletedInputCCCD({ isCompleted: false, data: null }); // Reset CCCD
      setNhanVienError(null); // Reset lỗi nhân viên
      setSoNgayPhepConLai(0); // Reset số ngày phép
      setLeaveWarning(""); // Reset cảnh báo
      setIsPartialDay(false); // Reset trạng thái nghỉ giữa ngày
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

    const currentValues = form.getFieldsValue();
    if (!checked) {
      // Khi bỏ chọn "Nghỉ giữa ngày", đặt lại giờ về đầu/cuối ngày
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
    } else {
      // Khi chọn "Nghỉ giữa ngày", nếu chưa có giờ, đặt về giờ hiện tại hoặc mặc định
      if (currentValues.ngayBatDau && !dayjs(currentValues.ngayBatDau).isValid()) {
        form.setFieldsValue({ ngayBatDau: dayjs() });
      }
      if (currentValues.ngayKetThuc && !dayjs(currentValues.ngayKetThuc).isValid()) {
        form.setFieldsValue({ ngayKetThuc: dayjs() });
      }
    }
    // Gọi handleDateChange sau khi state và form fields được cập nhật
    setTimeout(handleDateChange, 0); 
  };

  const disabledPastDate = (current) => {

    return current && current.isBefore(dayjs().startOf('day'));
  };

  const disabledEndDate = (endValue) => {
    const startValue = form.getFieldValue('ngayBatDau');
    if (!endValue || !startValue) {
      return false;
    }

    if (isPartialDay) {
      return endValue.isBefore(startValue);
    }
    return endValue.isBefore(startValue.startOf('day'));
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
                    setCompletedInputCCCD({ isCompleted: false, data: null });
                    return Promise.resolve();
                  }
                  if (!/^\d+$/.test(value)) {
               
                    return Promise.reject(new Error("Căn cước công dân chỉ được chứa số"));
                  }
                  if (value.length !== 12) {
                    setCompletedInputCCCD({ isCompleted: false, data: null }); 
                    return Promise.reject(
                      new Error("Căn cước công dân bắt buộc phải là 12 số")
                    );
                  }

                  if (completedInputCCCD.data !== value || !completedInputCCCD.isCompleted) {
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
                if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
                  form.setFieldsValue({ cccd: value }); 
                }
              }}
              onBlur={() => { 
                const value = form.getFieldValue('cccd');
                if (value && value.length === 12 && completedInputCCCD.data !== value) {
                  setCompletedInputCCCD({ isCompleted: true, data: value });
                }
              }}
            />
          </Form.Item>

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
                  if (endDate && value.isAfter(endDate, isPartialDay ? 'minute' : 'day')) {
                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!"
                      )
                    );
                  }
                  
                  if (value.isBefore(dayjs().startOf('day'))) {
                    return Promise.reject(new Error("Không thể chọn ngày trong quá khứ!"));
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
                  form.setFieldsValue({ ngayBatDau: dayjs(date).startOf("day") });
                }
                setTimeout(handleDateChange, 0); 
              }}
              disabledDate={disabledPastDate} 
              inputReadOnly={true}
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
                  if (startDate && value.isBefore(startDate, isPartialDay ? 'minute' : 'day')) {
                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!"
                      )
                    );
                  }
                  
                  const MAX_LEAVE_DAYS = 30; 
                  if (startDate && value) {
                    const daysDiff = calculateLeaveDays(startDate, value, isPartialDay, laySoGioLamViecTheoCa());
                    if (daysDiff > MAX_LEAVE_DAYS) {
                      return Promise.reject(
                        new Error(`Khoảng thời gian nghỉ không được quá ${MAX_LEAVE_DAYS} ngày.`)
                      );
                    }
                  }

                  return Promise.olv();
                },
              },
              {
                validator: validateDateRangeUniqueDB,
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
                  form.setFieldsValue({ ngayKetThuc: dayjs(date).endOf("day") });
                }
                setTimeout(handleDateChange, 0); 
              }}
              disabledDate={disabledEndDate} 
              inputReadOnly={true}
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
            rules={[
              { required: true, message: "Vui lòng nhập lý do nghỉ!" },
              { max: 255, message: "Lý do nghỉ không được quá 255 ký tự." },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

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

      {/** Modal Thông báo khi tạo đơn thành công */}
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

      <Modal
        centered={true}
        title="Xác nhận tách bản ghi"
        open={showSplitRecordModal}
        onOk={handleSplitRecord}
        onCancel={() => {
          setIsPartialDay(false); 
          setShowSplitRecordModal(false);
          setLeaveWarning(""); 
          form.setFieldsValue({ tinhPhep: false }); 
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