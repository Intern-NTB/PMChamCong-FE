import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Checkbox,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import LuongDetailModal from "./LuongDetailModal";
import LuongEditModal from "./LuongEditModal";
import { exportToExcel } from "./exportToExcel";
import { generatePDF } from "./generatePDF";

import "./luong.css";

const { Title } = Typography;
const { Option } = Select;

const sampleData = [
  {
    key: 1, 
    maNhanVien: "NV001",
    hoTen: "Nguyễn Văn A",
    phongBan: "Phòng IT",
    luongCoBan: 15000000,
    tienPhuCap: 2000000,
    tienThuong: 1000000,
    thucNhan: 18000000,
    ngayCong: 22,
    ngayLe: 2,
    mucPhat: 500000,
    tangCa: 5,
    lanDiMuon: 1,
    lanVeSom: 0,
    nghiCoPhep: 1,
    nghiKhongPhep: 0,
    tieuHaoTaiSanChung: 0,
  },
  {
    key: 2,
    maNhanVien: "NV002",
    hoTen: "Trần Thị B",
    phongBan: "Phòng Kinh doanh",
    luongCoBan: 13000000,
    tienPhuCap: 1500000,
    tienThuong: 1200000,
    thucNhan: 15700000,
    ngayCong: 21,
    ngayLe: 1,
    mucPhat: 0,
    tangCa: 3,
    lanDiMuon: 0,
    lanVeSom: 1,
    nghiCoPhep: 0,
    nghiKhongPhep: 0,
    tieuHaoTaiSanChung: 0,
  },
  {
    key: 3,
    maNhanVien: "NV003",
    hoTen: "Lê Văn C",
    phongBan: "Phòng Nhân sự",
    luongCoBan: 16000000,
    tienPhuCap: 1800000,
    tienThuong: 900000,
    thucNhan: 17700000,
    ngayCong: 23,
    ngayLe: 0,
    mucPhat: 300000,
    tangCa: 7,
    lanDiMuon: 1,
    lanVeSom: 0,
    nghiCoPhep: 2,
    nghiKhongPhep: 1,
    tieuHaoTaiSanChung: 0,
  },
];

export default function Luong() {
  const phongBanList = ["Phòng IT", "Phòng Kinh doanh", "Phòng Nhân sự"];

  const [dataSource, setDataSource] = useState(sampleData);
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs());
  const [searchValue, setSearchValue] = useState("");
  const [selectedPhongBan, setSelectedPhongBan] = useState(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const matchesSearch =
        item.maNhanVien.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.hoTen.toLowerCase().includes(searchValue.toLowerCase());

      const matchesPhongBan = selectedPhongBan
        ? item.phongBan === selectedPhongBan
        : true;

      return matchesSearch && matchesPhongBan;
    });
  }, [searchValue, selectedPhongBan, dataSource]);

  useEffect(() => {
    console.log("filteredData changed, resetting selections. New filteredData length:", filteredData.length);
    setSelectedRows([]);
    setSelectAll(false);
  }, [filteredData]);

  useEffect(() => {
    if (filteredData.length > 0 && selectedRows.length === filteredData.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedRows, filteredData]);

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectAll}
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectAll(checked);
            if (checked) {
              // Lấy tất cả key từ filteredData HIỆN TẠI
              setSelectedRows(filteredData.map((item) => item.key));
              console.log("Selected all keys:", filteredData.map((item) => item.key));
            } else {
              setSelectedRows([]);
              console.log("Deselected all.");
            }
          }}
        />
      ),
      key: "select",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            const checked = e.target.checked;
            console.log(`Checkbox for key ${record.key} clicked. Checked: ${checked}`); // Log từng click
            if (checked) {
              setSelectedRows((prevSelected) => {
                const newSelected = [...prevSelected, record.key];
                console.log("New selectedRows (add):", newSelected);
                return newSelected;
              });
            } else {
              setSelectedRows((prevSelected) => {
                const newSelected = prevSelected.filter((key) => key !== record.key);
                console.log("New selectedRows (remove):", newSelected);
                return newSelected;
              });
            }
          }}
        />
      ),
    },
    {
      title: "Mã NV",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      width: 100,
      align: "center",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Họ tên",
      dataIndex: "hoTen",
      key: "hoTen",
      width: 160,
      ellipsis: true,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Lương cơ bản",
      dataIndex: "luongCoBan",
      key: "luongCoBan",
      width: 120,
      align: "right",
      render: (v) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Phụ cấp",
      dataIndex: "tienPhuCap",
      key: "tienPhuCap",
      width: 110,
      align: "right",
      render: (v) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Thưởng",
      dataIndex: "tienThuong",
      key: "tienThuong",
      width: 110,
      align: "right",
      render: (v) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Thực nhận",
      dataIndex: "thucNhan",
      key: "thucNhan",
      width: 120,
      align: "right",
      render: (v) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1890ff", fontSize: 18 }} />}
            title="Xem chi tiết"
            onClick={() => {
              setDetailRecord(record);
              setIsDetailModalVisible(true);
            }}
            size="large"
          />
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined style={{ color: "#fff", fontSize: 18 }} />}
            title="Chỉnh sửa"
            onClick={() => {
              setEditRecord(record);
              setIsEditModalVisible(true);
            }}
            size="large"
          />
        </Space>
      ),
    },
  ];

  const onMonthYearChange = (date) => {
    if (date) setSelectedMonthYear(date);
  };

  const handleEditSave = (updatedRecord) => {
    setDataSource((prev) =>
      prev.map((item) => (item.key === updatedRecord.key ? updatedRecord : item))
    );
    setIsEditModalVisible(false);
  };

  const exportToExcelHandler = async () => {
    console.log("--- EXPORT EXCEL HANDLER INITIATED ---");
    console.log("Current selectedRows:", selectedRows);
    console.log("Current filteredData:", filteredData);

    const selectedData = filteredData.filter((record) => {
      const isIncluded = selectedRows.includes(record.key);
      console.log(`Checking record key ${record.key}: ${isIncluded ? 'Included' : 'Not Included'}`);
      return isIncluded;
    });
    console.log("Data to be exported (selectedData):", selectedData);

    if (selectedData.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nhân viên để xuất Excel.");
      return;
    }
    try {
      // isDetail = false for summary report
      await exportToExcel(selectedData, selectedMonthYear.format("MM/YYYY"), selectedPhongBan, false);
      message.success("Xuất Excel tổng quát thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xuất Excel tổng quát.");
      console.error("Export Excel Summary Error:", error);
    }
  };

  const generatePDFHandler = async () => {
    console.log("--- GENERATE PDF HANDLER INITIATED ---");
    console.log("Current selectedRows:", selectedRows);
    console.log("Current filteredData:", filteredData);

    const selectedData = filteredData.filter((record) =>
      selectedRows.includes(record.key)
    );
    console.log("Data to be generated PDF (selectedData):", selectedData);

    if (selectedData.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nhân viên để in PDF.");
      return;
    }
    try {
      // isDetail = false for general PDF, if you want detailed PDF, change last param to true
      await generatePDF(selectedData, selectedMonthYear.format("MM/YYYY"), false);
      message.success("Xuất PDF thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xuất PDF.");
      console.error("Export PDF Error:", error);
    }
  };

  return (
    <div className="luong-container">
      <Row justify="center" align="middle" className="title-row">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Title level={2} className="title-text">
            BẢNG LƯƠNG THÁNG {selectedMonthYear.format("M/YYYY")}
            <CalendarOutlined className="calendar-icon" />
          </Title>
        </div>
      </Row>

      <Row justify="start" align="middle" className="toolbar-row">
        <Col>
          <Input
            placeholder="Tìm nhân viên"
            prefix={<SearchOutlined className="icon-style" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            size="large"
            className="toolbar-input"
          />
        </Col>

        <Col>
          <Select
            placeholder="Chọn phòng ban"
            value={selectedPhongBan}
            onChange={setSelectedPhongBan}
            allowClear
            size="large"
            className="toolbar-select"
          >
            {phongBanList.map((pb) => (
              <Option key={pb} value={pb}>
                {pb}
              </Option>
            ))}
          </Select>
        </Col>

        <Col>
          <DatePicker
            picker="month"
            value={selectedMonthYear}
            onChange={onMonthYearChange}
            format="MM/YYYY"
            size="large"
            className="toolbar-date-picker"
            popupClassName="custom-date-picker-popup"
          />
        </Col>

        <Col flex="auto" />

        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined className="icon-style" />}
            size="large"
            className="toolbar-button"
            // onClick={() => { /* Logic to create new payroll */ }}
          >
            Tạo bảng lương mới
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1100 }}
        rowKey="key"
        size="middle"
        className="custom-table"
      />

      <Space style={{ marginTop: 16 }}>
        <Button
          onClick={exportToExcelHandler}
          style={{ marginRight: 10 }}
          icon={<FileExcelOutlined />}
        >
          Xuất Excel
        </Button>
        <Button onClick={generatePDFHandler} icon={<FilePdfOutlined />}>
          Xuất PDF
        </Button>
      </Space>

      <LuongDetailModal
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        record={detailRecord}
        selectedMonthYear={selectedMonthYear}
      />
      <LuongEditModal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        initialValues={editRecord}
        onSave={handleEditSave}
      />
    </div>
  );
}