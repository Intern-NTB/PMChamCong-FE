/* eslint-disable no-unused-vars */
// ===== Thư viện bên ngoài =====
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
  notification,
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
  const [selectedMonth, setSelectedMonth] = useState(null);
  const apiNotification = useAppNotification();

  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    selected: false,
    dateValue: null,
  });
  const [searchText, setSearchText] = useState("");
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

    const [gio, phut, giay] = gioStr.split(":");
    return phut === "00" ? `${gio}h` : `${gio}h${phut}`;
  };

  //Hàm xử lý lấy thông tin ca làm, giờ làm việc theo ngày.
  const getThongTinCaTrongNgay = (maNhanVien, ngayChamCong) => {
    const nhanVien = danhSachNhanVien.find(nv => nv.maNhanVien === maNhanVien);
    if (!nhanVien) return null;

    const phongBan = danhSachPhongBan.find(pb => pb.maPhongBan === nhanVien.maPhongBan);
    if (!phongBan) return null;

    const caLam = danhSachCaLam.find(ca => ca.maCa === phongBan.maCa);
    if (!caLam) return null;

    const jsDay = dayjs(ngayChamCong).day(); // 0 (Chủ nhật) – 6
    const ngayChuan = jsDay === 0 ? 1 : jsDay + 1;

    const caTrongTuan = danhSachCaLamTrongTuan.find(
      item => item.maCa === caLam.maCa && item.ngayTrongTuan === ngayChuan
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
        Thứ {caTrongTuan.ngayTrongTuan} <br />
        ({formatGio(caTrongTuan.gioBatDau)} - {formatGio(caTrongTuan.gioKetThuc)})
      </div>
    );
  };

  //Hàm xử lý lấy thời gian của ưu tiên.
  const getUuTien = (maNhanVien, ngayChamCong) => {
    const thongTin = getThongTinCaTrongNgay(maNhanVien, ngayChamCong);
    if (!thongTin) return "Không có ca trong ngày";

    const { nhanVien, caTrongTuan } = thongTin;

    const lichSuUuTien = danhSachLichSuUuTien.find(lsut => lsut.maNhanVien === nhanVien.maNhanVien);
    if (!lichSuUuTien) return null;

    const uuTien = danhSachDoiTuongUuTien.find(ut => ut.maUuTien === lichSuUuTien.maUuTien);
    if (!uuTien) return null;

    const gioBatDauCa = dayjs(`1970-01-01T${caTrongTuan.gioBatDau}`);
    const gioKetThucCa = dayjs(`1970-01-01T${caTrongTuan.gioKetThuc}`);

    const [h1, m1, s1] = uuTien.thoiGianBatDauCa.split(":").map(Number);
    const [h2, m2, s2] = uuTien.thoiGianKetThucCa.split(":").map(Number);

    const phutUuTienBatDau = h1 * 60 + m1 + Math.floor(s1 / 60);
    const phutUuTienKetThuc = h2 * 60 + m2 + Math.floor(s2 / 60);

    const gioUuTienBatDau = gioBatDauCa.add(phutUuTienBatDau, "minute");
    const gioUuTienKetThuc = gioKetThucCa.subtract(phutUuTienKetThuc, "minute");

    return (
      <div>
        {uuTien.tenUuTien} <br />
        ({gioUuTienBatDau.format("HH:mm")} - {gioUuTienKetThuc.format("HH:mm")})
      </div>
    );
  };

  //Hàm xử lý lấy thời gian tăng ca (vào/ra)
  const getTimeTangCa = (maNhanVien, ngayChamCong) => {
    const thongTin = getThongTinCaTrongNgay(maNhanVien, ngayChamCong);
    if(!thongTin) return "Không tìm thấy nhân viên";

    const {phongBan} = thongTin;

    const chamCong = danhSachChamCongChiTiet.find(cc =>
      cc.maNhanVien === maNhanVien &&
      dayjs(cc.ngayChamCong).isSame(dayjs(ngayChamCong), 'day')
    );
    if (!chamCong) return "Không có dữ liệu chấm công";

    const tangCa = danhSachTangCa.find(tc =>
      tc.maPhongBan === phongBan.maPhongBan &&
      dayjs(tc.ngayChamCongTangCa).isSame(dayjs(ngayChamCong), 'day')
    );
    if (!tangCa) return "Không có tăng ca";

    return `(${formatGio(tangCa.gioTangCaBatDau)} - ${formatGio(tangCa.gioTangCaKetThuc)})`;
  }

  const isDataReady = [
    danhSachNhanVien,
    danhSachPhongBan,
    danhSachCaLam,
    danhSachCaLamTrongTuan
  ].every(ds => Array.isArray(ds) && ds.length > 0);

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
          const ca = getCaLamViecTrongTuan(record.maNhanVien, record.ngayChamCong);
          return ca || "Không có";
        }
      },
      {
        title: "Ưu tiên",
        render(_, record) {
          const uutien = getUuTien(record.maNhanVien);
          return uutien || "-";
        }
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
        render(_, record){
          const tc = getTimeTangCa(record.maNhanVien, record.ngayChamCong);
          return tc || "Không tìm thấy";
        }
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
    [formatTime, isMobile, danhSachPhongBan, danhSachNhanVien, danhSachCaLamTrongTuan, 
      danhSachCaLam, danhSachLichSuUuTien, danhSachDoiTuongUuTien, danhSachTangCa]
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
              <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: 4 }}>
                Giờ tăng ca
              </div>
              {getTimeTangCa(record.maNhanVien, record.ngayChamCong) ? (
                <Space size={[12, 8]} wrap>
                  <span style={{ fontSize: "13px" }}>
                    <strong>Khoảng thời gian:</strong> {formatTime(getTimeTangCa(record.maNhanVien, record.ngayChamCong))}
                  </span>
                </Space>
              ) : (
                <div style={{ fontSize: "13px", color: "#999" }}>Không có tăng ca</div>
              )}
            </div>

            {/* Trạng thái */}
            <div style={{ marginTop: 10 }}>
              <Tag
                color={
                  record.trangThai === "Chưa hoàn tất" || record.trangThai === "Tăng ca"
                    ? "error"
                    : record.trangThai === "Tăng ca hoàn tất" || record.trangThai === "Hoàn tất"
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
    [formatTime, isMobile, danhSachPhongBan, danhSachNhanVien, danhSachCaLamTrongTuan, 
      danhSachCaLam, danhSachLichSuUuTien, danhSachDoiTuongUuTien, danhSachTangCa ]
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

    const tongSoGioTangCaThang = danhSachTangCa.reduce((total, tc) => {
      const ngayTangCa = dayjs(tc.ngayChamCongTangCa);
      const thang = ngayTangCa.month();
      const nam = ngayTangCa.year();

      const thangHienTai = (selectedMonth ?? dayjs()).month();
      const namHienTai = (selectedMonth ?? dayjs()).year();

      if (thang === thangHienTai && nam === namHienTai) {
        const gioBatDau = dayjs(tc.gioTangCaBatDau, "HH:mm");
        const gioKetThuc = dayjs(tc.gioTangCaKetThuc, "HH:mm");

        const soPhutTangCa = gioKetThuc.diff(gioBatDau, "minute");
        return total + (soPhutTangCa / 60 || 0);
      }

      return total;
    }, 0);

    return {
      totalRecords,
      workingNow,
      completedToday,
      vangMatCount,
      tongSoGioTangCaThang,
    };
  }, [
    selectedPhongBan,
    selectedMonth,
    danhSachNhanVien,
    danhSachChamCongChiTiet,
    danhSachTangCa,
  ]);

  const handleDateChange = useCallback((value) => {
    setSelectedDate({
      selected: true,
      dateValue: value,
    });
  }, []);

  const handlePhongBanChange = useCallback((value) => {
    setSelectedPhongBan({
      selected: true,
      phongBanValue: value,
    });
  }, []);

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
      apiNotification.warning({message: "Bạn đang trong ngày hôm nay rồi!!"});
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
                <Col span={12}>
                  <Select
                    placeholder="Chọn phòng ban"
                    style={{ width: "100%" }}
                    onChange={handlePhongBanChange}
                    getPopupContainer={() => document.body}
                    options={danhSachPhongBan.map((pb) => ({
                      value: pb.tenPhongBan,
                      label: pb.tenPhongBan,
                    }))}
                  />
                </Col>
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
            >
              <span>Chọn khoảng thời gian:</span>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                style={{ width: "100%", marginBottom: "8px" }}
                size="large"
              />
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
                const pb = filters.tenPhongBan?.[0];
                setSelectedPhongBan({
                  selected: true,
                  phongBanValue: pb.tenPhongBan || null,
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
                boxShadow: "0 4px 12px rgba",
                border: "1px solid #f0f0f0",
              }}
              styles={{ body: { padding: "24px" } }}
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
                  <Row gutter={[16, 8]} justify={"center"}>
                    <Col span={12}>
                      <div style={{ textAlign: "center" }}>
                        <Statistic
                          title="Giờ tăng ca tháng này"
                          value={statistics.tongSoGioTangCaThang.toFixed(2)}
                          valueStyle={{ color: "green", fontSize: "24px" }}
                        />
                      </div>
                    </Col>
                  </Row>
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
              <Space style={{ marginBottom: "16px" }}>
                <span>Chọn khoảng thời gian:</span>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
                <Button onClick={handleTodayClick}>Hôm nay</Button>
                <span style={{ marginLeft: "16px" }}>Chọn tháng:</span>
                <ConfigProvider locale={viVN}>
                  {" "}
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
              </Space>

              <Table
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
                scroll={{x: 'max-content', y: "calc(100vh - 300px)", sticky: true }}
                onChange={(pagination, filters) => {
                  const pb = filters.tenPhongBan?.[0];
                  setSelectedPhongBan({
                    selected: true,
                    phongBanValue: pb || null,
                  });
                }}
                onRow={(record, rowIndex) => {
                  return {
                    onClick: (event) => {
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
