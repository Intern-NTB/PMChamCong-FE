/* eslint-disable no-unused-vars */
// ===== Thư viện bên ngoài =====
import { useRef, useState } from "react";

// ===== Ant Design =====
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  Table,
  Input,
  Space,
  Select,
  DatePicker,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

// ===== styles =====
import "./tangca.css";

// ===== components ======
import ModalChinhSuaTangCa from "./modal_chinh_sua_tangca";

const { RangePicker } = DatePicker;

export default function ModalTangCa({
  onCancel,
  isVisible,
  danhSachTangCa,
  updateTangCa,
  deleteTangCa,
  danhSachPhongBan,
}) {
  // ==== State ====
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [recordEditing, setRecordEditing] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const openEditModal = (record) => {
    setRecordEditing(record);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setRecordEditing(null);
  };

  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const getDateRangeFilterProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <RangePicker
          value={selectedKeys[0]}
          onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{
              width: 90,
            }}
          >
            Lọc
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSelectedKeys([]);
            }}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      if (!value || !value[0] || !value[1]) return true;
      const recordDate = new Date(record[dataIndex]);
      const startDate = value[0].startOf("day").toDate();
      const endDate = value[1].endOf("day").toDate();
      return recordDate >= startDate && recordDate <= endDate;
    },
  });

  const getSelectFilterProps = (dataIndex, options) => ({
    filters: options.map((option) => ({
      text: option.label,
      value: option.value,
    })),
    onFilter: (value, record) => record[dataIndex] === value,
    filterMode: "menu",
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleEventRemoveTangCa = async (value) => {
    await deleteTangCa(value.ngayChamCongTangCa, value.maPhongBan);
  };

  const dataSourceTangCa = danhSachTangCa.map((tc, index) => {
    const phongBan = danhSachPhongBan.find(
      (pb) => pb.maPhongBan === tc.maPhongBan
    );

    return {
      key: index, // Thêm key cho Table
      ngayChamCongTangCa: tc.ngayChamCongTangCa,
      gioTangCaBatDau: tc.gioTangCaBatDau,
      gioTangCaKetThuc: tc.gioTangCaKetThuc,
      maPhongBan: tc.maPhongBan,
      tenPhongBan: phongBan ? phongBan.tenPhongBan : "Không xác định",
    };
  });

  // Tạo options cho filter phòng ban
  const phongBanOptions = danhSachPhongBan.map((pb) => ({
    label: pb.tenPhongBan,
    value: pb.tenPhongBan,
  }));

  const desktopColumn = [
    {
      title: "Ngày tăng ca",
      dataIndex: "ngayChamCongTangCa",
      key: "ngayChamCongTangCa",
      ...getDateRangeFilterProps("ngayChamCongTangCa"),
      sorter: (a, b) =>
        new Date(a.ngayChamCongTangCa) - new Date(b.ngayChamCongTangCa),
    },
    {
      title: "Giờ tăng ca bắt đầu",
      dataIndex: "gioTangCaBatDau",
      key: "gioTangCaBatDau",
      sorter: (a, b) => a.gioTangCaBatDau.localeCompare(b.gioTangCaBatDau),
    },
    {
      title: "Giờ tăng ca kết thúc",
      dataIndex: "gioTangCaKetThuc",
      key: "gioTangCaKetThuc",
      sorter: (a, b) => a.gioTangCaKetThuc.localeCompare(b.gioTangCaKetThuc),
    },
    {
      title: "Tên phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      filters: phongBanOptions.map((pb) => ({
        text: pb.label,
        value: pb.label,
      })),
      onFilter: (value, record) => record.tenPhongBan === value,
      sorter: (a, b) => a.tenPhongBan.localeCompare(b.tenPhongBan),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="link"
            onClick={() => openEditModal(record)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Button danger onClick={() => handleEventRemoveTangCa(record)}>
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="Chi Tiết tăng ca"
        open={isVisible}
        footer={[
          <Row gutter={8} justify={"end"} key="footer">
            <Col span={8}>
              <Button onClick={onCancel}>Quay về</Button>
            </Col>
          </Row>,
        ]}
        centered={true}
        maskClosable={true}
        width="90%"
        style={{ padding: "10px" }}
      >
        <Table
          dataSource={dataSourceTangCa}
          columns={desktopColumn}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bản ghi`,
            position: ["bottomCenter"],
          }}
        />
      </Modal>
      <ModalChinhSuaTangCa
        isVisible={isEditModalVisible}
        onCancel={closeEditModal}
        record={recordEditing}
        updateTangCa={updateTangCa}
        danhSachPhongBan={danhSachPhongBan}
      />
    </>
  );
}
