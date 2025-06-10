import React from "react";
import { Modal, Descriptions, Button, Space } from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { exportToExcel } from "./exportToExcel";
// import { generateDetailedSalaryPDF } from "./generatePDF";

export default function LuongDetailModal({
  visible,
  onCancel,
  record,
  selectedMonthYear,
}) {
  if (!record) return null;

  const handleExportExcel = () => {
    exportToExcel(
      [record],
      selectedMonthYear ? selectedMonthYear.format("MM/YYYY") : "",
      record.phongBan,
      true
    );
  };

  // const handleExportPDF = () => {
  //   generateDetailedSalaryPDF(
  //     [record],
  //     selectedMonthYear ? selectedMonthYear.format("MM/YYYY") : "",
  //     true
  //   );
  // };

  return (
    <Modal
      visible={visible}
      title={`Bảng lương tháng ${
        selectedMonthYear ? selectedMonthYear.format("MM/YYYY") : ""
      } - ${record.hoTen}`}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item
          label={
            <>
              <CalendarOutlined /> Tháng/Năm
            </>
          }
        >
          {selectedMonthYear ? selectedMonthYear.format("MM/YYYY") : "-"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <ApartmentOutlined /> Phòng ban
            </>
          }
        >
          {record.phongBan || "-"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <IdcardOutlined /> Mã nhân viên
            </>
          }
        >
          {record.maNhanVien || "-"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <TeamOutlined /> Họ tên
            </>
          }
        >
          {record.hoTen || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Lương cơ bản">
          {record.luongCoBan
            ? record.luongCoBan.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Phụ cấp">
          {record.tienPhuCap
            ? record.tienPhuCap.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Lương thưởng">
          {record.tienThuong
            ? record.tienThuong.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Mức phạt">
          {record.mucPhat
            ? record.mucPhat.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Tăng ca">
          {record.tangCa || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Số lần đi muộn">
          {record.lanDiMuon || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Số lần về sớm">
          {record.lanVeSom || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Số lần nghỉ có phép">
          {record.nghiCoPhep || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Số lần nghỉ không phép">
          {record.nghiKhongPhep || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày công">
          {record.ngayCong || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày lễ">
          {record.ngayLe || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Thực nhận">
          {record.thucNhan
            ? record.thucNhan.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            : "-"}
        </Descriptions.Item>
      </Descriptions>

      <Space style={{ marginTop: 20, justifyContent: "center", width: "100%" }}>
        <Button
          icon={<FileExcelOutlined />}
          onClick={handleExportExcel}
          type="primary"
          size="middle"
        >
          Xuất Excel
        </Button>
        {/* <Button
          icon={<FilePdfOutlined />}
          onClick={handleExportPDF}
          type="default"
          size="middle"
        >
          Xuất PDF
        </Button> */}
      </Space>
    </Modal>
  );
}
