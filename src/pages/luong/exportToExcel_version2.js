import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

const formatCurrency = (value) => {
  if (value == null || value === 0) return "0";
  return Math.round(value).toLocaleString("vi-VN") + " đ";
};

export const generateSummaryPDFHandler = (
  selectedData,
  selectedMonthYear = "",
  duLieuThongTinTienQuyDoi = {},
  isBaoGomTienQuyDoiPhep = false
) => {
  if (!selectedData || selectedData.length === 0) {
    console.error("Không có dữ liệu được chọn");
    return;
  }

  const doc = new jsPDF();

  // Tiêu đề
  doc.setFont("Roboto-Regular", "normal");
  doc.setFontSize(16);
  doc.text(
    `BẢNG TỔNG HỢP LƯƠNG THÁNG ${removeVietnameseTones(selectedMonthYear)}`,
    doc.internal.pageSize.getWidth() / 2,
    15,
    { align: "center" }
  );

  // Tạo dữ liệu cho bảng tổng hợp
  const summaryData = [
    [
      "STT",
      "Họ tên",
      "Mã NV",
      "Phòng ban",
      "Lương cơ bản",
      "Tổng lương cơ bản",
      "Tiền thưởng",
      "Tiền phạt",
      "Thực lãnh",
    ],
  ];

  selectedData.forEach((employee, index) => {
    const baseSalary = employee.luongCoBan || 0;
    const tienThuong = employee.tienThuong || 0;
    const tienTru = employee.tienTru || 0;
    const tongLuongCoBan =
      (employee.tongTienPhuCap || 0) +
      (employee.luongTheoNgay || 0) +
      (employee.luongNgayNghi || 0) +
      (employee.tongTienTangCa || 0);
    const tienQuyDoi = isBaoGomTienQuyDoiPhep
      ? duLieuThongTinTienQuyDoi[employee.maNhanVien]?.soTienQuyDoi || 0
      : 0;
    const thucLanh = tongLuongCoBan + tienThuong - tienTru + tienQuyDoi;

    summaryData.push([
      (index + 1).toString(),
      employee.hoTen || "-",
      employee.maNhanVien || "-",
      employee.tenPhongBan || "-",
      formatCurrency(baseSalary),
      formatCurrency(tongLuongCoBan),
      formatCurrency(tienThuong),
      formatCurrency(tienTru),
      formatCurrency(thucLanh),
    ]);
  });

  // Thêm dòng tổng cộng
  const totalBaseSalary = selectedData.reduce(
    (sum, emp) => sum + (emp.luongCoBan || 0),
    0
  );
  const totalTongLuongCoBan = selectedData.reduce(
    (sum, emp) =>
      sum +
      ((emp.tongTienPhuCap || 0) +
        (emp.luongTheoNgay || 0) +
        (emp.luongNgayNghi || 0) +
        (emp.tongTienTangCa || 0)),
    0
  );
  const totalBonus = selectedData.reduce(
    (sum, emp) => sum + (emp.tienThuong || 0),
    0
  );
  const totalPenalty = selectedData.reduce(
    (sum, emp) => sum + (emp.tienTru || 0),
    0
  );
  const totalQuyDoi = isBaoGomTienQuyDoiPhep
    ? selectedData.reduce(
        (sum, emp) =>
          sum + (duLieuThongTinTienQuyDoi[emp.maNhanVien]?.soTienQuyDoi || 0),
        0
      )
    : 0;
  const totalThucLanh =
    totalTongLuongCoBan + totalBonus - totalPenalty + totalQuyDoi;

  summaryData.push([
    "",
    "TỔNG CỘNG",
    "",
    "",
    formatCurrency(totalBaseSalary),
    formatCurrency(totalTongLuongCoBan),
    formatCurrency(totalBonus),
    formatCurrency(totalPenalty),
    formatCurrency(totalThucLanh),
  ]);

  autoTable(doc, {
    body: summaryData,
    startY: 25,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      font: "Roboto-Regular",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "left", cellWidth: 35 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "left", cellWidth: 25 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "right", cellWidth: 25 },
      6: { halign: "right", cellWidth: 25 },
      7: { halign: "right", cellWidth: 25 },
      8: { halign: "right", cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (data.row.index === 0) {
        data.cell.styles.fillColor = [169, 169, 169];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
        return;
      }
      if (data.row.index === summaryData.length - 1) {
        data.cell.styles.fillColor = [140, 40, 80];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
        return;
      }
      if (data.row.index % 2 === 0) {
        data.cell.styles.fillColor = [245, 245, 245];
      }
      if ([4, 5, 6, 7, 8].includes(data.column.index)) {
        data.cell.styles.fontStyle = "bold"; // Làm nổi bật các cột tiền
      }
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(
        `Trang ${data.pageNumber}/${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      doc.saveGraphicsState();
      doc.setFontSize(65);
      doc.setTextColor(12, 67, 110);
      doc.setFont("helvetica", "bold");
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.text("Công ty Manor", centerX, centerY, { align: "center" });
      doc.restoreGraphicsState();
    },
    theme: "grid",
    tableWidth: "auto",
    margin: { left: 5, right: 5 },
  });

  // Thêm thông tin thống kê
  const finalY = (doc.lastAutoTable?.finalY || 25) + 10;
  doc.setFontSize(12);
  doc.setFont("Roboto-Regular", "bold");
  doc.text("THỐNG KÊ TỔNG HỢP:", 10, finalY);

  doc.setFont("Roboto-Regular", "normal");
  doc.setFontSize(10);
  doc.text(`Tổng số nhân viên: ${selectedData.length}`, 10, finalY + 10);
  doc.text(
    `Tổng lương cơ bản: ${formatCurrency(totalBaseSalary)}`,
    10,
    finalY + 20
  );
  doc.text(`Tổng tiền thưởng: ${formatCurrency(totalBonus)}`, 10, finalY + 30);
  doc.text(`Tổng tiền phạt: ${formatCurrency(totalPenalty)}`, 10, finalY + 40);
  if (isBaoGomTienQuyDoiPhep) {
    doc.text(
      `Tổng tiền quy đổi phép: ${formatCurrency(totalQuyDoi)}`,
      10,
      finalY + 50
    );
  }
  doc.text(
    `Tổng thực lãnh: ${formatCurrency(totalThucLanh)}`,
    10,
    finalY + (isBaoGomTienQuyDoiPhep ? 60 : 50)
  );

  // Footer
  doc.text(
    `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
    10,
    doc.internal.pageSize.getHeight() - 20
  );

  const fileName = `bang_tong_hop_luong_${
    removeVietnameseTones(selectedMonthYear.replace("/", "-")) || "thang"
  }.pdf`;
  doc.save(fileName);
};

// Hàm tính toán số tiền dựa trên đơn vị
const calculateAmount = (value, unit, baseSalary) => {
  if (!value || value === 0) return 0;

  if (unit === "%") {
    // Nếu đơn vị là %, tính phần trăm của lương cơ bản
    return (baseSalary * value) / 100;
  } else {
    // Nếu không phải %, trả về giá trị gốc (số tiền cố định)
    return value;
  }
};
// Hàm tạo text chi tiết thưởng
const createBonusDetailText = (bonusData, baseSalary = 0) => {
  if (!bonusData) {
    return "Không có thưởng";
  }

  const details = [];

  if (Array.isArray(bonusData)) {
    bonusData.forEach((bonus) => {
      let bonusAmount = 0;

      if (bonus.soTienThuongKhac && bonus.soTienThuongKhac > 0) {
        bonusAmount = calculateAmount(
          bonus.soTienThuongKhac,
          bonus.donViThuongKhac || bonus.donVi,
          baseSalary
        );
      } else if (bonus.soTienThuong) {
        bonusAmount = calculateAmount(
          bonus.soTienThuong,
          bonus.donViThuong || bonus.donVi,
          baseSalary
        );
      }

      const bonusText = `${bonus.tenLoaiTienThuong || "Thưởng khác"}${
        bonus.lyDo ? ` (${bonus.lyDo})` : ""
      }${
        bonus.donVi === "%"
          ? ` - ${bonus.soTienThuong || bonus.soTienThuongKhac}%`
          : ""
      }: ${formatCurrency(bonusAmount)}`;

      details.push(bonusText);
    });
  } else {
    let bonusAmount = 0;

    if (bonusData.soTienThuongKhac && bonusData.soTienThuongKhac > 0) {
      bonusAmount = calculateAmount(
        bonusData.soTienThuongKhac,
        bonusData.donViThuongKhac || bonusData.donVi,
        baseSalary
      );
    } else if (bonusData.soTienThuong) {
      bonusAmount = calculateAmount(
        bonusData.soTienThuong,
        bonusData.donViThuong || bonusData.donVi,
        baseSalary
      );
    }

    const bonusText = `${bonusData.tenLoaiTienThuong || "Thưởng khác"}${
      bonusData.lyDo ? ` (${bonusData.lyDo})` : ""
    }${
      bonusData.donVi === "%"
        ? ` - ${bonusData.soTienThuong || bonusData.soTienThuongKhac}%`
        : ""
    }: ${formatCurrency(bonusAmount)}`;

    details.push(bonusText);
  }

  return details.join("\n");
};

// Hàm tạo text chi tiết phạt
const createPenaltyDetailText = (penaltyData, baseSalary = 0) => {
  if (!penaltyData) {
    return "Không có phạt";
  }

  const details = [];

  if (Array.isArray(penaltyData)) {
    penaltyData.forEach((penalty) => {
      let penaltyAmount = 0;

      if (penalty.soTienTruKhac && penalty.soTienTruKhac > 0) {
        penaltyAmount = calculateAmount(
          penalty.soTienTruKhac,
          penalty.donViTruKhac || penalty.donVi,
          baseSalary
        );
      } else if (penalty.soTienTru) {
        penaltyAmount = calculateAmount(
          penalty.soTienTru,
          penalty.donViTru || penalty.donVi,
          baseSalary
        );
      }

      const penaltyText = `${penalty.tenLoaiTienTru || "Phạt khác"}${
        penalty.liDo ? ` (${penalty.liDo})` : ""
      }${
        penalty.donVi === "%"
          ? ` - ${penalty.soTienTru || penalty.soTienTruKhac}%`
          : ""
      }: ${formatCurrency(penaltyAmount)}`;

      details.push(penaltyText);
    });
  } else {
    let penaltyAmount = 0;

    if (penaltyData.soTienTruKhac && penaltyData.soTienTruKhac > 0) {
      penaltyAmount = calculateAmount(
        penaltyData.soTienTruKhac,
        penaltyData.donViTruKhac || penaltyData.donVi,
        baseSalary
      );
    } else if (penaltyData.soTienTru) {
      penaltyAmount = calculateAmount(
        penaltyData.soTienTru,
        penaltyData.donViTru || penaltyData.donVi,
        baseSalary
      );
    }

    const penaltyText = `${penaltyData.tenLoaiTienTru || "Phạt khác"}${
      penaltyData.liDo ? ` (${penaltyData.liDo})` : ""
    }${
      penaltyData.donVi === "%"
        ? ` - ${penaltyData.soTienTru || penaltyData.soTienTruKhac}%`
        : ""
    }: ${formatCurrency(penaltyAmount)}`;

    details.push(penaltyText);
  }

  return details.join("\n");
};

export const exportToExcel = async (
  data,
  monthYear = "",
  tenPhongBan = null,
  isDetail = false,
  duLieuThongTinTienQuyDoi,
  isHaveTienQuyDoi = false
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
        { key: "soGioTangCa", width: 12, header: "(7)\nSố Giờ Tăng Ca" },
        { key: "heSoTangCa", width: 12, header: "(8)\nHệ Số Tăng Ca" },
        { key: "tongTienPhuCap", width: 15, header: "(9)\nTổng Tiền Phụ Cấp" },

        // === CHI TIẾT THƯỞNG VÀ PHẠT ===
        {
          key: "danhSachLichSuThuong",
          width: 50,
          header: "(10)\nChi Tiết Lương Thưởng",
        },
        { key: "tienThuong", width: 15, header: "(11)\nTổng Tiền Thưởng" },
        { key: "danhSachLichSuTru", width: 50, header: "(12)\nChi Tiết Lương Trừ" },
        { key: "tienTru", width: 15, header: "(13)\nTổng Lương Trừ" },

        // === CÁC CÔNG THỨC TÍNH (cập nhật số thứ tự) ===
        { key: "luongGio", width: 12, header: "(14)\nLương Giờ\n(1)/(3)/8" },
        {
          key: "soNgayNghi",
          width: 12,
          header: "(15)\nSố Ngày Nghỉ Tính Lương\n(4)+(5)+(6)",
        },
        {
          key: "tongTienTangCa",
          width: 15,
          header: "(16)\nTổng Tiền Tăng Ca\n(7)*(14)+((7)*(8)*(14))",
        },
        {
          key: "luongNgayNghi",
          width: 15,
          header: "(17)\nLương Ngày Nghỉ\n(14)*8*((4)+(5)+(6))",
        },
        {
          key: "luongNgayCongChuaLam",
          width: 15,
          header: "(18)\nLương Ngày Công Chưa Làm\n(14)*8*((3)-(2)-(15))",
        },
        {
          key: "luongTheoNgay",
          width: 15,
          header: "(19)\nLương Theo Ngày\n(2)*(14)*8",
        },
        {
          key: "tongLuongCoBan",
          width: 15,
          header: "(20)\nTổng Lương Cơ Bản\n(9)+(16)+(17)+(19)",
        },
      ];

      // Thêm cột tiền quy đổi nếu cần
      if (isHaveTienQuyDoi) {
        summaryColumnDefinitions.push({
          key: "soNgayPhepSuDung",
          width: 15,
          header: "(21)\nSố ngày phép đã nghỉ",
        });
        summaryColumnDefinitions.push({
          key: "soNgayPhepTichLuy",
          width: 15,
          header: "(22)\nSố ngày phép tích luỹ",
        });
        summaryColumnDefinitions.push({
          key: "soTienQuyDoi",
          width: 15,
          header: "(23)\nSố tiền phép quy đổi",
        });
        summaryColumnDefinitions.push({
          key: "tongLuong",
          width: 15,
          header: "(22)\nTổng Lương\n(20)+(11)-(13)+(21)",
        });
      } else {
        summaryColumnDefinitions.push({
          key: "tongLuong",
          width: 15,
          header: "(21)\nTổng Lương\n(20)+(11)-(13)",
        });
      }

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
        const tienQuyDoi =
          duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soTienQuyDoi || 0;

        const soNgayPhepSuDung =
          duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soNgayPhepSuDung || 0;
        const soNgayPhepTichLuy =
          duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soNgayPhepTichLuy || 0;

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
          soNgayNghi:
            item.soNgayNghi +
              item.soNgayLe -
              ((item.soNgayNghi || 0) - (item.soNgayNghiCoLuong || 0)) || 0,
          soNgayLe: item.soNgayLe || 0,
          soNgayNghiCoPhep: item.soNgayNghiCoPhep || 0,
          soNgayNghiKhongPhepNhungTinhLuong:
            (item.soNgayNghiCoLuong || 0) - (item.soNgayNghiCoPhep || 0),
          soGioTangCa: item.soGioTangCa || 0,
          heSoTangCa: item.heSoTangCa || 0,
          luongGio: item.luongGio || 0,
          tongTienTangCa: item.tongTienTangCa || 0,
          luongTheoNgay: item.luongTheoNgay || 0,
          luongNgayCongChuaLam: item.tongSoTienNgayNghiTruLuong || 0,
          luongNgayNghi: item.luongNgayNghi || 0,
          tongTienPhuCap: item.tongTienPhuCap || 0,

          // Thêm chi tiết thưởng và phạt
          danhSachLichSuThuong: createBonusDetailText(
            item.danhSachLichSuThuong,
            item.luongCoBan
          ),
          tienThuong: item.tienThuong || 0,
          danhSachLichSuTru: createPenaltyDetailText(
            item.danhSachLichSuTru,
            item.luongCoBan
          ),
          tienTru: item.tienTru || 0,

          tongLuongCoBan:
            (item.tongTienPhuCap || 0) +
            (item.luongTheoNgay || 0) +
            (item.luongNgayNghi || 0) +
            (item.tongTienTangCa || 0),
          soNgayPhepSuDung: soNgayPhepSuDung,
          soNgayPhepTichLuy: soNgayPhepTichLuy,
          soTienQuyDoi: tienQuyDoi,
          tongLuong: isHaveTienQuyDoi
            ? tienQuyDoi + item.tongLuong || 0
            : item.tongLuong || 0,
        });

        row.height = 40; // Tăng chiều cao để hiển thị chi tiết

        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const columnKey = summaryColumnDefinitions[colNumber - 1]?.key;

          // Căn giữa tất cả các cell
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

          // Format số cho các cột tiền (vẫn căn giữa)
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
              "soNgayPhepSuDung",
              "soNgayPhepTichLuy",
              "soTienQuyDoi",
              "tongLuong",
            ].includes(columnKey)
          ) {
            cell.numFmt = "#,##0";
            // Không cần thay đổi alignment, vẫn giữ căn giữa
          }

          // Màu nền xen kẽ
          if (index % 2 === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8F9FA" },
            };
          }

          // Highlight tổng lương
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

          // Highlight chi tiết thưởng và phạt
          if (
            ["danhSachLichSuThuong", "danhSachLichSuTru"].includes(columnKey)
          ) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFEF7E6" },
            };
            cell.font = {
              ...DEFAULT_FONT,
              size: 10, // Font nhỏ hơn cho chi tiết
            };
          }
        });
      });

      // Tạo dòng tổng cộng
      const totalRowData = {
        maNhanVien: "",
        hoTen: "TỔNG CỘNG",
        tenPhongBan: "",
        nam: "",
        thang: "",
        luongCoBan: data.reduce((sum, item) => sum + (item.luongCoBan || 0), 0),
        soNgayCong: data.reduce((sum, item) => sum + (item.soNgayCong || 0), 0),
        congChuanCuaThang: "",
        soNgayNghi: data.reduce(
          (sum, item) =>
            sum +
            ((item.soNgayNghi || 0) +
              (item.soNgayLe || 0) -
              ((item.soNgayNghi || 0) - (item.soNgayNghiCoLuong || 0))),
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
        danhSachLichSuThuong: "---", // Không tính tổng chi tiết
        tienThuong: data.reduce((sum, item) => sum + (item.tienThuong || 0), 0),
        danhSachLichSuTru: "---", // Không tính tổng chi tiết
        tienTru: data.reduce((sum, item) => sum + (item.tienTru || 0), 0),
        tongLuong: data.reduce((sum, item) => sum + (item.tongLuong || 0), 0),
        soNgayPhepSuDung: "",
        soNgayPhepTichLuy: "",
      };

      // Thêm cột tiền quy đổi cho tổng nếu cần
      if (isHaveTienQuyDoi) {
        totalRowData.soTienQuyDoi = data.reduce((sum, item) => {
          const tienQuyDoi =
            duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soTienQuyDoi || 0;
          return sum + tienQuyDoi;
        }, 0);

        // Tính lại tổng lương có bao gồm tiền quy đổi
        totalRowData.tongLuong = data.reduce((sum, item) => {
          const tienQuyDoi =
            duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soTienQuyDoi || 0;
          return sum + (item.tongLuong || 0) + tienQuyDoi;
        }, 0);
      }

      const totalRow = worksheet.addRow(totalRowData);

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
        // Căn giữa tất cả các cell
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
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
            "soTienQuyDoi",
            "tongLuong",
          ].includes(columnKey)
        ) {
          cell.numFmt = "#,##0";
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

export const exportIndividualToExcel = async (
  data,
  monthYear = "",
  isDetail = false,
  duLieuThongTinTienQuyDoi,
  isHaveTienQuyDoi = false
) => {
  try {
    for (const item of data) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        isDetail ? "Bảng Lương Chi Tiết" : "Bảng Lương Cá Nhân"
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

        // Định nghĩa cột cho bảng cá nhân (giống exportToExcel)
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
          { key: "soGioTangCa", width: 12, header: "(7)\nSố Giờ Tăng Ca" },
          { key: "heSoTangCa", width: 12, header: "(8)\nHệ Số Tăng Ca" },
          {
            key: "tongTienPhuCap",
            width: 15,
            header: "(9)\nTổng Tiền Phụ Cấp",
          },

          // === CHI TIẾT THƯỞNG VÀ PHẠT ===
          {
            key: "danhSachLichSuThuong",
            width: 50,
            header: "(10)\nChi Tiết Lương Thưởng",
          },
          { key: "tienThuong", width: 15, header: "(11)\nTổng Tiền Thưởng" },
          {
            key: "danhSachLichSuTru",
            width: 50,
            header: "(12)\nChi Tiết Lương Trừ",
          },
          { key: "tienTru", width: 15, header: "(13)\nTổng Lương Trừ" },

          // === CÁC CÔNG THỨC TÍNH (cập nhật số thứ tự) ===
          { key: "luongGio", width: 12, header: "(14)\nLương Giờ\n(1)/(3)/8" },
          {
            key: "soNgayNghi",
            width: 12,
            header: "(15)\nSố Ngày Nghỉ Tính Lương\n(4)+(5)+(6)",
          },
          {
            key: "tongTienTangCa",
            width: 15,
            header: "(16)\nTổng Tiền Tăng Ca\n(7)*(14)+((7)*(8)*(14))",
          },
          {
            key: "luongNgayNghi",
            width: 15,
            header: "(17)\nLương Ngày Nghỉ\n(14)*8*((4)+(5)+(6))",
          },
          {
            key: "luongNgayCongChuaLam",
            width: 15,
            header: "(18)\nLương Ngày Công Chưa Làm\n(14)*8*((3)-(2)-(15))",
          },
          {
            key: "luongTheoNgay",
            width: 15,
            header: "(19)\nLương Theo Ngày\n(2)*(14)*8",
          },
          {
            key: "tongLuongCoBan",
            width: 15,
            header: "(20)\nTổng Lương Cơ Bản\n(9)+(16)+(17)+(19)",
          },
        ];

        // Thêm cột tiền quy đổi nếu cần
        if (isHaveTienQuyDoi) {
          summaryColumnDefinitions.push({
            key: "soNgayPhepSuDung",
            width: 15,
            header: "(21)\nSố ngày phép đã nghỉ",
          });
          summaryColumnDefinitions.push({
            key: "soNgayPhepTichLuy",
            width: 15,
            header: "(22)\nSố ngày phép tích luỹ",
          });
          summaryColumnDefinitions.push({
            key: "soTienQuyDoi",
            width: 15,
            header: "(23)\nSố tiền phép quy đổi",
          });
          summaryColumnDefinitions.push({
            key: "tongLuong",
            width: 15,
            header: "(24)\nTổng Lương\n(20)+(11)-(13)+(23)",
          });
        } else {
          summaryColumnDefinitions.push({
            key: "tongLuong",
            width: 15,
            header: "(21)\nTổng Lương\n(20)+(11)-(13)",
          });
        }

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
        titleCell.value = `BẢNG LƯƠNG CÁ NHÂN THÁNG ${monthYear || "-"}`;
        titleCell.font = {
          ...DEFAULT_FONT,
          size: 18,
          bold: true,
          color: { argb: "FF1890FF" },
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getRow(2).height = 35;

        // Thông tin nhân viên
        worksheet.getCell("A3").value = `Nhân viên: ${item.hoTen} | Mã NV: ${
          item.maNhanVien
        } | Phòng ban: ${item.tenPhongBan || "Không có"}`;
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

        // Headers cho bảng cá nhân
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

        // Thêm dữ liệu cho nhân viên
        const tienQuyDoi =
          duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soTienQuyDoi || 0;

        const soNgayPhepSuDung =
          duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soNgayPhepSuDung || 0;
        const soNgayPhepTichLuy =
          duLieuThongTinTienQuyDoi?.[item.maNhanVien]?.soNgayPhepTichLuy || 0;

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
          soNgayNghi:
            item.soNgayNghi +
              item.soNgayLe -
              ((item.soNgayNghi || 0) - (item.soNgayNghiCoLuong || 0)) || 0,
          soNgayLe: item.soNgayLe || 0,
          soNgayNghiCoPhep: item.soNgayNghiCoPhep || 0,
          soNgayNghiKhongPhepNhungTinhLuong:
            (item.soNgayNghiCoLuong || 0) - (item.soNgayNghiCoPhep || 0),
          soGioTangCa: item.soGioTangCa || 0,
          heSoTangCa: item.heSoTangCa || 0,
          luongGio: item.luongGio || 0,
          tongTienTangCa: item.tongTienTangCa || 0,
          luongTheoNgay: item.luongTheoNgay || 0,
          luongNgayCongChuaLam: item.tongSoTienNgayNghiTruLuong || 0,
          luongNgayNghi: item.luongNgayNghi || 0,
          tongTienPhuCap: item.tongTienPhuCap || 0,

          // Thêm chi tiết thưởng và phạt
          danhSachLichSuThuong: createBonusDetailText(
            item.danhSachLichSuThuong,
            item.luongCoBan
          ),
          tienThuong: item.tienThuong || 0,
          danhSachLichSuTru: createPenaltyDetailText(
            item.danhSachLichSuTru,
            item.luongCoBan
          ),
          tienTru: item.tienTru || 0,

          tongLuongCoBan:
            (item.tongTienPhuCap || 0) +
            (item.luongTheoNgay || 0) +
            (item.luongNgayNghi || 0) +
            (item.tongTienTangCa || 0),
          soNgayPhepSuDung: soNgayPhepSuDung,
          soNgayPhepTichLuy: soNgayPhepTichLuy,
          soTienQuyDoi: tienQuyDoi,
          tongLuong: isHaveTienQuyDoi
            ? tienQuyDoi + item.tongLuong || 0
            : item.tongLuong || 0,
        });

        row.height = 40; // Tăng chiều cao để hiển thị chi tiết

        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const columnKey = summaryColumnDefinitions[colNumber - 1]?.key;

          // Căn giữa tất cả các cell
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

          // Format số cho các cột tiền (vẫn căn giữa)
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
              "soNgayPhepSuDung",
              "soNgayPhepTichLuy",
              "soTienQuyDoi",
              "tongLuong",
            ].includes(columnKey)
          ) {
            cell.numFmt = "#,##0";
            // Không cần thay đổi alignment, vẫn giữ căn giữa
          }

          // Highlight tổng lương
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

          // Highlight chi tiết thưởng và phạt
          if (
            ["danhSachLichSuThuong", "danhSachLichSuTru"].includes(columnKey)
          ) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFEF7E6" },
            };
            cell.font = {
              ...DEFAULT_FONT,
              size: 10, // Font nhỏ hơn cho chi tiết
            };
          }
        });
      }

      // Lưu file Excel cho từng nhân viên
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Bang_Luong_Ca_Nhan_${removeVietnameseTones(
        item.hoTen
      )}_${
        monthYear
          ? removeVietnameseTones(monthYear.replace("/", "_"))
          : "Tat_Ca"
      }.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    }
  } catch (error) {
    console.error("Lỗi khi xuất file Excel cá nhân:", error);
    throw new Error("Không thể xuất file Excel cá nhân: " + error.message);
  }
};
