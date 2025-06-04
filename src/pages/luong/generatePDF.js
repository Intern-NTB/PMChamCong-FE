import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

export const generatePDF = (data, monthYear = "", isDetail = false) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("Dữ liệu không hợp lệ để xuất PDF");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(
    `Bang Luong Thang ${removeVietnameseTones(monthYear)}`, 
    doc.internal.pageSize.getWidth() / 2,
    10,
    { align: "center" }
  );

  const formatCurrency = (value) =>
    value != null ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "-";

  const columns = isDetail ? [
    removeVietnameseTones("Mã NV"),
    removeVietnameseTones("Họ Tên"),
    removeVietnameseTones("Phòng ban"),
    removeVietnameseTones("Luong co ban"),
    removeVietnameseTones("Phụ cấp"),
    removeVietnameseTones("Thuong"),
    removeVietnameseTones("Muc phat"),
    removeVietnameseTones("Tăng ca"),
    removeVietnameseTones("Vi phạm"),
    removeVietnameseTones("Đi muộn"),
    removeVietnameseTones("Về sớm"),
    removeVietnameseTones("Nghỉ có phép"),
    removeVietnameseTones("Nghỉ không phép"),
    removeVietnameseTones("Ngày công"),
    removeVietnameseTones("Ngày lễ"),
    removeVietnameseTones("Thuc nhận"),
  ] : [
    removeVietnameseTones("Mã NV"),
    removeVietnameseTones("Họ Tên"),
    removeVietnameseTones("Phòng ban"),
    removeVietnameseTones("Luong cơ bản"),
    removeVietnameseTones("Phụ cấp"),
    removeVietnameseTones("Thuong"),
    removeVietnameseTones("Thuc nhận"),
  ];

  const rows = data.map((item) => [
    item.maNhanVien || "",
    item.hoTen || "",
    item.phongBan || "",
    formatCurrency(item.luongCoBan),
    formatCurrency(item.tienPhuCap),
    formatCurrency(item.tienThuong),
    formatCurrency(item.mucPhat),
    item.tangCa != null ? item.tangCa : "-",
    item.viPham != null ? item.viPham : "-",
    item.lanDiMuon != null ? item.lanDiMuon : "-",
    item.lanVeSom != null ? item.lanVeSom : "-",
    item.nghiCoPhep != null ? item.nghiCoPhep : "-",
    item.nghiKhongPhep != null ? item.nghiKhongPhep : "-",
    item.ngayCong != null ? item.ngayCong : "-",
    item.ngayLe != null ? item.ngayLe : "-",
    formatCurrency(item.thucNhan),
  ]);

  autoTable(doc, {
    head: [columns],
    body: rows,
    styles: { fontSize: 9 },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      15: { halign: "right" },
      7: { halign: "center" },
      8: { halign: "center" },
      9: { halign: "center" },
      10: { halign: "center" },
      11: { halign: "center" },
      12: { halign: "center" },
      13: { halign: "center" },
      14: { halign: "center" },
    },
    startY: 20,
    margin: { left: 10, right: 10 },
  });

  doc.save(`baocaoluong_${removeVietnameseTones(monthYear.replace("/", "-")) || "all"}_${isDetail ? "chi_tiet" : "tong"}.pdf`);
};
