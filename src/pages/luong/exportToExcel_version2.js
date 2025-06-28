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
    a: "áàạảãâấầạẩẫăắằặẳẵ",
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
  try {
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
        // === THÔNG TIN CƠ BẢN (không cần tính) ===
        { key: "maNhanVien", width: 12, header: "Mã Nhân Viên" },
        { key: "hoTen", width: 25, header: "Họ Tên" },
        { key: "tenPhongBan", width: 18, header: "Phòng Ban" },
        { key: "nam", width: 8, header: "Năm" },
        { key: "thang", width: 8, header: "Tháng" },
        { key: "luongCoBan", width: 15, header: "(1)\nLương Cơ Bản" },

        // === THÔNG TIN CÔNG VIỆC (không cần tính) ===
        { key: "soNgayCong", width: 12, header: "(2)\nSố Ngày Công" },
        {
          key: "congChuanCuaThang",
          width: 15,
          header: "(3)\nCông Chuẩn Của Tháng",
        },
        { key: "soNgayLe", width: 12, header: "(4)\nSố Ngày Lễ" },
        {
          key: "soNgayNghiCoPhep",
          width: 15,
          header: "(5)\nSố Ngày Nghỉ Có Phép",
        },
        {
          key: "soNgayNghiKhongPhepNhungTinhLuong",
          width: 16,
          header: "(6)\nSố Ngày Nghỉ Không Phép Nhưng Tính Lương",
        },
        {
          key: "soNgayNghiTruLuong",
          width: 16,
          header: "(7)\nSố Ngày Nghỉ Trừ Lương",
        },
        { key: "soGioTangCa", width: 12, header: "(8)\nSố Giờ Tăng Ca" },
        { key: "heSoTangCa", width: 12, header: "(9)\nHệ Số Tăng Ca" },
        { key: "tongTienPhuCap", width: 15, header: "(10)\nTổng Tiền Phụ Cấp" },
        { key: "tienThuong", width: 15, header: "(11)\nTiền Thưởng" },
        { key: "tienTru", width: 15, header: "(12)\nTiền Trừ" },

        // === CÁC CÔNG THỨC TÍNH (theo thứ tự logic) ===
        { key: "luongGio", width: 12, header: "(13)\nLương Giờ\n(1)/(3)/8" },
        {
          key: "soNgayNghi",
          width: 12,
          header: "(14)\nSố Ngày Nghỉ\n(4)+(5)+(6)+(7)",
        },
        {
          key: "soNgayCongChuaLam",
          width: 12,
          header: "(15)\nSố Ngày Công Chưa Làm\n(3)-(2)-\n(4)-(5)-(6)",
        },
        {
          key: "tongTienTangCa",
          width: 15,
          header: "(16)\nTổng Tiền Tăng Ca\n(8)*(13)+((8)*(9)*(13))",
        },
        {
          key: "luongNgayNghi",
          width: 15,
          header: "(17)\nLương Ngày Nghỉ\n(13)*8*((4)+(5)+(6))",
        },
        {
          key: "luongNgayCongChuaLam",
          width: 15,
          header: "(18)\nLương Ngày Công Chưa Làm\n(13)*8*(15)",
        },
        {
          key: "luongTheoNgay",
          width: 15,
          header: "(19)\nLương Theo Ngày\n(1)-(18)-(17)",
        },
        {
          key: "tongLuongCoBan",
          width: 15,
          header: "(20)\nTổng Lương Cơ Bản\n(16)+(19)+(17)+(10)",
        },
        {
          key: "tongLuong",
          width: 15,
          header: "(21)\nTổng Lương\n(20)+(11)-(12)",
        },
      ];

      worksheet.columns = summaryColumnDefinitions.map(({ key, width }) => ({
        key,
        width,
      }));

      // Xóa nội dung row 1 (ngoại trừ A1) để đảm bảo không có header dư thừa
      for (let i = 2; i <= summaryColumnDefinitions.length; i++) {
        worksheet.getCell(1, i).value = null;
      }

      // Tiêu đề bảng lương
      worksheet.mergeCells(
        `A2:${String.fromCharCode(64 + summaryColumnDefinitions.length)}2`
      );
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
      worksheet.getCell("A3").font = {
        ...DEFAULT_FONT,
        italic: true,
        size: 11,
      };
      worksheet.getCell("A3").alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      worksheet.getRow(3).height = 20;

      // Headers cho bảng tổng hợp
      const actualHeaders = summaryColumnDefinitions.map((col) => col.header);
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

      // Thêm dữ liệu tổng hợp
      data.forEach((item, index) => {
        const row = worksheet.addRow({
          maNhanVien: item.maNhanVien,
          hoTen: item.hoTen,
          tenPhongBan: item.tenPhongBan,
          nam: item.nam,
          thang: item.thang,
          luongCoBan: item.luongCoBan || 0,
          soNgayCong: item.soNgayCong || 0,
          soNgayCongChuaLam: item.soNgayNghiTruLuong || 0,
          congChuanCuaThang: item.congChuanCuaThang || 0,
          soNgayNghi: item.soNgayNghi + item.soNgayLe || 0,
          soNgayLe: item.soNgayLe || 0,
          soNgayNghiCoPhep: item.soNgayNghiCoPhep || 0,
          soNgayNghiKhongPhepNhungTinhLuong:
            (item.soNgayNghiCoLuong || 0) - (item.soNgayNghiCoPhep || 0),
          soNgayNghiTruLuong:
            (item.soNgayNghi || 0) - (item.soNgayNghiCoLuong || 0),
          soGioTangCa: item.soGioTangCa || 0,
          heSoTangCa: item.heSoTangCa || 0,
          luongGio: item.luongGio || 0,
          tongTienTangCa: item.tongTienTangCa || 0,
          luongTheoNgay: item.luongTheoNgay || 0,
          luongNgayCongChuaLam: item.tongSoTienNgayNghiTruLuong || 0,
          luongNgayNghi: item.luongNgayNghi || 0,
          tongTienPhuCap: item.tongTienPhuCap || 0,
          tongLuongCoBan:
            (item.tongTienPhuCap || 0) +
            (item.luongTheoNgay || 0) +
            (item.luongNgayNghi || 0) +
            (item.tongTienTangCa || 0),
          tienThuong: item.tienThuong || 0,
          tienTru: item.tienTru || 0,
          tongLuong: item.tongLuong || 0,
        });

        row.height = 25;

        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const columnKey = summaryColumnDefinitions[colNumber - 1]?.key;

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
              "luongNgayCongChuaLam",
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

          if (
            columnKey === "soNgayNghiTruLuong" &&
            (item.soNgayNghi || 0) - (item.soNgayNghiCoLuong || 0) > 0
          ) {
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
        soNgayCongChuaLam: data.reduce(
          (sum, item) => sum + (item.soNgayNghiTruLuong || 0),
          0
        ),
        congChuanCuaThang: "",
        soNgayNghi: data.reduce(
          (sum, item) => sum + ((item.soNgayNghi || 0) + (item.soNgayLe || 0)),
          0
        ),
        soNgayLe: data.reduce((sum, item) => sum + (item.soNgayLe || 0), 0),
        soNgayNghiCoPhep: data.reduce(
          (sum, item) => sum + (item.soNgayNghiCoPhep || 0),
          0
        ),
        soNgayNghiKhongPhepNhungTinhLuong: data.reduce(
          (sum, item) =>
            sum +
            ((item.soNgayNghiCoLuong || 0) - (item.soNgayNghiCoPhep || 0)),
          0
        ),
        soNgayNghiTruLuong: data.reduce(
          (sum, item) =>
            sum + ((item.soNgayNghi || 0) - (item.soNgayNghiCoLuong || 0)),
          0
        ),
        soGioTangCa: data.reduce(
          (sum, item) => sum + (item.soGioTangCa || 0),
          0
        ),
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
        luongNgayCongChuaLam: data.reduce(
          (sum, item) => sum + (item.tongSoTienNgayNghiTruLuong || 0),
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
              (item.luongNgayNghi || 0) +
              (item.tongTienTangCa || 0)),
          0
        ),
        tienThuong: data.reduce((sum, item) => sum + (item.tienThuong || 0), 0),
        tienTru: data.reduce((sum, item) => sum + (item.tienTru || 0), 0),
        tongLuong: data.reduce((sum, item) => sum + (item.tongLuong || 0), 0),
      });

      totalRow.height = 30;
      totalRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const columnKey = summaryColumnDefinitions[colNumber - 1]?.key;

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF52C41A" },
        };
        cell.font = {
          ...DEFAULT_FONT,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
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
            "luongGio",
            "tongTienTangCa",
            "luongTheoNgay",
            "luongNgayCongChuaLam",
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
    }

    // Lưu file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Bang_Tinh_Luong_${
      monthYear ? removeVietnameseTones(monthYear.replace("/", "_")) : "Tat_Ca"
    }.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  } catch (error) {
    console.error("Lỗi khi xuất file Excel:", error);
    throw new Error("Không thể xuất file Excel: " + error.message);
  }
};
