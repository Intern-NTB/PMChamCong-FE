import { Input, Modal, QRCode } from "antd";
import { useState } from "react";
export const ModalQrCode = ({ isOpen, onBack }) => {
  const [value, setValue] = useState(
    `${import.meta.env.VITE_HOST}${import.meta.env.VITE_URL_XIN_NGHI_PHEP}`
  );
  return (
    <Modal
      centered
      open={isOpen}
      onCancel={() => {
        onBack();
        setValue(
          `${import.meta.env.VITE_HOST}${
            import.meta.env.VITE_URL_XIN_NGHI_PHEP
          }`
        );
      }}
      width="fit-content"
      okButtonProps={{ style: { display: "none" } }}
    >
      <div
        style={{
          width: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <QRCode
          errorLevel="H"
          value={value}
          icon="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        />
      </div>
      <Input value={value} onChange={(value) => setValue(value.target.value)} />
    </Modal>
  );
};
