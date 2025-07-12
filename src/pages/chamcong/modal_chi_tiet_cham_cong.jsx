import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  DatePicker,
  Tag,
  Space,
  ConfigProvider,
  Row,
  Col,
  Typography,
  Card,
  Button,
  Checkbox,
} from "antd";
import { useNgayLe } from "../../component/hooks/useNgayLe";
import { useNghiPhep } from "../../component/hooks/useNghiPhep";
import { useNgayPhep } from "../../component/hooks/useNgayPhep";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";
import { CalendarOutlined, FileExcelOutlined } from "@ant-design/icons";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import isBetween from "dayjs/plugin/isBetween";
import duration from "dayjs/plugin/duration";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.locale("vi");

const { Text, Title } = Typography;
import { exportPersonalAttendanceExcel } from "./exportAttendance";

/**
 * @param {string} text
 * @returns {string}
 */
const formatTime = (text) => {
  if (!text) return "00:00:00";
  try {
    const d = dayjs(text);
    if (d.isValid()) {
      return d.format("HH:mm:ss");
    }
    const parts = String(text).split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${(
        parts[2] || "00"
      ).padStart(2, "0")}`;
    }
    return "";
  } catch (error) {
    console.error("Error formatting time:", text, error);
    return "";
  }
};

const checkIfHoliday = (date, danhSachNgayLe) => {
  if (!danhSachNgayLe || danhSachNgayLe.length === 0) return null;
  return (
    danhSachNgayLe.find((ngayLe) => {
      const ngayBatDau = dayjs(ngayLe.ngayBatDau).format("YYYY-MM-DD");
      const ngayKetThuc = dayjs(ngayLe.ngayKetThuc).format("YYYY-MM-DD");
      return date.isBetween(ngayBatDau, ngayKetThuc, "day", "[]");
    }) || null
  );
};

const checkIfLeaveDay = (date, danhSachNghiPhep, maNhanVien) => {
  if (!danhSachNghiPhep || danhSachNghiPhep.length === 0 || !maNhanVien)
    return null;
  return (
    danhSachNghiPhep.find((nghiPhep) => {
      if (nghiPhep.maNhanVien !== maNhanVien) return false;
      const ngayBatDau = dayjs(nghiPhep.ngayBatDau, "DD/MM/YYYY HH:mm:ss");
      const ngayKetThuc = dayjs(nghiPhep.ngayKetThuc, "DD/MM/YYYY HH:mm:ss");

      return date.isBetween(ngayBatDau, ngayKetThuc, "day", "[]");
    }) || null
  );
};

/**
 * @param {dayjs.Dayjs} selectedMonth
 * @param {Array<Object>} danhSachChamCongChiTiet
 * @param {string} maNhanVien
 * @returns {Array<Object>}
 */
const processAttendanceDataForCalendar = (
  selectedMonth,
  danhSachChamCongChiTiet,
  maNhanVien,
  danhSachNgayLe,
  danhSachNghiPhep
) => {
  if (!selectedMonth || !selectedMonth.isValid()) {
    return [];
  }

  const startOfMonth = selectedMonth.startOf("month");
  const endOfMonth = selectedMonth.endOf("month");
  const daysInMonth = selectedMonth.daysInMonth();

  const processedData = {};

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDay = startOfMonth.date(i);
    const holidayInfo = checkIfHoliday(currentDay, danhSachNgayLe);
    const leaveInfo = checkIfLeaveDay(currentDay, danhSachNghiPhep, maNhanVien);

    processedData[currentDay.format("YYYY-MM-DD")] = {
      date: currentDay,
      dayOfMonth: i,
      dayOfWeek: currentDay.weekday(),
      chamCong: null,
      isWeekend: currentDay.day() === 0,
      isHoliday: !!holidayInfo,
      holidayInfo: holidayInfo,
      isLeave: leaveInfo,
      isAbsent: false,
      isHalfDayAbsent: false,
      isOvertimeDay: false,
    };
  }

  danhSachChamCongChiTiet.forEach((item) => {
    if (item.maNhanVien === maNhanVien) {
      const itemDate = dayjs(item.ngayChamCong);
      if (itemDate.isBetween(startOfMonth, endOfMonth, "day", "[]")) {
        const dateKey = itemDate.format("YYYY-MM-DD");
        if (processedData[dateKey]) {
          processedData[dateKey].chamCong = item;
          if (
            item.trangThai === "Tăng ca" ||
            item.trangThai === "Tăng ca hoàn tất"
          ) {
            processedData[dateKey].isOvertimeDay = true;
          }
          if (
            item.trangThai === "Chưa hoàn tất" &&
            !item.thoiGianVao &&
            !item.thoiGianRa
          ) {
            processedData[dateKey].isAbsent = true;
          } else if (
            item.cong !== undefined &&
            item.cong !== null &&
            item.cong < 1 &&
            item.cong > 0
          ) {
            if (item.cong === 0.5) {
              processedData[dateKey].isHalfDayAbsent = true;
            }
          }
        }
      }
    }
  });

  return Object.values(processedData);
};

export default function ModalChiTietChamCong({
  isVisible,
  onCancel,
  selectedNhanVien,
  danhSachChamCongChiTiet,
}) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const { danhSachNgayLe, loading: loadingNgayLe } = useNgayLe();
  const { danhSachNghiPhep, loading: loadingNghiPhep } = useNghiPhep();
  const { danhSachNgayPhep, thongTinTienQuyDoiPhep, getTienQuyDoiNgayPhep } =
    useNgayPhep();

  // Theo dõi trạng thái loading tổng quát
  const isLoading = loadingNgayLe || loadingNghiPhep;

  //mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    try {
      const body = {
        nam: dayjs(selectedMonth).year(),
        thang: dayjs(selectedMonth).month() + 1,
      };
      getTienQuyDoiNgayPhep(selectedNhanVien.maNhanVien, body);
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576); // hoặc 768 tùy breakpoint bạn chọn
    };

    handleResize(); // Gọi lần đầu
    window.addEventListener("resize", handleResize); // Theo dõi resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  const processedCalendarData = useMemo(() => {
    if (!selectedNhanVien || !danhSachChamCongChiTiet || isLoading) {
      return [];
    }
    return processAttendanceDataForCalendar(
      selectedMonth,
      danhSachChamCongChiTiet,
      selectedNhanVien.maNhanVien,
      danhSachNgayLe,
      danhSachNghiPhep
    );
  }, [
    selectedNhanVien,
    danhSachChamCongChiTiet,
    selectedMonth,
    danhSachNgayLe,
    danhSachNghiPhep,
    isLoading,
  ]);

  const dataSourceNgayPhep = useMemo(() => {
    if (
      !selectedNhanVien ||
      !danhSachNgayPhep ||
      danhSachNgayPhep.length === 0
    ) {
      return null;
    }
    const ngayPhepNhanVien = danhSachNgayPhep.find(
      (np) =>
        np.maNhanVien === selectedNhanVien.maNhanVien &&
        np.nam === dayjs(selectedMonth).year()
    );
    return ngayPhepNhanVien
      ? {
          maNgayPhep: ngayPhepNhanVien.maNgayPhep,
          ngayPhepDaSuDung: ngayPhepNhanVien.ngayPhepDaSuDung || 0,
          ngayPhepConLai: ngayPhepNhanVien.ngayPhepConLai || 0,
          ngayPhepTichLuy: ngayPhepNhanVien.ngayPhepTichLuy || 0,
        }
      : null;
  }, [danhSachNgayPhep, selectedNhanVien, selectedMonth]);

  const attendanceStatistics = useMemo(() => {
    let totalOvertimeDays = 0;
    let totalLeaveDays = 0;
    let totalHolidayDays = 0;

    // Calculate total work days and hours, excluding leave days, for the selected employee
    const { totalWorkDays, totalActualWorkHours } =
      processedCalendarData.reduce(
        (acc, day) => {
          // Only process days in the selected month for the selected employee
          const isSameMonth = day.date.month() === selectedMonth.month();
          const isSelectedEmployee =
            selectedNhanVien?.maNhanVien === day.chamCong?.maNhanVien;

          if (
            isSameMonth &&
            !day.isLeave &&
            day.chamCong &&
            isSelectedEmployee
          ) {
            acc.totalWorkDays += 1;
            acc.totalActualWorkHours += day.chamCong.soGioThucTe || 0;
            acc.danhSachChamCongChiTietFilter.push(day.chamCong);
          }
          return acc;
        },
        {
          totalWorkDays: 0,
          totalActualWorkHours: 0,
          danhSachChamCongChiTietFilter: [],
        }
      );

    processedCalendarData.forEach((day) => {
      if (day.isOvertimeDay) {
        totalOvertimeDays += 1;
      }
      if (day.isLeave) {
        totalLeaveDays += 1;
      }
      if (day.isHoliday) {
        totalHolidayDays += 1;
      }
    });

    const formattedTotalHours = `${Math.round(totalActualWorkHours)} h`;

    const ngayPhepDaSuDung = dataSourceNgayPhep?.ngayPhepDaSuDung || 0;
    const ngayPhepConLai = dataSourceNgayPhep?.ngayPhepConLai || 0;
    const ngayPhepTichLuy = dataSourceNgayPhep?.ngayPhepTichLuy || 0;

    return {
      totalWorkDays: totalWorkDays,
      totalActualWorkHours: formattedTotalHours,
      totalOvertimeDays,
      totalLeaveDays,
      totalHolidayDays,
      annualLeaveQuota: ngayPhepDaSuDung + ngayPhepConLai,
      leaveTaken: ngayPhepDaSuDung,
      leaveRemaining: ngayPhepConLai,
      leaveAccumulated: ngayPhepTichLuy,
    };
  }, [
    processedCalendarData,
    dataSourceNgayPhep?.ngayPhepDaSuDung,
    dataSourceNgayPhep?.ngayPhepConLai,
    dataSourceNgayPhep?.ngayPhepTichLuy,
    selectedMonth,
    selectedNhanVien?.maNhanVien,
  ]);

  useEffect(() => {
    if (selectedNhanVien) {
      setSelectedMonth(dayjs());
    }
  }, [selectedNhanVien]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleExport = useCallback(() => {
    exportPersonalAttendanceExcel(
      selectedNhanVien,
      selectedMonth,
      processedCalendarData,
      attendanceStatistics
    );
  }, [
    selectedNhanVien,
    selectedMonth,
    processedCalendarData,
    attendanceStatistics,
  ]);

  const renderDayCell = useCallback((dayData) => {
    const {
      date,
      dayOfMonth,
      chamCong,
      isWeekend,
      isHoliday,
      isLeave,
      isAbsent,
      isHalfDayAbsent,
      isOvertimeDay,
      holidayInfo,
    } = dayData;

    let backgroundColor = "#fff";
    let textColor = "#333";
    let dayNumberColor = "inherit";
    const isForgetCheckOut = chamCong && chamCong.trangThai === "Chưa hoàn tất";

    if (isHoliday) {
      backgroundColor = "#fde68a";
      textColor = "#b45309";
      dayNumberColor = "#b45309";
    } else if (isAbsent) {
      backgroundColor = "#fef2f2";
      textColor = "#ef4444";
      dayNumberColor = "#ef4444";
    } else if (isForgetCheckOut) {
      backgroundColor = "#fee2e2";
      textColor = "#dc2626";
      dayNumberColor = "#dc2626";
    } else if (isLeave) {
      backgroundColor = "#bfdbfe";
      textColor = "#2563eb";
      dayNumberColor = "#2563eb";
    } else if (
      chamCong &&
      (chamCong.trangThai === "Hoàn tất" ||
        chamCong.trangThai === "Không tăng ca")
    ) {
      backgroundColor = "#dcfce7";
      textColor = "#16a34a";
      dayNumberColor = "#16a34a";
    } else if (isOvertimeDay) {
      if (chamCong?.trangThai === "Tăng ca hoàn tất") {
        backgroundColor = "#e0f2f1";
        textColor = "#00796b";
        dayNumberColor = "#00796b";
      } else {
        backgroundColor = "#fee2e2";
        textColor = "#dc2626";
        dayNumberColor = "#dc2626";
      }
    } else if (
      chamCong?.cong !== undefined &&
      chamCong.cong < 1 &&
      chamCong.cong > 0
    ) {
      backgroundColor = "#f0f2f5";
      textColor = "#555";
    } else if (isWeekend) {
      backgroundColor = "#f0f0f0";
      dayNumberColor = "red";
    }

    let dayCellClass = "day-cell";

    const gioVao = chamCong?.thoiGianVao
      ? formatTime(chamCong.thoiGianVao).substring(0, 5)
      : "-";
    const gioRa = chamCong?.thoiGianRa
      ? formatTime(chamCong.thoiGianRa).substring(0, 5)
      : "-";
    const cong =
      chamCong?.cong !== undefined && chamCong?.cong !== null
        ? chamCong.cong.toFixed(2)
        : "-";

    return (
      <Col
        key={date.format("YYYY-MM-DD")}
        className={dayCellClass}
        span={24 / 7}
        style={{
          border: "1px solid #e0e0e0",
          padding: "8px",
          textAlign: "center",
          backgroundColor: backgroundColor,
          color: textColor,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "100px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "15px",
            color: dayNumberColor,
          }}
        >
          {dayOfMonth}
        </div>
        <div style={{ fontSize: "11px", lineHeight: "1.2" }}>
          {chamCong ? (
            isMobile ? (
              <div>Đã chấm công</div>
            ) : (
              <>
                <div>Vào: {gioVao}</div>
                <div>Ra: {gioRa}</div>
                <div>{cong} công</div>
              </>
            )
          ) : (
            <>
              {!(
                isAbsent ||
                isHalfDayAbsent ||
                isWeekend ||
                isHoliday ||
                isLeave ||
                isOvertimeDay
              ) && <div>-</div>}
              {!(isAbsent || isHalfDayAbsent) && <div>-</div>}
              {!(isAbsent || isHalfDayAbsent) && <div>-</div>}
              {!(isAbsent || isHalfDayAbsent) && (
                <div>
                  {isWeekend
                    ? "Nghỉ"
                    : isHoliday
                    ? "Lễ"
                    : isLeave
                    ? "Nghỉ"
                    : "-"}
                </div>
              )}
              {isHoliday && holidayInfo && (
                <div style={{ color: "#b45309" }}>{holidayInfo.tenNgayLe}</div>
              )}
            </>
          )}
        </div>
      </Col>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekDays = useMemo(() => {
    return [
      { name: "T2", color: "#000" },
      { name: "T3", color: "#000" },
      { name: "T4", color: "#000" },
      { name: "T5", color: "#000" },
      { name: "T6", color: "#000" },
      { name: "T7", color: "#000" },
      { name: "CN", color: "red" },
    ];
  }, []);

  const firstDay = selectedMonth.startOf("month").day();
  const dbDay = firstDay === 0 ? 1 : firstDay + 1;
  const startOffset = dbDay === 1 ? 6 : dbDay - 2;
  const emptyCells = Array.from({ length: startOffset }, (_, i) => (
    <Col
      key={`empty-${i}`}
      className="day-cell-empty"
      span={Math.floor(24 / 7)}
    ></Col>
  ));

  const calendarCells = [
    ...emptyCells.map((cell, index) => ({
      type: "empty",
      key: `empty-${index}`,
    })),
    ...processedCalendarData.map((day, index) => ({
      type: "day",
      data: day,
      key: `day-${index}`,
    })),
  ];

  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        Đang tải dữ liệu...
      </div>
    );

  return (
    <Modal
      title={
        selectedNhanVien
          ? `Lịch chấm công của ${selectedNhanVien.hoTen} (${selectedNhanVien.maNhanVien})`
          : "Lịch chấm công chi tiết"
      }
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      styles={{ body: { padding: 0 } }}
    >
      <ConfigProvider locale={viVN}>
        <div style={{ padding: "0 0 24px 0" }}>
          <Row
            gutter={[8, 8]}
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16, padding: "0 24px" }}
          >
            <Col xs={24} sm={6}>
              <DatePicker
                picker="month"
                placeholder="Chọn tháng"
                onChange={handleMonthChange}
                value={selectedMonth}
                format="MM/YYYY"
                style={{ width: "100%" }}
                allowClear={false}
              />
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExport}
                disabled={!selectedNhanVien || !processedCalendarData.length}
              >
                Xuất Excel
              </Button>
            </Col>
          </Row>

          <Row gutter={[16, 0]} style={{ padding: "0 24px" }} wrap>
            <Col xs={24} md={16} style={{ marginBottom: 16 }}>
              <Card
                size="small"
                style={{
                  marginBottom: 20,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 16px",
                  }}
                >
                  {[
                    {
                      text: "Hoàn tất",
                      color: "#dcfce7",
                      textColor: "#16a34a",
                      borderColor: "#bbf7d0",
                    },
                    {
                      text: "Ngày tăng ca",
                      color: "#e0f2f1",
                      textColor: "#00796b",
                      borderColor: "#00796b",
                    },
                    {
                      text: "Nghỉ lễ",
                      color: "#fde68a",
                      textColor: "#b45309",
                      borderColor: "#fcd34d",
                    },
                    {
                      text: "Xin nghỉ",
                      color: "#bfdbfe",
                      textColor: "#2563eb",
                      borderColor: "#93c5fd",
                    },
                    {
                      text: "Chưa hoàn tất",
                      color: "#fef2f2",
                      textColor: "#ef4444",
                      borderColor: "#fecaca",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        width: "calc(50% - 8px)",
                        minWidth: 120,
                      }}
                    >
                      <Tag
                        color={item.color}
                        style={{
                          color: item.textColor,
                          borderColor: item.borderColor,
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        {item.text}
                      </Tag>
                    </div>
                  ))}
                </div>
              </Card>

              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Row
                  justify="start"
                  style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                >
                  {weekDays.map((day) => (
                    <Col
                      key={day.name}
                      style={{
                        textAlign: "center",
                        color: day.color,
                        width: "14.28%",
                      }}
                    >
                      {day.name}
                    </Col>
                  ))}
                </Row>
                {weeks.map((week, weekIndex) => (
                  <Row
                    key={weekIndex}
                    gutter={[0, 0]}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  >
                    {week.map((cell) =>
                      cell.type === "empty" ? (
                        <Col
                          key={cell.key}
                          style={{
                            width: "14.28%",
                            minWidth: "45px",
                            height: "100px",
                            minHeigh: "100px",
                            padding: 0,
                          }}
                          className="day-cell-empty"
                        />
                      ) : (
                        <Col
                          key={cell.key}
                          style={{
                            width: "14.28%",
                            minWidth: "45px",
                            height: "100px",
                            minHeigh: "100px",
                            padding: 0,
                          }}
                          className="day-cell"
                        >
                          {renderDayCell(cell.data)}
                        </Col>
                      )
                    )}
                  </Row>
                ))}
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Card
                title={
                  <Space size={8}>
                    <Title
                      level={5}
                      style={{
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <CalendarOutlined style={{ color: "#1890ff" }} /> Thống kê
                      tháng {selectedMonth.format("MM/YYYY")}
                    </Title>
                  </Space>
                }
                size="small"
                style={{
                  marginBottom: 16,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Tổng số công:</Text>
                      <Text>{attendanceStatistics.totalWorkDays}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Tổng giờ làm thực tế:</Text>
                      <Text>{attendanceStatistics.totalActualWorkHours}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số ngày tăng ca:</Text>
                      <Text>{attendanceStatistics.totalOvertimeDays}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số ngày nghỉ lễ/phép:</Text>
                      <Text>
                        {attendanceStatistics.totalHolidayDays +
                          attendanceStatistics.totalLeaveDays}
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Space size={8}>
                    <Title
                      level={5}
                      style={{
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <CalendarOutlined style={{ color: "#1890ff" }} /> Tổng kết
                      nghỉ phép năm {dayjs(selectedMonth).year()}
                    </Title>
                  </Space>
                }
                size="small"
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số ngày phép cả năm:</Text>
                      <Text>{attendanceStatistics.annualLeaveQuota}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số ngày phép đã nghỉ:</Text>
                      <Text>{attendanceStatistics.leaveTaken}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số ngày phép còn lại:</Text>
                      <Text>{attendanceStatistics.leaveRemaining}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số ngày phép tích lũy:</Text>
                      <Text>{attendanceStatistics.leaveAccumulated}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong>Số tiền quy đổi:</Text>
                      <Text>{Intl.NumberFormat("vi-VN").format(Number(thongTinTienQuyDoiPhep?.soTienQuyDoi ?? 0)) } VNĐ</Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
      <style>{`
      .day-cell {
        box-sizing: border-box;
      }
      .day-cell-empty {
        box-sizing: border-box;
        background-color: #f9f9f9;
        border: 1px solid #f0f0f0;
        min-height: 100px;
      }
      .current-day {
        border: 2px solid #6100b3 !important;
      }
`}</style>
    </Modal>
  );
}
