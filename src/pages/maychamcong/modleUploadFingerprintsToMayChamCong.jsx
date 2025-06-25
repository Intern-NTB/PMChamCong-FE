import { Modal, Table, Progress, message, Button, Space, Tooltip } from "antd";
import { useState } from "react";
import { UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";

export const ModalUploadFingerPrintsToMayChamCong = ({
  isVisible = false,
  dataSourceNhanVienMayChamCon,
  NhanVienChamCongEmployyes,
  onCancel,
  onOk, // Callback để parent component xử lý sau khi upload
  apiReload,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleOnOk = async () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất một vân tay để upload!");
      return;
    }

    // Gọi onOk để upload vân tay
    await onOk?.(selectedRows);

    // Reset selection
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
    // Reset selection khi đóng modal
    setSelectedRows([]);
    setSelectedRowKeys([]);
    onCancel?.();
  };

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
          Tổng số: {dataSourceNhanVienMayChamCon?.length || 0} vân tay
        </span>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={NhanVienChamCongEmployyes}
        dataSource={dataSourceNhanVienMayChamCon}
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
