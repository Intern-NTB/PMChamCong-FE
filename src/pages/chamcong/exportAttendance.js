import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

/**
 * @param {string} text
 * @returns {string}
 */
const formatTimeForExcel = (text) => {
  if (!text) return "00:00";
  try {
    const d = dayjs(text);
    if (d.isValid()) {
      return d.format("HH:mm");
    }
    const parts = String(text).split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return "00:00";
  } catch (error) {
    console.error("Error formatting time for Excel:", text, error);
    return "00:00";
  }
};

/**
 * @param {Object} selectedNhanVien
 * @param {dayjs.Dayjs} selectedMonth
 * @param {Array<Object>} processedCalendarData
 * @param {Object} attendanceStatistics
 */
export const exportPersonalAttendanceExcel = async (
  selectedNhanVien,
  selectedMonth,
  processedCalendarData,
  attendanceStatistics
) => {
  if (
    !selectedNhanVien ||
    !processedCalendarData ||
    processedCalendarData.length === 0
  ) {
    console.warn("Không có dữ liệu hoặc nhân viên được chọn để xuất Excel.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    `BangCong_${selectedMonth.format("MM_YYYY")}`
  );

  // Set column widths
  worksheet.columns = [
    { width: 12 }, // Ngày
    { width: 12 }, // Thứ
    { width: 10 }, // Giờ Vào
    { width: 10 }, // Giờ Ra
    { width: 15 }, // Tổng Giờ Làm
    { width: 10 }, // Số Công
    { width: 18 }, // Trạng Thái
    { width: 25 }, // Ghi Chú
  ];

  let currentRow = 1;

  // Header section
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = "BẢNG CÔNG CHI TIẾT NHÂN VIÊN";
  titleCell.font = {
    name: "Times New Roman",
    size: 16,
    bold: true,
    color: { argb: "FF1F4E79" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  worksheet.getRow(currentRow).height = 25;
  currentRow++;

  // Employee info
  const empInfoCell = worksheet.getCell(currentRow, 1);
  empInfoCell.value = `Nhân viên: ${selectedNhanVien.hoTen} (${selectedNhanVien.maNhanVien})`;
  empInfoCell.font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
    color: { argb: "FF1F4E79" },
  };
  empInfoCell.alignment = { horizontal: "center", vertical: "middle" };
  empInfoCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  worksheet.getRow(currentRow).height = 20;
  currentRow++;

  // Month info
  const monthInfoCell = worksheet.getCell(currentRow, 1);
  monthInfoCell.value = `Tháng: ${selectedMonth.format("MM/YYYY")}`;
  monthInfoCell.font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
    color: { argb: "FF1F4E79" },
  };
  monthInfoCell.alignment = { horizontal: "center", vertical: "middle" };
  monthInfoCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  worksheet.getRow(currentRow).height = 20;
  currentRow++;

  // Empty row
  currentRow++;

  // Column headers
  const headers = [
    "Ngày",
    "Thứ",
    "Giờ Vào",
    "Giờ Ra",
    "Tổng Giờ Làm",
    "Số Công",
    "Trạng Thái",
    "Ghi Chú",
  ];

  const headerRow = worksheet.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });
  headerRow.height = 30;
  currentRow++;

  // Data rows
  // Data rows
  processedCalendarData.forEach((day, dayIndex) => {
    const dateStr = day.date.format("DD/MM/YYYY");
    const dayOfWeekStr = day.date.format("dddd");

    let gioVao = "-";
    let gioRa = "-";
    let totalHours = "-";
    let cong = "0.00";
    let trangThai = "Không có dữ liệu";
    let ghiChu = "";

    // Xác định loại ngày để định dạng màu sắc
    let dayType = "normal";
    const dayOfWeek = day.date.day(); // 0 = Chủ nhật, 6 = Thứ bảy
    const isSunday = dayOfWeek === 0; // Chỉ Chủ nhật là ngày nghỉ mặc định

    if (day.chamCong) {
      gioVao = day.chamCong.thoiGianVao
        ? formatTimeForExcel(day.chamCong.thoiGianVao)
        : "-";
      gioRa = day.chamCong.thoiGianRa
        ? formatTimeForExcel(day.chamCong.thoiGianRa)
        : "-";
      // Sử dụng soGioThucTe từ database cho Tổng Giờ Làm
      totalHours =
        day.chamCong.soGioThucTe !== undefined &&
        day.chamCong.soGioThucTe !== null
          ? `${day.chamCong.soGioThucTe.toFixed(2)}h`
          : "-";
      cong =
        day.chamCong.cong !== undefined && day.chamCong.cong !== null
          ? day.chamCong.cong.toFixed(2)
          : "0.00";
      trangThai = day.chamCong.trangThai || "Không rõ";

      // Xác định loại ngày dựa trên trạng thái
      if (
        trangThai.toLowerCase().includes("hoàn tất") ||
        trangThai.toLowerCase().includes("không tăng ca")
      ) {
        dayType = "complete";
      } else if (
        trangThai.toLowerCase().includes("chưa hoàn tất")
      ) {
        dayType = "incomplete";
      }
    } else {
      // Xác định loại ngày khi không có dữ liệu chấm công
      if (day.isLeave) {
        trangThai = "Nghỉ phép";
        ghiChu = "Nghỉ phép";
        dayType = "leave";
      } else if (day.isHoliday) {
        trangThai = "Nghỉ lễ";
        ghiChu = day.holidayInfo?.tenNgayLe || "Nghỉ lễ";
        dayType = "holiday";
      } else if (isSunday) {
        // Chỉ Chủ nhật là ngày nghỉ mặc định
        trangThai = "Nghỉ";
        ghiChu = "Nghỉ Chủ nhật";
        dayType = "weekend";
      } else {
        trangThai = "Không chấm công";
        ghiChu = "Chưa có dữ liệu chấm công";
        dayType = "absent";
      }
      cong = "0.00";
    }

    // Nếu là Chủ nhật và chưa được phân loại
    if (isSunday && dayType === "normal") {
      dayType = "weekend";
    }

    const row = worksheet.getRow(currentRow);
    const rowData = [
      dateStr,
      dayOfWeekStr,
      gioVao,
      gioRa,
      totalHours,
      cong,
      trangThai,
      ghiChu,
    ];

    rowData.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);

      cell.value = value;
      cell.font = {
        name: "Times New Roman",
        size: 11,
      };
      // Căn giữa tất cả các ô
      cell.alignment = {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };

      // Áp dụng màu sắc dựa trên loại ngày
      let fillColor = "FFFFFFFF";
      let fontColor = "FF000000";

      switch (dayType) {
        case "weekend":
          fillColor = "FFE8F4FD";
          fontColor = "FF0066CC";
          break;
        case "holiday":
          fillColor = "FFFFEAA7";
          fontColor = "FFD63031";
          break;
        case "absent":
          fillColor = "FFFDCBC4";
          fontColor = "FFD63031";
          break;
        case "leave":
          fillColor = "FFD1F2EB";
          fontColor = "FF00B894";
          break;
        case "incomplete":
          fillColor = "FFFFEAA7";
          fontColor = "FFD63031";
          break;
        case "complete":
          fillColor = "FFD5EDDA";
          fontColor = "FF155724";
          break;
        default:
          // Ngày thường - xen kẽ màu
          if (dayIndex % 2 === 0) {
            fillColor = "FFF8F9FA";
          } else {
            fillColor = "FFFFFFFF";
          }
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
      cell.font = {
        ...cell.font,
        color: { argb: fontColor },
      };
    });

    row.height = 20;
    currentRow++;
  });

  // Summary section - Tổng kết tháng
  currentRow++; // Empty row

  // Summary header - sử dụng màu gradient đẹp hơn
  const summaryHeaderCell = worksheet.getCell(currentRow, 1);
  summaryHeaderCell.value = "TỔNG KẾT THÁNG";
  summaryHeaderCell.font = {
    name: "Times New Roman",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  summaryHeaderCell.alignment = { horizontal: "center", vertical: "middle" };
  summaryHeaderCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2E8B57" }, // Sea Green
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  // Summary data với format đẹp hơn
  const summaryData = [
    [
      "Tổng số công làm việc",
      (attendanceStatistics.totalWorkDays || 0) + " ngày",
    ],
    [
      "Tổng giờ làm thực tế",
      (attendanceStatistics.totalActualWorkHours || 0) + " giờ",
    ],
    [
      "Số ngày tăng ca",
      (attendanceStatistics.totalOvertimeDays || 0) + " ngày",
    ],
    [
      "Số ngày nghỉ lễ/phép",
      (attendanceStatistics.totalHolidayDays || 0) +
        (attendanceStatistics.totalLeaveDays || 0) +
        " ngày",
    ],
  ];

  summaryData.forEach(([label, value], index) => {
    const row = worksheet.getRow(currentRow);

    // Merge 4 cột đầu cho label
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
    const labelCell = row.getCell(1);
    labelCell.value = label;
    labelCell.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      color: { argb: "FF2F4F4F" },
    };
    labelCell.alignment = { horizontal: "left", vertical: "center" };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: index % 2 === 0 ? "FFF0F8EF" : "FFE8F5E8" },
    };

    // Merge 4 cột sau cho value
    worksheet.mergeCells(currentRow, 5, currentRow, 8);
    const valueCell = row.getCell(5);
    valueCell.value = value;
    valueCell.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      color: { argb: "FF2E8B57" },
    };
    valueCell.alignment = { horizontal: "center", vertical: "center" };
    valueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: index % 2 === 0 ? "FFF0F8EF" : "FFE8F5E8" },
    };

    row.height = 25;
    currentRow++;
  });

  // Annual leave section - Tổng kết nghỉ phép năm
  currentRow++; // Empty row

  // Annual leave header với icon đẹp hơn
  const annualLeaveHeaderCell = worksheet.getCell(currentRow, 1);
  annualLeaveHeaderCell.value = "TỔNG KẾT NGHỈ PHÉP NĂM";
  annualLeaveHeaderCell.font = {
    name: "Times New Roman",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  annualLeaveHeaderCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  annualLeaveHeaderCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF8C00" }, // Dark Orange
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  // Annual leave data với format đẹp hơn
  const annualLeaveData = [
    [
      "Tổng ngày phép được phép trong năm",
      (attendanceStatistics.annualLeaveQuota || 0) + " ngày",
    ],
    [
      "Số ngày phép đã sử dụng",
      (attendanceStatistics.leaveTaken || 0) + " ngày",
    ],
    [
      "Số ngày phép còn lại",
      (attendanceStatistics.leaveRemaining || 0) + " ngày",
    ],
    [
      "Số ngày phép tích luỹ",
      (attendanceStatistics.leaveAccumulated || 0) + " ngày",
    ],
  ];

  annualLeaveData.forEach(([label, value], index) => {
    const row = worksheet.getRow(currentRow);

    // Merge 4 cột đầu cho label
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
    const labelCell = row.getCell(1);
    labelCell.value = label;
    labelCell.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      color: { argb: "FF8B4513" },
    };
    labelCell.alignment = { horizontal: "left", vertical: "center" };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: index % 2 === 0 ? "FFFFF8DC" : "FFFFEFD5" },
    };

    // Merge 4 cột sau cho value
    worksheet.mergeCells(currentRow, 5, currentRow, 8);
    const valueCell = row.getCell(5);
    valueCell.value = value;
    valueCell.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      color: { argb: "FFFF8C00" },
    };
    valueCell.alignment = { horizontal: "center", vertical: "center" };
    valueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: index % 2 === 0 ? "FFFFF8DC" : "FFFFEFD5" },
    };

    row.height = 25;
    currentRow++;
  });

  // Export file
  const fileName = `BangCong_${selectedNhanVien.hoTen.replace(
    /\s+/g,
    "_"
  )}_${selectedMonth.format("MM_YYYY")}.xlsx`;

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
    console.log("Excel exported successfully with improved design!");
  } catch (error) {
    console.error("Error exporting Excel:", error);
    throw error;
  }
};
