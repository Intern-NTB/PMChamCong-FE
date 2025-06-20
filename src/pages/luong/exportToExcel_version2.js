import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const COMPANY_NAME = "CÔNG TY MAY MẶC MANOR";

const DEFAULT_FONT = {
  name: "Times New Roman",
  size: 12,
};

// Hàm loại bỏ dấu tiếng Việt
const removeVietnameseTones = (str) => {
  const map = {
    a: "áàạảãâấậậâãâăắặặẳă",
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

// Hàm tính toán số tiền dựa trên đơn vị
const calculateAmount = (value, unit, baseSalary) => {
  if (!value || value === 0) return 0;
  if (unit === "%") {
    return (baseSalary * value) / 100;
  } else {
    return value;
  }
};

// Hàm định dạng chi tiết thưởng/phạt
const formatBonusPenaltyDetails = (data, baseSalary = 0, type = "bonus") => {
  if (!data) return "Không có";

  let details = [];

  if (Array.isArray(data)) {
    data.forEach((item) => {
      let amount = 0;
      let text = "";

      if (type === "bonus") {
        if (item.soTienThuongKhac && item.soTienThuongKhac > 0) {
          amount = calculateAmount(
            item.soTienThuongKhac,
            item.donViThuongKhac || item.donVi,
            baseSalary
          );
        } else if (item.soTienThuong) {
          amount = calculateAmount(
            item.soTienThuong,
            item.donViThuong || item.donVi,
            baseSalary
          );
        }

        text = `${item.tenLoaiTienThuong || "Thưởng khác"}`;
        if (item.lyDo) text += ` (${item.lyDo})`;
        if (item.donVi === "%") {
          text += ` - ${item.soTienThuong || item.soTienThuongKhac}%`;
        }
      } else {
        if (item.soTienTruKhac && item.soTienTruKhac > 0) {
          amount = calculateAmount(
            item.soTienTruKhac,
            item.donViTruKhac || item.donVi,
            baseSalary
          );
        } else if (item.soTienTru) {
          amount = calculateAmount(
            item.soTienTru,
            item.donViTru || item.donVi,
            baseSalary
          );
        }

        text = `${item.tenLoaiTienTru || "Phạt khác"}`;
        if (item.liDo) text += ` (${item.liDo})`;
        if (item.donVi === "%") {
          text += `-${item.soTienTru || item.soTienTruKhac}%`;
        }
      }

      details.push(`${text}: ${amount.toLocaleString("vi-VN")} VND`);
    });
  } else {
    let amount = 0;
    let text = "";

    if (type === "bonus") {
      if (data.soTienThuongKhac && data.soTienThuongKhac > 0) {
        amount = calculateAmount(
          data.soTienThuongKhac,
          data.donViThuongKhac || data.donVi,
          baseSalary
        );
      } else if (data.soTienThuong) {
        amount = calculateAmount(
          data.soTienThuong,
          data.donViThuong || data.donVi,
          baseSalary
        );
      }

      text = `${data.tenLoaiTienThuong || "Thưởng khác"}`;
      if (data.lyDo) text += ` (${data.lyDo})`;
      if (data.donVi === "%") {
        text += ` - ${data.soTienThuong || data.soTienThuongKhac}%`;
      }
    } else {
      if (data.soTienTruKhac && data.soTienTruKhac > 0) {
        amount = calculateAmount(
          data.soTienTruKhac,
          data.donViTruKhac || data.donVi,
          baseSalary
        );
      } else if (data.soTienTru) {
        amount = calculateAmount(
          data.soTienTru,
          data.donViTru || data.donVi,
          baseSalary
        );
      }

      text = `${data.tenLoaiTienTru || "Phạt khác"}`;
      if (data.liDo) text += ` (${data.liDo})`;
      if (data.donVi === "%") {
        text += `-${data.soTienTru || data.soTienTruKhac}%`;
      }
    }

    details.push(`${text}: ${amount.toLocaleString("vi-VN")} VND`);
  }

  return details.join("\n");
};

export const exportToExcel = async (
  data,
  monthYear = "",
  tenPhongBan = null,
  isDetail = false
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    isDetail ? "Bảng Lương Chi Tiết" : "Bảng Lương Tổng Hợp"
  );

  if (!isDetail) {
    // Header công ty
    worksheet.getCell("A1").value = COMPANY_NAME;
    worksheet.getCell("A1").font = {
      ...DEFAULT_FONT,
      bold: true,
      size: 14,
      color: { argb: "FF1890FF" },
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getRow(1).height = 25;

    // Định nghĩa cột cho bảng tổng hợp
    const summaryColumnDefinitions = [
      { key: "maNhanVien", width: 12 },
      { key: "hoTen", width: 25 },
      { key: "tenPhongBan", width: 18 },
      { key: "nam", width: 8 },
      { key: "thang", width: 8 },
      { key: "luongCoBan", width: 15 },
      { key: "soNgayCong", width: 12 },
      { key: "congChuanCuaThang", width: 15 },
      { key: "soNgayNghi", width: 12 },
      { key: "soNgayLe", width: 12 },
      { key: "soNgayNghiCoPhep", width: 15 },
      { key: "soNgayNghiKhongPhep", width: 16 },
      { key: "soGioTangCa", width: 12 },
      { key: "heSoTangCa", width: 12 },
      { key: "luongGio", width: 12 },
      { key: "tongTienTangCa", width: 15 },
      { key: "luongTheoNgay", width: 15 },
      { key: "luongNgayNghi", width: 15 },
      { key: "tongTienPhuCap", width: 15 },
      { key: "tongLuongCoBan", width: 15 },
      { key: "tienThuong", width: 15 },
      { key: "tienTru", width: 15 },
      { key: "tongLuong", width: 15 },
    ];

    worksheet.columns = summaryColumnDefinitions;

    // Tiêu đề bảng lương
    worksheet.mergeCells("A2:W2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = `BẢNG LƯƠNG THÁNG ${monthYear || "-"}`;
    titleCell.font = {
      ...DEFAULT_FONT,
      size: 18,
      bold: true,
      color: { argb: "FF1890FF" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 35;

    // Thông tin phòng ban
    worksheet.getCell("A3").value = tenPhongBan
      ? `Phòng ban: ${tenPhongBan}`
      : "Phòng ban: Tất cả";
    worksheet.getCell("A3").font = { ...DEFAULT_FONT, italic: true, size: 11 };
    worksheet.getCell("A3").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getRow(3).height = 20;

    // Headers cho bảng tổng hợp
    const actualHeaders = [
      "Mã NV",
      "Họ Tên",
      "Phòng ban",
      "Năm",
      "Tháng",
      "Lương cơ bản",
      "Ngày công",
      "Công chuẩn",
      "Ngày nghỉ",
      "Ngày lễ",
      "Nghỉ có phép",
      "Nghỉ không phép",
      "Giờ tăng ca",
      "Hệ số TC",
      "Lương giờ",
      "Tiền tăng ca",
      "Lương theo ngày",
      "Lương ngày nghỉ",
      "Phụ cấp",
      "Tổng lương CB",
      "Thưởng",
      "Phạt",
      "Thực nhận",
    ];

    const headerRow = worksheet.getRow(4);
    headerRow.values = actualHeaders;
    headerRow.font = {
      ...DEFAULT_FONT,
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
    };
    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    headerRow.height = 35;

    // Style cho header
    for (let i = 1; i <= actualHeaders.length; i++) {
      const cell = worksheet.getCell(4, i);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1890FF" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    }

    // Thêm dữ liệu
    data.forEach((item, index) => {
      const soNgayNghiKhongPhep = Math.max(
        0,
        (item.soNgayNghi || 0) - (item.soNgayNghiCoPhep || 0)
      );

      const row = worksheet.addRow({
        maNhanVien: item.maNhanVien,
        hoTen: item.hoTen,
        tenPhongBan: item.tenPhongBan,
        nam: item.nam,
        thang: item.thang,
        luongCoBan: item.luongCoBan || 0,
        soNgayCong: item.soNgayCong || 0,
        congChuanCuaThang: item.congChuanCuaThang || 0,
        soNgayNghi: (item.soNgayNghi || 0) + (item.soNgayLe || 0),
        soNgayLe: item.soNgayLe || 0,
        soNgayNghiCoPhep: item.soNgayNghiCoPhep || 0,
        soNgayNghiKhongPhep: soNgayNghiKhongPhep,
        soGioTangCa: item.soGioTangCa || 0,
        heSoTangCa: item.heSoTangCa || 0,
        luongGio: item.luongGio || 0,
        tongTienTangCa: item.tongTienTangCa || 0,
        luongTheoNgay: item.luongTheoNgay || 0,
        luongNgayNghi: item.luongNgayNghi || 0,
        tongTienPhuCap: item.tongTienPhuCap || 0,
        tongLuongCoBan:
          (item.tongTienPhuCap || 0) +
          (item.luongTheoNgay || 0) +
          (item.luongNgayNghi || 0),
        tienThuong: item.tienThuong || 0,
        tienTru: item.tienTru || 0,
        tongLuong: item.tongLuong || 0,
      });

      row.height = 25;

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const columnKey = worksheet.columns[colNumber - 1]?.key;

        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.font = { ...DEFAULT_FONT };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };

        if (["maNhanVien", "hoTen", "tenPhongBan"].includes(columnKey)) {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }

        if (
          [
            "luongCoBan",
            "luongGio",
            "tongTienTangCa",
            "luongTheoNgay",
            "luongNgayNghi",
            "tongTienPhuCap",
            "tongLuongCoBan",
            "tienThuong",
            "tienTru",
            "tongLuong",
          ].includes(columnKey)
        ) {
          cell.numFmt = "#,##0";
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }

        if (index % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
        }

        if (columnKey === "tongLuong") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE6F7FF" },
          };
          cell.font = {
            ...DEFAULT_FONT,
            bold: true,
            color: { argb: "FF1890FF" },
          };
        }

        if (columnKey === "soNgayNghiKhongPhep" && soNgayNghiKhongPhep > 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE6E6" },
          };
          cell.font = { ...DEFAULT_FONT, color: { argb: "FFD32F2F" } };
        }
      });
    });

    const totalRow = worksheet.addRow({
      maNhanVien: "",
      hoTen: "TỔNG CỘNG",
      tenPhongBan: "",
      nam: "",
      thang: "",
      luongCoBan: data.reduce((sum, item) => sum + (item.luongCoBan || 0), 0),
      soNgayCong: data.reduce((sum, item) => sum + (item.soNgayCong || 0), 0),
      congChuanCuaThang: "",
      soNgayNghi: "",
      soNgayLe: "",
      soNgayNghiCoPhep: "",
      soNgayNghiKhongPhep: data.reduce(
        (sum, item) =>
          sum +
          Math.max(0, (item.soNgayNghi || 0) - (item.soNgayNghiCoPhep || 0)),
        0
      ),
      soGioTangCa: data.reduce((sum, item) => sum + (item.soGioTangCa || 0), 0),
      heSoTangCa: "",
      luongGio: "",
      tongTienTangCa: data.reduce(
        (sum, item) => sum + (item.tongTienTangCa || 0),
        0
      ),
      luongTheoNgay: data.reduce(
        (sum, item) => sum + (item.luongTheoNgay || 0),
        0
      ),
      luongNgayNghi: data.reduce(
        (sum, item) => sum + (item.luongNgayNghi || 0),
        0
      ),
      tongTienPhuCap: data.reduce(
        (sum, item) => sum + (item.tongTienPhuCap || 0),
        0
      ),
      tongLuongCoBan: data.reduce(
        (sum, item) =>
          sum +
          ((item.tongTienPhuCap || 0) +
            (item.luongTheoNgay || 0) +
            (item.luongNgayNghi || 0)),
        0
      ),
      tienThuong: data.reduce((sum, item) => sum + (item.tienThuong || 0), 0),
      tienTru: data.reduce((sum, item) => sum + (item.tienTru || 0), 0),
      tongLuong: data.reduce((sum, item) => sum + (item.tongLuong || 0), 0),
    });

    totalRow.height = 30;
    totalRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const columnKey = worksheet.columns[colNumber - 1]?.key;

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF52C41A" },
      };
      cell.font = { ...DEFAULT_FONT, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thick", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thick", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };

      if (["hoTen"].includes(columnKey)) {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }

      if (
        [
          "luongCoBan",
          "tongTienTangCa",
          "luongTheoNgay",
          "luongNgayNghi",
          "tongTienPhuCap",
          "tongLuongCoBan",
          "tienThuong",
          "tienTru",
          "tongLuong",
        ].includes(columnKey)
      ) {
        cell.numFmt = "#,##0";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
    });
  } else {
    let currentRow = 1;

    worksheet.columns = [
      { key: "stt", width: 10 },
      { key: "noiDung", width: 60 },
      { key: "giaTri", width: 25 },
      { key: "ghiChu", width: 15 },
    ];

    for (const record of data) {
      if (currentRow > 1) {
        worksheet.addRow([]);
        worksheet.addRow([]);
        currentRow += 2;
      }

      worksheet.getCell(`A${currentRow}`).value = COMPANY_NAME;
      worksheet.getCell(`A${currentRow}`).font = {
        ...DEFAULT_FONT,
        bold: true,
        size: 14,
        color: { argb: "FF1890FF" },
      };
      worksheet.getCell(`A${currentRow}`).alignment = {
        horizontal: "left",
      };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;
      currentRow++;

      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = `BẢNG TÍNH LƯƠNG CHI TIẾT THÁNG ${monthYear || "-"}`;
      titleCell.font = {
        ...DEFAULT_FONT,
        bold: true,
        size: 16,
        color: { argb: "FF1890FF" },
      };
      titleCell.alignment = { horizontal: "center" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F8FF" },
      };
      worksheet.getRow(currentRow).height = 30;
      currentRow++;
      currentRow++;

      worksheet.getCell(`A${currentRow}`).value = `Phòng ban: ${
        record.tenPhongBan || "-"
      }`;
      worksheet.getCell(`A${currentRow}`).font = {
        ...DEFAULT_FONT,
        italic: true,
        size: 12,
      };
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
      currentRow++;

      const soNgayNghiKhongPhep = Math.max(
        0,
        (record.soNgayNghi || 0) - (record.soNgayNghiCoPhep || 0)
      );

      const detailData = [
        ["STT", "Nội dung", "Giá trị", "Ghi chú"],
        ["1", "Họ và tên", record.hoTen || "-", ""],
        ["2", "Mã nhân viên", record.maNhanVien || "-", ""],
        ["3", "Phòng ban", record.tenPhongBan || "-", ""],
        ["4", "Năm", record.nam || "-", ""],
        ["5", "Tháng", record.thang || "-", ""],
        ["6", "Lương cơ bản", record.luongCoBan || 0, "VND"],
        ["7", "Số ngày làm việc", record.soNgayCong || 0, "ngày"],
        ["8", "Công chuẩn của tháng", record.congChuanCuaThang || 0, "ngày"],
        [
          "9",
          "Số ngày nghỉ",
          (record.soNgayNghi || 0) + (record.soNgayLe || 0),
          "ngày",
        ],
        ["10", "Số ngày nghỉ lễ", record.soNgayLe || 0, "ngày"],
        ["11", "Số ngày nghỉ có phép", record.soNgayNghiCoPhep || 0, "ngày"],
        ["12", "Số ngày nghỉ không phép", soNgayNghiKhongPhep, "ngày"],
        ["13", "Số giờ tăng ca", record.soGioTangCa || 0, "giờ"],
        ["14", "Hệ số tăng ca", record.heSoTangCa || 0, ""],
        ["15", "Lương giờ", record.luongGio || 0, "VND"],
        ["16", "Tổng tiền tăng ca", record.tongTienTangCa || 0, "VND"],
        ["17", "Lương theo ngày", record.luongTheoNgay || 0, "VND"],
        ["18", "Lương ngày nghỉ", record.luongNgayNghi || 0, "VND"],
        ["19", "Tổng tiền phụ cấp", record.tongTienPhuCap || 0, "VND"],
        [
          "20",
          "Tổng lương cơ bản",
          (record.tongTienPhuCap || 0) +
            (record.luongTheoNgay || 0) +
            (record.luongNgayNghi || 0),
          "VND",
        ],
        ["21", "Chi tiết Thưởng", "", ""],
        [
          "21.1",
          "Danh sách thưởng",
          formatBonusPenaltyDetails(
            record.danhSachLichSuThuong,
            record.luongCoBan,
            "bonus"
          ),
          "",
        ],
        ["22", "Tổng Tiền Thưởng", record.tienThuong || 0, "VND"],
        ["23", "Chi tiết Phạt", "", ""],
        [
          "23.1",
          "Danh sách phạt",
          formatBonusPenaltyDetails(
            record.danhSachLichSuTru,
            record.luongCoBan,
            "penalty"
          ),
          "",
        ],
        ["24", "Tổng Tiền Phạt", record.tienTru || 0, "VND"],
        ["25", "Lương thực lãnh", record.tongLuong || 0, "VND"],
      ];

      detailData.forEach((rowData, index) => {
        const row = worksheet.addRow(rowData);
        row.height =
          index === 0
            ? 30
            : rowData[1].includes("Chi tiết") && !rowData[0].includes(".")
            ? 25
            : 22;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.font = { ...DEFAULT_FONT };
          cell.alignment = {
            vertical: "middle",
            horizontal:
              colNumber === 1 ? "center" : colNumber === 3 ? "right" : "left",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          if (index === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF1890FF" },
            };
            cell.font = {
              ...DEFAULT_FONT,
              bold: true,
              color: { argb: "FFFFFFFF" },
            };
            return;
          }

          if (rowData[1].includes("Chi tiết") && !rowData[0].includes(".")) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFE6F7FF" },
            };
            cell.font = {
              ...DEFAULT_FONT,
              bold: true,
              color: { argb: "FF1890FF" },
            };
            return;
          }

          const importantRows = [
            "Tổng Tiền Thưởng",
            "Tổng Tiền Phạt",
            "Lương thực lãnh",
            "Tổng lương cơ bản",
          ];
          if (importantRows.includes(rowData[1])) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF8C2850" },
            };
            cell.font = {
              ...DEFAULT_FONT,
              bold: true,
              color: { argb: "FFFFFFFF" },
            };
            return;
          }

          if (rowData[0].includes(".")) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF5F5F5" },
            };
          }

          if (
            [
              "Lương cơ bản",
              "Lương giờ",
              "Tổng tiền tăng ca",
              "Lương theo ngày",
              "Lương ngày nghỉ",
              "Tổng tiền phụ cấp",
              "Tổng lương cơ bản",
              "Tổng Tiền Thưởng",
              "Tổng Tiền Phạt",
              "Lương thực lãnh",
            ].includes(rowData[1]) &&
            colNumber === 3
          ) {
            cell.numFmt = "#,##0";
          }
        });
      });

      currentRow = worksheet.lastRow.number + 2;

      worksheet.getCell(
        `A${currentRow}`
      ).value = `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`;
      worksheet.getCell(`A${currentRow}`).font = { ...DEFAULT_FONT };
      worksheet.getCell(`A${currentRow}`).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      worksheet.getRow(currentRow).height = 20;
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
