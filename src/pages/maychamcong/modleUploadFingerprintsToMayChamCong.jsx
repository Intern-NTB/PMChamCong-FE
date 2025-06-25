import { Modal, Table, Progress, message, Button, Space, Input } from "antd"; 
import { useState, useMemo } from "react"; 
import { UploadOutlined, InfoCircleOutlined, SearchOutlined } from "@ant-design/icons"; 

const removeAccents = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export const ModalUploadFingerPrintsToMayChamCong = ({
  isVisible = false,
  dataSourceNhanVienMayChamCon, 
  NhanVienChamCongEmployyes, 
  onCancel,
  onOk, 
  apiReload,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState(""); 

  const handleOnOk = async () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất một vân tay để upload!");
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

  const handleCancel = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSearchText(""); 
    onCancel?.();
  };

  const filteredDataSource = useMemo(() => {
    if (!searchText) {
      return dataSourceNhanVienMayChamCon;
    }

    const processedSearchText = removeAccents(searchText).toLowerCase();

    return dataSourceNhanVienMayChamCon?.filter((record) => {
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
  }, [dataSourceNhanVienMayChamCon, searchText]);


  return (
    <Modal
      title={
        <Space>
          <UploadOutlined style={{ color: "#1890ff" }} />
          Upload vân tay lên máy chấm công
        </Space>
      }
      open={isVisible}
      onCancel={handleCancel}
      onOk={handleOnOk}
      okText={`Upload ${selectedRows.length} vân tay`}
      cancelText="Hủy"
      width={900}
      okButtonProps={{
        type: "primary",
        disabled: selectedRows.length === 0,
      }}
    >
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "#f6ffed",
          border: "1px solid #b7eb8f",
          borderRadius: 6,
        }}
      >
        <Space>
          <InfoCircleOutlined style={{ color: "#52c41a" }} />
          <span>
            <strong>Thông tin:</strong> Thao tác này sẽ upload vân tay lên máy
            chấm công để nhân viên có thể sử dụng!
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
          <strong style={{ color: "#1890ff" }}>{selectedRows.length}</strong>{" "}
          vân tay để upload
        </span>
        <span style={{ fontSize: "12px", color: "#666" }}>
          Tổng số: {filteredDataSource?.length || 0} vân tay
        </span>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-start' }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          allowClear
          size="small"
          style={{ width: 180 }} 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        rowSelection={rowSelection}
        columns={NhanVienChamCongEmployyes} 
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
            backgroundColor: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: 6,
          }}
        >
          <strong>Danh sách vân tay sẽ upload:</strong>
          <div style={{ marginTop: 8, maxHeight: 100, overflowY: "auto" }}>
            {selectedRows.map((row, index) => (
              <div key={index} style={{ fontSize: "12px", color: "#666" }}>
                • {row.maNhanVien} - {row.hoTen || "N/A"}
                {row.viTriNgonTay}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};