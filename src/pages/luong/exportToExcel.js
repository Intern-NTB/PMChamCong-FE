import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const removeVietnameseTones = (str) => {
  const map = {
    a: "áàạảãâấầậẩẫăắằặẳẵ",
    e: "éèẹẻẽêếềệểễ",
    i: "íìịỉĩ",
    o: "óòọỏõôốồộổỗơớờợởỡ",
    u: "úùụủũôốồộổỗơớờợởỡ",
    y: "ýỳỵỷỹ",
    d: "đ",
  };

  return str
    .split("")
    .map((char) => {
      for (let key in map) {
        if (map[key].includes(char)) {
          return key;
        }
      }
      return char;
    })
    .join("");
};

export const exportToExcel = (data, monthYear = "", phongBan = null, isDetail = false) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(isDetail ? "Bảng Lương Chi Tiết" : "Bảng Lương Tổng");

  worksheet.getCell("F2").value = `Bảng Lương Tháng ${monthYear || "-"}`;
  worksheet.getCell("F2").font = { size: 16, bold: true };
  worksheet.getCell("F2").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 25;

  worksheet.getCell("A2").value = phongBan ? `Phòng ban: ${phongBan}` : "Phòng ban: Tất cả";
  worksheet.getCell("A2").font = { size: 12, italic: true };
  worksheet.getCell("A2").alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(2).height = 20;

  const columns = isDetail ? [
    { header: removeVietnameseTones("Mã NV"), key: "maNhanVien", width: 12 },
    { header: removeVietnameseTones("Họ Tên"), key: "hoTen", width: 25 },
    { header: removeVietnameseTones("Phòng ban"), key: "phongBan", width: 18 },
    { header: removeVietnameseTones("Luong cơ bản"), key: "luongCoBan", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Phụ cấp"), key: "tienPhuCap", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Thuong"), key: "tienThuong", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Muc phạt"), key: "mucPhat", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Tăng ca"), key: "tangCa", width: 10 },
    { header: removeVietnameseTones("Vi phạm"), key: "viPham", width: 10 },
    { header: removeVietnameseTones("Đi muộn"), key: "lanDiMuon", width: 12 },
    { header: removeVietnameseTones("Về sớm"), key: "lanVeSom", width: 12 },
    { header: removeVietnameseTones("Nghỉ có phép"), key: "nghiCoPhep", width: 12 },
    { header: removeVietnameseTones("Nghỉ không phép"), key: "nghiKhongPhep", width: 12 },
    { header: removeVietnameseTones("Ngày công"), key: "ngayCong", width: 12 },
    { header: removeVietnameseTones("Ngày lễ"), key: "ngayLe", width: 10 },
    { header: removeVietnameseTones("Thuc nhận"), key: "thucNhan", width: 15, style: { numFmt: '#,##0" VND"' } },
  ] : [
    { header: removeVietnameseTones("Mã NV"), key: "maNhanVien", width: 12 },
    { header: removeVietnameseTones("Họ Tên"), key: "hoTen", width: 25 },
    { header: removeVietnameseTones("Phòng ban"), key: "phongBan", width: 18 },
    { header: removeVietnameseTones("Luong cơ bản"), key: "luongCoBan", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Phụ cấp"), key: "tienPhuCap", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Thuong"), key: "tienThuong", width: 15, style: { numFmt: '#,##0" VND"' } },
    { header: removeVietnameseTones("Thuc nhận"), key: "thucNhan", width: 15, style: { numFmt: '#,##0" VND"' } },
  ];

  worksheet.columns = columns;

  data.forEach((item) => worksheet.addRow(item));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1890FF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(3).height = 20;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 3) row.height = 18;
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `baocaoluong_${monthYear ? monthYear.replace("/", "-") : "all"}_${isDetail ? "chi_tiet" : "tong"}.xlsx`);
  });
};
