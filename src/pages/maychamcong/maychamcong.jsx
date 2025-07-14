import React, { useState, useMemo } from "react"; // Import useMemo
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Table,
  Row,
  Col,
  Modal,
  Form,
  Tag,
  Spin,
} from "antd";
import {
  WifiOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LockOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./maychamcong.css";
import { useMayChamCong } from "../../component/hooks/useMayChamCong";
import { useForm } from "antd/es/form/Form";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { useVanTay } from "../../component/hooks/useVanTay";
import { ModalDeleteEmployee } from "./modleHandleDeleteNhanVien";
import { ModalDeleteFingerprints } from "./modleHandleDeleteVanTay";
import { ModalUploadFingerPrintsToMayChamCong } from "./modleUploadFingerprintsToMayChamCong";
const { Title, Text } = Typography;

const removeAccents = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const MayChamCong = () => {
  const [connectionStatus, setConnectionStatus] = useState("Chưa kết nối");
  const [progress, setProgress] = useState(0);

  const [form] = useForm();
  const [logs, setLogs] = useState([]);
  const [isFunctionEnabled, setIsFunctionEnabled] = useState(false);
  const [
    isDeleteTingModalNhanVienMayChamCong,
    setIsDeleteTingModalNhanVienMayChamCong,
  ] = useState(false);
  const [isDeleteTingModalVanTay, setIsDeleteTingModalVanTay] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [isVisibleModalDeleteEmployee, setIsVisibleModalDeleteEmployee] =
    useState(false);
  const [isVisibleModalDeleteVanTay, setIsVisibleModalDeleteVanTay] =
    useState(false);
  const [isVisibleModalUploadVanTay, setIsVisibleModalUploadVanTay] =
    useState(false);
  const [selectedDbEmployees, setSelectedDbEmployees] = useState([]);
  const [searchDbEmployeeText, setSearchDbEmployeeText] = useState("");

  const {
    danhSachNhanVienMayChamCong,
    isLoadingMayChamCong,
    isConnected,
    checkConnection,
    getAllNhanVienMayChamCong,
    createNhanVienMayChamCong,
    deleteNhanVienMayChamCong,
    deleteFingerprintDBAndMayChamCong,
    syncFingerprintsToDB,
    uploadFingerprintsToMayChamCong,
  } = useMayChamCong();
  const { danhSachNhanVien } = useNhanVien();
  const {
    danhSachVanTayNhanVien,
    getAllFingerprintsOfNhanVien,
  } = useVanTay();

  const dataSourceNhanVien = danhSachNhanVien.map((nv) => {
    return {
      maNhanVien: nv.maNhanVien,
      hoTen: nv.hoTen,
      trangThai: nv.trangThai,
    };
  });

  const dataSourceDanhSachVanTayNhanVien = danhSachVanTayNhanVien.map(
    (dsvt) => {
      const dataSourceNhanVienFilter = danhSachNhanVien.find(
        (nv) => nv.maNhanVien === dsvt.maNhanVien
      );
      return {
        maNhanVien: dsvt.maNhanVien,
        hoTen: dataSourceNhanVienFilter?.hoTen || "N/A",
        viTriNgonTay: dsvt.viTriNgonTay,
      };
    }
  );

  const dataSourceNhanVienMayChamCong = danhSachNhanVienMayChamCong.map(
    (nv) => {
      return {
        maNhanVien: nv.employeeId,
        hoTen: nv.name,
        dacQuyen: nv.privilege,
        kichHoat: nv.enable,
      };
    }
  );

  const filteredDataSourceNhanVienDB = useMemo(() => {
    if (!searchDbEmployeeText) {
      return dataSourceNhanVien;
    }

    const processedSearchText =
      removeAccents(searchDbEmployeeText).toLowerCase();

    return dataSourceNhanVien.filter((record) => {
      const maNhanVienString = removeAccents(
        String(record.maNhanVien || "")
      ).toLowerCase();
      const hoTenString = removeAccents(
        String(record.hoTen || "")
      ).toLowerCase();
      const trangThaiString = removeAccents(
        String(record.trangThai || "")
      ).toLowerCase();

      return (
        maNhanVienString.includes(processedSearchText) ||
        hoTenString.includes(processedSearchText) ||
        trangThaiString.includes(processedSearchText)
      );
    });
  }, [dataSourceNhanVien, searchDbEmployeeText]);

  // --- Handlers ---
  const handleOkModalUploadNhanVien = async (selectedRows) => {
    setLogs((prev) => [...prev, "Bắt đầu cập nhật vân tay lên máy chấm công"]);
    setProgress(0);

    await uploadFingerprintsToMayChamCong(selectedRows);

    setIsVisibleModalUploadVanTay(false);
  };

  const handleReloadNhanVienMayChamCong = async () => {
    try {
      setLogs((prev) => [...prev, "Đang tải lại dữ liệu nhân viên !"]);
      const isReloadedGetAllNhanVienMayChamCong =
        await getAllNhanVienMayChamCong();
      if (isReloadedGetAllNhanVienMayChamCong) {
        setLogs((prev) => [...prev, "Tải lại dữ liêu nhân viên Thành công !"]);
      }
    } catch {
      setLogs((prev) => [...prev, "Tải lại dữ liêu nhân viên Thất bại !"]);
    }
  };

  const handleConnect = async () => {
    const values = await form.validateFields();
    const { ipAddress, port } = values;
    console.log("Connect Đến Máy chấm Công .....");

    setConnectionStatus("Đang kết nối...");
    setIsFunctionEnabled(false);
    setLogs((prev) => [
      ...prev,
      `Đang cố gắng kết nối đến ${ipAddress}:${port}...`,
    ]);

    const isSuccess = await checkConnection(ipAddress, port);

    if (isSuccess) {
      console.log("Connect thành công");
      setIsFunctionEnabled(true);
      setConnectionStatus("Đã kết nối thành công");
      setLogs((prev) => [...prev, "Kết nối thành công!"]);
      setLogs((prev) => [...prev, "Đang lấy dữ liệu nhân viên !"]);
      const isGetDataNhanVienMCCSuccess = await getAllNhanVienMayChamCong();
      if (isGetDataNhanVienMCCSuccess) {
        setLogs((prev) => [...prev, " lấy dữ liệu nhân viên thành công !"]);
      } else {
        setLogs((prev) => [...prev, " lấy dữ liệu nhân viên Thất bại !"]);
      }
    } else {
      console.log("Connect thất bại");
      setIsFunctionEnabled(false);
      setConnectionStatus("Kết nối thất bại");
      setLogs((prev) => [...prev, "Kết nối thất bại!"]);
    }
  };

  const handeCancelModelDeleteVanTay = () => {
    setIsVisibleModalDeleteVanTay(false);
  };

  const handleUpload = async (dataEmployees) => {
    try {
      const isCreatedNhanVienMayChamCong = await createNhanVienMayChamCong(
        dataEmployees
      );
      if (isCreatedNhanVienMayChamCong) {
        setLogs((prev) => [
          ...prev,
          `Đã gửi nhân viên thành công lên máy chấm công.`,
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          `Gửi nhân viên không thành công lên máy chấm công.`,
        ]);
      }
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `Lỗi trong quá trình gửi nhân viên lên máy chấm công : ${error}`,
      ]);
    }
  };

  const handleUploadEmployees = async () => {
    await handleUpload(selectedDbEmployees);
    setShowEmployeeModal(false);
    setSelectedDbEmployees([]);
    setSearchDbEmployeeText("");
    await handleReloadNhanVienMayChamCong();
  };

  const handleUploadFingerprints = async () => {
    setIsVisibleModalUploadVanTay(true);
  };

  const handleOkModalDeleteVanTay = async (selectedRows) => {
    setIsDeleteTingModalVanTay(true);
    setLogs((prev) => [...prev, "Bắt đầu xoá Vân tay trên máy chấm công"]);
    setProgress(0);

    const total = selectedRows.length;
    let completed = 0;

    const deletePromises = selectedRows.map((nv) =>
      deleteFingerprintDBAndMayChamCong(nv.maNhanVien, nv.viTriNgonTay)
        .then(() => {
          setLogs((prev) => [...prev, `Xoá Vân tay ${nv.hoTen} thành công`]);
        })
        .catch((err) => {
          setLogs((prev) => [...prev, `Lỗi xoá Vân tay ${nv.hoTen}: ${err}`]);
        })
        .finally(() => {
          completed++;
          setProgress(Math.round((completed / total) * 100));
        })
    );

    await Promise.allSettled(deletePromises);
    setIsVisibleModalDeleteVanTay(false);
    setIsDeleteTingModalVanTay(false);
  };

  const handleDownloadAttendance = async () => {
    setLogs((prev) => [
      ...prev,
      "Chức năng tải dữ liệu chấm công đang được phát triển.",
    ]);
  };

  const handleDownloadFingerprints = async () => {
    try {
      setIsSyncing(true);
      setLogs((prev) => [
        ...prev,
        "Đang đồng bộ dữ liệu vân tay từ máy chấm công về DB hệ thống",
      ]);

      await syncFingerprintsToDB();

      await getAllFingerprintsOfNhanVien();
      setLogs((prev) => [...prev, "Đồng bộ dữ liệu vân tay hoàn tất"]);
      setIsSyncing(false);
    } catch (error) {
      setLogs((prev) => [...prev, `Lỗi khi đồng bộ dữ liệu vân tay: ${error}`]);
      setIsSyncing(false);
    }
  };

  const handleDeleteEmployee = async () => {
    setIsVisibleModalDeleteEmployee(true);
  };

  const handleOnOkModal = async (selectedRows) => {
    setIsDeleteTingModalNhanVienMayChamCong(true);
    setLogs((prev) => [...prev, "Bắt đầu xoá Nhân viên trên máy chấm công"]);
    setProgress(0);

    const total = selectedRows.length;
    let completed = 0;

    const deletePromises = selectedRows.map((nv) =>
      deleteNhanVienMayChamCong(nv.maNhanVien)
        .then(() => {
          setLogs((prev) => [...prev, `Xoá Nhân viên ${nv.hoTen} thành công`]);
        })
        .catch((err) => {
          setLogs((prev) => [...prev, `Lỗi xoá nhân viên ${nv.hoTen}: ${err}`]);
        })
        .finally(() => {
          completed++;
          setProgress(Math.round((completed / total) * 100));
        })
    );

    await Promise.allSettled(deletePromises);
    await getAllNhanVienMayChamCong();
    setIsVisibleModalDeleteEmployee(false);
    setIsDeleteTingModalNhanVienMayChamCong(false);
  };

  const handleCancelModalDeleteEployeeNhanVien = () => {
    setIsVisibleModalDeleteEmployee(false);
  };

  const handleDeleteFingerprints = async () => {
    setIsVisibleModalDeleteVanTay(true);
  };

  const NhanVienDBColumns = [
    {
      title: "Mã Nhân viên",
      dataIndex: "maNhanVien",
      label: "maNhanVien",
      width: 120,
    },
    { title: "Họ Tên", dataIndex: "hoTen", label: "hoTen" },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      label: "trangThai",
      width: 150,
    },
  ];

  const NhanVienMayChamCongColumns = [
    {
      title: "Mã Nhân viên",
      dataIndex: "maNhanVien",
      label: "maNhanVien",
      width: 120,
    },
    { title: "Họ Tên", dataIndex: "hoTen", label: "hoTen" },
    {
      title: "Trạng thái",
      dataIndex: "kichHoat",
      label: "kichHoat",
      width: 150,
      render: (number) => {
        const color = number === 0 ? "red" : "green";
        return (
          <Tag color={color}>
            {number === 0 ? "Chưa kích hoạt" : "Đã kích hoạt"}
          </Tag>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedDbEmployees.map((emp) => emp.maNhanVien),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedDbEmployees(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: dataSourceNhanVienMayChamCong.some(
        (emp) => emp.maNhanVien === record.maNhanVien
      ),
    }),
  };

  return (
    <Spin spinning={isSyncing}>
      <div className="pageContainer">
        <Card title="Cấu hình Kết nối Máy Chấm Công" className="card">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="ipAddress"
                label="Địa chỉ IP"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ IP!" },
                ]}
              >
                <Input
                  placeholder="VD: 192.168.1.100"
                  disabled={isLoadingMayChamCong}
                />
              </Form.Item>

              <Form.Item
                name="port"
                label="Port"
                rules={[{ required: true, message: "Vui lòng nhập port!" }]}
              >
                <Input placeholder="VD: 4370" disabled={isLoadingMayChamCong} />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              icon={<WifiOutlined />}
              onClick={handleConnect}
              loading={isLoadingMayChamCong}
              block
              className="button"
            >
              {isLoadingMayChamCong ? "Đang kết nối..." : "Kết nối"}
            </Button>
            <Alert
              message={`Trạng thái: ${connectionStatus}`}
              type={
                isConnected
                  ? "success"
                  : isLoadingMayChamCong
                  ? "info"
                  : "error"
              }
              showIcon
            />
          </Space>
        </Card>
        <Card
          title={
            <Title level={3} className="menuCardTitle">
              Chức năng Quản lý Máy Chấm Công
            </Title>
          }
          className="card"
        >
          <Space size="middle" wrap style={{ marginBottom: 16 }}>
            <Button
              icon={<UploadOutlined />}
              onClick={() => {
                setShowEmployeeModal(true);
                setSearchDbEmployeeText("");
              }}
              disabled={!isFunctionEnabled}
              className="button"
            >
              Tải Nhân viên lên máy
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={handleUploadFingerprints}
              disabled={!isFunctionEnabled}
              className="button"
            >
              Tải Vân tay lên máy
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadAttendance}
              disabled={!isFunctionEnabled}
              className="button"
            >
              Lưu Dữ liệu Chấm công về DB
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadFingerprints}
              disabled={!isFunctionEnabled}
              className="button"
            >
              Lưu Vân tay về DB
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteEmployee}
              disabled={!isFunctionEnabled}
              className="button dangerButton"
            >
              Xóa Nhân viên (trên máy)
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteFingerprints}
              disabled={!isFunctionEnabled}
              className="button dangerButton"
            >
              Xóa Vân tay (trên máy & DB)
            </Button>
          </Space>

          <Title level={4}>Log Thao tác</Title>
          <div className="logContainer">
            {logs.length === 0 ? (
              <Text type="secondary">Chưa có thao tác nào.</Text>
            ) : (
              logs.map((log, index) => (
                <p key={index} className="logEntry">
                  {" "}
                  {/* Added key prop */}
                  <ClockCircleOutlined className="logIcon" />
                  {log}
                </p>
              ))
            )}
          </div>
        </Card>
        {/**Modal Cập nhật vân tay từ DB lên máy chấm công cho nhân viên */}
        <ModalUploadFingerPrintsToMayChamCong
          isVisible={isVisibleModalUploadVanTay}
          dataSourceNhanVienMayChamCon={dataSourceNhanVienMayChamCong}
          NhanVienChamCongEmployyes={NhanVienMayChamCongColumns}
          onCancel={() => setIsVisibleModalUploadVanTay(false)}
          onOk={handleOkModalUploadNhanVien}
          apiReload={getAllFingerprintsOfNhanVien}
        />
        {/**Modal Xoá nhân viên trên máy chấm công */}
        <ModalDeleteEmployee
          isDelete={isDeleteTingModalNhanVienMayChamCong}
          progress={progress}
          isVisible={isVisibleModalDeleteEmployee}
          onOk={handleOnOkModal}
          onCancel={handleCancelModalDeleteEployeeNhanVien}
          dataSourceNhanVienMayChamCong={dataSourceNhanVienMayChamCong}
          employeeColumns={NhanVienMayChamCongColumns}
        />
        {/**Modal Xoá vân tay nhân viên */}
        <ModalDeleteFingerprints
          isDelete={isDeleteTingModalVanTay}
          isVisible={isVisibleModalDeleteVanTay}
          onOk={handleOkModalDeleteVanTay}
          onCancel={handeCancelModelDeleteVanTay}
          dataSourceNhanVienVanTay={dataSourceDanhSachVanTayNhanVien}
          apiReload={getAllFingerprintsOfNhanVien}
        />

        {/* Modal "Tải Nhân viên lên Máy Chấm Công" */}
        <Modal
          title="Tải Nhân viên lên Máy Chấm Công"
          open={showEmployeeModal}
          onCancel={() => {
            setShowEmployeeModal(false);
            setSearchDbEmployeeText("");
            setSelectedDbEmployees([]);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setShowEmployeeModal(false);
                setSearchDbEmployeeText("");
                setSelectedDbEmployees([]);
              }}
              className="button"
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleUploadEmployees}
              disabled={selectedDbEmployees.length === 0}
              className="button"
            >
              Gửi Nhân viên đã chọn lên máy ({selectedDbEmployees.length})
            </Button>,
          ]}
          width={1000}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5} className="modalTableTitle">
                Nhân viên trong hệ thống (DB)
              </Title>
              {/* Search bar for DB employees */}
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Input
                  placeholder="Tìm kiếm trong DB..."
                  prefix={<SearchOutlined />}
                  allowClear
                  size="small"
                  style={{ width: 180 }}
                  value={searchDbEmployeeText}
                  onChange={(e) => setSearchDbEmployeeText(e.target.value)}
                />
              </div>
              <Table
                rowKey={"maNhanVien"}
                rowSelection={rowSelection}
                columns={NhanVienDBColumns}
                dataSource={filteredDataSourceNhanVienDB}
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ y: 300 }}
                locale={{ emptyText: "Không có dữ liệu nhân viên trong DB." }}
              />
            </Col>
            <Col span={12}>
              <Title level={5} className="modalTableTitle">
                Nhân viên trên Máy Chấm Công
              </Title>
              <Button
                icon={<ReloadOutlined />}
                className="button"
                style={{ marginBottom: 12 }}
                size="small"
                onClick={() => handleReloadNhanVienMayChamCong()}
              >
                Tải lại từ máy
              </Button>
              <Table
                rowKey={"maNhanVien"}
                columns={NhanVienMayChamCongColumns}
                dataSource={dataSourceNhanVienMayChamCong}
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ y: 300 }}
                locale={{ emptyText: "Không có dữ liệu nhân viên trên máy." }}
              />
            </Col>
          </Row>
          {selectedDbEmployees.length > 0 && (
            <Alert
              message={`Đã chọn ${selectedDbEmployees.length} nhân viên để gửi lên máy.`}
              type="info"
              showIcon
              className="alertInfo"
            />
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default MayChamCong;
