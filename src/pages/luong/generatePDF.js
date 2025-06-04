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
  if (!data || data.length === 0) {
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

  let yOffset = 20; 

  if (isDetail) {
    const formFields = [
      { label: "Mã nhân viên", value: data[0].maNhanVien || "-" },
      { label: "Họ tên", value: data[0].hoTen || "-" },
      { label: "Phòng ban", value: data[0].phongBan || "-" },
      { label: "Luong cơ bản", value: formatCurrency(data[0].luongCoBan) },
      { label: "Phu cấp", value: formatCurrency(data[0].tienPhuCap) },
      { label: "Luong thuong", value: formatCurrency(data[0].tienThuong) },
      { label: "Muc phạt", value: formatCurrency(data[0].mucPhat) },
      { label: "Tang ca", value: data[0].tangCa != null ? data[0].tangCa : "-" },
      { label: "Vi phạm", value: data[0].viPham != null ? data[0].viPham : "-" },
      { label: "Di muon", value: data[0].lanDiMuon != null ? data[0].lanDiMuon : "-" },
      { label: "Ve som", value: data[0].lanVeSom != null ? data[0].lanVeSom : "-" },
      { label: "Nghỉ có phép", value: data[0].nghiCoPhep != null ? data[0].nghiCoPhep : "-" },
      { label: "Nghỉ không phép", value: data[0].nghiKhongPhep != null ? data[0].nghiKhongPhep : "-" },
      { label: "Ngày công", value: data[0].ngayCong != null ? data[0].ngayCong : "-" },
      { label: "Ngày lễ", value: data[0].ngayLe != null ? data[0].ngayLe : "-" },
      { label: "Thuc nhận", value: formatCurrency(data[0].thucNhan) },
    ];

    const formWidth = 200;
    const formHeight = yOffset + (formFields.length * 11); 

    doc.setDrawColor(169, 169, 169); 
    doc.setLineWidth(0.5); 
    doc.roundedRect(5, yOffset - 5, formWidth, formHeight - 5, 5, 5); 

    formFields.forEach((field) => {
      doc.setFontSize(12);
      doc.text(`${removeVietnameseTones(field.label)}:`, 10, yOffset);

      doc.setFontSize(12);
      doc.text(`${field.value}`, 60, yOffset);

      doc.setDrawColor(169, 169, 169); 
      doc.setLineWidth(0.2); 
      doc.line(55, yOffset - 5, 55, yOffset + 5);

      doc.setLineWidth(0.2); 
      doc.line(5, yOffset + 6, formWidth + 5, yOffset + 6);

      yOffset += 12; 
    });
  } else {
    const columns = [
      removeVietnameseTones("Mã NV"),
      removeVietnameseTones("Họ Tên"),
      removeVietnameseTones("Phòng ban"),
      removeVietnameseTones("Luong cơ bản"),
      removeVietnameseTones("Phụ cấp"),
      removeVietnameseTones("Thuong"),
      removeVietnameseTones("Thuc nhận"),
    ];

    const rows = data.map((item) => [
      item.maNhanVien || "-",
      item.hoTen || "-",
      item.phongBan || "-",
      formatCurrency(item.luongCoBan),
      formatCurrency(item.tienPhuCap),
      formatCurrency(item.tienThuong),
      formatCurrency(item.thucNhan),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      styles: {
        fontSize: 9,
        cellPadding: 4, 
        lineWidth: 0.5, 
        lineColor: [169, 169, 169], 
      },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
      startY: 20,
      margin: { left: 10, right: 10 },
      theme: "grid", 
    });
  }

  doc.save(`baocaoluong_${removeVietnameseTones(monthYear.replace("/", "-")) || "all"}_${isDetail ? "chi_tiet" : "tong"}.pdf`);
};
