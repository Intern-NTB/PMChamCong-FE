import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Space,
  Typography,
  Tag,
  Table,
  Button,
  Form,
  TimePicker,
  Switch,
  Popconfirm,
  Spin,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Text } = Typography;

const ModalChiTietCaLam = ({
  isVisible,
  onCancel,
  shiftData,
  shiftDetailsByDay = [],
  loadingDetails,
  createCaLamTrongTuan,
  updateCaLamTrongTuan,
}) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailForm] = Form.useForm();
  const [currentDetailsState, setCurrentDetailsState] = useState([]);
  const [originalDetails, setOriginalDetails] = useState([]); // Store original data to restore on cancel

  const calculateWorkingHours = useCallback(
    (start, end, breakStart, breakEnd) => {
      if (!start || !end) return null;

      const startTime = dayjs(`2000-01-01 ${start}`);
      let endTime = dayjs(`2000-01-01 ${end}`);

      if (endTime.isBefore(startTime)) {
        endTime = endTime.add(1, "day");
      }

      const breakStartTime = breakStart
        ? dayjs(`2000-01-01 ${breakStart}`)
        : null;
      let breakEndTime = breakEnd ? dayjs(`2000-01-01 ${breakEnd}`) : null;

      if (
        breakStartTime &&
        breakEndTime &&
        breakEndTime.isBefore(breakStartTime)
      ) {
        breakEndTime = breakEndTime.add(1, "day");
      }

      const totalDurationMinutes = endTime.diff(startTime, "minute", true);
      const breakDurationMinutes =
        breakStartTime && breakEndTime
          ? breakEndTime.diff(breakStartTime, "minute", true)
          : 0;

      const netWorkingMinutes = Math.max(
        0,
        totalDurationMinutes - breakDurationMinutes
      );

      return parseFloat((netWorkingMinutes / 60).toFixed(2));
    },
    []
  );

  const initializeDefaultShiftDetails = useCallback(() => {
    return Array.from({ length: 7 }, (_, index) => ({
      ngayTrongTuan: index + 1,
      coLamViec: 0,
      gioBatDau: null,
      gioKetThuc: null,
      gioNghiTruaBatDau: null,
      gioNghiTruaKetThuc: null,
      soGioLamViec: null,
    }));
  }, []);

  useEffect(() => {
    if (isVisible && shiftData?.maCa) {
      const defaultDetails = initializeDefaultShiftDetails();

      const detailsToUse = defaultDetails.map((defaultItem) => {
        const existingData = shiftDetailsByDay.find(
          (item) => item.ngayTrongTuan === defaultItem.ngayTrongTuan
        );

        return existingData
          ? {
              ...defaultItem,
              ...existingData,
              coLamViec: !!existingData.coLamViec, // Convert 0/1 to boolean for form
            }
          : defaultItem;
      });

      const mappedDetails = detailsToUse.map((detail) => {
        const gioBatDau = detail.gioBatDau
          ? dayjs(detail.gioBatDau, "HH:mm:ss").isValid()
            ? dayjs(detail.gioBatDau, "HH:mm:ss")
            : null
          : null;
        const gioKetThuc = detail.gioKetThuc
          ? dayjs(detail.gioKetThuc, "HH:mm:ss").isValid()
            ? dayjs(detail.gioKetThuc, "HH:mm:ss")
            : null
          : null;
        const gioNghiTruaBatDau = detail.gioNghiTruaBatDau
          ? dayjs(detail.gioNghiTruaBatDau, "HH:mm:ss").isValid()
            ? dayjs(detail.gioNghiTruaBatDau, "HH:mm:ss")
            : null
          : null;
        const gioNghiTruaKetThuc = detail.gioNghiTruaKetThuc
          ? dayjs(detail.gioNghiTruaKetThuc, "HH:mm:ss").isValid()
            ? dayjs(detail.gioNghiTruaKetThuc, "HH:mm:ss")
            : null
          : null;

        const calculatedHours =
          detail.coLamViec && gioBatDau && gioKetThuc
            ? calculateWorkingHours(
                gioBatDau.format("HH:mm:ss"),
                gioKetThuc.format("HH:mm:ss"),
                gioNghiTruaBatDau ? gioNghiTruaBatDau.format("HH:mm:ss") : null,
                gioNghiTruaKetThuc
                  ? gioNghiTruaKetThuc.format("HH:mm:ss")
                  : null
              )
            : null;

        return {
          ...detail,
          gioBatDau,
          gioKetThuc,
          gioNghiTruaBatDau,
          gioNghiTruaKetThuc,
          soGioLamViec: calculatedHours,
          isExisting: !!shiftDetailsByDay.find(
            (item) => item.ngayTrongTuan === detail.ngayTrongTuan
          ),
        };
      });

      setCurrentDetailsState(mappedDetails);
      setOriginalDetails(mappedDetails); // Preserve original data

      const initialFormValues = mappedDetails.reduce((acc, curr) => {
        acc[`${curr.ngayTrongTuan}_coLamViec`] = curr.coLamViec;
        acc[`${curr.ngayTrongTuan}_gioBatDau`] = curr.gioBatDau;
        acc[`${curr.ngayTrongTuan}_gioKetThuc`] = curr.gioKetThuc;
        acc[`${curr.ngayTrongTuan}_gioNghiTruaBatDau`] = curr.gioNghiTruaBatDau;
        acc[`${curr.ngayTrongTuan}_gioNghiTruaKetThuc`] =
          curr.gioNghiTruaKetThuc;
        acc[`${curr.ngayTrongTuan}_soGioLamViec`] = curr.soGioLamViec;
        return acc;
      }, {});

      detailForm.setFieldsValue(initialFormValues);
      setIsEditingDetails(false);
    } else if (!isVisible) {
      setIsEditingDetails(false);
      setCurrentDetailsState([]);
      setOriginalDetails([]);
      detailForm.resetFields();
    }
  }, [
    isVisible,
    shiftData,
    shiftDetailsByDay,
    detailForm,
    calculateWorkingHours,
    initializeDefaultShiftDetails,
  ]);

  const getDayName = (dayNumber) => {
    const days = {
      1: "Chủ Nhật",
      2: "Thứ Hai",
      3: "Thứ Ba",
      4: "Thứ Tư",
      5: "Thứ Năm",
      6: "Thứ Sáu",
      7: "Thứ Bảy",
    };
    return days[dayNumber] || `Ngày ${dayNumber}`;
  };

  const handleTogglecoLamViec = (dayNumber, checked) => {
    const updatedFields = {};
    updatedFields[`${dayNumber}_coLamViec`] = checked;

    if (!checked) {
      updatedFields[`${dayNumber}_gioBatDau`] = null;
      updatedFields[`${dayNumber}_gioKetThuc`] = null;
      updatedFields[`${dayNumber}_gioNghiTruaBatDau`] = null;
      updatedFields[`${dayNumber}_gioNghiTruaKetThuc`] = null;
      updatedFields[`${dayNumber}_soGioLamViec`] = null;
    } else {
      // Check if there's existing data in shiftDetailsByDay (from DB)
      const dbDayData = shiftDetailsByDay.find(
        (item) => item.ngayTrongTuan === dayNumber
      );

      // Kiểm tra xem có dữ liệu thực tế hay không (thay vì kiểm tra isExisting)
      if (dbDayData && (dbDayData.gioBatDau || dbDayData.gioKetThuc)) {
        // Restore data from DB
        const gioBatDau = dbDayData.gioBatDau
          ? dayjs(dbDayData.gioBatDau, ["HH:mm:ss", "HH:mm"]).isValid()
            ? dayjs(dbDayData.gioBatDau, ["HH:mm:ss", "HH:mm"])
            : null
          : null;
        const gioKetThuc = dbDayData.gioKetThuc
          ? dayjs(dbDayData.gioKetThuc, ["HH:mm:ss", "HH:mm"]).isValid()
            ? dayjs(dbDayData.gioKetThuc, ["HH:mm:ss", "HH:mm"])
            : null
          : null;
        const gioNghiTruaBatDau = dbDayData.gioNghiTruaBatDau
          ? dayjs(dbDayData.gioNghiTruaBatDau, ["HH:mm:ss", "HH:mm"]).isValid()
            ? dayjs(dbDayData.gioNghiTruaBatDau, ["HH:mm:ss", "HH:mm"])
            : null
          : null;
        const gioNghiTruaKetThuc = dbDayData.gioNghiTruaKetThuc
          ? dayjs(dbDayData.gioNghiTruaKetThuc, ["HH:mm:ss", "HH:mm"]).isValid()
            ? dayjs(dbDayData.gioNghiTruaKetThuc, ["HH:mm:ss", "HH:mm"])
            : null
          : null;

        const calculatedHours =
          gioBatDau && gioKetThuc
            ? calculateWorkingHours(
                gioBatDau.format("HH:mm:ss"),
                gioKetThuc.format("HH:mm:ss"),
                gioNghiTruaBatDau ? gioNghiTruaBatDau.format("HH:mm:ss") : null,
                gioNghiTruaKetThuc
                  ? gioNghiTruaKetThuc.format("HH:mm:ss")
                  : null
              )
            : null;

        updatedFields[`${dayNumber}_gioBatDau`] = gioBatDau;
        updatedFields[`${dayNumber}_gioKetThuc`] = gioKetThuc;
        updatedFields[`${dayNumber}_gioNghiTruaBatDau`] = gioNghiTruaBatDau;
        updatedFields[`${dayNumber}_gioNghiTruaKetThuc`] = gioNghiTruaKetThuc;
        updatedFields[`${dayNumber}_soGioLamViec`] = calculatedHours;
      } else {
        // Use default times if no DB data
        const defaultStartTime = dayjs("08:00:00", "HH:mm:ss");
        const defaultEndTime = dayjs("17:00:00", "HH:mm:ss");
        const defaultBreakStart = dayjs("12:00:00", "HH:mm:ss");
        const defaultBreakEnd = dayjs("13:00:00", "HH:mm:ss");

        updatedFields[`${dayNumber}_gioBatDau`] = defaultStartTime;
        updatedFields[`${dayNumber}_gioKetThuc`] = defaultEndTime;
        updatedFields[`${dayNumber}_gioNghiTruaBatDau`] = defaultBreakStart;
        updatedFields[`${dayNumber}_gioNghiTruaKetThuc`] = defaultBreakEnd;

        const calculatedHours = calculateWorkingHours(
          defaultStartTime.format("HH:mm:ss"),
          defaultEndTime.format("HH:mm:ss"),
          defaultBreakStart.format("HH:mm:ss"),
          defaultBreakEnd.format("HH:mm:ss")
        );
        updatedFields[`${dayNumber}_soGioLamViec`] = calculatedHours;
      }
    }

    detailForm.setFieldsValue(updatedFields);

    setCurrentDetailsState((prevDetails) =>
      prevDetails.map((detail) =>
        detail.ngayTrongTuan === dayNumber
          ? {
              ...detail,
              coLamViec: checked ? 1 : 0,
              gioBatDau: updatedFields[`${dayNumber}_gioBatDau`],
              gioKetThuc: updatedFields[`${dayNumber}_gioKetThuc`],
              gioNghiTruaBatDau:
                updatedFields[`${dayNumber}_gioNghiTruaBatDau`],
              gioNghiTruaKetThuc:
                updatedFields[`${dayNumber}_gioNghiTruaKetThuc`],
              soGioLamViec: updatedFields[`${dayNumber}_soGioLamViec`],
            }
          : detail
      )
    );
  };

  const handleDetailFormChange = useCallback(
    (changedValues, allValues) => {
      let updatedDayNumber = null;
      for (const key in changedValues) {
        if (key.includes("_")) {
          updatedDayNumber = parseInt(key.split("_")[0]);
          break;
        }
      }

      if (updatedDayNumber) {
        const coLamViec = allValues[`${updatedDayNumber}_coLamViec`];
        const gioBatDau = allValues[`${updatedDayNumber}_gioBatDau`];
        const gioKetThuc = allValues[`${updatedDayNumber}_gioKetThuc`];
        const gioNghiTruaBatDau =
          allValues[`${updatedDayNumber}_gioNghiTruaBatDau`];
        const gioNghiTruaKetThuc =
          allValues[`${updatedDayNumber}_gioNghiTruaKetThuc`];

        let calculatedHours = null;
        if (coLamViec && gioBatDau && gioKetThuc) {
          calculatedHours = calculateWorkingHours(
            gioBatDau.format("HH:mm:ss"),
            gioKetThuc.format("HH:mm:ss"),
            gioNghiTruaBatDau ? gioNghiTruaBatDau.format("HH:mm:ss") : null,
            gioNghiTruaKetThuc ? gioNghiTruaKetThuc.format("HH:mm:ss") : null
          );
        }

        detailForm.setFieldsValue({
          [`${updatedDayNumber}_soGioLamViec`]: calculatedHours,
        });

        setCurrentDetailsState((prevDetails) =>
          prevDetails.map((detail) =>
            detail.ngayTrongTuan === updatedDayNumber
              ? {
                  ...detail,
                  coLamViec,
                  gioBatDau,
                  gioKetThuc,
                  gioNghiTruaBatDau,
                  gioNghiTruaKetThuc,
                  soGioLamViec: calculatedHours,
                }
              : detail
          )
        );
      }
    },
    [detailForm, calculateWorkingHours]
  );

  const handleSaveDetails = async () => {
    if (!shiftData?.maCa) {
      console.error("Không tìm thấy mã ca làm việc");
      return;
    }

    try {
      const values = await detailForm.validateFields();

      const formattedDetails = Array.from({ length: 7 }, (_, i) => {
        const dayNumber = i + 1;
        const coLamViec = values[`${dayNumber}_coLamViec`] ? 1 : 0;
        const gioBatDau = values[`${dayNumber}_gioBatDau`];
        const gioKetThuc = values[`${dayNumber}_gioKetThuc`];
        const gioNghiTruaBatDau = values[`${dayNumber}_gioNghiTruaBatDau`];
        const gioNghiTruaKetThuc = values[`${dayNumber}_gioNghiTruaKetThuc`];

        const existingRecord = shiftDetailsByDay.find(
          (item) => item.ngayTrongTuan === dayNumber
        );

        return {
          maCa: shiftData.maCa,
          ngayTrongTuan: dayNumber,
          coLamViec,
          gioBatDau: gioBatDau ? dayjs(gioBatDau).format("HH:mm:ss") : null,
          gioKetThuc: gioKetThuc ? dayjs(gioKetThuc).format("HH:mm:ss") : null,
          gioNghiTruaBatDau: gioNghiTruaBatDau
            ? dayjs(gioNghiTruaBatDau).format("HH:mm:ss")
            : null,
          gioNghiTruaKetThuc: gioNghiTruaKetThuc
            ? dayjs(gioNghiTruaKetThuc).format("HH:mm:ss")
            : null,
          isExisting: !!existingRecord,
        };
      });

      for (const dataCaLamTrongTuan of formattedDetails) {
        if (dataCaLamTrongTuan.isExisting) {
          await updateCaLamTrongTuan(dataCaLamTrongTuan);
        } else if (dataCaLamTrongTuan.coLamViec) {
          await createCaLamTrongTuan(dataCaLamTrongTuan);
        }
      }

      // Update originalDetails with saved data
      setOriginalDetails(
        formattedDetails.map((item) => ({
          ...item,
          coLamViec: !!item.coLamViec, // Convert 0/1 to boolean for form
          gioBatDau: item.gioBatDau ? dayjs(item.gioBatDau, "HH:mm:ss") : null,
          gioKetThuc: item.gioKetThuc
            ? dayjs(item.gioKetThuc, "HH:mm:ss")
            : null,
          gioNghiTruaBatDau: item.gioNghiTruaBatDau
            ? dayjs(item.gioNghiTruaBatDau, "HH:mm:ss")
            : null,
          gioNghiTruaKetThuc: item.gioNghiTruaKetThuc
            ? dayjs(item.gioNghiTruaKetThuc, "HH:mm:ss")
            : null,
          soGioLamViec:
            item.coLamViec && item.gioBatDau && item.gioKetThuc
              ? calculateWorkingHours(
                  item.gioBatDau,
                  item.gioKetThuc,
                  item.gioNghiTruaBatDau,
                  item.gioNghiTruaKetThuc
                )
              : null,
        }))
      );

      setIsEditingDetails(false);
      console.log("Lưu chi tiết ca làm thành công!");
    } catch (errorInfo) {
      console.error("Lưu chi tiết ca làm thất bại: ", errorInfo);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDetails(false);
    setCurrentDetailsState(originalDetails); // Restore original data
    detailForm.setFieldsValue(
      originalDetails.reduce((acc, curr) => {
        acc[`${curr.ngayTrongTuan}_coLamViec`] = curr.coLamViec;
        acc[`${curr.ngayTrongTuan}_gioBatDau`] = curr.gioBatDau;
        acc[`${curr.ngayTrongTuan}_gioKetThuc`] = curr.gioKetThuc;
        acc[`${curr.ngayTrongTuan}_gioNghiTruaBatDau`] = curr.gioNghiTruaBatDau;
        acc[`${curr.ngayTrongTuan}_gioNghiTruaKetThuc`] =
          curr.gioNghiTruaKetThuc;
        acc[`${curr.ngayTrongTuan}_soGioLamViec`] = curr.soGioLamViec;
        return acc;
      }, {})
    );
  };

  const detailColumns = [
    {
      title: "Thứ",
      dataIndex: "ngayTrongTuan",
      key: "ngayTrongTuan",
      width: 100,
      render: (dayNumber) => (
        <Tag color="geekblue">{getDayName(dayNumber)}</Tag>
      ),
      onHeaderCell: () => ({ style: { fontFamily: "Times New Roman" } }),
    },
    {
      title: "Có Làm Việc",
      dataIndex: "coLamViec",
      key: "coLamViec",
      width: 120,
      render: (coLamViec, record) =>
        isEditingDetails ? (
          <Form.Item
            name={`${record.ngayTrongTuan}_coLamViec`}
            valuePropName="checked"
            noStyle
          >
            <Switch
              checkedChildren="Có"
              unCheckedChildren="Không"
              onChange={(checked) =>
                handleTogglecoLamViec(record.ngayTrongTuan, checked)
              }
            />
          </Form.Item>
        ) : (
          <Tag color={coLamViec ? "green" : "red"}>
            {coLamViec ? "Có" : "Không"}
          </Tag>
        ),
      onHeaderCell: () => ({ style: { fontFamily: "Times New Roman" } }),
    },
    {
      title: "Giờ Bắt Đầu",
      dataIndex: "gioBatDau",
      key: "gioBatDau",
      width: 140,
      render: (text, record) => {
        const displayValue = isEditingDetails
          ? detailForm.getFieldValue(`${record.ngayTrongTuan}_gioBatDau`)
          : text;

        return isEditingDetails &&
          detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`) ? (
          <Form.Item
            name={`${record.ngayTrongTuan}_gioBatDau`}
            rules={[
              {
                required: detailForm.getFieldValue(
                  `${record.ngayTrongTuan}_coLamViec`
                ),
                message: "Bắt buộc",
              },
            ]}
            noStyle
          >
            <TimePicker
              format="HH:mm"
              placeholder="Giờ Vào"
              style={{ width: "100%" }}
              minuteStep={5}
              disabled={
                !detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`)
              }
            />
          </Form.Item>
        ) : displayValue ? (
          displayValue.format("HH:mm")
        ) : (
          "-"
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: "Times New Roman" } }),
    },
    {
      title: "Giờ Kết Thúc",
      dataIndex: "gioKetThuc",
      key: "gioKetThuc",
      width: 140,
      render: (text, record) => {
        const displayValue = isEditingDetails
          ? detailForm.getFieldValue(`${record.ngayTrongTuan}_gioKetThuc`)
          : text;

        return isEditingDetails &&
          detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`) ? (
          <Form.Item
            name={`${record.ngayTrongTuan}_gioKetThuc`}
            rules={[
              {
                required: detailForm.getFieldValue(
                  `${record.ngayTrongTuan}_coLamViec`
                ),
                message: "Bắt buộc",
              },
            ]}
            noStyle
          >
            <TimePicker
              format="HH:mm"
              placeholder="Giờ Ra"
              style={{ width: "100%" }}
              minuteStep={5}
              disabled={
                !detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`)
              }
            />
          </Form.Item>
        ) : displayValue ? (
          displayValue.format("HH:mm")
        ) : (
          "-"
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: "Times New Roman" } }),
    },
    {
      title: "Giờ Nghỉ Trưa",
      key: "gioNghiTrua",
      width: 250,
      render: (record) => {
        const startValue = isEditingDetails
          ? detailForm.getFieldValue(
              `${record.ngayTrongTuan}_gioNghiTruaBatDau`
            )
          : record.gioNghiTruaBatDau;
        const endValue = isEditingDetails
          ? detailForm.getFieldValue(
              `${record.ngayTrongTuan}_gioNghiTruaKetThuc`
            )
          : record.gioNghiTruaKetThuc;

        return isEditingDetails &&
          detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`) ? (
          <Space>
            <Form.Item
              name={`${record.ngayTrongTuan}_gioNghiTruaBatDau`}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Giờ Vào"
                style={{ width: 100 }}
                minuteStep={5}
                disabled={
                  !detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`)
                }
              />
            </Form.Item>
            <Form.Item
              name={`${record.ngayTrongTuan}_gioNghiTruaKetThuc`}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Giờ Ra"
                style={{ width: 100 }}
                minuteStep={5}
                disabled={
                  !detailForm.getFieldValue(`${record.ngayTrongTuan}_coLamViec`)
                }
              />
            </Form.Item>
          </Space>
        ) : startValue && endValue ? (
          `${startValue.format("HH:mm")} - ${endValue.format("HH:mm")}`
        ) : (
          "-"
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: "Times New Roman" } }),
    },
    {
      title: "Số Giờ Làm Việc",
      dataIndex: "soGioLamViec",
      key: "soGioLamViec",
      width: 140,
      render: (hours, record) => {
        const displayHours = isEditingDetails
          ? detailForm.getFieldValue(`${record.ngayTrongTuan}_soGioLamViec`)
          : hours;
        return displayHours !== null && displayHours !== undefined ? (
          <Tag color="green">{displayHours}h</Tag>
        ) : (
          "-"
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: "Times New Roman" } }),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ fontFamily: "Times New Roman", display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <EyeOutlined />
          <span>
            Chi Tiết Ca Làm: {shiftData?.tenCa} (Mã Ca: {shiftData?.maCa})
          </span>
        </div>
      }
      open={isVisible}
      onCancel={onCancel}
      footer={
        <Space
          style={{
            fontFamily: "Times New Roman",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {isEditingDetails ? (
            <>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSaveDetails}
              >
                Lưu
              </Button>
              <Popconfirm
                title="Hủy bỏ thay đổi"
                description="Bạn có chắc chắn muốn hủy bỏ các thay đổi?"
                onConfirm={handleCancelEdit}
                okText="Có"
                cancelText="Không"
              >
                <Button icon={<CloseOutlined />}>Hủy</Button>
              </Popconfirm>
            </>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditingDetails(true)}
            >
              Sửa
            </Button>
          )}
          <Button onClick={onCancel}>Đóng</Button>
        </Space>
      }
      centered
      width={1000}
    >
      <div style={{ padding: "16px 0", fontFamily: "Times New Roman" }}>
        {shiftData ? (
          <Form
            form={detailForm}
            layout="vertical"
            onFinish={handleSaveDetails}
            onValuesChange={handleDetailFormChange}
          >
            <Spin spinning={loadingDetails}>
              <Table
                columns={detailColumns}
                dataSource={currentDetailsState}
                rowKey={(record) =>
                  `${record.maCa || shiftData?.maCa}-${record.ngayTrongTuan}`
                }
                pagination={false}
                loading={loadingDetails}
                size="small"
                scroll={{ x: "max-content" }}
                rowClassName={(record) => {
                  return record.ngayTrongTuan === 1 ? "sunday-row" : "";
                }}
              />
            </Spin>
          </Form>
        ) : (
          <Text>Không có dữ liệu chi tiết ca làm.</Text>
        )}
      </div>
    </Modal>
  );
};

export default ModalChiTietCaLam;
