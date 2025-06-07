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
      return char === char.toUpperCase()
        ? replacement.toUpperCase()
        : replacement;
    })
    .join("");
};

export const exportToExcel = async (
  data,
  monthYear = "",
  tenPhongBan = null,
  isDetail = false
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    isDetail ? "Bảng Lương Chi Tiết" : "Bảng Lương Tổng"
  );

  if (!isDetail) {
    worksheet.getCell("A1").value = COMPANY_NAME;
    worksheet.getCell("A1").font = {
      ...DEFAULT_FONT,
      bold: true,
      color: { argb: "FF595959" },
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getRow(1).height = 20;

    const summaryColumnDefinitions = [
      { key: "maNhanVien", width: 12 },
      { key: "nam", width: 12 },
      { key: "thang", width: 12 },
      { key: "hoTen", width: 25 },
      { key: "tenPhongBan", width: 18 },
      {
        key: "congChuanCuaThang",
        width: 15,
      },
      {
        key: "soNgayCong",
        width: 15,
      },
      {
        key: "luongCoBan",
        width: 15,
        style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT },
      },
      {
        key: "tongTienPhuCap",
        width: 15,
        style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT },
      },
      {
        key: "tienThuong",
        width: 15,
        style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT },
      },
      {
        key: "tienTru",
        width: 15,
        style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT },
      },
      {
        key: "tongTienTangCa",
        width: 15,
        style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT },
      },
      {
        key: "tongLuong",
        width: 15,
        style: { numFmt: '#,##0" VND"', font: DEFAULT_FONT },
      },
    ];

    worksheet.columns = summaryColumnDefinitions;

    //Tiêu đề bbảng lương
    worksheet.mergeCells("A2:G2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = `Bảng Lương Tháng ${monthYear || "-"}`;
    titleCell.font = { ...DEFAULT_FONT, size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 25;

    //Thông tin phòng ban
    worksheet.getCell("A3").value = tenPhongBan
      ? `Phòng ban: ${tenPhongBan}`
      : "Phòng ban: Tất cả";
    worksheet.getCell("A3").font = { ...DEFAULT_FONT, italic: true };
    worksheet.getCell("A3").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getRow(3).height = 20;
    const actualHeaders = [
      "Mã NV",
      "Năm",
      "Tháng",
      "Họ Tên",
      "Tên Phòng ban",
      "Công chuẩn",
      "Số ngày công",
      "Lương cơ bản",
      "Tổng tiền phụ cấp",
      "Thưởng",
      "phạt",
      "Tổng tiền tăng ca",
      "Thực nhận",
    ];

    const headerRow = worksheet.getRow(4);
    headerRow.values = actualHeaders;
    headerRow.font = {
      ...DEFAULT_FONT,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;
    headerRow.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    for (let i = 1; i <= actualHeaders.length; i++) {
      // bắt đầu từ cột B (2), số cột là actualHeaders.length
      worksheet.getCell(4, i).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1890FF" },
      };
    }

    data.forEach((item) => {
      const row = worksheet.addRow({
        maNhanVien: item.maNhanVien,
        nam: item.nam,
        thang: item.thang,
        hoTen: item.hoTen,
        tenPhongBan: item.tenPhongBan,
        congChuanCuaThang: item.congChuanCuaThang,
        soNgayCong: item.soNgayCong,
        luongCoBan: item.luongCoBan,
        tongTienPhuCap: item.tongTienPhuCap,
        tienThuong: item.tienThuong,
        tienTru: item.tienTru,
        tongTienTangCa: item.tongTienTangCa,
        tongLuong: item.tongLuong,
      });

      row.height = 20;

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const columnKey = worksheet.columns[colNumber - 1]?.key;
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { ...DEFAULT_FONT };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (
          [
            "luongCoBan",
            "tongTienPhuCap",
            "tienThuong",
            "tienTru",
            "tongTienTangCa",
            "tongLuong",
          ].includes(columnKey)
        ) {
          cell.numFmt = "#,##0";
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }
      });
    });
  } else {
    let currentRow = 1;
    const contentStartCol = 1; //A

    worksheet.getColumn(1).width = 22; //A
    worksheet.getColumn(2).width = 25; //B
    worksheet.getColumn(3).width = 20; //C
    worksheet.getColumn(4).width = 20; //D
    worksheet.getColumn(5).width = 20; //E
    worksheet.getColumn(6).width = 15; //F
    worksheet.getColumn(7).width = 15; //G
    worksheet.getColumn(8).width = 25; //H
    worksheet.getColumn(9).width = 8; //I

    for (const record of data) {
      if (currentRow > 1) {
        worksheet.addRow([]);
        worksheet.addRow([]);
        currentRow += 2;
      }

      worksheet.getCell(currentRow, contentStartCol).value = COMPANY_NAME;
      worksheet.getCell(currentRow, contentStartCol).font = {
        ...DEFAULT_FONT,
        bold: true,
      };
      worksheet.getCell(currentRow, contentStartCol).alignment = {
        horizontal: "left",
      };
      currentRow++;

      currentRow++;

      worksheet.mergeCells(
        currentRow,
        contentStartCol + 1,
        currentRow,
        contentStartCol + 5
      );
      const titleCell = worksheet.getCell(currentRow, contentStartCol + 1);
      titleCell.value = `BẢNG LƯƠNG THÁNG ${monthYear || "-"}`;
      titleCell.font = { ...DEFAULT_FONT, bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center" };
      currentRow++;

      currentRow++;

      worksheet.getCell(currentRow, contentStartCol).value = `Phòng ban: ${
        record.phongBan || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = {
        ...DEFAULT_FONT,
        italic: true,
      };
      worksheet.getCell(currentRow, contentStartCol).alignment = {
        horizontal: "left",
      };
      currentRow++;

      const mainInfoHeaderRow = worksheet.getRow(currentRow);
      mainInfoHeaderRow.getCell(contentStartCol).value = "Mã NV";
      mainInfoHeaderRow.getCell(contentStartCol + 1).value = "Họ tên";
      mainInfoHeaderRow.getCell(contentStartCol + 2).value = "Lương cơ bản";
      mainInfoHeaderRow.getCell(contentStartCol + 3).value = "Phụ cấp";
      mainInfoHeaderRow.getCell(contentStartCol + 4).value = "Thưởng";
      mainInfoHeaderRow.getCell(contentStartCol + 5).value = "Ngày công";
      mainInfoHeaderRow.font = { ...DEFAULT_FONT, bold: true, size: 13 };
      mainInfoHeaderRow.getCell(contentStartCol).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      mainInfoHeaderRow.getCell(contentStartCol + 1).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      mainInfoHeaderRow.getCell(contentStartCol + 2).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      mainInfoHeaderRow.getCell(contentStartCol + 3).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      mainInfoHeaderRow.getCell(contentStartCol + 4).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      mainInfoHeaderRow.getCell(contentStartCol + 5).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      mainInfoHeaderRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber >= contentStartCol && colNumber <= contentStartCol + 5) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD3D3D3" },
          };
        }
      });

      currentRow++;

      const mainInfoValueRow = worksheet.getRow(currentRow);
      mainInfoValueRow.getCell(contentStartCol).value =
        record.maNhanVien || "-";
      mainInfoValueRow.getCell(contentStartCol).font = { ...DEFAULT_FONT };
      mainInfoValueRow.getCell(contentStartCol + 1).value = record.hoTen || "-";
      mainInfoValueRow.getCell(contentStartCol + 1).font = { ...DEFAULT_FONT };
      mainInfoValueRow.getCell(contentStartCol + 2).value = record.luongCoBan;
      mainInfoValueRow.getCell(contentStartCol + 2).font = { ...DEFAULT_FONT };
      mainInfoValueRow.getCell(contentStartCol + 3).value = record.tienPhuCap;
      mainInfoValueRow.getCell(contentStartCol + 3).font = { ...DEFAULT_FONT };
      mainInfoValueRow.getCell(contentStartCol + 4).value = record.tienThuong;
      mainInfoValueRow.getCell(contentStartCol + 4).font = { ...DEFAULT_FONT };
      mainInfoValueRow.getCell(contentStartCol + 5).value =
        record.ngayCong || "-";
      mainInfoValueRow.getCell(contentStartCol + 5).font = { ...DEFAULT_FONT };

      mainInfoValueRow.getCell(contentStartCol + 2).numFmt = '#,##0" VND"';
      mainInfoValueRow.getCell(contentStartCol + 3).numFmt = '#,##0" VND"';
      mainInfoValueRow.getCell(contentStartCol + 4).numFmt = '#,##0" VND"';

      mainInfoValueRow.getCell(contentStartCol + 2).alignment = {
        horizontal: "right",
      };
      mainInfoValueRow.getCell(contentStartCol + 3).alignment = {
        horizontal: "right",
      };
      mainInfoValueRow.getCell(contentStartCol + 4).alignment = {
        horizontal: "right",
      };

      mainInfoValueRow.getCell(contentStartCol).alignment = {
        horizontal: "left",
      };
      mainInfoValueRow.getCell(contentStartCol + 1).alignment = {
        horizontal: "left",
      };
      mainInfoValueRow.getCell(contentStartCol + 5).alignment = {
        horizontal: "center",
      };
      currentRow++;

      currentRow++; // Spacer row

      worksheet.getCell(currentRow, contentStartCol).value = `Nghỉ phép: ${
        record.nghiCoPhep || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;
      worksheet.getCell(currentRow, contentStartCol).value = `Ngày lễ: ${
        record.ngayLe || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;
      worksheet.getCell(currentRow, contentStartCol).value = `Tăng ca: ${
        record.tangCa || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;

      currentRow++; // Spacer row

      const mucPhatRow = worksheet.getRow(currentRow);
      mucPhatRow.getCell(contentStartCol).value = "Mức phạt:";
      mucPhatRow.getCell(contentStartCol).font = {
        ...DEFAULT_FONT,
        bold: true,
      };
      mucPhatRow.getCell(contentStartCol + 1).value = record.mucPhat;
      mucPhatRow.getCell(contentStartCol + 1).font = { ...DEFAULT_FONT };
      mucPhatRow.getCell(contentStartCol + 1).numFmt = '#,##0" VND"';
      mucPhatRow.getCell(contentStartCol + 1).alignment = {
        horizontal: "right",
      };
      currentRow++;

      worksheet.getCell(currentRow, contentStartCol).value = `Đi muộn:${
        record.lanDiMuon || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;
      worksheet.getCell(currentRow, contentStartCol).value = `Về sớm:${
        record.lanVeSom || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;
      worksheet.getCell(currentRow, contentStartCol).value = `Nghỉ 0 phép:${
        record.nghiKhongPhep || "-"
      }`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;
      worksheet.getCell(
        currentRow,
        contentStartCol
      ).value = `Tiêu hao tài sản chung: ${record.tieuHaoTaiSanChung || "-"}`;
      worksheet.getCell(currentRow, contentStartCol).font = { ...DEFAULT_FONT };
      currentRow++;

      currentRow++; // Spacer row
      worksheet.mergeCells(
        currentRow,
        contentStartCol + 4,
        currentRow,
        contentStartCol + 5
      );
      const thucNhanCell = worksheet.getCell(currentRow, contentStartCol + 4);
      thucNhanCell.value = `THỰC NHẬN: ${
        record.thucNhan
          ? record.thucNhan.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          : "- VND"
      }`;
      thucNhanCell.font = {
        ...DEFAULT_FONT,
        bold: true,
        size: 14,
        color: { argb: "FF0000FF" },
      };
      thucNhanCell.alignment = { horizontal: "right" };
      currentRow++;
    }
  }

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const filename = `baocaoluong_${
      monthYear ? removeVietnameseTones(monthYear).replace("/", "-") : "all"
    }_${isDetail ? "chi_tiet" : "tong"}.xlsx`;
    saveAs(blob, filename.toLowerCase());
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};
