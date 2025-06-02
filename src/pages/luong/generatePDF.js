import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * @param {Array} data
 */
export const generatePDF = (data) => {
  const doc = new jsPDF();
  doc.text("Bảng Lương", 14, 16);

  const columns = [
    "Mã NV",
    "Họ Tên",
    "Lương cơ bản",
    "Phụ cấp",
    "Thưởng",
    "Thực nhận",
    "Ngày công",
    "Ngày lễ",
  ];

  const rows = data.map((item) => [
    item.maNhanVien,
    item.hoTen,
    item.luongCoBan,
    item.tienPhuCap,
    item.tienThuong,
    item.thucNhan,
    item.ngayCong,
    item.ngayLe,
  ]);

  doc.autoTable({
    head: [columns],
    body: rows,
  });

  doc.save("baocaoluong.pdf");
};
