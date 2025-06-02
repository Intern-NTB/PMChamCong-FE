import React from "react";
import { Modal, Descriptions } from "antd";

export default function LuongDetailModal({ visible, onCancel, record }) {
  if (!record) return null;

  return (
    <Modal
      visible={visible}
      title={`Chi tiết bảng lương - ${record.hoTen}`}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Lương cơ bản">
          {record.luongCoBan.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Phụ cấp">
          {record.tienPhuCap.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Lương thưởng">
          {record.tienThuong.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Mức phạt">
          {record.mucPhat.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Tăng ca">{record.tangCa}</Descriptions.Item>
        <Descriptions.Item label="Vi phạm">{record.viPham}</Descriptions.Item>
        <Descriptions.Item label="Số lần đi muộn">{record.lanDiMuon}</Descriptions.Item>
        <Descriptions.Item label="Số lần về sớm">{record.lanVeSom}</Descriptions.Item>
        <Descriptions.Item label="Số lần nghỉ có phép">
          {record.nghiCoPhep}
        </Descriptions.Item>
        <Descriptions.Item label="Số lần nghỉ không phép">
          {record.nghiKhongPhep}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
