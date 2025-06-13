import { Modal, Table, Progress } from "antd";
import { useState } from "react";

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

  const handleOnOk = async () => {
    await onOk?.(selectedRows);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };

  return (
    <Modal
      title="Xoá nhân viên trên máy chấm công"
      onCancel={onCancel}
      cancelText="Quay về"
      onOk={handleOnOk}
      okText={`Xoá ${selectedRows.length} nhân viên`}
      okButtonProps={{
        disabled: selectedRowKeys.length === 0,
      }}
      open={isVisible}
      centered={true}
    >
      {isDelete && <Progress percent={progress} size="small" />}
      <Table
        rowKey={"maNhanVien"}
        rowSelection={rowSelection}
        dataSource={dataSourceNhanVienMayChamCong}
        columns={employeeColumns}
      />
    </Modal>
  );
};
