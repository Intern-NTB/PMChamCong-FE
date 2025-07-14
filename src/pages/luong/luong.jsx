/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Checkbox,
  Modal,
  Form,
  Dropdown,
  Menu,
  ConfigProvider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import locale from "antd/locale/vi_VN";
dayjs.locale("vi");
import { useLuong } from "../../component/hooks/useLuong";
import { useNhanVien } from "../../component/hooks/useNhanVien";
import { usePhongBan } from "../../component/hooks/usePhongBan";
import { useNgayPhep } from "../../component/hooks/useNgayPhep";
import { ReloadContext } from "../../context/reloadContext";
import { useAppNotification } from "../../component/ui/notification";
import { useLichSuThuong } from "../../component/hooks/useLichSuTienThuong";
import { useLichSuTru } from "../../component/hooks/useLichSuTienTru";
import { useLoaiTienThuong } from "../../component/hooks/useLoaiTienThuong";
import { useLoaiTienTru } from "../../component/hooks/useLoaiTienTru";
import { useChamCong } from "../../component/hooks/useChamCong";
import ModalChiTietChamCong from "../chamcong/modal_chi_tiet_cham_cong";
import {
  exportToExcel,
  exportIndividualToExcel,
} from "./exportToExcel_version2";
import {
  generateMultipleDetailedPDFs,
  generateSinglePDFMultiplePages,
} from "./generatePDF";

import "./luong.css";
const { Title } = Typography;
const { Option } = Select;

export default function Luong() {
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs());
  const [searchValue, setSearchValue] = useState("");
  const [selectedPhongBan, setSelectedPhongBan] = useState(null);

  const { danhSachChamCongChiTiet } = useChamCong();
  const { getTienQuyDoiNgayPhep } = useNgayPhep(false);
  const [isModalChamCongChiTietVisible, setIsModalChamCongChiTietVisible] =
    useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBaoGomTienQuyDoiPhep, setIsBaoGomTienQuyDoiPhep] = useState(false);
  const [duLieuThongTinTienQuyDoi, setDuLieuThongTinTienQuyDoi] =
    useState(null);

  // Modal tính lương
  const [isTinhLuongModalVisible, setIsTinhLuongModalVisible] = useState(false);
  const [tinhLuongForm] = Form.useForm();

  const { danhSachLuong, createLuong, createLuongById } = useLuong();
  const { danhSachNhanVien } = useNhanVien();
  const { danhSachPhongBan } = usePhongBan();
  const { danhSachLichSuThuong } = useLichSuThuong();
  const { danhSachLichSuTru } = useLichSuTru();
  const { danhSachLoaiTienTru } = useLoaiTienTru();
  const { danhSachLoaiTienThuong } = useLoaiTienThuong();
  const apiNotification = useAppNotification();

  const dataSourceLuong = danhSachLuong.map((dsl) => {
    const danhSachNhanVienFind = danhSachNhanVien.find(
      (nv) => nv.maNhanVien === dsl.maNhanVien
    );

    const danhSachPhongBanFind = danhSachPhongBan.find(
      (pb) => danhSachNhanVienFind?.maPhongBan === pb.maPhongBan
    );

    const danhSachLichSuTruFind = danhSachLichSuTru.filter((lst) => {
      if (lst.maNhanVien !== dsl.maNhanVien) return false;
      const ngayTru = dayjs(lst.ngayTao, "YYYY-MM-DD");
      return (
        ngayTru.month() + 1 === selectedMonthYear.month() + 1 &&
        ngayTru.year() === selectedMonthYear.year()
      );
    });

    const danhSachLichSuThuongFind = danhSachLichSuThuong.filter((lsth) => {
      if (lsth.maNhanVien !== dsl.maNhanVien) return false;
      const ngayThuong = dayjs(lsth.ngayTao, "YYYY-MM-DD");
      return (
        ngayThuong.month() + 1 === selectedMonthYear.month() + 1 &&
        ngayThuong.year() === selectedMonthYear.year()
      );
    });
    const danhSachLichSuTruFinal = danhSachLichSuTruFind.map((tru) => {
      const loaiTru = danhSachLoaiTienTru.find(
        (ltt) => ltt.maLoaiTienTru === tru.maLoaiTienTru
      );
      return {
        ...tru,
        tenLoaiTienTru: loaiTru?.tenLoaiTienTru || "N/A",
        soTienTru: loaiTru?.soTienTru || 0,
        donVi: loaiTru?.donVi || "N/A",
      };
    });

    const danhSachLichSuThuongFinal = danhSachLichSuThuongFind.map((thuong) => {
      const loaiThuong = danhSachLoaiTienThuong.find(
        (ltt) => ltt.maLoaiTienThuong === thuong.maLoaiTienThuong
      );
      return {
        ...thuong,
        tenLoaiTienThuong: loaiThuong?.tenLoaiTienThuong || "N/A",
        soTienThuong: loaiThuong?.soTienThuong || 0,
        donVi: loaiThuong?.donVi || "N/A",
      };
    });
    return {
      maNhanVien: dsl.maNhanVien,
      nam: dsl.nam,
      thang: dsl.thang,
      soNgayLe: dsl.soNgayLe,
      soNgayNghi: dsl.soNgayNghi,
      soNgayNghiCoLuong: dsl.soNgayNghiCoLuong || 0,
      soNgayNghiCoPhep: dsl.soNgayNghiCoPhep || 0,
      soNgayCong: dsl.soNgayCong,
      congChuanCuaThang: dsl.congChuanCuaThang,
      soGioTangCa: dsl.soGioTangCa,
      tienThuong: dsl.tienThuong,
      tongTienPhuCap: dsl.tongTienPhuCap,
      tongLuong: dsl.tongLuong,
      tienTru: dsl.tienTru,
      tongTienTangCa: dsl.tongTienTangCa,
      luongGio: dsl.luongGio,
      luongTheoNgay: dsl.luongTheoNgay || 0,
      luongNgayNghi: dsl.luongNgayNghi || 0,
      soNgayNghiTruLuong: dsl.soNgayNghiTruLuong || 0,
      tongSoTienNgayNghiTruLuong: dsl.tongSoTienNgayNghiTruLuong || 0,
      hoTen: danhSachNhanVienFind?.hoTen || "N/A",
      heSoTangCa: danhSachNhanVienFind?.heSoTangCa || 0,
      luongCoBan: danhSachNhanVienFind?.luongCoBan || 0,
      tenPhongBan: danhSachPhongBanFind?.tenPhongBan || "N/A",
      danhSachLichSuTru: danhSachLichSuTruFinal,
      danhSachLichSuThuong: danhSachLichSuThuongFinal,
    };
  });

  useEffect(() => {
    if (isBaoGomTienQuyDoiPhep && selectedRows.length > 0) {
      const fetchLeaveConversionData = async () => {
        const conversionData = {};

        for (const maNhanVien of selectedRows) {
          try {
            const body = {
              nam: dayjs(selectedMonthYear).year(),
              thang: dayjs(selectedMonthYear).month() + 1,
            };
            const result = await getTienQuyDoiNgayPhep(maNhanVien, body);
            conversionData[maNhanVien] = result;
          } catch (error) {
            console.error(error);
          }
        }

        setDuLieuThongTinTienQuyDoi(conversionData);
      };

      fetchLeaveConversionData();
    } else {
      setDuLieuThongTinTienQuyDoi({});
    }
  }, [isBaoGomTienQuyDoiPhep, selectedRows, selectedMonthYear]);

  // Menu cho Excel
  const menuExcel = (
    <Menu>
      <Menu.Item key="1">
        <Button
          type="text"
          onClick={() => {
            if (selectedRows.length !== 0) {
              exportToExcelIndividuaHandler();
            } else {
              apiNotification.warning({
                message: "Vui lòng chọn ít nhất 1 nhân viên !",
              });
            }
          }}
        >
          Xuất lương cho nhân viên
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button
          type="text"
          onClick={() => {
            if (selectedRows.length !== 0) {
              exportToExcelHandler();
            } else {
              apiNotification.warning({
                message: "Vui lòng chọn ít nhất 1 nhân viên !",
              });
            }
          }}
        >
          Xuất báo cáo
        </Button>
      </Menu.Item>
    </Menu>
  );

  // Menu cho PDF
  const menuPdf = (
    <Menu>
      <Menu.Item key="1">
        <Button
          type="text"
          onClick={() => {
            if (selectedRows.length !== 0) {
              generateMultipagePDFHandler();
            } else {
              apiNotification.warning({
                message: "Vui lòng chọn ít nhất 1 nhân viên !",
              });
            }
          }}
        >
          Xuất lương cho nhân viên
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button
          type="text"
          onClick={() => {
            if (selectedRows.length !== 0) {
              generateSummaryPDFHandler();
            } else {
              apiNotification.warning({
                message: "Vui lòng chọn ít nhất 1 nhân viên !",
              });
            }
          }}
        >
          Xuất báo cáo
        </Button>
      </Menu.Item>
    </Menu>
  );
  const filteredData = useMemo(() => {
    return dataSourceLuong.filter((item) => {
      // Tìm kiếm theo tên
      const matchesSearch = searchValue
        ? item.hoTen.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(item.maNhanVien)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        : true;

      // Lọc theo phòng ban
      const matchesPhongBan = selectedPhongBan
        ? item.tenPhongBan === selectedPhongBan
        : true;

      // Lọc theo tháng/năm - sửa lại logic
      const matchesDateFilter = selectedMonthYear
        ? item.thang === selectedMonthYear.month() + 1 && // month() trả về 0-11, cần +1
          item.nam === selectedMonthYear.year()
        : true;

      return matchesSearch && matchesPhongBan && matchesDateFilter;
    });
  }, [searchValue, selectedPhongBan, selectedMonthYear, dataSourceLuong]);

  const columns = [
    {
      title: (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectAll}
            onChange={(e) => {
              setSelectAll(e.target.checked);
              if (e.target.checked) {
                setSelectedRows(filteredData.map((item) => item.maNhanVien));
              } else {
                setSelectedRows([]);
              }
            }}
          />
        </div>
      ),
      key: "select",
      width: 60,
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedRows.includes(record.maNhanVien)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows([...selectedRows, record.maNhanVien]);
              } else {
                setSelectedRows(
                  selectedRows.filter(
                    (maNhanVien) => maNhanVien !== record.maNhanVien
                  )
                );
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Năm",
      dataIndex: "nam",
      key: "nam",
      width: 100,
      align: "center",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Tháng",
      dataIndex: "thang",
      key: "thang",
      width: 100,
      align: "center",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Mã NV",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      width: 100,
      align: "center",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Họ tên",
      dataIndex: "hoTen",
      key: "hoTen",
      width: 160,
      ellipsis: true,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      width: 140,
      ellipsis: true,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Công chuẩn của tháng",
      dataIndex: "congChuanCuaThang",
      key: "congChuanCuaThang",
      width: 160,
      ellipsis: true,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày công làm việc",
      dataIndex: "soNgayCong",
      key: "soNgayCong",
      width: 160,
      ellipsis: true,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Lương cơ bản",
      dataIndex: "luongCoBan",
      key: "luongCoBan",
      width: 120,
      align: "right",
      render: (luongCoBan) =>
        new Intl.NumberFormat("vi-VN").format(Number(luongCoBan)),
    },
    {
      title: "Phụ cấp",
      dataIndex: "tongTienPhuCap",
      key: "tongTienPhuCap",
      width: 110,
      align: "right",
      render: (phuCap) => new Intl.NumberFormat("vi-VN").format(Number(phuCap)),
    },
    {
      title: "Thưởng",
      dataIndex: "tienThuong",
      key: "tienThuong",
      width: 110,
      align: "right",
      render: (thuong) => new Intl.NumberFormat("vi-VN").format(Number(thuong)),
    },
    {
      title: "Phạt",
      dataIndex: "tienTru",
      key: "tienTru",
      width: 110,
      align: "right",
      render: (phat) => new Intl.NumberFormat("vi-VN").format(Number(phat)),
    },
    {
      title: "Tổng tiền tăng ca",
      dataIndex: "tongTienTangCa",
      key: "tongTienTangCa",
      width: 110,
      align: "right",
      render: (tongTienTangCa) =>
        new Intl.NumberFormat("vi-VN").format(Number(tongTienTangCa)),
    },
    {
      title: "Thực nhận",
      dataIndex: "tongLuong",
      key: "tongLuong",
      width: 120,
      align: "right",
      render: (thucNhan) =>
        new Intl.NumberFormat("vi-VN").format(Number(thucNhan)),
      sorter: {
        compare: (a, b) => a.tongLuong - b.tongLuong,
        multiple: 2,
      },
    },
  ];

  const onMonthYearChange = (date) => {
    if (date) {
      setSelectedMonthYear(date);
    }
  };

  const exportToExcelHandler = () => {
    const selectedData = filteredData.filter((record) =>
      selectedRows.includes(record.maNhanVien)
    );

    const duLieuTienQuyDoiTheoNhanVien = {};
    selectedData.forEach((record) => {
      duLieuTienQuyDoiTheoNhanVien[record.maNhanVien] =
        duLieuThongTinTienQuyDoi[record.maNhanVien] || { soTienQuyDoi: 0 };
    });

    exportToExcel(
      selectedData,
      selectedMonthYear.format("MM/YYYY"),
      selectedPhongBan,
      false,
      duLieuTienQuyDoiTheoNhanVien,
      isBaoGomTienQuyDoiPhep
    );
  };

  const exportToExcelIndividuaHandler = () => {
    const selectedData = filteredData.filter((record) =>
      selectedRows.includes(record.maNhanVien)
    );

    const duLieuTienQuyDoiTheoNhanVien = {};
    selectedData.forEach((record) => {
      duLieuTienQuyDoiTheoNhanVien[record.maNhanVien] =
        duLieuThongTinTienQuyDoi[record.maNhanVien] || { soTienQuyDoi: 0 };
    });
    exportIndividualToExcel(
      selectedData,
      selectedMonthYear.format("MM/YYYY"),
      false,
      duLieuTienQuyDoiTheoNhanVien,
      isBaoGomTienQuyDoiPhep
    );
  };

  const generateSummaryPDFHandler = async () => {
    const selectedData = filteredData.filter((record) =>
      selectedRows.includes(record.maNhanVien)
    );

    if (selectedData.length === 0) {
      alert("Vui lòng chọn ít nhất một nhân viên để in.");
      return;
    }

    // Tạo PDF duy nhất với nhiều trang (một trang cho mỗi nhân viên)
    generateSinglePDFMultiplePages(
      selectedData,
      selectedMonthYear.format("MM/YYYY"),
      duLieuThongTinTienQuyDoi,
      isBaoGomTienQuyDoiPhep
    );
  };

  const generateMultipagePDFHandler = async () => {
    const selectedData = filteredData.filter((record) =>
      selectedRows.includes(record.maNhanVien)
    );

    if (selectedData.length === 0) {
      alert("Vui lòng chọn ít nhất một nhân viên để in.");
      return;
    }

    // Tạo nhiều file PDF riêng biệt (mỗi nhân viên một file)
    generateMultipleDetailedPDFs(
      selectedData,
      selectedMonthYear.format("MM/YYYY"),
      duLieuThongTinTienQuyDoi,
      isBaoGomTienQuyDoiPhep
    );
  };

  const handleTinhLuong = () => {
    setIsTinhLuongModalVisible(true);
    // Đặt giá trị mặc định cho form
    tinhLuongForm.setFieldsValue({
      thangNam: selectedMonthYear,
      phongBan: selectedPhongBan,
    });
  };

  const handleTinhLuongSubmit = async (values) => {
    try {
      if (values.nhanVienIds && values.nhanVienIds.length > 0) {
        // Tính lương cho các nhân viên cụ thể
        for (const maNhanVien of values.nhanVienIds) {
          const valuesFormated = {
            nam: Number(dayjs(values.thangNam).format("YYYY")),
            thang: Number(dayjs(values.thangNam).format("MM")),
            maNhanVien,
          };
          await createLuongById(valuesFormated);
        }
      } else {
        // Tính lương cho tất cả nhân viên
        const valuesFormated = {
          nam: Number(dayjs(values.thangNam).format("YYYY")),
          thang: Number(dayjs(values.thangNam).format("MM")),
        };
        await createLuong(valuesFormated);
      }
    } catch (error) {
      console.error("Lỗi khi tính lương:", error);
    } finally {
      setIsTinhLuongModalVisible(false);
      tinhLuongForm.resetFields();
    }
  };

  // Update selectAll state based on selectedRows
  useEffect(() => {
    if (filteredData.length > 0) {
      setSelectAll(selectedRows.length === filteredData.length);
    } else {
      setSelectAll(false);
    }
  }, [selectedRows, filteredData]);

  return (
    <div className="luong-container">
      <Row justify="center" align="middle" className="title-row">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Title level={2} className="title-text">
            BẢNG LƯƠNG THÁNG {selectedMonthYear.format("M/YYYY")}
            <CalendarOutlined className="calendar-icon" />
          </Title>
        </div>
      </Row>

      <Row
        justify="start"
        align="middle"
        className="toolbar-row"
        gutter={[16, 8]}
      >
        <Col>
          <Input
            placeholder="Tìm nhân viên (tên hoặc mã NV)"
            prefix={<SearchOutlined className="icon-style" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            size="large"
            className="toolbar-input"
            style={{ width: 250 }}
          />
        </Col>

        <Col>
          <Select
            placeholder="Chọn phòng ban"
            value={selectedPhongBan}
            onChange={setSelectedPhongBan}
            allowClear
            size="large"
            className="toolbar-select"
            style={{ width: 180 }}
          >
            {danhSachPhongBan.map((pb) => (
              <Option key={pb.maPhongBan} value={pb.tenPhongBan}>
                {pb.tenPhongBan}
              </Option>
            ))}
          </Select>
        </Col>

        <Col>
          <ConfigProvider locale={locale}>
            <DatePicker
              picker="month"
              value={selectedMonthYear}
              onChange={onMonthYearChange}
              format="MM/YYYY"
              size="large"
              className="toolbar-date-picker"
              placeholder="Chọn tháng/năm"
            />
          </ConfigProvider>
        </Col>

        <Col flex="auto" />

        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined className="icon-style" />}
            size="large"
            className="toolbar-button"
            onClick={handleTinhLuong}
          >
            Tính lương
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} nhân viên`,
        }}
        scroll={{ x: 1500 }}
        rowKey={(record) =>
          `${record.nam}-${record.thang}-${record.maNhanVien}`
        }
        size="middle"
        className="custom-table"
        onRow={(record) => {
          return {
            onClick: () => {
              setSelectedNhanVien(record);
              setIsModalChamCongChiTietVisible(true);
            },
          };
        }}
      />

      <Space style={{ marginTop: 16 }}>
        <Dropdown overlay={menuExcel}>
          <Button>
            Xuất Excel <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown overlay={menuPdf}>
          <Button>
            Xuất PDF <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
      <Checkbox
        disabled={selectedRows.length === 0 ? true : false}
        style={{ marginLeft: 12 }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => {
          e.stopPropagation();
          // Thay đổi logic này để cho phép bật/tắt
          setIsBaoGomTienQuyDoiPhep(e.target.checked);
        }}
        checked={isBaoGomTienQuyDoiPhep} // Thêm thuộc tính checked để hiển thị trạng thái
      >
        Thêm thông tin tiền quy đổi phép
      </Checkbox>

      {/* Modal Tính Lương */}
      <Modal
        title="Tính Lương"
        open={isTinhLuongModalVisible}
        onCancel={() => {
          setIsTinhLuongModalVisible(false);
          tinhLuongForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={tinhLuongForm}
          layout="vertical"
          onFinish={handleTinhLuongSubmit}
          initialValues={{
            thangNam: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="thangNam"
                label="Tháng/Năm"
                rules={[
                  { required: true, message: "Vui lòng chọn tháng/năm!" },
                ]}
              >
                <ConfigProvider locale={locale}>
                  <DatePicker
                    picker="month"
                    format="MM/YYYY"
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Chọn tháng/năm"
                  />
                </ConfigProvider>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="nhanVienIds" label="Nhân viên cụ thể (tùy chọn)">
            <Select
              mode="multiple"
              placeholder="Chọn nhân viên (để trống sẽ tính cho tất cả)"
              allowClear
              size="large"
              showSearch
              filterOption={(input, option) =>
                (option.label || "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {danhSachNhanVien.map((nv) => (
                <Option
                  key={nv.maNhanVien}
                  value={nv.maNhanVien}
                  label={`${nv.hoTen} - ${nv.cmnd}`}
                >
                  {nv.hoTen} - {nv.cmnd}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsTinhLuongModalVisible(false);
                  tinhLuongForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tính lương
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ModalChiTietChamCong
        isVisible={isModalChamCongChiTietVisible}
        onCancel={() => setIsModalChamCongChiTietVisible(false)}
        selectedNhanVien={selectedNhanVien}
        danhSachChamCongChiTiet={danhSachChamCongChiTiet}
      />
    </div>
  );
}