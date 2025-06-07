import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const COMPANY_NAME = "CÔNG TY MAY MẶC MANOR";

const DEFAULT_FONT = {
  name: "Times New Roman",
  size: 12,
};

const removeVietnameseTones = (str) => {
  const map = {
    a: "áàạảãâấầậẩẫăắằặẳẵ",
    e: "éèẹẻẽêếềệểễ",
    i: "íìịỉĩ",
    o: "óòọỏõôốồộổỗơớờợởỡ",
    u: "úùụủũưứừựửữ",
    y: "ýỳỵỷỹ",
    d: "đ",
  };

  return str
    .split("")
    .map((char) => {
      const lowerChar = char.toLowerCase();
      let replacement = char;

      for (let key in map) {
        if (map[key].includes(lowerChar)) {
          replacement = key;
          break;
        }
      }
      return char === char.toUpperCase() ? replacement.toUpperCase() : replacement;
    })
    .join("");
};

export const exportToExcel = async (data, monthYear = "", phongBan = null, isDetail = false) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(isDetail ? "Bảng Lương Chi Tiết" : "Bảng Lương Tổng");

  if (!isDetail) {
    worksheet.getCell("A1").value = COMPANY_NAME;
    worksheet.getCell("A1").font = { ...DEFAULT_FONT, bold: true, color: { argb: "FF595959" } };
    worksheet.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(1).height = 20;

    const summaryColumnDefinitions = [
      { key: "maNhanVien", width: 12 },
      { key: "hoTen", width: 25 },
      { key: "luongCoBan", width: 15, style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT } },
      { key: "tienPhuCap", width: 15, style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT } },
      { key: "tienThuong", width: 15, style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT } },
      { key: "thucNhan", width: 15, style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT } },
    ];

    worksheet.columns = summaryColumnDefinitions;

    worksheet.mergeCells('A2:F2'); 
    const titleCell = worksheet.getCell("A2");
    titleCell.value = `Bảng Lương Tháng ${monthYear || "-"}`;
    titleCell.font = { ...DEFAULT_FONT, size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 25;

    worksheet.getCell("A3").value = phongBan ? `Phòng ban: ${phongBan}` : "Phòng ban: Tất cả";
    worksheet.getCell("A3").font = { ...DEFAULT_FONT, italic: true };
    worksheet.getCell("A3").alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(3).height = 20;

    const actualHeaders = [
      "Mã NV", "Họ Tên", "Lương cơ bản", "Phụ cấp", "Thưởng", "Thực nhận"
    ];

    const headerRow = worksheet.getRow(4);
    headerRow.values = actualHeaders;
    headerRow.font = { ...DEFAULT_FONT, bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    for (let i = 1; i <= 6; i++) { 
      worksheet.getCell(4, i).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1890FF" }
      };
    }

    data.forEach((item) => {
      const row = worksheet.addRow({
        maNhanVien: item.maNhanVien,
        hoTen: item.hoTen,
        luongCoBan: item.luongCoBan,
        tienPhuCap: item.tienPhuCap,
        tienThuong: item.tienThuong,
        thucNhan: item.thucNhan,
      });
      row.height = 20;
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { ...DEFAULT_FONT };

        if (['luongCoBan', 'tienPhuCap', 'tienThuong', 'thucNhan'].includes(cell.col.key)) {
          cell.numFmt = '#,##0" VND"';
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }
      });
    });

  } else {
    let currentRow = 1;

    worksheet.getColumn('A').width = 15;
    worksheet.getColumn('B').width = 25;
    worksheet.getColumn('C').width = 20;
    worksheet.getColumn('D').width = 20;
    worksheet.getColumn('E').width = 10; 

    worksheet.getCell(currentRow, 1).value = COMPANY_NAME;
    worksheet.getCell(currentRow, 1).font = { ...DEFAULT_FONT, bold: true };
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left" };
    currentRow++; 

    currentRow++; 

    worksheet.mergeCells(currentRow, 1, currentRow, 3); 
    const titleCell = worksheet.getCell(currentRow, 1); 
    titleCell.value = `BẢNG LƯƠNG THÁNG ${monthYear || "-"}`;
    titleCell.font = { ...DEFAULT_FONT, bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    currentRow++; 

    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Phòng ban: ${phongBan || "-"}`; 
    worksheet.getCell(currentRow, 1).font = { ...DEFAULT_FONT, italic: true };
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left" };
    currentRow++; 

    const mainInfoHeaderRow = worksheet.getRow(currentRow);
    mainInfoHeaderRow.getCell(1).value = "Mã NV"; // A6
    mainInfoHeaderRow.getCell(2).value = "Họ tên"; // B6
    mainInfoHeaderRow.getCell(3).value = "Lương cơ bản"; // C6

    mainInfoHeaderRow.font = { ...DEFAULT_FONT, bold: true, size: 12 };
    mainInfoHeaderRow.height = 20;

    const headerFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" }, 
    };
    mainInfoHeaderRow.getCell(1).fill = headerFill;
    mainInfoHeaderRow.getCell(2).fill = headerFill;
    mainInfoHeaderRow.getCell(3).fill = headerFill;

    // Apply alignment for headers
    mainInfoHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }; 
    mainInfoHeaderRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" }; 
    mainInfoHeaderRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" }; 

    currentRow++; 

    const record = data[0]; 
    if (record) {
      const mainInfoValueRow = worksheet.getRow(currentRow);
      mainInfoValueRow.getCell(1).value = record.maNhanVien || "-"; // A7
      mainInfoValueRow.getCell(2).value = record.hoTen || "-"; // B7
      mainInfoValueRow.getCell(3).value = record.luongCoBan; // C7

      mainInfoValueRow.getCell(1).font = DEFAULT_FONT;
      mainInfoValueRow.getCell(2).font = DEFAULT_FONT;
      mainInfoValueRow.getCell(3).font = DEFAULT_FONT;

      mainInfoValueRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
      mainInfoValueRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
      mainInfoValueRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
      mainInfoValueRow.getCell(3).numFmt = '#,##0" VND"';
    }
    currentRow++; 

    currentRow++; 

    worksheet.getCell(currentRow, 1).value = "Ngày công"; // A9
    worksheet.getCell(currentRow, 1).font = { ...DEFAULT_FONT, bold: true, size: 12 };
    worksheet.getCell(currentRow, 1).fill = headerFill;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };

    worksheet.getCell(currentRow, 3).value = "Phụ cấp"; // C9
    worksheet.getCell(currentRow, 3).font = { ...DEFAULT_FONT, bold: true, size: 12 };
    worksheet.getCell(currentRow, 3).fill = headerFill;
    worksheet.getCell(currentRow, 3).alignment = { horizontal: "right", vertical: "middle" };

    currentRow++; 

    if (record) {
      worksheet.getCell(currentRow, 1).value = record.ngayCong || "-"; // A10
      worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
      worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };

      worksheet.getCell(currentRow, 3).value = record.tienPhuCap; // C10
      worksheet.getCell(currentRow, 3).font = DEFAULT_FONT;
      worksheet.getCell(currentRow, 3).alignment = { horizontal: "right", vertical: "middle" };
      worksheet.getCell(currentRow, 3).numFmt = '#,##0" VND"';
    }
    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Nghỉ phép: ${record ? record.nghiCoPhep || "-" : "-"}`; // A11
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };
    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Ngày lễ: ${record ? record.ngayLe || "-" : "-"}`; // A12
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };

    worksheet.getCell(currentRow, 3).value = "Thưởng"; // C12
    worksheet.getCell(currentRow, 3).font = { ...DEFAULT_FONT, bold: true, size: 12 };
    worksheet.getCell(currentRow, 3).fill = headerFill;
    worksheet.getCell(currentRow, 3).alignment = { horizontal: "right", vertical: "middle" };
    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Tăng ca: ${record ? record.tangCa || "-" : "-"}`; // A13
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };

    if (record) {
      worksheet.getCell(currentRow, 3).value = record.tienThuong; // C13
      worksheet.getCell(currentRow, 3).font = DEFAULT_FONT;
      worksheet.getCell(currentRow, 3).alignment = { horizontal: "right", vertical: "middle" };
      worksheet.getCell(currentRow, 3).numFmt = '#,##0" VND"';
    }
    currentRow++; 

    currentRow++; 

    worksheet.getCell(currentRow, 1).value = record?.mucPhat || 0 // A15
    worksheet.getCell(currentRow, 1).font = { ...DEFAULT_FONT, bold: true };
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };
    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Đi muộn: ${record ? record.lanDiMuon || "-" : "-"}`; // A16
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };
    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Về sớm: ${record ? record.lanVeSom || "-" : "-"}`; // A17
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };
    currentRow++; 

    worksheet.getCell(currentRow, 1).value = `Nghỉ 0 phép: ${record ? record.nghiKhongPhep || "-" : "-"}`; // A18
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };
    currentRow++;

    worksheet.getCell(currentRow, 1).value = `Tiêu hao tài sản chung: ${record ? record.tieuHaoTaiSanChung || "-" : "-"}`; // A19
    worksheet.getCell(currentRow, 1).font = DEFAULT_FONT;
    worksheet.getCell(currentRow, 1).alignment = { horizontal: "left", vertical: "middle" };
    currentRow++; 

    worksheet.mergeCells(currentRow, 2, currentRow, 3); 
    const thucNhanCell = worksheet.getCell(currentRow, 2); 
    thucNhanCell.value = record?.thucNhan || 0
    thucNhanCell.font = { ...DEFAULT_FONT, bold: true, size: 14, color: { argb: "FF0000FF" } }; 
    thucNhanCell.alignment = { horizontal: "right", vertical: "middle" };
    currentRow++; 
  }

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const filename = `baocaoluong_${monthYear ? removeVietnameseTones(monthYear).replace("/", "-") : "all"}_${isDetail ? "chi_tiet" : "tong"}.xlsx`;
    saveAs(blob, filename.toLowerCase());
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};