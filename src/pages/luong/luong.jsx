import React, { useState, useMemo } from "react";
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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
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
    viPham: 1,
    lanDiMuon: 2,
    lanVeSom: 0,
    nghiCoPhep: 1,
    nghiKhongPhep: 0,
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
    viPham: 0,
    lanDiMuon: 0,
    lanVeSom: 1,
    nghiCoPhep: 0,
    nghiKhongPhep: 0,
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
    viPham: 2,
    lanDiMuon: 1,
    lanVeSom: 0,
    nghiCoPhep: 2,
    nghiKhongPhep: 1,
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

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 60,
      align: "center",
      render: (text) => <b>{text}</b>,
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

  const exportToExcelHandler = () => {
    exportToExcel(filteredData, selectedMonthYear.format("MM/YYYY"), selectedPhongBan, false);
  };

  const generatePDFHandler = () => {
    generatePDF(filteredData, selectedMonthYear.format("MM/YYYY"));
  };

  return (
    <div className="luong-container">
      <Row justify="center" align="middle" className="title-row">
        <Title level={3} className="title-text">
          Bảng lương tháng {selectedMonthYear.format("M/YYYY")}
          <CalendarOutlined className="calendar-icon" />
        </Title>
      </Row>

      <Row justify="start" align="middle" gutter={16} className="toolbar-row">
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
            icon={
              <PlusOutlined
                className="icon-style"
                style={{ color: "#fff", fontSize: 18 }}
              />
            }
            size="large"
            className="toolbar-button"
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
        <Button onClick={exportToExcelHandler} style={{ marginRight: 10 }}>
          Xuất Excel
        </Button>
        <Button onClick={generatePDFHandler}>Xuất PDF</Button>
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
