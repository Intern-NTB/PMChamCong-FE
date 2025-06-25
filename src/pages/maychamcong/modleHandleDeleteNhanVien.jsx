import { Modal, Table, Progress, Input, Space, message } from "antd";
import { useState, useMemo } from "react";
import { SearchOutlined, WarningOutlined } from "@ant-design/icons";

const removeDiacritics = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export const ModalDeleteEmployee = ({
  isDelete,
  progress,
  isVisible = false,
  dataSourceNhanVienMayChamCong,
  employeeColumns,
  onCancel,
  onOk,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");

  const handleOnOk = async () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nhân viên để xóa!");
      return;
    }
    await onOk?.(selectedRows);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSearchText("");
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };

  const filteredDataSource = useMemo(() => {
    if (!searchText) {
      return dataSourceNhanVienMayChamCong;
    }

    const normalizedSearchText = removeDiacritics(searchText).toLowerCase();

    return dataSourceNhanVienMayChamCong.filter((employee) =>
      Object.values(employee).some((value) => {
        if (typeof value === "string") {
          const normalizedValue = removeDiacritics(value).toLowerCase();
          return normalizedValue.includes(normalizedSearchText);
        }
        if (typeof value === "number" || typeof value === "boolean") {
            const normalizedValue = String(value).toLowerCase();
            return normalizedValue.includes(normalizedSearchText);
        }
        return false;
      })
    );
  }, [dataSourceNhanVienMayChamCong, searchText]);

  const handleCancel = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSearchText("");
    onCancel?.();
  };

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: "#ff4d4f" }} />
          Xóa nhân viên trên máy chấm công
        </Space>
      }
      onCancel={handleCancel}
      cancelText="Quay về"
      onOk={handleOnOk}
      okText={`Xóa ${selectedRows.length} nhân viên`}
      okButtonProps={{
        danger: true,
        disabled: selectedRowKeys.length === 0,
      }}
      open={isVisible}
      centered={true}
      width={900}
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
            <strong>Cảnh báo:</strong> Thao tác này sẽ xóa nhân viên khỏi máy chấm
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
          nhân viên để xóa
        </span>
        <span style={{ fontSize: "12px", color: "#666" }}>
          Tổng số: {filteredDataSource?.length || 0} nhân viên
        </span>
      </div>

      {isDelete && <Progress percent={progress} size="small" status="active" style={{ marginBottom: 16 }} format={(percent) => `${percent}% Đang xóa...`} />}

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
        rowKey={"maNhanVien"}
        rowSelection={rowSelection}
        dataSource={filteredDataSource}
        columns={employeeColumns}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} nhân viên`,
        }}
        scroll={{ y: 300 }}
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
          <strong>Danh sách nhân viên sẽ xóa:</strong>
          <div style={{ marginTop: 8, maxHeight: 100, overflowY: "auto" }}>
            {selectedRows.map((row, index) => (
              <div key={index} style={{ fontSize: "12px", color: "#666" }}>
                • {row.maNhanVien} - {row.hoTen || "N/A"}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};