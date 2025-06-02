import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * @param {Array} data 
 */
export const exportToExcel = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bảng Lương");

  worksheet.columns = [
    { header: "Mã NV", key: "maNhanVien" },
    { header: "Họ Tên", key: "hoTen" },
    { header: "Lương cơ bản", key: "luongCoBan" },
    { header: "Phụ cấp", key: "tienPhuCap" },
    { header: "Thưởng", key: "tienThuong" },
    { header: "Thực nhận", key: "thucNhan" },
    { header: "Ngày công", key: "ngayCong" },
    { header: "Ngày lễ", key: "ngayLe" },
  ];
  data.forEach((item) => worksheet.addRow(item));

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "baocaoluong.xlsx");
  });
};
