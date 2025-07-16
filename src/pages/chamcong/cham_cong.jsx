/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// ===== Ant Design =====
import {
  ConfigProvider,
  Card,
  Button,
  Table,
  DatePicker,
  Select, 
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Form,
  Typography,
  Input,
} from "antd";
import {
  ClockCircleOutlined,
  LogoutOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";

// ===== Hook tùy chỉnh =====
import { useChamCong } from "../../component/hooks/useChamCong";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useTangCa } from "../../component/hooks/useTangCa";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useCaLam } from "../../component/hooks/useCaLam";
import { useCaLamTrongTuan } from "../../component/hooks/useCaLamTrongTuan";
import { useLichSuUuTien } from "../../component/hooks/useLichSuUuTien";
import { useDoiTuongUuTien } from "../../component/hooks/useDoiTuongUuTien";
// ===== Context =====
import { ReloadContext } from "../../context/reloadContext";
import { useAppNotification } from "../../component/ui/notification";
// ===== Component nội bộ =====
import MyAlert from "../../component/ui/alert";
import ModalTangCa from "./tangca/modal_tangcang";
import ModalThemTangCa from "./tangca/modal_them_tang_ca";
import ModalChiTietChamCong from "./modal_chi_tiet_cham_cong";

// ===== Styles =====

// ===== Cấu hình Day.js =====
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("vi");
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

export default function GiaLapChamCong() {
  // Hooks
  const { danhSachNhanVien } = useNhanVien();
  const { danhSachChamCongChiTiet, getAllChamCongDetail } = useChamCong();
  const { danhSachPhongBan } = usePhongBan();
  const { danhSachCaLam } = useCaLam();
  const { danhSachCaLamTrongTuan } = useCaLamTrongTuan();
  const { danhSachLichSuUuTien } = useLichSuUuTien();
  const { danhSachDoiTuongUuTien } = useDoiTuongUuTien();

  const { setReload } = useContext(ReloadContext);
  const {
    danhSachTangCa,
    createTangCa,
    getAllTangCa,
    updateTangCa,
    deleteTangCa,
  } = useTangCa();

  // State
  const [pageSize, setPageSize] = useState(10);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const apiNotification = useAppNotification();

  const [isMobile, setIsMobile] = useState(false);

  const [searchText, setSearchText] = useState("");
  // Keep selectedPhongBan state as it's used for the table filter and statistics
  const [selectedPhongBan, setSelectedPhongBan] = useState({
    selected: false,
    phongBanValue: null,
  });
  const [isModalTangCaVisible, setIsModalTangCaVisible] = useState(false);
  const [isModalThemTangCaVisible, setIsModalThemTangCaVisible] =
    useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const [isModalChiTietVisible, setIsModalChiTietVisible] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);

  // Component
  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    message: "",
    description: "",
  });
  const [form] = Form.useForm();

  const thuNgayTrongTuan = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  useEffect(() => {
    setReload(getAllChamCongDetail);
  }, [getAllChamCongDetail, setReload]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let tempFilteredData = danhSachChamCongChiTiet;

    // Lọc theo khoảng thời gian
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dayjs(dateRange[0]).startOf("day");
      const endDate = dayjs(dateRange[1]).endOf("day");
      tempFilteredData = tempFilteredData.filter((item) => {
        const itemDate = dayjs(item.ngayChamCong);
        return (
          itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate)
        );
      });
    }

    // Lọc theo tháng
    if (selectedMonth) {
      tempFilteredData = tempFilteredData.filter((item) => {
        const itemDate = dayjs(item.ngayChamCong);
        return (
          itemDate.month() === selectedMonth.month() &&
          itemDate.year() === selectedMonth.year()
        );
      });
    }

    if (searchText.trim()) {
      tempFilteredData = tempFilteredData.filter(
        (item) =>
          item.hoTen.toLowerCase().includes(searchText.toLowerCase()) ||
          String(item.maNhanVien)
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    setFilteredData(tempFilteredData);
  }, [danhSachChamCongChiTiet, dateRange, selectedMonth, searchText]);

  const handleSearch = useCallback((value) => {
    setSearchText(value);
  }, []);

  const handleShowModalTangCa = () => {
    setIsModalTangCaVisible(true);
  };

  const handleShowModalThemTangCa = () => {
    setIsModalThemTangCaVisible(true);
  };

  const onCancelModalTangCa = () => {
    setIsModalTangCaVisible(false);
    getAllChamCongDetail();
  };

  const formatTime = useCallback((text) => {
    // Nếu text là null, undefined, chuỗi rỗng, "N/A" HOẶC "Invalid Date", trả về "00:00:00"
    if (!text || text === "N/A" || text === "Invalid Date")
      return "Chưa chấm công ra";
    if (typeof text === "string" && text.includes("T")) {
      const timePart = text.split("T")[1];
      return timePart.split(".")[0];
    }
    return text;
  }, []);

  const formatGio = (gioStr) => {
    if (!gioStr) return "";

    const [gio, phut] = gioStr.split(":");
    return phut === "00" ? `${gio}h` : `${gio}h${phut}`;
  };

  //Hàm xử lý lấy thông tin ca làm, giờ làm việc theo ngày.
  const getThongTinCaTrongNgay = (maNhanVien, ngayChamCong) => {
    const nhanVien = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === maNhanVien
    );
    if (!nhanVien) return null;

    const phongBan = danhSachPhongBan.find(
      (pb) => pb.maPhongBan === nhanVien.maPhongBan
    );
    if (!phongBan) return null;

    const caLam = danhSachCaLam.find((ca) => ca.maCa === phongBan.maCa);
    if (!caLam) return null;

    const jsDay = dayjs(ngayChamCong).day(); // 0 (Chủ nhật) – 6 (Thứ 7)

    // Sửa logic: dayjs 0-6 → hệ thống 1-7
    const ngayChuan = jsDay + 1; // 0→1, 1→2, 2→3, ..., 6→7
    const caTrongTuan = danhSachCaLamTrongTuan.find(
      (item) => item.maCa === caLam.maCa && item.ngayTrongTuan === ngayChuan
    );

    if (!caTrongTuan) return null;

    return { nhanVien, phongBan, caLam, caTrongTuan };
  };

  //Hàm xử lý lấy giờ bắt đầu/kết thúc hằng ngày của nhân viên ứng với ca làm việc mỗi ngày.
  const getCaLamViecTrongTuan = (maNhanVien, ngayChamCong) => {
    const thongTin = getThongTinCaTrongNgay(maNhanVien, ngayChamCong);
    if (!thongTin) return "Không có ca trong ngày";

    const { caTrongTuan } = thongTin;

    return (
      <div>
        {thuNgayTrongTuan[caTrongTuan.ngayTrongTuan - 1]} <br />({
          formatGio(caTrongTuan.gioBatDau)
        }{" "}
        - {formatGio(caTrongTuan.gioKetThuc)})
      </div>
    );
  };

  //Hàm xử lý lấy thời gian của ưu tiên.
  const getUuTien = (maNhanVien, ngayChamCong) => {
    const thongTin = getThongTinCaTrongNgay(maNhanVien, ngayChamCong);
    if (!thongTin) return null; 

    const { nhanVien, caTrongTuan } = thongTin;

    const lichSuUuTien = danhSachLichSuUuTien.find(
      (lsut) => lsut.maNhanVien === nhanVien.maNhanVien
    );
    if (!lichSuUuTien) return null; // Return null here

    const uuTien = danhSachDoiTuongUuTien.find(
      (ut) => ut.maUuTien === lichSuUuTien.maUuTien
    );
    if (!uuTien) return null; // Return null here

    // Parse thời gian ca làm việc - thử nhiều cách
    let gioBatDauCa, gioKetThucCa;

    // Cách 1: Nếu là string thời gian "HH:mm:ss"
    if (typeof caTrongTuan.gioBatDau === "string") {
      gioBatDauCa = dayjs(`2024-01-01 ${caTrongTuan.gioBatDau}`);
      gioKetThucCa = dayjs(`2024-01-01 ${caTrongTuan.gioKetThuc}`);
    } else {
      // Cách 2: Nếu là timestamp hoặc Date object
      gioBatDauCa = dayjs(caTrongTuan.gioBatDau);
      gioKetThucCa = dayjs(caTrongTuan.gioKetThuc);
    }

    // Kiểm tra nếu parse thành công
    if (!gioBatDauCa.isValid() || !gioKetThucCa.isValid()) {
      console.error("Lỗi parse thời gian ca làm việc");
      return null; // Return null here
    }

    // Parse thời gian ưu tiên từ string "HH:mm:ss" thành phút
    const parseTimeToMinutes = (timeStr) => {
      const parts = timeStr.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2] || "0", 10);
      return hours * 60 + minutes + Math.round(seconds / 60);
    };

    const phutUuTienBatDau = parseTimeToMinutes(uuTien.thoiGianBatDauCa);
    const phutUuTienKetThuc = parseTimeToMinutes(uuTien.thoiGianKetThucCa);

    // Tính toán thời gian ưu tiên
    const gioUuTienBatDau = gioBatDauCa.add(phutUuTienBatDau, "minute");
    const gioUuTienKetThuc = gioKetThucCa.subtract(phutUuTienKetThuc, "minute");

    // Kiểm tra kết quả
    if (!gioUuTienBatDau.isValid() || !gioUuTienKetThuc.isValid()) {
      console.error("Lỗi tính toán thời gian ưu tiên");
      return null; // Return null here
    }

    return (
      <div>
        {uuTien.tenUuTien} <br />({gioUuTienBatDau.format("HH:mm")} -{" "}
        {gioUuTienKetThuc.format("HH:mm")})
      </div>
    );
  };

  const getTimeTangCa = (maNhanVien, ngayChamCong) => {
    const thongTin = getThongTinCaTrongNgay(maNhanVien, ngayChamCong);
    if (!thongTin) return null; 

    const { phongBan } = thongTin;

    const chamCong = danhSachChamCongChiTiet.find(
      (cc) =>
        cc.maNhanVien === maNhanVien &&
        dayjs(cc.ngayChamCong).isSame(dayjs(ngayChamCong), "day")
    );
    if (!chamCong) return null; 

    const tangCa = danhSachTangCa.find(
      (tc) =>
        tc.maPhongBan === phongBan.maPhongBan &&
        dayjs(tc.ngayChamCongTangCa).isSame(dayjs(ngayChamCong), "day")
    );
    if (!tangCa) return null; 
    return `(${formatGio(tangCa.gioTangCaBatDau)} - ${formatGio(
      tangCa.gioTangCaKetThuc
    )})`;
  };
  const styles = `
  .row-early-leave {
    background-color: #ffebee !important;
    border-left: 4px solid #f44336 !important;
  }
  
  .row-early-leave:hover {
    background-color: #ffcdd2 !important;
  }
  
  .ant-table-tbody > tr.row-early-leave > td {
    background-color: inherit !important;
  }
`;
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  const addRowClass = (record) => {
    // Kiểm tra dữ liệu cần thiết
    if (!record || !record.thoiGianRa || !isDataReady) {
      return "";
    }

    const thongTin = getThongTinCaTrongNgay(
      record.maNhanVien,
      record.ngayChamCong
    );

    if (!thongTin) {
      return "";
    }

    const { caTrongTuan } = thongTin;

    if (
      !record.thoiGianRa ||
      record.thoiGianRa === "N/A" ||
      record.thoiGianRa === "Invalid Date"
    ) {
      return "";
    }

    try {
      // Parse thời gian ra của nhân viên
      let thoiGianRa;
      if (record.thoiGianRa.includes("T")) {
        // Nếu là ISO string, lấy phần time
        const timePart = record.thoiGianRa.split("T")[1];
        const timeOnly = timePart.split(".")[0];
        thoiGianRa = dayjs(timeOnly, "HH:mm:ss");
      } else {
        // Nếu là string thời gian thuần
        thoiGianRa = dayjs(record.thoiGianRa, "HH:mm:ss");
      }

      // Parse thời gian kết thúc ca làm việc
      let thoiGianKetThucCa;
      if (typeof caTrongTuan.gioKetThuc === "string") {
        thoiGianKetThucCa = dayjs(caTrongTuan.gioKetThuc, "HH:mm:ss");
      } else {
        thoiGianKetThucCa = dayjs(caTrongTuan.gioKetThuc);
      }

      // Kiểm tra nếu parse thành công
      if (!thoiGianRa.isValid() || !thoiGianKetThucCa.isValid()) {
        console.warn("Không thể parse thời gian:", {
          thoiGianRa: record.thoiGianRa,
          gioKetThuc: caTrongTuan.gioKetThuc,
        });
        return "";
      }

      if (thoiGianRa.isBefore(thoiGianKetThucCa, "minute")) {
        return "row-early-leave";
      }

      return "";
    } catch (error) {
      console.error("Lỗi trong addRowClass:", error);
      return "";
    }
  };

  const isDataReady = [
    danhSachNhanVien,
    danhSachPhongBan,
    danhSachCaLam,
    danhSachCaLamTrongTuan,
  ].every((ds) => Array.isArray(ds) && ds.length > 0);

  const columns = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "ngayChamCong",
        key: "ngayChamCong",
        sorter: {
          compare: (a, b) =>
            dayjs(a.ngayChamCong).unix() - dayjs(b.ngayChamCong).unix(),
          multiple: 1,
        },
        render: (text) => dayjs(text).format("DD/MM/YYYY"),
        showSorterTooltip: {
          title: "Sắp xếp theo ngày",
        },
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Nhân viên",
        dataIndex: "hoTen",
        key: "hoTen",
        sorter: {
          compare: (a, b) =>
            a.hoTen.localeCompare(b.hoTen, "vi", { numeric: true }),
          multiple: 2,
        },
        showSorterTooltip: {
          title: "Sắp xếp theo tên nhân viên",
        },
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Phòng ban",
        width: 150,
        dataIndex: "tenPhongBan",
        key: "tenPhongBan",
        filters: danhSachPhongBan.map((pb) => ({
          text: pb.tenPhongBan,
          value: pb.tenPhongBan,
        })),
        onFilter: (value, record) => record.tenPhongBan === value,
        sorter: (a, b) => a.tenPhongBan.localeCompare(b.tenPhongBan),
      },
      {
        title: "Ca làm việc",
        key: "caLamViec",
        render: (_, record) => {
          if (!isDataReady) return "Đang tải...";
          const ca = getCaLamViecTrongTuan(
            record.maNhanVien,
            record.ngayChamCong
          );
          return ca || "-";
        },
      },
      {
        title: "Ưu tiên",
        width: 120, 
        render(_, record) {
          const uutien = getUuTien(record.maNhanVien, record.ngayChamCong);
          return uutien || "-"; 
        },
      },
      {
        title: "Giờ vào",
        dataIndex: "thoiGianVao",
        key: "thoiGianVao",
        render: formatTime,
      },
      {
        title: "Giờ ra",
        dataIndex: "thoiGianRa",
        key: "thoiGianRa",
        render: formatTime,
      },
      {
        title: "Giờ tăng ca",
        width: 120, 
        render(_, record) {
          const tc = getTimeTangCa(record.maNhanVien, record.ngayChamCong);
          return tc || "-"; 
        },
      },
      {
        title: "Tổng giờ",
        dataIndex: "soGioThucTe",
        width: 120,
        key: "soGioThucTe",
        responsive: ["md"],
      },
      {
        title: "Công",
        dataIndex: "cong",
        key: "cong",
        responsive: ["md"],
        width: 80,
      },
      {
        title: "Trạng thái",
        dataIndex: "trangThai",
        width: 130,
        key: "trangThai",
        render: (status) => {
          const color =
            status === "Chưa hoàn tất" || status === "Tăng ca"
              ? "error"
              : status === "Tăng ca hoàn tất" || status === "Hoàn tất"
              ? "success"
              : "warning";
          return (
            <Tag color={color}>
              {isMobile ? status.slice(0, 8) + "..." : status}
            </Tag>
          );
        },
        sorter: (a, b) => {
          const priority = {
            "Chưa hoàn tất": 1,
            "Tăng ca": 2,
            "Hoàn tất": 3,
            "Tăng ca hoàn tất": 4,
            "Không tăng ca": 5,
          };
          return priority[a.trangThai] - priority[b.trangThai];
        },
        filters: [
          { text: "Chưa hoàn tất", value: "Chưa hoàn tất" },
          { text: "Tăng ca", value: "Tăng ca" },
          { text: "Hoàn tất", value: "Hoàn tất" },
          { text: "Tăng ca hoàn tất", value: "Tăng ca hoàn tất" },
          { text: "Không tăng ca", value: "Không tăng ca" },
        ],
        onFilter: (value, record) => record.trangThai === value,
      },
    ],
    [
      formatTime,
      isMobile,
      danhSachPhongBan,
      danhSachNhanVien,
      danhSachCaLamTrongTuan,
      danhSachCaLam,
      danhSachLichSuUuTien,
      danhSachDoiTuongUuTien,
      danhSachTangCa,
      isDataReady 
    ]
  );

  const mobileColumns = useMemo(
    () => [
      {
        title: "Thông tin",
        key: "info",
        render: (_, record) => (
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedNhanVien(record);
              setIsModalChiTietVisible(true);
            }}
          >
            {/* Ngày và tên */}
            <div style={{ fontWeight: 600, fontSize: "15px", color: "#333" }}>
              {dayjs(record.ngayChamCong).format("DD/MM/YYYY")} - {record.hoTen}
            </div>

            {/* Phòng ban */}
            <div style={{ fontSize: "13px", color: "#888", marginTop: 4 }}>
              {record.tenPhongBan}
            </div>

            {/* Giờ làm */}
            <div style={{ marginTop: 8 }}>
              <Space size={[12, 8]} wrap>
                <span style={{ fontSize: "13px" }}>
                  <strong>Vào:</strong> {formatTime(record.thoiGianVao)}
                </span>
                <span style={{ fontSize: "13px" }}>
                  <strong>Ra:</strong> {formatTime(record.thoiGianRa)}
                </span>
                <span style={{ fontSize: "13px" }}>
                  <strong>Giờ:</strong> {record.soGioThucTe}
                </span>
                <span style={{ fontSize: "13px" }}>
                  <strong>Công:</strong> {record.cong}
                </span>
              </Space>
            </div>
            {/* Giờ tăng ca */}
            <div style={{ marginTop: 8 }}>
              <div
                style={{ fontSize: "13px", fontWeight: 500, marginBottom: 4 }}
              >
                Giờ tăng ca
              </div>
              {getTimeTangCa(record.maNhanVien, record.ngayChamCong) ? ( 
                <Space size={[12, 8]} wrap>
                  <span style={{ fontSize: "13px" }}>
                    <strong>Khoảng thời gian:</strong>{" "}
                    {getTimeTangCa(record.maNhanVien, record.ngayChamCong)}
                  </span>
                </Space>
              ) : (
                <div style={{ fontSize: "13px", color: "#999" }}>
                  Không có tăng ca
                </div>
              )}
            </div>

            {/* Trạng thái */}
            <div style={{ marginTop: 10 }}>
              <Tag
                color={
                  record.trangThai === "Chưa hoàn tất" ||
                  record.trangThai === "Tăng ca"
                    ? "error"
                    : record.trangThai === "Tăng ca hoàn tất" ||
                      record.trangThai === "Hoàn tất"
                    ? "success"
                    : record.trangThai === "Không tăng ca"
                    ? "cyan"
                    : "warning"
                }
                style={{ fontSize: "12px" }}
              >
                {record.trangThai}
              </Tag>
            </div>
          </div>
        ),
        sorter: (a, b) =>
          dayjs(a.ngayChamCong).unix() - dayjs(b.ngayChamCong).unix(),
        filters: [
          { text: "Hoàn tất", value: "Hoàn tất" },
          { text: "Chưa hoàn tất", value: "Chưa hoàn tất" },
          { text: "Tăng ca", value: "Tăng ca" },
          { text: "Tăng ca hoàn tất", value: "Tăng ca hoàn tất" },
          { text: "Không tăng ca", value: "Không tăng ca" },
        ],
        onFilter: (value, record) => record.trangThai === value,
      },
    ],
    [
      formatTime,
      isMobile,
      danhSachPhongBan,
      danhSachNhanVien,
      danhSachCaLamTrongTuan,
      danhSachCaLam,
      danhSachLichSuUuTien,
      danhSachDoiTuongUuTien,
      danhSachTangCa,
    ]
  );

  const statistics = useMemo(() => {
    const today = dayjs().format("DD/MM/YYYY");

    const nhanVienTheoPhongBan =
      selectedPhongBan && selectedPhongBan.phongBanValue
        ? danhSachNhanVien.filter(
            (nv) => nv.tenPhongBan === selectedPhongBan.phongBanValue
          )
        : danhSachNhanVien;

    const chamCongTheoPhongBan =
      selectedPhongBan && selectedPhongBan.phongBanValue
        ? danhSachChamCongChiTiet.filter(
            (cc) => cc.tenPhongBan === selectedPhongBan.phongBanValue
          )
        : danhSachChamCongChiTiet;

    const totalRecords = chamCongTheoPhongBan.filter(
      (item) => dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today
    ).length;

    const workingNow = chamCongTheoPhongBan.filter(
      (item) =>
        dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today &&
        (item.trangThai === "Chưa hoàn tất" || item.trangThai === "Tăng ca")
    ).length;

    const completedToday = chamCongTheoPhongBan.filter(
      (item) =>
        dayjs(item.ngayChamCong).format("DD/MM/YYYY") === today &&
        ["Hoàn tất", "Tăng ca hoàn tất", "Không tăng ca"].includes(
          item.trangThai
        )
    ).length;

    const vangMatCount = nhanVienTheoPhongBan.filter(
      (nv) =>
        !chamCongTheoPhongBan.some(
          (cc) =>
            cc.maNhanVien === nv.maNhanVien &&
            dayjs(cc.ngayChamCong).format("DD/MM/YYYY") === today
        )
    ).length;

    const overtimeHoursByDepartment = {};
    const thangHienTai = (selectedMonth ?? dayjs()).month();
    const namHienTai = (selectedMonth ?? dayjs()).year();

    danhSachTangCa.forEach((tc) => {
      const ngayTangCa = dayjs(tc.ngayChamCongTangCa);
      const thang = ngayTangCa.month();
      const nam = ngayTangCa.year();

      if (thang === thangHienTai && nam === namHienTai) {
        const gioBatDau = dayjs(`2000-01-01 ${tc.gioTangCaBatDau}`);
        const gioKetThuc = dayjs(`2000-01-01 ${tc.gioTangCaKetThuc}`);

        if (gioBatDau.isValid() && gioKetThuc.isValid()) {
          const soPhutTangCa = gioKetThuc.diff(gioBatDau, "minute");
          const soGioTangCa = soPhutTangCa / 60;

          const phongBan = danhSachPhongBan.find(pb => pb.maPhongBan === tc.maPhongBan);
          if (phongBan) {
            if (!overtimeHoursByDepartment[phongBan.tenPhongBan]) {
              overtimeHoursByDepartment[phongBan.tenPhongBan] = 0;
            }
            overtimeHoursByDepartment[phongBan.tenPhongBan] += soGioTangCa;
          }
        }
      }
    });

    return {
      totalRecords,
      workingNow,
      completedToday,
      vangMatCount,
      overtimeHoursByDepartment,
    };
  }, [
    selectedPhongBan,
    selectedMonth,
    danhSachNhanVien,
    danhSachChamCongChiTiet,
    danhSachTangCa,
    danhSachPhongBan,
  ]);

  const handleDateRangeChange = useCallback((dates) => {
    setDateRange(dates);
    setSelectedMonth(null);
  }, []);

  const handleMonthChange = useCallback((month) => {
    setSelectedMonth(month);
    if (month) {
      const startOfMonth = month.startOf("month");
      const endOfMonth = month.endOf("month");
      setDateRange([startOfMonth, endOfMonth]);
    } else {
      setDateRange([null, null]);
    }
  }, []);

  const handleTodayClick = () => {
    const today = dayjs().startOf("day");

    if (
      dateRange &&
      dayjs(dateRange[0]).isSame(today, "day") &&
      dayjs(dateRange[1]).isSame(today, "day")
    ) {
      apiNotification.warning({ message: "Bạn đang trong ngày hôm nay rồi!!" });
      return;
    }

    setDateRange([today, today.endOf("day")]);
    setSelectedMonth(null);
  };

  const handlePageSizeChange = useCallback((current, size) => {
    setPageSize(size);
  }, []);

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "24px",
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <ClockCircleOutlined
            style={{
              fontSize: isMobile ? "20px" : "24px",
              marginRight: "8px",
            }}
          />
          <span
            style={{
              fontSize: isMobile ? "16px" : "24px",
              fontWeight: "bold",
            }}
          >
            {isMobile
              ? currentTime.format("DD/MM/YYYY HH:mm:ss")
              : currentTime.format("dddd, DD/MM/YYYY - HH:mm:ss")}
          </span>
        </div>
      </Card>

      {isMobile ? (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Card title="Chấm công" size="small" extra={<CalendarOutlined />}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Row gutter={[8, 8]}>
                {/* Removed Select for department filter */}
              </Row>

              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleShowModalThemTangCa}
                    size="large"
                    block
                  >
                    Tăng ca
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={handleShowModalTangCa}
                    size="large"
                    block
                  >
                    Xem ngày tăng ca
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>

          <Card
            title={`Thống kê hôm nay (${dayjs().format("DD/MM/YYYY")})`}
            size="small"
          >
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12}>
                <Card size="small">
                  <Statistic
                    title="Đang làm việc"
                    value={statistics.workingNow}
                    valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small">
                  <Statistic
                    title="Hoàn thành hôm nay"
                    value={statistics.completedToday}
                    valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small">
                  <Statistic
                    title="Nhân viên vắng"
                    value={statistics.vangMatCount}
                    valueStyle={{ color: "red", fontSize: "16px" }}
                  />
                </Card>
              </Col>
              <Col xs={24}> {/* Added for monthly overtime stat on mobile */}
                <Card size="small">
                  <Typography.Title level={5} style={{ marginBottom: '8px' }}>Giờ tăng ca tháng này</Typography.Title>
                  {Object.entries(statistics.overtimeHoursByDepartment).length > 0 ? (
                    Object.entries(statistics.overtimeHoursByDepartment).map(([departmentName, hours]) => (
                      <div key={departmentName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <Text strong>{departmentName}:</Text>
                        <Text style={{ color: "green", fontSize: "16px" }}>{hours.toFixed(2)}h</Text>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">Không có giờ tăng ca trong tháng này.</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </Card>
          {alert.visible && (
            <MyAlert
              type={alert.type}
              message={alert.message}
              description={alert.description}
              onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
            />
          )}

          <Card title="Lịch sử chấm công" size="small">
            <Space
              direction="vertical"
              style={{ width: "100%", marginBottom: "16px" }}
              size="middle"
            >
              <Text strong>Chọn khoảng thời gian:</Text> {/* Changed to Text for better styling */}
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                size="large"
              />
              <Button onClick={handleTodayClick} block size="large">Hôm nay</Button> {/* Added block for full width */}
              <Text strong>Chọn tháng:</Text> {/* Changed to Text for better styling */}
              <ConfigProvider locale={viVN}>
                <DatePicker
                  placeholder="Chọn tháng"
                  picker="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  format="MM/YYYY"
                  style={{ width: "100%" }}
                  size="large"
                />
              </ConfigProvider>
              <Input.Search
                placeholder="Tìm kiếm theo tên hoặc mã nhân viên"
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                style={{ width: "100%" }}
                size="large"
                allowClear
              />
            </Space>
            <Table
              rowClassName={addRowClass}
              columns={mobileColumns}
              dataSource={filteredData}
              rowKey={(record) => `${record.ngayChamCong}_${record.maNhanVien}`}
              pagination={{
                pageSize: pageSize,
                pageSizeOptions: ["8", "20", "50", "100"],
                size: "small",
                showSizeChanger: true,
                showQuickJumper: true,
                onShowSizeChange: handlePageSizeChange,
                showTotal: (total, range) => `${range[0]}-${range[1]}/${total}`,
              }}
              size="small"
              scroll={{ y: "calc(100vh - 300px)", sticky: true }}
              onChange={(pagination, filters) => {
                const pb = filters.tenPhongBan && filters.tenPhongBan.length > 0 ? filters.tenPhongBan[0] : null;
                setSelectedPhongBan({
                  selected: !!pb,
                  phongBanValue: pb,
                });
              }}
            />
          </Card>
        </Space>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f0f0f0",
              }}
              bodyStyle={{ padding: "24px" }}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  Chấm công
                </div>
              }
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {/* Header Section */}
                <div>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "16px",
                      display: "block",
                    }}
                  >
                    Quản lý thời gian làm việc
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    Chọn ngày tăng ca và theo dõi lịch làm việc của bạn
                  </Text>
                </div>

                {/* Alert Section */}
                {alert.visible && (
                  <MyAlert
                    type={alert.type}
                    message={alert.message}
                    description={alert.description}
                    onClose={() =>
                      setAlert((prev) => ({ ...prev, visible: false }))
                    }
                    style={{ marginBottom: "8px" }}
                  />
                )}

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Button
                      danger
                      icon={<LogoutOutlined />}
                      onClick={handleShowModalThemTangCa}
                      size="large"
                      style={{
                        width: "100%",
                        height: "50px",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      ghost
                    >
                      Đăng ký tăng ca
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={handleShowModalTangCa}
                      size="large"
                      style={{
                        width: "100%",
                        height: "50px",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background:
                          "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        border: "none",
                      }}
                    >
                      Xem lịch tăng ca
                    </Button>
                  </Col>
                </Row>

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography.Title level={5} style={{ marginBottom: '8px' }}>Giờ tăng ca tháng này theo phòng ban:</Typography.Title>
                  {Object.entries(statistics.overtimeHoursByDepartment).length > 0 ? (
                    Object.entries(statistics.overtimeHoursByDepartment).map(([departmentName, hours]) => (
                      <Row key={departmentName} gutter={[16, 8]} justify="center">
                        <Col span={24}>
                          <div style={{ textAlign: "center" }}>
                            <Statistic
                              title={departmentName}
                              value={hours.toFixed(2)}
                              valueStyle={{ color: "green", fontSize: "20px" }}
                            />
                          </div>
                        </Col>
                      </Row>
                    ))
                  ) : (
                    <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>Không có giờ tăng ca trong tháng này cho bất kỳ phòng ban nào.</Text>
                  )}
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card title={`Thống kê hôm nay (${dayjs().format("DD/MM/YYYY")})`}>
              <Row gutter={16}>
                <Col span={24} style={{ marginTop: "16px" }}>
                  <Statistic
                    title="Đang làm việc"
                    value={statistics.workingNow}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={24} style={{ marginTop: "16px" }}>
                  <Statistic
                    title="Hoàn thành hôm nay"
                    value={statistics.completedToday}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col span={24} style={{ marginTop: "16px" }}>
                  <Statistic
                    title="Nhân viên vắng trong ngày"
                    value={statistics.vangMatCount}
                    valueStyle={{ color: "red" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Lịch sử chấm công">
              <Space style={{ marginBottom: "16px" }} wrap> {/* Added wrap for better layout on smaller desktop screens */}
                <Text strong>Chọn khoảng thời gian:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
                <Button onClick={handleTodayClick}>Hôm nay</Button>
                <Text strong style={{ marginLeft: "16px" }}>Chọn tháng:</Text>
                <ConfigProvider locale={viVN}>
                  <DatePicker
                    placeholder="Chọn tháng"
                    picker="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    format="MM/YYYY"
                  />
                </ConfigProvider>
                <Input.Search
                  placeholder="Tìm kiếm theo mã nhân viên hoặc tên"
                  onSearch={handleSearch}
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                  style={{ width: "250px" }}
                  allowClear
                />
                  {/* Removed Select for department filter */}
              </Space>

              <Table
                rowClassName={addRowClass}
                columns={columns}
                dataSource={filteredData}
                rowKey={(record) =>
                  `${record.ngayChamCong}_${record.maNhanVien}`
                }
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["10", "20", "50", "100", "200"],
                  onShowSizeChange: handlePageSizeChange,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                scroll={{
                  x: "max-content",
                  y: "calc(100vh - 300px)",
                  sticky: true,
                }}
                onChange={(pagination, filters) => {
                  const pb = filters.tenPhongBan && filters.tenPhongBan.length > 0 ? filters.tenPhongBan[0] : null;
                  setSelectedPhongBan({
                    selected: !!pb,
                    phongBanValue: pb,
                  });
                }}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      setSelectedNhanVien(record);
                      setIsModalChiTietVisible(true);
                    },
                  };
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <ModalThemTangCa
        isVisible={isModalThemTangCaVisible}
        danhSachPhongBan={danhSachPhongBan}
        createTangCa={createTangCa}
        onCancel={() => setIsModalThemTangCaVisible(false)}
        getAllChamCongDetail={getAllChamCongDetail}
        getAllTangCa={getAllTangCa}
      />
      <ModalTangCa
        isVisible={isModalTangCaVisible}
        onCancel={onCancelModalTangCa}
        danhSachTangCa={danhSachTangCa}
        updateTangCa={updateTangCa}
        deleteTangCa={deleteTangCa}
        danhSachPhongBan={danhSachPhongBan}
        formInstance={form}
      />

      <ModalChiTietChamCong
        isVisible={isModalChiTietVisible}
        onCancel={() => {
          setIsModalChiTietVisible(false);
          setSelectedNhanVien(null);
        }}
        selectedNhanVien={selectedNhanVien}
        danhSachChamCongChiTiet={danhSachChamCongChiTiet}
      />
    </div>
  );
}