import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Input, Modal, Row, Spin } from "antd";
import { useEffect, useState } from "react";

export const ModalEmail = ({ isOpen, updateEmailNhanVien, onBack }) => {
  const [email, setEmail] = useState("");
  const [isLoadingValidateEmail, setIsLoadingValidateEmail] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  // Validate email format đơn giản (có thể thay bằng API thật)
  const validateEmailFormat = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (!email) return;

    setIsLoadingValidateEmail(true);

    const timeoutId = setTimeout(() => {
      const isValid = validateEmailFormat(email);
      setIsValidated(isValid);
      setIsLoadingValidateEmail(false);
    }, 1000); // delay 1 giây sau khi user dừng gõ

    return () => clearTimeout(timeoutId); // cleanup khi email thay đổi
  }, [email]);

  return (
    <Modal
      open={isOpen}
      onOk={() => {
        updateEmailNhanVien(email);
        setEmail(""); // Xoá input
      }}
      onCancel={onBack}
      okText="Lưu"
      okButtonProps={{ style: { display: isValidated ? "" : "none" } }}
      cancelText="Quay lại"
      title="Bạn chưa có Email!"
    >
      <Row style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        {isLoadingValidateEmail ? (
          <Spin />
        ) : email ? (
          isValidated ? (
            <CheckCircleFilled style={{ color: "green" }} />
          ) : (
            <CloseCircleFilled style={{ color: "red" }} />
          )
        ) : null}
      </Row>
    </Modal>
  );
};
