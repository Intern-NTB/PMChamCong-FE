import { Modal, Table, Progress, message, Button, Space, Input } from "antd";
import { useState, useMemo } from "react";
import { DeleteOutlined, WarningOutlined, SearchOutlined } from "@ant-design/icons";

const removeAccents = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export const ModalDeleteFingerprints = ({
  isDelete,
  progress,
  isVisible = false,
  dataSourceNhanVienVanTay,
  onCancel,
  onOk,
  apiReload,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");

  const handleOnOk = async () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất một vân tay để xóa!");
      return;
    }

    await onOk?.(selectedRows);

    setSelectedRows([]);
    setSelectedRowKeys([]);

    await apiReload?.();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };

  const NhanVienVanTayColumns = [
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      width: 120,
      sorter: (a, b) => String(a.maNhanVien).localeCompare(String(b.maNhanVien)),
    },
    {
      title: "Tên nhân viên",
      dataIndex: "hoTen",
      key: "hoTen",
      width: 150,
      sorter: (a, b) => String(a.hoTen || "").localeCompare(String(b.hoTen || "")),
    },
    {
      title: "Vị trí vân tay",
      dataIndex: "viTriNgonTay",
      key: "viTriNgonTay",
      width: 120,
      render: (text) => {
        const fingerMap = {
          0: "Ngón út trái",
          1: "Ngón áp út trái",
          2: "Ngón giữa trái",
          3: "Ngón trỏ trái",
          4: "Ngón cái trái",
          5: "Ngón cái phải",
          6: "Ngón trỏ phải",
          7: "Ngón giữa phải",
          8: "Ngón áp út phải",
          9: "Ngón út phải",
        };
        return fingerMap[text] || text;
      },
    },
  ];

  const handleCancel = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSearchText("");
    onCancel?.();
  };

  const filteredDataSource = useMemo(() => {
    if (!searchText) {
      return dataSourceNhanVienVanTay;
    }

    const processedSearchText = removeAccents(searchText).toLowerCase();

    return dataSourceNhanVienVanTay?.filter((record) => {
      const maNhanVienString = removeAccents(String(record.maNhanVien || "")).toLowerCase();
      const hoTenString = removeAccents(String(record.hoTen || "")).toLowerCase();
      const viTriNgonTayString = String(record.viTriNgonTay || "").toLowerCase();

      const fingerMapValue = {
        0: "ngon ut trai",
        1: "ngon ap ut trai",
        2: "ngon giua trai",
        3: "ngon tro trai",
        4: "ngon cai trai",
        5: "ngon cai phai",
        6: "ngon tro phai",
        7: "ngon giua phai",
        8: "ngon ap ut phai",
        9: "ngon ut phai",
      }[record.viTriNgonTay]?.toLowerCase();
      
      const maNhanVienMatch = maNhanVienString.includes(processedSearchText);
      const hoTenMatch = hoTenString.includes(processedSearchText);
      const viTriNgonTayNumberMatch = viTriNgonTayString.includes(processedSearchText); 
      const fingerPositionTextMatch = fingerMapValue?.includes(processedSearchText);

      return maNhanVienMatch || hoTenMatch || viTriNgonTayNumberMatch || fingerPositionTextMatch;
    });
  }, [dataSourceNhanVienVanTay, searchText]);

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: "#ff4d4f" }} />
          Xóa vân tay nhân viên
        </Space>
      }
      open={isVisible}
      onCancel={handleCancel}
      onOk={handleOnOk}
      okText={`Xóa ${selectedRows.length} vân tay`}
      cancelText="Hủy"
      width={900}
      okButtonProps={{
        danger: true,
        disabled: selectedRows.length === 0,
      }}
    >
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "#fff2f0",
          border: "1px solid #ffccc7",
          borderRadius: 6,
        }}
      >
        <Space>
          <WarningOutlined style={{ color: "#ff4d4f" }} />
          <span>
            <strong>Cảnh báo:</strong> Thao tác này sẽ xóa vân tay khỏi máy chấm
            công và không thể hoàn tác!
          </span>
        </Space>
      </div>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          Đã chọn:{" "}
          <strong style={{ color: "#ff4d4f" }}>{selectedRows.length}</strong>{" "}
          vân tay để xóa
        </span>
        <span style={{ fontSize: "12px", color: "#666" }}>
          Tổng số: {filteredDataSource?.length || 0} vân tay
        </span>
      </div>

      <Input
        placeholder="Tìm kiếm..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, width: 180 }}
        allowClear
      />

      {isDelete && (
        <Progress
          percent={progress}
          status="active"
          style={{ marginBottom: 16 }}
          format={(percent) => `${percent}% Đang xóa...`}
        />
      )}

      <Table
        rowSelection={rowSelection}
        columns={NhanVienVanTayColumns}
        dataSource={filteredDataSource}
        rowKey={(record) => `${record.maNhanVien}-${record.viTriNgonTay}`}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} vân tay`,
        }}
        scroll={{ y: 400 }}
        size="small"
      />

      {selectedRows.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 6,
          }}
        >
          <strong>Danh sách vân tay sẽ xóa:</strong>
          <div style={{ marginTop: 8, maxHeight: 100, overflowY: "auto" }}>
            {selectedRows.map((row, index) => (
              <div key={index} style={{ fontSize: "12px", color: "#666" }}>
                • {row.maNhanVien} - {row.hoTen || "N/A"} - Vị trí:{" "}
                {row.viTriNgonTay}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};