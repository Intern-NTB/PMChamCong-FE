import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../assets/fonts/Roboto.js";

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
      for (let key in map) {
        if (map[key].includes(char.toLowerCase())) {
          return char === char.toUpperCase() ? key.toUpperCase() : key;
        }
      }
      return char;
    })
    .join("");
};

const formatCurrency = (value) => {
  if (value == null || value === 0) return "0 đ";
  return Math.round(value).toLocaleString("vi-VN") + " đ";
};

const calculateAmount = (value, unit, baseSalary) => {
  if (!value || value === 0) return 0;
  if (unit === "%") {
    return (baseSalary * value) / 100;
  }
  return value;
};

const createBonusRows = (bonusData, startIndex, baseSalary = 0) => {
  const rows = [];
  if (!bonusData || (Array.isArray(bonusData) && bonusData.length === 0)) {
    return [[`${startIndex}`, "Chi Tiết Lương Thưởng", "Không có thưởng"]];
  }

  rows.push([`${startIndex}`, "Chi Tiết Lương Thưởng", ""]);

  if (Array.isArray(bonusData)) {
    bonusData.forEach((bonus, index) => {
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
      }`;
      rows.push([
        `${startIndex}.${index + 1}`,
        bonusText,
        formatCurrency(bonusAmount),
      ]);
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
    }`;
    rows.push([`${startIndex}.1`, bonusText, formatCurrency(bonusAmount)]);
  }
  return rows;
};

const createPenaltyRows = (penaltyData, startIndex, baseSalary = 0) => {
  const rows = [];
  if (
    !penaltyData ||
    (Array.isArray(penaltyData) && penaltyData.length === 0)
  ) {
    return [[`${startIndex}`, "Chi Tiết Lương Trừ", "Khong có trừ"]];
  }

  rows.push([`${startIndex}`, "Chi Tiết Lương Trừ", ""]);

  if (Array.isArray(penaltyData)) {
    penaltyData.forEach((penalty, index) => {
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
          ? ` -${penalty.soTienTru || penalty.soTienTruKhac}%`
          : ""
      }`;
      rows.push([
        `${startIndex}.${index + 1}`,
        penaltyText,
        formatCurrency(penaltyAmount),
      ]);
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
        ? ` -${penaltyData.soTienTru || penaltyData.soTienTruKhac}%`
        : ""
    }`;
    rows.push([`${startIndex}.1`, penaltyText, formatCurrency(penaltyAmount)]);
  }
  return rows;
};

export const generateDetailedSalaryPDF = (
  employeeData,
  monthYear = "",
  duLieuThongTinTienQuyDoi = {},
  isBaoGomTienQuyDoiPhep = false
) => {
  if (!employeeData) {
    console.error("Không có dữ liệu nhân viên");
    return;
  }

  const doc = new jsPDF();
  const baseSalary = employeeData.luongCoBan || 0;
  const tienQuyDoi =
    duLieuThongTinTienQuyDoi[employeeData.maNhanVien]?.soTienQuyDoi || 0;
  const soNgayPhepSuDung =
    duLieuThongTinTienQuyDoi[employeeData.maNhanVien]?.soNgayPhepSuDung || 0;
  const soNgayPhepTichLuy =
    duLieuThongTinTienQuyDoi[employeeData.maNhanVien]?.soNgayPhepTichLuy || 0;

  // Tiêu đề
  doc.setFont("Roboto-Regular", "normal");
  doc.setFontSize(16);
  doc.text(
    `BẢNG TÍNH LƯƠNG THÁNG ${removeVietnameseTones(monthYear)}`,
    doc.internal.pageSize.getWidth() / 2,
    15,
    { align: "center" }
  );

  // Dữ liệu cơ bản
  const basicData = [
    ["STT", "Nội dung", "Giá trị"],
    ["1", "Họ và tên", employeeData.hoTen || "-"],
    ["2", "Mã nhân viên", employeeData.maNhanVien || "-"],
    ["3", "Phòng ban", employeeData.tenPhongBan || "-"],
    ["4", "Năm", employeeData.nam || "-"],
    ["5", "Tháng", employeeData.thang || "-"],
    ["6", "Lương cơ bản", formatCurrency(baseSalary)],
    ["7", "Số ngày công làm việc", employeeData.soNgayCong || 0],
    ["8", "Số ngày công chưa làm việc", employeeData.soNgayNghiTruLuong || 0],
    ["9", "Công chuẩn của tháng", employeeData.congChuanCuaThang || 0],
    [
      "10",
      "Tổng số ngày nghỉ",
      (employeeData.soNgayLe || 0) + (employeeData.soNgayNghi || 0),
    ],
    ["11", "Số ngày nghỉ lễ", employeeData.soNgayLe || 0],
    ["12", "Số ngày nghỉ có phép", employeeData.soNgayNghiCoPhep || 0],
    [
      "13",
      "Số ngày nghỉ không phép nhưng tính lương",
      (employeeData.soNgayNghiCoLuong || 0) -
        (employeeData.soNgayNghiCoPhep || 0),
    ],
    [
      "14",
      "Số ngày nghỉ trừ lương",
      (employeeData.soNgayNghi || 0) - (employeeData.soNgayNghiCoLuong || 0),
    ],
    ["15", "Số giờ tăng ca", employeeData.soGioTangCa || 0],
    ["16", "Hệ số tăng ca", employeeData.heSoTangCa || 0],
    ["17", "Lương giờ", formatCurrency(employeeData.luongGio || 0)],
    [
      "18",
      "Tổng tiền tăng ca",
      formatCurrency(employeeData.tongTienTangCa || 0),
    ],
    ["19", "Lương theo ngày", formatCurrency(employeeData.luongTheoNgay || 0)],
    [
      "20",
      "Lương ngày công chưa làm",
      formatCurrency(employeeData.tongSoTienNgayNghiTruLuong || 0),
    ],
    ["21", "Lương ngày nghỉ", formatCurrency(employeeData.luongNgayNghi || 0)],
    [
      "22",
      "Tổng tiền phụ cấp",
      formatCurrency(employeeData.tongTienPhuCap || 0),
    ],
    [
      "23",
      "Tổng lương",
      formatCurrency(
        (employeeData.tongTienPhuCap || 0) +
          (employeeData.luongTheoNgay || 0) +
          (employeeData.luongNgayNghi || 0) +
          (employeeData.tongTienTangCa || 0)
      ),
    ],
  ];

  let currentIndex = 24;
  let tableData = [...basicData];

  // Thêm thông tin tiền quy đổi phép nếu có
  if (isBaoGomTienQuyDoiPhep) {
    tableData.push([
      currentIndex.toString(),
      "Số ngày phép đã nghỉ",
      soNgayPhepSuDung.toString(),
    ]);
    currentIndex++;
    tableData.push([
      currentIndex.toString(),
      "Số ngày phép tích lũy",
      soNgayPhepTichLuy.toString(),
    ]);
    currentIndex++;
    tableData.push([
      currentIndex.toString(),
      "Số tiền phép quy đổi",
      formatCurrency(tienQuyDoi),
    ]);
    currentIndex++;
  }

  // Thêm thông tin thưởng
  const bonusRows = createBonusRows(
    employeeData.danhSachLichSuThuong,
    currentIndex,
    baseSalary
  );
  tableData = tableData.concat(bonusRows);
  currentIndex += bonusRows.length;

  // Tổng Lương Thưởng
  const totalBonusRow = [
    isBaoGomTienQuyDoiPhep ? "28" : "25",

    "Tổng Lương Thưởng",
    formatCurrency(employeeData.tienThuong || 0),
  ];
  tableData.push(totalBonusRow);
  currentIndex++;

  // Thêm thông tin phạt
  const penaltyRows = createPenaltyRows(
    employeeData.danhSachLichSuTru,
    isBaoGomTienQuyDoiPhep ? "29" : "26",
    baseSalary
  );
  tableData = tableData.concat(penaltyRows);
  currentIndex += penaltyRows.length;

  // Tổng Lương Trừ
  const totalPenaltyRow = [
    isBaoGomTienQuyDoiPhep ? "30" : "27",
    "Tổng Lương Trừ",
    formatCurrency(employeeData.tienTru || 0),
  ];
  tableData.push(totalPenaltyRow);
  currentIndex++;

  // Lương thực lãnh
  const finalSalaryAmount = isBaoGomTienQuyDoiPhep
    ? (employeeData.tongLuong || 0) + tienQuyDoi
    : employeeData.tongLuong || 0;
  const finalSalaryRow = [
    isBaoGomTienQuyDoiPhep ? "31" : "28",
    "Lương thực lãnh",
    formatCurrency(finalSalaryAmount),
  ];
  tableData.push(finalSalaryRow);

  autoTable(doc, {
    body: tableData,
    startY: 25,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      font: "Roboto-Regular",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15, fillColor: [169, 169, 169] },
      1: { halign: "left", cellWidth: 100 },
      2: { halign: "right", cellWidth: 75 },
    },
    didParseCell: (data) => {
      if (data.row.index === 0) {
        data.cell.styles.fillColor = [169, 169, 169];
        data.cell.styles.textColor = [255, 255, 255];
        return;
      }
      const cellText = data.row.cells[1]?.text?.[0];
      const isDetailHeader =
        cellText === "Chi Tiết Lương Thưởng" || cellText === "Chi Tiết Lương Trừ";
      if (isDetailHeader) {
        data.cell.styles.fillColor = [169, 169, 169];
        data.cell.styles.textColor = [255, 255, 255];
        return;
      }
      const isImportantRow = [
        "Tổng Lương Thưởng",
        "Tổng Lương Trừ",
        "Lương thực lãnh",
        "Số tiền phép quy đổi",
        "Tổng lương",
      ].includes(cellText);
      if (isImportantRow) {
        data.cell.styles.fillColor = [140, 40, 80];
        data.cell.styles.textColor = [255, 255, 255];
        return;
      }
      if (data.cell.text[0]?.includes(".")) {
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
    didDrawPage: () => {
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
    margin: { left: 10, right: 10 },
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(10);
  doc.text(
    `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
    10,
    pageHeight - 10
  );
  doc.text(
    `Trang 1/1`,
    doc.internal.pageSize.getWidth() - 20,
    pageHeight - 10,
    { align: "right" }
  );

  const fileName = `bang_tinh_luong_${removeVietnameseTones(
    (employeeData.hoTen || "nhan_vien").replace(/\s+/g, "_")
  )}_${removeVietnameseTones(monthYear.replace("/", "-")) || "thang"}.pdf`;
  doc.save(fileName);
};

export const generateMultipleDetailedPDFs = async (
  employeesData,
  monthYear = "",
  duLieuThongTinTienQuyDoi = {},
  isBaoGomTienQuyDoiPhep = false
) => {
  if (!employeesData || employeesData.length === 0) {
    console.error("Không có dữ liệu nhân viên");
    return;
  }

  for (let i = 0; i < employeesData.length; i++) {
    generateDetailedSalaryPDF(
      employeesData[i],
      monthYear,
      duLieuThongTinTienQuyDoi,
      isBaoGomTienQuyDoiPhep
    );
    // Delay để tránh tải quá nặng
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

export const generateSinglePDFMultiplePages = (
  employeesData,
  monthYear = "",
  duLieuThongTinTienQuyDoi = {},
  isBaoGomTienQuyDoiPhep = false
) => {
  if (!employeesData || employeesData.length === 0) {
    console.error("Không có dữ liệu nhân viên");
    return;
  }

  const doc = new jsPDF();

  employeesData.forEach((employeeData, index) => {
    if (index > 0) doc.addPage();

    const baseSalary = employeeData.luongCoBan || 0;
    const tienQuyDoi =
      duLieuThongTinTienQuyDoi[employeeData.maNhanVien]?.soTienQuyDoi || 0;
    const soNgayPhepSuDung =
      duLieuThongTinTienQuyDoi[employeeData.maNhanVien]?.soNgayPhepSuDung || 0;
    const soNgayPhepTichLuy =
      duLieuThongTinTienQuyDoi[employeeData.maNhanVien]?.soNgayPhepTichLuy || 0;

    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(16);
    doc.text(
      `BẢNG TÍNH LƯƠNG THÁNG ${removeVietnameseTones(monthYear)}`,
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    const basicData = [
      ["STT", "Nội dung", "Giá trị"],
      ["1", "Họ và tên", employeeData.hoTen || "-"],
      ["2", "Mã nhân viên", employeeData.maNhanVien || "-"],
      ["3", "Phòng ban", employeeData.tenPhongBan || "-"],
      ["4", "Năm", employeeData.nam || "-"],
      ["5", "Tháng", employeeData.thang || "-"],
      ["6", "Lương cơ bản", formatCurrency(baseSalary)],
      ["7", "Số ngày công làm việc", employeeData.soNgayCong || 0],
      ["8", "Số ngày công chưa làm việc", employeeData.soNgayNghiTruLuong || 0],
      ["9", "Công chuẩn của tháng", employeeData.congChuanCuaThang || 0],
      [
        "10",
        "Tổng số ngày nghỉ",
        (employeeData.soNgayLe || 0) + (employeeData.soNgayNghi || 0),
      ],
      ["11", "Số ngày nghỉ lễ", employeeData.soNgayLe || 0],
      ["12", "Số ngày nghỉ có phép", employeeData.soNgayNghiCoPhep || 0],
      [
        "13",
        "Số ngày nghỉ không phép nhưng tính lương",
        (employeeData.soNgayNghiCoLuong || 0) -
          (employeeData.soNgayNghiCoPhep || 0),
      ],
      [
        "14",
        "Số ngày nghỉ trừ lương",
        (employeeData.soNgayNghi || 0) - (employeeData.soNgayNghiCoLuong || 0),
      ],
      ["15", "Số giờ tăng ca", employeeData.soGioTangCa || 0],
      ["16", "Hệ số tăng ca", employeeData.heSoTangCa || 0],
      ["17", "Lương giờ", formatCurrency(employeeData.luongGio || 0)],
      [
        "18",
        "Tổng tiền tăng ca",
        formatCurrency(employeeData.tongTienTangCa || 0),
      ],
      [
        "19",
        "Lương theo ngày",
        formatCurrency(employeeData.luongTheoNgay || 0),
      ],
      [
        "20",
        "Lương ngày công chưa làm",
        formatCurrency(employeeData.tongSoTienNgayNghiTruLuong || 0),
      ],
      [
        "21",
        "Lương ngày nghỉ",
        formatCurrency(employeeData.luongNgayNghi || 0),
      ],
      [
        "22",
        "Tổng tiền phụ cấp",
        formatCurrency(employeeData.tongTienPhuCap || 0),
      ],
      [
        "23",
        "Tổng lương",
        formatCurrency(
          (employeeData.tongTienPhuCap || 0) +
            (employeeData.luongTheoNgay || 0) +
            (employeeData.luongNgayNghi || 0) +
            (employeeData.tongTienTangCa || 0)
        ),
      ],
    ];

    let currentIndex = 24;
    let tableData = [...basicData];

    // Thêm thông tin tiền quy đổi phép nếu có
    if (isBaoGomTienQuyDoiPhep) {
      tableData.push([
        currentIndex.toString(),
        "Số ngày phép đã nghỉ",
        soNgayPhepSuDung.toString(),
      ]);
      currentIndex++;
      tableData.push([
        currentIndex.toString(),
        "Số ngày phép tích lũy",
        soNgayPhepTichLuy.toString(),
      ]);
      currentIndex++;
      tableData.push([
        currentIndex.toString(),
        "Số tiền phép quy đổi",
        formatCurrency(tienQuyDoi),
      ]);
      currentIndex++;
    }

    // Thêm thông tin thưởng
    const bonusRows = createBonusRows(
      employeeData.danhSachLichSuThuong,
      currentIndex,
      baseSalary
    );
    tableData = tableData.concat(bonusRows);
    currentIndex += bonusRows.length;

    // Tổng Lương Thưởng
    const totalBonusRow = [
      isBaoGomTienQuyDoiPhep ? "28" : "25",

      "Tổng Lương Thưởng",
      formatCurrency(employeeData.tienThuong || 0),
    ];
    tableData.push(totalBonusRow);
    currentIndex++;

    // Thêm thông tin phạt
    const penaltyRows = createPenaltyRows(
      employeeData.danhSachLichSuTru,
      isBaoGomTienQuyDoiPhep ? "29" : "26",
      baseSalary
    );
    tableData = tableData.concat(penaltyRows);
    currentIndex += penaltyRows.length;

    // Tổng Lương Trừ
    const totalPenaltyRow = [
      isBaoGomTienQuyDoiPhep ? "30" : "27",
      "Tổng Lương Trừ",
      formatCurrency(employeeData.tienTru || 0),
    ];
    tableData.push(totalPenaltyRow);
    currentIndex++;

    // Lương thực lãnh
    const finalSalaryAmount = isBaoGomTienQuyDoiPhep
      ? (employeeData.tongLuong || 0) + tienQuyDoi
      : employeeData.tongLuong || 0;
    const finalSalaryRow = [
      isBaoGomTienQuyDoiPhep ? "31" : "28",
      "Lương thực lãnh",
      formatCurrency(finalSalaryAmount),
    ];
    tableData.push(finalSalaryRow);

    autoTable(doc, {
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        font: "Roboto-Regular",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15, fillColor: [169, 169, 169] },
        1: { halign: "left", cellWidth: 100 },
        2: { halign: "right", cellWidth: 75 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [169, 169, 169];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }
        const cellText = data.row.cells[1]?.text?.[0];
        const isDetailHeader =
          cellText === "Chi Tiết Lương Thưởng" || cellText === "Chi Tiết Lương Trừ";
        if (isDetailHeader) {
          data.cell.styles.fillColor = [169, 169, 169];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }
        const isImportantRow = [
          "Tổng Lương Thưởng",
          "Tổng Lương Trừ",
          "Lương thực lãnh",
          "Tổng lương",
          "Số tiền phép quy đổi",
        ].includes(cellText);
        if (isImportantRow) {
          data.cell.styles.fillColor = [140, 40, 80];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }
        if (data.cell.text[0]?.includes(".")) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
      },
      didDrawPage: () => {
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
      margin: { left: 10, right: 10 },
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(
      `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
      10,
      pageHeight - 10
    );
    doc.text(
      `Trang ${index + 1}/${employeesData.length}`,
      doc.internal.pageSize.getWidth() - 20,
      pageHeight - 10,
      { align: "right" }
    );
  });

  const fileName = `bang_tinh_luong_tat_ca_${
    removeVietnameseTones(monthYear.replace("/", "-")) || "thang"
  }.pdf`;
  doc.save(fileName);
};
