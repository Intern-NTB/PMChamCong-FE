import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
            return d.format('HH:mm');
        }
        const parts = String(text).split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
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
export const exportPersonalAttendanceExcel = (selectedNhanVien, selectedMonth, processedCalendarData, attendanceStatistics) => {
    if (!selectedNhanVien || !processedCalendarData || processedCalendarData.length === 0) {
        console.warn("Không có dữ liệu hoặc nhân viên được chọn để xuất Excel.");
        return;
    }

    const fileName = `BangCong_${selectedNhanVien.hoTen.replace(/\s+/g, '_')}_${selectedMonth.format('MM_YYYY')}.xlsx`;
    const worksheetName = `BangCong_${selectedMonth.format('MM_YYYY')}`;

    const dataForExcel = [
        [`BẢNG CÔNG CHI TIẾT NHÂN VIÊN`],
        [`Nhân viên: ${selectedNhanVien.hoTen} (${selectedNhanVien.maNhanVien})`],
        [`Tháng: ${selectedMonth.format('MM/YYYY')}`],
        [],
        ['Ngày', 'Thứ', 'Giờ Vào', 'Giờ Ra', 'Tổng Giờ Làm', 'Số Công', 'Trạng Thái', 'Ghi Chú'],
    ];

    const headerRowIdx = 4; 

    const dataStartRow = dataForExcel.length; 

    processedCalendarData.forEach(day => {
        const dateStr = day.date.format('DD/MM/YYYY');
        const dayOfWeekStr = day.date.format('dddd');

        let gioVao = '-';
        let gioRa = '-';
        let totalHours = '-';
        let cong = '0.00';
        let trangThai = 'Không có dữ liệu';
        let ghiChu = '';

        if (day.chamCong) {
            gioVao = day.chamCong.thoiGianVao ? formatTimeForExcel(day.chamCong.thoiGianVao) : '-';
            gioRa = day.chamCong.thoiGianRa ? formatTimeForExcel(day.chamCong.thoiGianRa) : '-';
            cong = (day.chamCong.cong !== undefined && day.chamCong.cong !== null) ? day.chamCong.cong.toFixed(2) : '0.00';
            trangThai = day.chamCong.trangThai || 'Không rõ';

            if (day.chamCong.thoiGianVao && day.chamCong.thoiGianRa) {
                const checkIn = dayjs(day.chamCong.ngayChamCong + 'T' + formatTimeForExcel(day.chamCong.thoiGianVao) + ':00');
                const checkOut = dayjs(day.chamCong.ngayChamCong + 'T' + formatTimeForExcel(day.chamCong.thoiGianRa) + ':00');
                if (checkOut.isValid() && checkIn.isValid() && checkOut.isAfter(checkIn)) {
                    const diffMinutes = dayjs.duration(checkOut.diff(checkIn)).asMinutes();
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = Math.round(diffMinutes % 60);
                    totalHours = `${hours}h ${minutes}m`;
                }
            }
        } else {
            if (day.isAbsent) {
                trangThai = 'Vắng mặt';
                ghiChu = '0 Công';
            } else if (day.isHalfDayAbsent) {
                trangThai = 'Vắng nửa ngày';
                ghiChu = '0.5 Công';
            } else if (day.isLeave) {
                trangThai = 'Nghỉ phép';
                ghiChu = 'Nghỉ phép';
            } else if (day.isHoliday) {
                trangThai = 'Nghỉ lễ';
                ghiChu = 'Nghỉ lễ';
            } else if (day.isWeekend) {
                trangThai = 'Nghỉ';
                ghiChu = 'Nghỉ Cuối Tuần';
            } else {
                trangThai = 'Không chấm công';
                ghiChu = 'Chưa có dữ liệu chấm công';
            }
            cong = '0.00';
        }

        dataForExcel.push([
            dateStr,
            dayOfWeekStr,
            gioVao,
            gioRa,
            totalHours,
            cong,
            trangThai,
            ghiChu
        ]);
    });

    const summaryStartRow = dataForExcel.length + 1;
    dataForExcel.push([]); 
    dataForExcel.push(['TỔNG KẾT THÁNG:']);
    dataForExcel.push(['Tổng số công:', attendanceStatistics.totalWorkDays]);
    dataForExcel.push(['Tổng giờ làm thực tế:', attendanceStatistics.totalActualWorkHours]);
    dataForExcel.push(['Số ngày vắng:', attendanceStatistics.totalAbsentDays]);
    dataForExcel.push(['Số ngày vắng nửa buổi:', attendanceStatistics.totalHalfDayAbsent]);
    dataForExcel.push(['Số ngày tăng ca:', attendanceStatistics.totalOvertimeDays]);
    dataForExcel.push(['Số ngày nghỉ lễ/phép:', attendanceStatistics.totalHolidayDays + attendanceStatistics.totalLeaveDays]);

    const annualLeaveSummaryStartRow = dataForExcel.length + 1;
    dataForExcel.push([]); 
    dataForExcel.push(['TỔNG KẾT NGHỈ PHÉP NĂM:']);
    dataForExcel.push(['Số ngày phép cả năm:', attendanceStatistics.annualLeaveQuota]);
    dataForExcel.push(['Số ngày phép đã nghỉ:', attendanceStatistics.leaveTaken]);
    dataForExcel.push(['Số ngày phép còn lại:', attendanceStatistics.leaveRemaining]);
    dataForExcel.push(['Số ngày nghỉ không lương:', attendanceStatistics.unpaidLeave]);


    const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

    // --- Apply Merges ---
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, 
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, 
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }  
    ];

    // --- Apply Styles ---
    const allCells = XLSX.utils.decode_range(ws['!ref']);

    for (let R = allCells.s.r; R <= allCells.e.r; ++R) {
        for (let C = allCells.s.c; C <= allCells.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) ws[cellAddress] = {}; 

            ws[cellAddress].s = {
                ...ws[cellAddress].s,
                font: { name: "Times New Roman" }
            };

            if (R >= dataStartRow && R < summaryStartRow - 1) { 
                ws[cellAddress].s = {
                    ...ws[cellAddress].s,
                    border: {
                        top: { style: "thin", color: { auto: 1 } },
                        bottom: { style: "thin", color: { auto: 1 } },
                        left: { style: "thin", color: { auto: 1 } },
                        right: { style: "thin", color: { auto: 1 } },
                    }
                };
            }

            if (R >= 0 && R <= 2) {
                ws[cellAddress].s = {
                    ...ws[cellAddress].s,
                    alignment: { horizontal: "center", vertical: "center" },
                    font: { ...ws[cellAddress].s.font, bold: true, sz: 14 } 
                };
            }

            // Header row styling
            if (R === headerRowIdx) {
                ws[cellAddress].s = {
                    ...ws[cellAddress].s,
                    font: { ...ws[cellAddress].s.font, bold: true },
                    alignment: { horizontal: "center", vertical: "center" },
                    fill: { fgColor: { rgb: "FFD9D9D9" } } 
                };
            }

            if (R === summaryStartRow) {
                ws[cellAddress].s = {
                    ...ws[cellAddress].s,
                    font: { ...ws[cellAddress].s.font, bold: true, color: { rgb: "FF333333" } },
                    fill: { fgColor: { rgb: "FFCCE5FF" } }
                };
            }

            if (R === annualLeaveSummaryStartRow) {
                ws[cellAddress].s = {
                    ...ws[cellAddress].s,
                    font: { ...ws[cellAddress].s.font, bold: true, color: { rgb: "FF333333" } },
                    fill: { fgColor: { rgb: "FFCCFFCC" } } 
                };
            }

            if ((R > summaryStartRow && R < annualLeaveSummaryStartRow - 1) || (R > annualLeaveSummaryStartRow)) {
                if (C === 0) { 
                     ws[cellAddress].s = {
                        ...ws[cellAddress].s,
                        font: { ...ws[cellAddress].s.font, bold: true } 
                     };
                }
            }
        }
    }


    const colWidths = [];
    for (let C = 0; C < dataForExcel[headerRowIdx].length; ++C) {
        let maxWidth = 0;
        for (let R = 0; R < dataForExcel.length; ++R) {
            const cellValue = dataForExcel[R][C];
            if (cellValue) {
                const len = String(cellValue).length;
                if (len > maxWidth) {
                    maxWidth = len;
                }
            }
        }
        colWidths.push({ wch: maxWidth + 2 }); 
    }
    ws['!cols'] = colWidths;


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, worksheetName);

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
};