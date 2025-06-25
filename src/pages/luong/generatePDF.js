import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../assets/fonts/Roboto.js";

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

const formatCurrency = (value) => {
  if (value == null || value === 0) return "0";
  return Math.round(value).toLocaleString("vi-VN") + " đ";
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

// Hàm tạo các dòng chi tiết thưởng (đã cập nhật)
const createBonusRows = (bonusData, startIndex, baseSalary = 0) => {
  const rows = [];
  if (!bonusData) {
    return [[`${startIndex}`, "Chi tiết Thưởng", "Không có thưởng"]];
  }

  // Dòng tiêu đề
  rows.push([`${startIndex}`, "Chi tiết Thưởng", ""]);

  // Nếu là array (nhiều loại thưởng)
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
  }
  // Nếu là object (một loại thưởng)
  else {
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

// Hàm tạo các dòng chi tiết phạt (đã cập nhật)
const createPenaltyRows = (penaltyData, startIndex, baseSalary = 0) => {
  const rows = [];

  if (!penaltyData) {
    return [[`${startIndex}`, "Chi tiết Phạt", "Không có phạt"]];
  }

  // Dòng tiêu đề
  rows.push([`${startIndex}`, "Chi tiết Phạt", ""]);

  // Nếu là array (nhiều loại phạt)
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
          ? ` - ${penalty.soTienTru || penalty.soTienTruKhac}%`
          : ""
      }`;

      rows.push([
        `${startIndex}.${index + 1}`,
        penaltyText,
        formatCurrency(penaltyAmount),
      ]);
    });
  }
  // Nếu là object (một loại phạt)
  else {
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
    }`;

    rows.push([`${startIndex}.1`, penaltyText, formatCurrency(penaltyAmount)]);
  }

  return rows;
};

// Function xuất PDF chi tiết cho 1 nhân viên
export const generateDetailedSalaryPDF = (employeeData, monthYear = "") => {
  if (!employeeData) {
    return;
  }

  const doc = new jsPDF();
  const baseSalary = employeeData.luongCoBan || 0; // Lương cơ bản để tính %

  // Tiêu đề
  doc.setFont("Roboto-Regular", "normal");
  doc.setFontSize(16);
  doc.text(
    `BẢNG TÍNH LƯƠNG THÁNG ${removeVietnameseTones(monthYear)}`,
    doc.internal.pageSize.getWidth() / 2,
    15,
    { align: "center", font: "Roboto-Regular", fontStyle: "normal" }
  );

  const basicData = [
    ["STT", "Nội dung", "Giá trị"], // Header row
    ["1", "Họ và tên", employeeData.hoTen || "-"],
    ["2", "Mã nhân viên", employeeData.maNhanVien || "-"],
    ["3", "Phòng ban", employeeData.tenPhongBan || "-"],
    ["4", "Năm", employeeData.nam || "-"],
    ["5", "Tháng", employeeData.thang || "-"],
    ["6", "Lương cơ bản", formatCurrency(baseSalary)],
    ["7", "Số ngày công làm việc", employeeData.soNgayCong || 0],
    ["8", "Công chuẩn của tháng", employeeData.congChuanCuaThang || 0],
    ["9", "Số ngày nghỉ", employeeData.soNgayNghi + employeeData.soNgayLe || 0],
    ["10", "Số ngày nghỉ lễ", employeeData.soNgayLe || 0],
    ["11", "Số ngày nghỉ có phép", employeeData.soNgayNghiCoPhep || 0],
    ["12", "Số giờ tăng ca", employeeData.soGioTangCa || 0],
    ["13", "Hệ số tăng ca", employeeData.heSoTangCa || 0],
    ["14", "Lương giờ", formatCurrency(employeeData.luongGio)],
    [
      "15",
      "Tổng tiền tăng ca",
      formatCurrency(employeeData.tongTienTangCa || 0),
    ],
    ["16", "Lương theo ngày", formatCurrency(employeeData.luongTheoNgay || 0)],
    ["17", "Lương ngày nghi", formatCurrency(employeeData.luongNgayNghi || 0)],
    [
      "18",
      "Tổng tiền phụ cấp",
      formatCurrency(employeeData.tongTienPhuCap || 0),
    ],
    [
      "19",
      "Tổng lương",
      formatCurrency(
        (employeeData.tongTienPhuCap || 0) +
          (employeeData.luongTheoNgay || 0) +
          (employeeData.luongNgayNghi || 0) +
          (employeeData.tongTienTangCa || 0)
      ),
    ],
  ];

  // Tạo các dòng chi tiết thưởng (truyền thêm baseSalary)
  const bonusRows = createBonusRows(
    employeeData.danhSachLichSuThuong,
    20,
    baseSalary
  );

  // Tạo dòng tổng thưởng
  const totalBonusRow = [
    String(21),
    "Tổng Tiền Thưởng",
    formatCurrency(employeeData.tienThuong || 0),
  ];

  // Tạo các dòng chi tiết phạt (truyền thêm baseSalary)
  const penaltyRows = createPenaltyRows(
    employeeData.danhSachLichSuTru,
    22,
    baseSalary
  );

  // Tạo dòng tổng phạt
  const totalPenaltyRow = [
    String(23),
    "Tổng Tiền Phạt",
    formatCurrency(employeeData.tienTru || 0),
  ];

  // Tạo dòng lương thực lãnh
  const finalSalaryRow = [
    String(24),
    "Lương thực lãnh",
    formatCurrency(employeeData.tongLuong || 0),
  ];

  // Kết hợp tất cả dữ liệu
  const tableData = [
    ...basicData,
    ...bonusRows,
    totalBonusRow,
    ...penaltyRows,
    totalPenaltyRow,
    finalSalaryRow,
  ];

  // Tạo bảng với autoTable
  autoTable(doc, {
    body: tableData,
    startY: 25,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      font: "Roboto-Regular",
      fontStyle: "normal",
    },
    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 15,
        fillColor: [169, 169, 169], // Màu xám cho cột STT
      },
      1: {
        halign: "left",
        cellWidth: 100,
        fontStyle: "normal",
      },
      2: {
        halign: "right",
        cellWidth: 75,
      },
    },
    didParseCell: function (data) {
      // Tô hàng tiêu đề
      if (data.row.index === 0) {
        data.cell.styles.fillColor = [169, 169, 169];
        data.cell.styles.textColor = [255, 255, 255];
        return;
      }

      // Lấy nội dung ở cột "Nội dung" (cột thứ 2)
      const cellText = data.row.cells[1]?.text?.[0];

      // Dòng tiêu đề chi tiết
      const isDetailHeader =
        cellText === "Chi tiết Thưởng" || cellText === "Chi tiết Phạt";
      if (isDetailHeader) {
        data.cell.styles.fillColor = [169, 169, 169];
        data.cell.styles.textColor = [255, 255, 255];
        return;
      }

      // Dòng tổng quan trọng
      const isImportantRow = [
        "Tổng Tiền Thưởng",
        "Tổng Tiền Phạt",
        "Lương thực lãnh",
        "Tổng lương",
      ].includes(cellText);
      if (isImportantRow) {
        data.cell.styles.fillColor = [140, 40, 80];
        data.cell.styles.textColor = [255, 255, 255];
        return;
      }

      // Dòng chi tiết con (có số thứ tự kiểu "2.1", "3.2" v.v)
      if (data.cell.text[0]?.includes(".")) {
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
    didDrawPage: function () {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;

      doc.saveGraphicsState();
      doc.setFontSize(65);
      doc.setTextColor(12, 67, 110);
      doc.setFont("helvetica", "bold");
      doc.setGState(new doc.GState({ opacity: 0.08 })); // mờ hơn
      doc.text("Công ty Manor", centerX, centerY, {
        align: "center",
      });
      doc.restoreGraphicsState();
    },
    theme: "grid",
    tableWidth: "auto",
    margin: { left: 10, right: 10 },
  });

  // Thêm chân trang
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(10);
  doc.text(
    `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
    10,
    pageHeight - 10
  );

  doc.text(`Trang 1`, doc.internal.pageSize.getWidth() - 20, pageHeight - 10, {
    align: "right",
  });

  // Lưu file
  const fileName = `bang_tinh_luong_${removeVietnameseTones(
    (employeeData.hoTen || "nhan_vien").replace(/\s+/g, "_")
  )}_${removeVietnameseTones(monthYear.replace("/", "-")) || "thang"}.pdf`;

  doc.save(fileName);
};

// Xuất nhiều file PDF chi tiết (mỗi nhân viên 1 file)
export const generateMultipleDetailedPDFs = async (
  employeesData,
  monthYear = ""
) => {
  if (!employeesData || employeesData.length === 0) {
    return;
  }

  for (let i = 0; i < employeesData.length; i++) {
    const employee = employeesData[i];
    generateDetailedSalaryPDF(employee, monthYear);

    // Delay 500ms giữa các file để tránh browser bị quá tải
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

// Xuất tất cả nhân viên vào 1 file PDF nhiều trang
export const generateSinglePDFMultiplePages = (
  employeesData,
  monthYear = ""
) => {
  if (!employeesData || employeesData.length === 0) {
    return;
  }

  const doc = new jsPDF();
  const formatCurrency = (value) => {
    if (value == null || value === 0) return 0;
    return Math.round(value).toLocaleString("vi-VN") + " đ";
  };
  employeesData.forEach((employeeData, index) => {
    // Nếu không phải trang đầu tiên, thêm trang mới
    if (index > 0) {
      doc.addPage();
    }
    const baseSalary = employeeData.luongCoBan || 0; // Lương cơ bản để tính %

    // Tiêu đề
    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(16);
    doc.text(
      `BẢNG TÍNH LƯƠNG THÁNG ${removeVietnameseTones(monthYear)}`,
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: "center", font: "Roboto-Regular", fontStyle: "normal" }
    );

    const basicData = [
      ["STT", "Nội dung", "Giá trị"], // Header row
      ["1", "Họ và tên", employeeData.hoTen || "-"],
      ["2", "Mã nhân viên", employeeData.maNhanVien || "-"],
      ["3", "Phòng ban", employeeData.tenPhongBan || "-"],
      ["4", "Năm", employeeData.nam || "-"],
      ["5", "Tháng", employeeData.thang || "-"],
      ["6", "Lương cơ bản", formatCurrency(baseSalary)],
      ["7", "Số ngày công làm việc", employeeData.soNgayCong || 0],
      ["8", "Công chuẩn của tháng", employeeData.congChuanCuaThang || 0],
      [
        "9",
        "Số ngày nghỉ",
        employeeData.soNgayNghi + employeeData.soNgayLe || 0,
      ],
      ["10", "Số ngày nghỉ lễ", employeeData.soNgayLe || 0],
      ["11", "Số ngày nghỉ có phép", employeeData.soNgayNghiCoPhep || 0],
      ["12", "Số giờ tăng ca", employeeData.soGioTangCa || 0],
      ["13", "Hệ số tăng ca", employeeData.heSoTangCa || 0],
      ["14", "Lương giờ", formatCurrency(employeeData.luongGio)],
      [
        "15",
        "Tổng tiền tăng ca",
        formatCurrency(employeeData.tongTienTangCa || 0),
      ],
      [
        "16",
        "Lương theo ngày",
        formatCurrency(employeeData.luongTheoNgay || 0),
      ],
      [
        "17",
        "Lương ngày nghi",
        formatCurrency(employeeData.luongNgayNghi || 0),
      ],
      [
        "18",
        "Tổng tiền phụ cấp",
        formatCurrency(employeeData.tongTienPhuCap || 0),
      ],
      [
        "19",
        "Tổng lương",
        [
          "19",
          "Tổng lương",
          formatCurrency(
            (employeeData.tongTienPhuCap || 0) +
              (employeeData.luongTheoNgay || 0) +
              (employeeData.luongNgayNghi || 0) +
              (employeeData.tongTienTangCa || 0)
          ),
        ],
      ],
    ];

    // Tạo các dòng chi tiết thưởng (truyền thêm baseSalary)
    const bonusRows = createBonusRows(
      employeeData.danhSachLichSuThuong,
      20,
      baseSalary
    );

    // Tạo dòng tổng thưởng
    const totalBonusRow = [
      String(21),
      "Tổng Tiền Thưởng",
      formatCurrency(employeeData.tienThuong || 0),
    ];

    // Tạo các dòng chi tiết phạt (truyền thêm baseSalary)
    const penaltyRows = createPenaltyRows(
      employeeData.danhSachLichSuTru,
      22,
      baseSalary
    );

    // Tạo dòng tổng phạt
    const totalPenaltyRow = [
      String(23),
      "Tổng Tiền Phạt",
      formatCurrency(employeeData.tienTru || 0),
    ];

    // Tạo dòng lương thực lãnh
    const finalSalaryRow = [
      String(24),
      "Lương thực lãnh",
      formatCurrency(employeeData.tongLuong || 0),
    ];

    // Kết hợp tất cả dữ liệu
    const tableData = [
      ...basicData,
      ...bonusRows,
      totalBonusRow,
      ...penaltyRows,
      totalPenaltyRow,
      finalSalaryRow,
    ];

    // Tạo bảng với autoTable
    autoTable(doc, {
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        font: "Roboto-Regular",
        fontStyle: "normal",
      },
      columnStyles: {
        0: {
          halign: "center",
          cellWidth: 15,
          fillColor: [169, 169, 169], // Màu xám cho cột STT
        },
        1: {
          halign: "left",
          cellWidth: 100,
          fontStyle: "normal",
        },
        2: {
          halign: "right",
          cellWidth: 75,
        },
      },
      didParseCell: function (data) {
        // Tô hàng tiêu đề
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [169, 169, 169];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }

        // Lấy nội dung ở cột "Nội dung" (cột thứ 2)
        const cellText = data.row.cells[1]?.text?.[0];

        // Dòng tiêu đề chi tiết
        const isDetailHeader =
          cellText === "Chi tiết Thưởng" || cellText === "Chi tiết Phạt";
        if (isDetailHeader) {
          data.cell.styles.fillColor = [169, 169, 169];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }

        // Dòng tổng quan trọng
        const isImportantRow = [
          "Tổng Tiền Thưởng",
          "Tổng Tiền Phạt",
          "Lương thực lãnh",
          "Tổng lương",
        ].includes(cellText);
        if (isImportantRow) {
          data.cell.styles.fillColor = [140, 40, 80];
          data.cell.styles.textColor = [255, 255, 255];
          return;
        }

        // Dòng chi tiết con (có số thứ tự kiểu "2.1", "3.2" v.v)
        if (data.cell.text[0]?.includes(".")) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
      },
      didDrawPage: function () {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        doc.saveGraphicsState();
        doc.setFontSize(65);
        doc.setTextColor(12, 67, 110);
        doc.setFont("helvetica", "bold");
        doc.setGState(new doc.GState({ opacity: 0.08 })); // mờ hơn
        doc.text("Công ty Manor", centerX, centerY, {
          align: "center",
        });
        doc.restoreGraphicsState();
      },
      theme: "grid",
      tableWidth: "auto",
      margin: { left: 10, right: 10 },
    });

    // Thêm chân trang
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(
      `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
      10,
      pageHeight - 10
    );

    doc.text(
      `Trang 1`,
      doc.internal.pageSize.getWidth() - 20,
      pageHeight - 10,
      {
        align: "right",
      }
    );

    doc.text(
      `Trang ${index + 1}/${employeesData.length}`,
      doc.internal.pageSize.getWidth() - 20,
      pageHeight - 10,
      { align: "right" }
    );
  });

  // Lưu file
  const fileName = `bang_tinh_luong_tat_ca_${
    removeVietnameseTones(monthYear.replace("/", "-")) || "thang"
  }.pdf`;
  doc.save(fileName);
};
