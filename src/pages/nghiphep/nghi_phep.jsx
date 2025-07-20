// ===== REACT & Thư viện ngoài =====
import React, { useState, useMemo, useEffect, useContext } from "react";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
// Thêm plugin để parse custom format
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
// ===== ANT DESIGN =====
import {
  Card,
  Table,
  Button,
  Input,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Select,
  Checkbox,
  Tooltip,
  Tag,
  Alert,
  Grid 
} from "antd";
import { ModalQrCode } from "./modalQrCode";
import {
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined, // Import for Modal.confirm
  WarningOutlined,
} from "@ant-design/icons";

// ===== STYLES ======
import "./nghi_phep.css"; // Đảm bảo file CSS này tồn tại và được cập nhật

// ===== HOOK Tuỳ Chỉnh ======
import { useNghiPhep } from "../../component/hooks/useNghiPhep";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useAppNotification } from "../../component/ui/notification";
import { useNgayPhep } from "../../component/hooks/useNgayPhep";
import { useHeThong } from "../../component/hooks/useHeThong";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useCaLam } from "../../component/hooks/useCaLam";

// ===== CONTEXT =====
import { ReloadContext } from "../../context/reloadContext";

// ===== UTILITIES =====
import { NghiPhepPermissions } from "../../config/utils/user_permission";

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

// Hàm helper để parse ngày từ backend
const parseDate = (dateString) => {
  if (!dateString) return null;

  // Thử parse với nhiều format khác nhau
  const formats = [
    "DD/MM/YYYY HH:mm:ss",
    "DD/MM/YYYY",
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD",
  ];

  for (const format of formats) {
    const parsed = dayjs(dateString, format, true); // strict mode
    if (parsed.isValid()) {
      return parsed;
    }
  }

  // Fallback - parse thông thường
  const fallback = dayjs(dateString);
  return fallback.isValid() ? fallback : null;
};

export default function NghiPhep() {
  const {
    danhSachNghiPhep,
    getAllNghiPhep,
    updateNghiPhep,
    deleteNghiPhep,
    createNghiPhep,
  } = useNghiPhep();
  const { danhSachNhanVien } = useNhanVien();
  const { danhSachNgayPhep, getAllNgayPhep, tinhToanNgayPhepTatCa } =
    useNgayPhep();
  const { danhSachHeThong } = useHeThong();
  const { danhSachPhongBan } = usePhongBan();
  const { danhSachCaLam } = useCaLam();

  const api = useAppNotification();
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [disableTinhLuong, setDisableTinhLuong] = useState(false);
  const [isPartialDay, setIsPartialDay] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);

  const [leaveWarning, setLeaveWarning] = useState("");
  const [showSplitRecordModal, setShowSplitRecordModal] = useState(false);
  const [soNgayPhepConLai, setSoNgayPhepConLai] = useState(0);
  const [isOpenModalQrCode, setIsOpenModalQrCode] = useState(false);

  //Mobile
  const screens = useBreakpoint();
  const isMobile = !screens.sm; 

  // CONTEXT
  const { setReload } = useContext(ReloadContext);

  const canEditStatus = NghiPhepPermissions.canEdit();
  const canDelete = NghiPhepPermissions.canDelete();

  useEffect(() => {
    setReload(() => getAllNghiPhep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm để tính số ngày phép còn lại
  useEffect(() => {
    const ngayPhep = danhSachNgayPhep.find(
      (np) => np.maNhanVien === selectedNhanVien
    );
    setSoNgayPhepConLai(ngayPhep ? ngayPhep.ngayPhepConLai : 0);
  }, [danhSachNgayPhep, selectedNhanVien]);

  // Hàm tính số ngày nghỉ dựa trên ngày bắt đầu và kết thúc
  const calculateLeaveDays = (
    startDate,
    endDate,
    isPartial = false,
    soGioLamViec
  ) => {
    if (!startDate || !endDate) return 0;
    if (isPartial) {
      // Tính theo giờ cho nghỉ giữa ngày
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      // Kiểm tra nếu cùng ngày
      if (start.isSame(end, "day")) {
        const hoursOff = end.diff(start, "hour", true);
        // Nếu dưới 50% số giờ làm việc (4.5 giờ) thì tính 0.5 ngày, ngược lại 1 ngày
        return hoursOff < soGioLamViec * 0.5 ? 0.5 : 1;
      } else {
        // Nếu khác ngày, tính số ngày đầy đủ
        return end.diff(start, "day") + 1;
      }
    } else {
      // Tính theo ngày đầy đủ
      const start = dayjs(startDate).startOf("day");
      const end = dayjs(endDate).startOf("day");
      return end.diff(start, "day") + 1;
    }
  };

  const laySoGioLamViecTheoCa = (maNhanVien) => {
    const caLamNhanVien = dataSourceNghiPhep.find(
      (nhanVienNghiPhep) => nhanVienNghiPhep.maNhanVien === maNhanVien
    );
    if (caLamNhanVien) {
      return caLamNhanVien.soGioLamViec;
    } else {
      return 8; // Mặc định là 8 giờ nếu không tìm thấy ca làm
    }
  };

  const isCanhBaoSapHetHan = (ngayBatDau, trangThaiPheDuyet) => {
    if (
      !danhSachHeThong ||
      danhSachHeThong.length === 0 ||
      !danhSachHeThong[0].nguongThoiGianPheDuyetNgayNghi
    ) {
      return;
    }
    if (trangThaiPheDuyet === "Đã duyệt" || trangThaiPheDuyet === "Từ chối")
      return;

    const parsedNgayBatDau = dayjs(ngayBatDau, "DD/MM/YYYY HH:mm:ss");
    if (!parsedNgayBatDau.isValid()) {
      return false;
    }
    const diffDays = dayjs().diff(parsedNgayBatDau, "day") + 1; // Số ngày còn lại
    // Nếu
    if (diffDays <= danhSachHeThong[0].nguongThoiGianPheDuyetNgayNghi - 2) {
      return 1;
    } else if (diffDays > danhSachHeThong[0].nguongThoiGianPheDuyetNgayNghi) {
      return 2;
    } else {
      return 0;
    }
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
    const { ngayBatDau, ngayKetThuc, maNhanVien, tinhPhep } = values;

    // Lấy số giờ làm việc theo ca của nhân viên
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
    if (selectedNhanVien) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      const isOverlapped = dataSourceNghiPhep.some((record) => {
        if (editingRecord && record.maNghiPhep === editingRecord) {
          return false;
        }

        const rStart = dayjs(record.ngayBatDau, "DD/MM/YYYY HH:mm:ss");
        const rEnd = dayjs(record.ngayKetThuc, "DD/MM/YYYY HH:mm:ss");

        return (
          record.maNhanVien === selectedNhanVien &&
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
      // Tính toán ngày chính xác cho việc tách bản ghi
      const ngayBatDau = values.ngayBatDau;
      const ngayKetThuc = values.ngayKetThuc;

      // Ngày kết thúc của bản ghi đầu tiên (có phép)
      const ngayKetThucBanGhi1 = ngayBatDau
        .clone()
        .add(soNgayPhepConLai - 1, "day");
      // Ngày bắt đầu của bản ghi thứ hai (không phép)
      const ngayBatDauBanGhi2 = ngayBatDau.clone().add(soNgayPhepConLai, "day");

      // Tạo bản ghi đầu tiên (có phép)
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
        maNhanVien: values.maNhanVien,
      };

      // Tạo bản ghi thứ hai (không phép)
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
        maNhanVien: values.maNhanVien,
      };

      await createNghiPhep(secondRecord);
      await createNghiPhep(firstRecord);
      await getAllNgayPhep();
      api.success({
        message: "Thành công",
        description:
          "Đã tạo bản ghi nghỉ phép không lương vì đã hết ngày phép.",
      });
      api.success({
        message: "Thành công",
        description: "Đã tạo 2 bản ghi nghỉ phép (có phép và không phép)",
      });

      setIsModalVisible(false);
      setShowSplitRecordModal(false);
      setLeaveWarning("");
      setIsPartialDay(false);
    } catch (error) {
      api.error({
        message: "Có lỗi xảy ra",
        description: error.message || "Không thể tạo bản ghi nghỉ phép",
      });
    }
  };

  const dataSourceNghiPhep = danhSachNghiPhep.map((np) => {
    const nhanVien = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === np.maNhanVien
    );

    const phongBanFind = danhSachPhongBan.find(
      (pb) => pb.maPhongBan === nhanVien?.maPhongBan
    );

    const caLamFind = danhSachCaLam.find(
      (cl) => cl.maCa === phongBanFind?.maCa || 1 // Mặc định là ca 1 nếu không tìm thấy
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
      soGioLamViec: caLamFind?.soGioLamViec || 0,
    };
  });

  const [form] = Form.useForm();

  // Filter list
  const filteredList = useMemo(() => {
    return dataSourceNghiPhep.filter((item) => {
      const maNhanVien = item.maNhanVien
        ? String(item.maNhanVien).toLowerCase()
        : "";

      const hoTen = item.hoTen ? String(item.hoTen).toLowerCase() : "";

      const matchesSearch =
        maNhanVien.includes(searchValue.toLowerCase()) ||
        hoTen.includes(searchValue.toLowerCase());

      if (!matchesSearch) return false;

      // Nếu không có ngày bắt đầu/kết thúc => bỏ qua dòng này
      if (!item.ngayBatDau || !item.ngayKetThuc) return false;

      const start = parseDate(item.ngayBatDau);
      const end = parseDate(item.ngayKetThuc);

      if (!start || !end || !start.isValid() || !end.isValid()) return false;

      // Lọc theo khoảng ngày nếu có - PRIORITY CAO HỠN
      if (dateRange?.[0] && dateRange?.[1]) {
        const isInDateRange =
          start.isBetween(dateRange[0], dateRange[1], "day", "[]") ||
          end.isBetween(dateRange[0], dateRange[1], "day", "[]") ||
          (start.isBefore(dateRange[0]) && end.isAfter(dateRange[1]));

        if (!isInDateRange) return false;
      }

      // Lọc theo tháng chỉ khi KHÔNG có date range
      if (selectedMonth && (!dateRange?.[0] || !dateRange?.[1])) {
        const startOfMonth = selectedMonth.clone().startOf("month");
        const endOfMonth = selectedMonth.clone().endOf("month");

        const isInSelectedMonth =
          start.isBetween(startOfMonth, endOfMonth, "day", "[]") ||
          end.isBetween(startOfMonth, endOfMonth, "day", "[]") ||
          (start.isBefore(startOfMonth) && end.isAfter(endOfMonth));

        if (!isInSelectedMonth) return false;
      }

      return true;
    });
  }, [dataSourceNghiPhep, searchValue, dateRange, selectedMonth]);

  const statistics = useMemo(() => {
    if (!filteredList.length) return { total: 0, tinhLuong: 0, tinhPhep: 0 };

    return {
      total: filteredList.length,
      tinhLuong: filteredList.filter((i) => i.tinhLuong).length,
      tinhPhep: filteredList.filter((i) => i.tinhPhep).length,
    };
  }, [filteredList]);

  // Xử lý khi thay đổi checkbox "Nghỉ giữa ngày"
  const handlePartialDayChange = (e) => {
    const checked = e.target.checked;
    setIsPartialDay(checked);

    if (!checked) {
      // Nếu bỏ tick "nghỉ giữa ngày", set về thời gian mặc định
      const currentValues = form.getFieldsValue();
      if (currentValues.ngayBatDau) {
        form.setFieldsValue({
          ngayBatDau: dayjs(currentValues.ngayBatDau).startOf("day"), // 00:00:00
        });
      }
      if (currentValues.ngayKetThuc) {
        form.setFieldsValue({
          ngayKetThuc: dayjs(currentValues.ngayKetThuc).endOf("day"), // 23:59:59
        });
      }
    }
    // Tính lại số ngày khi thay đổi loại nghỉ
    setTimeout(handleDateChange, 100);
  };

  const onMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
    setLeaveWarning("");
    setSelectedNhanVien(null);
    setIsPartialDay(false);
  };

  const isPartialDayRecord = (ngayBatDau, ngayKetThuc) => {
    const start = parseDate(ngayBatDau);
    const end = parseDate(ngayKetThuc);

    if (!start || !end) return false;

    // Kiểm tra nếu thời gian bắt đầu không phải 00:00:00 hoặc kết thúc không phải 23:59:59
    const isStartNotMidnight =
      start.hour() !== 0 || start.minute() !== 0 || start.second() !== 0;
    const isEndNotEndOfDay =
      end.hour() !== 23 || end.minute() !== 59 || end.second() !== 59;

    return isStartNotMidnight || isEndNotEndOfDay;
  };

  const showEditModal = (record) => {
    setDisableTinhLuong(false);

    if (record.tinhPhep) {
      setDisableTinhLuong(true);
    }

    console.warn("Edit:", record);

    // Kiểm tra xem record có phải nghỉ giữa ngày không
    const isPartialRecord = isPartialDayRecord(
      record.ngayBatDau,
      record.ngayKetThuc
    );
    setIsPartialDay(isPartialRecord);

    setEditingRecord(record.maNghiPhep);

    // Parse ngày và set vào form
    const startDate = parseDate(record.ngayBatDau);
    const endDate = parseDate(record.ngayKetThuc);

    form.setFieldsValue({
      ...record,
      ngayBatDau: startDate,
      ngayKetThuc: endDate,
      nghiGiuaNgay: isPartialRecord, // Set checkbox dựa trên dữ liệu
    });

    setIsModalVisible(true);
    setSelectedNhanVien(record.maNhanVien);
  };
  const handleOk = async () => {
    try {
      // Validate tất cả các field trước
      const values = await form.validateFields();
      console.warn("Edit:", values);

      // Log để debug
      console.log("Form values:", values);

      // Kiểm tra các field bắt buộc
      if (!values.maNhanVien) {
        api.error({
          message: "Lỗi validation",
          description: "Vui lòng chọn nhân viên",
        });
        return;
      }

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

      // Kiểm tra cảnh báo về số ngày phép
      if (leaveWarning && !editingRecord) {
        setShowSplitRecordModal(true);
        return;
      }

      let ngayBatDauFormatted, ngayKetThucFormatted;
      const isPartialFromForm = values.nghiGiuaNgay || isPartialDay;
      if (isPartialFromForm) {
        // Nghỉ giữa ngày - giữ nguyên thời gian người dùng chọn
        ngayBatDauFormatted = values.ngayBatDau.format("YYYY-MM-DD HH:mm:ss");
        ngayKetThucFormatted = values.ngayKetThuc.format("YYYY-MM-DD HH:mm:ss");
      } else {
        // Nghỉ nguyên ngày - đảm bảo 00:00:00 và 23:59:59
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
        tinhLuong: values.tinhLuong || false,
        tinhPhep: values.tinhPhep || false,
        liDo: values.liDo.trim(),
        trangThaiPheDuyet: values.trangThaiPheDuyet || "Chờ duyệt",
        maNhanVien: values.maNhanVien,
      };
      // Log data để debug
      console.log("Data to save:", dataToSave);

      if (editingRecord) {
        try {
          await updateNghiPhep(editingRecord, dataToSave);
          setIsModalVisible(false);
          await getAllNgayPhep();
        } catch (error) {
          console.error("Update error:", error);
        }
      } else {
        // Tạo mới
        try {
          await createNghiPhep(dataToSave);
          setIsModalVisible(false);
          await getAllNgayPhep();
        } catch (error) {
          console.error("Create error:", error);
        }
      }
    } catch (errorInfo) {
      console.error("Validation failed:", errorInfo);

      // Xử lý lỗi validation cụ thể
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
          description: "Vui lòng kiểm tra lại các trường đã nhập.",
        });
      }
    }
  };

  // form xác nhận
  const handleDelete = async (maNghiPhep) => {
    try {
      await deleteNghiPhep(maNghiPhep);
      await getAllNgayPhep();
    } catch {
      // Do nothing, error is handled by service layer
    }
  };

  const columns = [
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      width: 120,
    },
    { title: "Tên nhân viên", dataIndex: "hoTen", key: "hoTen", width: 120 },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      width: 120,
      render: (text) => {
        const parsed = parseDate(text);
        return parsed && parsed.isValid()
          ? parsed.format("DD/MM/YYYY HH:mm:ss")
          : text;
      },
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      width: 120,
      render: (text) => {
        const parsed = parseDate(text);
        return parsed && parsed.isValid()
          ? parsed.format("DD/MM/YYYY HH:mm:ss")
          : text;
      },
    },
    { title: "Lý do nghỉ", dataIndex: "liDo", key: "liDo", width: 180 },
    {
      title: "Tính lương",
      dataIndex: "tinhLuong",
      key: "tinhLuong",
      width: 100,
      align: "center",
      render: (value) =>
        value ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: 20 }} />
        ),
    },
    {
      title: "Có phép",
      dataIndex: "tinhPhep",
      key: "tinhPhep",
      width: 100,
      align: "center",
      render: (value) =>
        value ? (
          <CheckCircleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: 20 }} />
        ),
    },
    {
      title: "Trạng thái phê duyệt",
      dataIndex: "trangThaiPheDuyet",
      key: "trangThaiPheDuyet",
      width: 100,
      align: "center",
      defaultSortOrder: "ascend", // mặc định sort theo chiều tăng dần
      sorter: (a, b) => {
        const order = {
          "Chờ duyệt": 0,
          "Đã duyệt": 1,
          "Từ chối": 2,
        };
        return (
          (order[a.trangThaiPheDuyet] ?? 99) -
          (order[b.trangThaiPheDuyet] ?? 99)
        );
      },
      render: (status) => {
        const color =
          status === "Đã duyệt"
            ? "green"
            : status === "Chờ duyệt"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              disabled={canDelete ? false : true}
              danger
              shape="circle"
              icon={<DeleteOutlined style={{ color: "red" }} />}
              onClick={() => handleDelete(record.maNghiPhep)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      className="container-column"
      style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Row gutter={16} style={{ marginBottom: 20, textAlign: "center" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số phép"
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tính lương"
              value={statistics.tinhLuong}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Có phép"
              value={statistics.tinhPhep}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#108ee9" }}
            />
          </Card>
        </Col>
      </Row>
      <Card
        style={{
          marginBottom: 12,
        }}
      >
        <Row gutter={16} style={{ marginBottom: 20, alignItems: "center" }}>
          <Col xs={24} sm={24} md={8}>
            <Input.Search
              placeholder="Tìm kiếm Mã nhân viên, Tên nhân viên..."
              allowClear
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              enterButton
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            {isMobile ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Từ ngày"
                  value={dateRange?.[0]}
                  onChange={(date) => setDateRange([date, dateRange?.[1] ?? null])}
                />
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Đến ngày"
                  value={dateRange?.[1]}
                  onChange={(date) => setDateRange([dateRange?.[0] ?? null, date])}
                />
              </div>
            ) : (
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(values) => {
                  if (!Array.isArray(values)) {
                    setDateRange([null, null]);
                  } else {
                    setDateRange(values);
                  }
                }}
                format="DD/MM/YYYY"
                allowClear
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            )}
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button onClick={() => setIsOpenModalQrCode(true)}>Tạo QrCode đến trang nghỉ phép</Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={4}>
            <ConfigProvider locale={viVN}>
              <DatePicker
                picker="month"
                onChange={onMonthChange}
                value={selectedMonth}
                style={{ width: "100%" }}
                format="MM/YYYY"
                placeholder="Chọn tháng"
                allowClear
              />
            </ConfigProvider>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              onClick={showAddModal}
            >
              Tạo đơn xin nghỉ
            </Button>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              block
              onClick={async () => {
                try {
                  await tinhToanNgayPhepTatCa(
                    dayjs(selectedMonth).year(),
                    dayjs(selectedMonth).month() + 1
                  );
                  api.success({
                    message: "Cập nhật phép thành công cho nhân viên",
                  });
                } catch {
                  api.error({
                    message: "Lỗi khi cập nhật ngày phép nhân viên",
                  });
                }
              }}
            >
              Cập nhật ngày phép
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        rowClassName={(record) => {
          const canhBao = isCanhBaoSapHetHan(
            record.ngayBatDau,
            record.trangThaiPheDuyet
          );

          return canhBao === 0
            ? "row-canh-bao"
            : canhBao === 2
            ? "row-qua-han"
            : canhBao === 1
            ? "row-cho-duyet"
            : "";
        }}
        columns={columns}
        dataSource={filteredList}
        rowKey={(record) => record.maNghiPhep}
        pagination={{ pageSize: 10 }}
        scroll={{ y: 'calc(100vh - 460px)' }}
        sticky
        className="custom-header-table"
      />

      {/* Modal chính cho tạo/sữa đơn nghỉ phép */}
      <Modal
        title={editingRecord ? "Sửa đơn nghỉ phép" : "Tạo đơn xin nghỉ"}
        open={isModalVisible}
        onCancel={() => {
          setIsPartialDay(false);
          setDisableTinhLuong(false);
          setIsModalVisible(false);
          setSelectedNhanVien(null);
          setLeaveWarning("");
          setIsPartialDay(false);
        }}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        closable={false}
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
            name="maNhanVien"
            label="Mã nhân viên"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nhân viên!",
              },
            ]}
          >
            <Select
              disabled={editingRecord ? true : false}
              placeholder="Chọn nhân viên"
              showSearch
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={danhSachNhanVien.map((nv) => ({
                value: nv.maNhanVien,
                label: `${nv.hoTen} - ${nv.cmnd}`,
              }))}
              onChange={(value) => {
                setSelectedNhanVien(value);
                setTimeout(handleDateChange, 100);
              }}
            />
          </Form.Item>

          {/* Checkbox nghỉ giữa ngày */}
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
                form.validateFields(["ngayKetThuc"]);
                setTimeout(handleDateChange, 100);
              }}
            />
          </Form.Item>

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

          <Form.Item
            name="liDo"
            label="Lý do nghỉ"
            rules={[{ required: true, message: "Vui lòng nhập lý do nghỉ!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {canEditStatus && editingRecord && (
            <Form.Item name="trangThaiPheDuyet">
              <Select
                placeholder="Trạng thái phê duyệt"
                options={[
                  { value: "Chờ duyệt", label: "Chờ duyệt" },
                  { value: "Từ chối", label: "Từ chối" },
                  { value: "Đã duyệt", label: "Đã duyệt" },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item name="tinhLuong" valuePropName="checked">
            <Checkbox disabled={disableTinhLuong}>Tính lương</Checkbox>
          </Form.Item>

          <Form.Item name="tinhPhep" valuePropName="checked">
            <Checkbox
              disabled={editingRecord ? false : soNgayPhepConLai <= 0}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  form.setFieldsValue({ tinhLuong: true });
                  setDisableTinhLuong(true);
                } else {
                  form.setFieldsValue({ tinhLuong: false });
                  setDisableTinhLuong(false);
                }
                setTimeout(handleDateChange, 100);
              }}
            >
              Có phép{" "}
              {selectedNhanVien && (
                <Tag color="success">
                  Số ngày phép còn lại trong năm: {soNgayPhepConLai}
                </Tag>
              )}
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
      {/** Modal Qrcode */}
      <ModalQrCode isOpen={isOpenModalQrCode} onBack={() => setIsOpenModalQrCode(false)}/>

      {/* Modal xác nhận tách bản ghi */}
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
