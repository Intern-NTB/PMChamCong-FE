import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Space, Typography, Tag, Table, Button, Form, Input, TimePicker, Switch, Popconfirm, Spin } from 'antd';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Text } = Typography;

const mockUpdateShiftDailyDetails = async (maCa, updatedDetails) => {
  console.log(`Mock API: Đang cập nhật ca ${maCa} với chi tiết:`, updatedDetails);
  return new Promise(resolve => setTimeout(() => {
    console.log("Mock API: Cập nhật thành công!");
    resolve({ success: true, updatedDetails });
  }, 1000));
};

const ModalChiTietCaLam = ({ isVisible, onCancel, shiftData, shiftDetailsByDay, loadingDetails, fetchShiftDetailsByMaCa }) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailForm] = Form.useForm();
  const [currentDetails, setCurrentDetails] = useState([]);

  const calculateWorkingHours = useCallback((start, end, breakStart, breakEnd) => {
    const startTime = dayjs(`2000-01-01 ${start}`);
    let endTime = dayjs(`2000-01-01 ${end}`);

    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, 'day');
    }

    const breakStartTime = breakStart ? dayjs(`2000-01-01 ${breakStart}`) : null;
    let breakEndTime = breakEnd ? dayjs(`2000-01-01 ${breakEnd}`) : null;

    if (breakStartTime && breakEndTime && breakEndTime.isBefore(breakStartTime)) {
      breakEndTime = breakEndTime.add(1, 'day');
    }

    const totalHours = endTime.diff(startTime, 'hour', true);
    const breakHours = (breakStartTime && breakEndTime) ? breakEndTime.diff(breakStartTime, 'hour', true) : 0;

    return Math.max(0, Math.round((totalHours - breakHours) * 10) / 10);
  }, []);

  useEffect(() => {
    if (isVisible && shiftDetailsByDay) {
      const mappedDetails = shiftDetailsByDay.map(detail => ({
        ...detail,
        GioBatDau: detail.GioBatDau ? dayjs(detail.GioBatDau, 'HH:mm:ss') : null,
        GioKetThuc: detail.GioKetThuc ? dayjs(detail.GioKetThuc, 'HH:mm:ss') : null,
        GioNghiTruaBatDau: detail.GioNghiTruaBatDau ? dayjs(detail.GioNghiTruaBatDau, 'HH:mm:ss') : null,
        GioNghiTruaKetThuc: detail.GioNghiTruaKetThuc ? dayjs(detail.GioNghiTruaKetThuc, 'HH:mm:ss') : null,
      }));
      setCurrentDetails(mappedDetails);
      detailForm.setFieldsValue(mappedDetails.reduce((acc, curr) => {
        acc[`${curr.NgayTrongTuan}_CoLamViec`] = curr.CoLamViec === 1;
        acc[`${curr.NgayTrongTuan}_GioBatDau`] = curr.GioBatDau;
        acc[`${curr.NgayTrongTuan}_GioKetThuc`] = curr.GioKetThuc;
        acc[`${curr.NgayTrongTuan}_GioNghiTruaBatDau`] = curr.GioNghiTruaBatDau;
        acc[`${curr.NgayTrongTuan}_GioNghiTruaKetThuc`] = curr.GioNghiTruaKetThuc;
        acc[`${curr.NgayTrongTuan}_SoGioLamViec`] = curr.SoGioLamViec;
        return acc;
      }, {}));
    } else {
      setIsEditingDetails(false);
      setCurrentDetails([]);
      detailForm.resetFields();
    }
  }, [isVisible, shiftDetailsByDay, detailForm]);

  const getDayName = (dayNumber) => {
    const days = {
      1: 'Chủ Nhật',
      2: 'Thứ Hai',
      3: 'Thứ Ba',
      4: 'Thứ Tư',
      5: 'Thứ Năm',
      6: 'Thứ Sáu',
      7: 'Thứ Bảy',
    };
    return days[dayNumber] || `Ngày ${dayNumber}`;
  };

  const handleToggleCoLamViec = (dayNumber, checked) => {
    const updatedFields = {};
    updatedFields[`${dayNumber}_CoLamViec`] = checked;

    if (!checked) {
      updatedFields[`${dayNumber}_GioBatDau`] = null;
      updatedFields[`${dayNumber}_GioKetThuc`] = null;
      updatedFields[`${dayNumber}_GioNghiTruaBatDau`] = null;
      updatedFields[`${dayNumber}_GioNghiTruaKetThuc`] = null;
      updatedFields[`${dayNumber}_SoGioLamViec`] = null;
    }
    detailForm.setFieldsValue(updatedFields);
  };

  const handleDetailFormChange = (changedValues, allValues) => {
    const updatedDetailsTemp = currentDetails.map(detail => {
        const dayNumber = detail.NgayTrongTuan;
        const coLamViec = allValues[`${dayNumber}_CoLamViec`];
        const gioBatDau = allValues[`${dayNumber}_GioBatDau`];
        const gioKetThuc = allValues[`${dayNumber}_GioKetThuc`];
        const gioNghiBatDau = allValues[`${dayNumber}_GioNghiTruaBatDau`];
        const gioNghiKetThuc = allValues[`${dayNumber}_GioNghiTruaKetThuc`];

        let calculatedHours = null;
        if (coLamViec && gioBatDau && gioKetThuc) {
            calculatedHours = calculateWorkingHours(
                gioBatDau.format('HH:mm:ss'),
                gioKetThuc.format('HH:mm:ss'),
                gioNghiBatDau ? gioNghiBatDau.format('HH:mm:ss') : null,
                gioNghiKetThuc ? gioNghiKetThuc.format('HH:mm:ss') : null
            );
        }

        if (detailForm.getFieldValue(`${dayNumber}_SoGioLamViec`) !== calculatedHours) {
             detailForm.setFieldsValue({
                 [`${dayNumber}_SoGioLamViec`]: calculatedHours
             });
        }

        return {
            ...detail,
            CoLamViec: coLamViec ? 1 : 0,
            GioBatDau: gioBatDau,
            GioKetThuc: gioKetThuc,
            GioNghiTruaBatDau: gioNghiBatDau,
            GioNghiTruaKetThuc: gioNghiKetThuc,
            SoGioLamViec: calculatedHours
        };
    });
    setCurrentDetails(updatedDetailsTemp);
  };

  const handleSaveDetails = async (values) => {
    if (!shiftData?.maCa) return;

    const formattedDetails = Array.from({ length: 7 }, (_, i) => {
      const dayNumber = i + 1;
      const coLamViec = values[`${dayNumber}_CoLamViec`];
      const gioBatDau = values[`${dayNumber}_GioBatDau`];
      const gioKetThuc = values[`${dayNumber}_GioKetThuc`];
      const gioNghiTruaBatDau = values[`${dayNumber}_GioNghiTruaBatDau`];
      const gioNghiTruaKetThuc = values[`${dayNumber}_GioNghiTruaKetThuc`];
      const soGioLamViec = values[`${dayNumber}_SoGioLamViec`];

      return {
        NgayTrongTuan: dayNumber,
        CoLamViec: coLamViec ? 1 : 0,
        GioBatDau: gioBatDau ? gioBatDau.format('HH:mm:ss') : null,
        GioKetThuc: gioKetThuc ? gioKetThuc.format('HH:mm:ss') : null,
        GioNghiTruaBatDau: gioNghiTruaBatDau ? gioNghiTruaBatDau.format('HH:mm:ss') : null,
        GioNghiTruaKetThuc: gioNghiTruaKetThuc ? gioNghiTruaKetThuc.format('HH:mm:ss') : null,
        SoGioLamViec: soGioLamViec,
      };
    }).sort((a, b) => a.NgayTrongTuan - b.NgayTrongTuan);

    try {
      await mockUpdateShiftDailyDetails(shiftData.maCa, formattedDetails);
      if (typeof fetchShiftDetailsByMaCa === 'function') {
        await fetchShiftDetailsByMaCa(shiftData.maCa);
      }
      setIsEditingDetails(false);
    } catch (error) {
      console.error("Lỗi khi lưu chi tiết ca làm:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDetails(false);
    if (shiftDetailsByDay) {
        const mappedDetails = shiftDetailsByDay.map(detail => ({
            ...detail,
            GioBatDau: detail.GioBatDau ? dayjs(detail.GioBatDau, 'HH:mm:ss') : null,
            GioKetThuc: detail.GioKetThuc ? dayjs(detail.GioKetThuc, 'HH:mm:ss') : null,
            GioNghiTruaBatDau: detail.GioNghiTruaBatDau ? dayjs(detail.GioNghiTruaBatDau, 'HH:mm:ss') : null,
            GioNghiTruaKetThuc: detail.GioNghiTruaKetThuc ? dayjs(detail.GioNghiTruaKetThuc, 'HH:mm:ss') : null,
        }));
        setCurrentDetails(mappedDetails);
        detailForm.setFieldsValue(mappedDetails.reduce((acc, curr) => {
            acc[`${curr.NgayTrongTuan}_CoLamViec`] = curr.CoLamViec === 1;
            acc[`${curr.NgayTrongTuan}_GioBatDau`] = curr.GioBatDau;
            acc[`${curr.NgayTrongTuan}_GioKetThuc`] = curr.GioKetThuc;
            acc[`${curr.NgayTrongTuan}_GioNghiTruaBatDau`] = curr.GioNghiTruaBatDau;
            acc[`${curr.NgayTrongTuan}_GioNghiTruaKetThuc`] = curr.GioNghiTruaKetThuc;
            acc[`${curr.NgayTrongTuan}_SoGioLamViec`] = curr.SoGioLamViec;
            return acc;
        }, {}));
    }
  };

  const detailColumns = [
    {
      title: 'Thứ',
      dataIndex: 'NgayTrongTuan',
      key: 'NgayTrongTuan',
      width: 100,
      render: (dayNumber) => <Tag color="geekblue">{getDayName(dayNumber)}</Tag>,
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Có Làm Việc',
      dataIndex: 'CoLamViec',
      key: 'CoLamViec',
      width: 120,
      render: (coLamViec, record) => (
        isEditingDetails ? (
          <Form.Item
            name={`${record.NgayTrongTuan}_CoLamViec`}
            valuePropName="checked"
            noStyle
          >
            <Switch
              checkedChildren="Có"
              unCheckedChildren="Không"
              onChange={(checked) => handleToggleCoLamViec(record.NgayTrongTuan, checked)}
            />
          </Form.Item>
        ) : (
          <Tag color={coLamViec === 1 ? 'green' : 'red'}>
            {coLamViec === 1 ? 'Có' : 'Không'}
          </Tag>
        )
      ),
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'GioBatDau',
      key: 'GioBatDau',
      width: 140,
      render: (text, record) => {
        const displayValue = isEditingDetails
          ? detailForm.getFieldValue(`${record.NgayTrongTuan}_GioBatDau`)
          : (record.GioBatDau ? dayjs(record.GioBatDau, 'HH:mm:ss') : null);

        return isEditingDetails && detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`) ? (
          <Form.Item
            name={`${record.NgayTrongTuan}_GioBatDau`}
            rules={[{ required: detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`), message: '' }]}
            noStyle
          >
            <TimePicker
              format="HH:mm"
              placeholder="Giờ Vào" 
              style={{ width: '100%' }}
              minuteStep={5}
              disabled={!detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`)}
            />
          </Form.Item>
        ) : (
          displayValue ? displayValue.format('HH:mm') : '-'
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Giờ Kết Thúc',
      dataIndex: 'GioKetThuc',
      key: 'GioKetThuc',
      width: 140,
      render: (text, record) => {
        const displayValue = isEditingDetails
          ? detailForm.getFieldValue(`${record.NgayTrongTuan}_GioKetThuc`)
          : (record.GioKetThuc ? dayjs(record.GioKetThuc, 'HH:mm:ss') : null);

        return isEditingDetails && detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`) ? (
          <Form.Item
            name={`${record.NgayTrongTuan}_GioKetThuc`}
            rules={[{ required: detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`), message: '' }]}
            noStyle
          >
            <TimePicker
              format="HH:mm"
              placeholder="Giờ Ra"
              style={{ width: '100%' }}
              minuteStep={5}
              disabled={!detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`)}
            />
          </Form.Item>
        ) : (
          displayValue ? displayValue.format('HH:mm') : '-'
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Giờ Nghỉ Trưa',
      key: 'GioNghiTrua',
      width: 250,
      render: (record) => {
        const startValue = isEditingDetails
          ? detailForm.getFieldValue(`${record.NgayTrongTuan}_GioNghiTruaBatDau`)
          : (record.GioNghiTruaBatDau ? dayjs(record.GioNghiTruaBatDau, 'HH:mm:ss') : null);
        const endValue = isEditingDetails
          ? detailForm.getFieldValue(`${record.NgayTrongTuan}_GioNghiTruaKetThuc`)
          : (record.GioNghiTruaKetThuc ? dayjs(record.GioNghiTruaKetThuc, 'HH:mm:ss') : null);

        return isEditingDetails && detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`) ? (
          <Space>
            <Form.Item
              name={`${record.NgayTrongTuan}_GioNghiTruaBatDau`}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Giờ Vào"
                style={{ width: 100 }}
                minuteStep={5}
                disabled={!detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`)}
              />
            </Form.Item>
            <Form.Item
              name={`${record.NgayTrongTuan}_GioNghiTruaKetThuc`}
              noStyle
            >
              <TimePicker
                format="HH:mm"
                placeholder="Giờ Ra"
                style={{ width: 100 }}
                minuteStep={5}
                disabled={!detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`)}
              />
            </Form.Item>
          </Space>
        ) : (
          (startValue && endValue) ? `${startValue.format('HH:mm')} - ${endValue.format('HH:mm')}` : '-'
        );
      },
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
    {
      title: 'Số Giờ Làm Việc',
      dataIndex: 'SoGioLamViec',
      key: 'SoGioLamViec',
      width: 140,
      render: (hours, record) => {
          const displayHours = detailForm.getFieldValue(`${record.NgayTrongTuan}_SoGioLamViec`);
          return displayHours !== null ? <Tag color="green">{displayHours}h</Tag> : '-';
      },
      onHeaderCell: () => ({ style: { fontFamily: 'Times New Roman' } }),
    },
  ];

  return (
    <Modal
      title={
        <Space style={{ fontFamily: 'Times New Roman' }}>
          <EyeOutlined />
          Chi Tiết Ca Làm: {shiftData?.tenCa} (Mã Ca: {shiftData?.maCa})
        </Space>
      }
      open={isVisible}
      onCancel={onCancel}
      footer={
        <Space style={{ fontFamily: 'Times New Roman', justifyContent: 'flex-end', width: '100%' }}>
          {isEditingDetails ? (
            <>
              <Button icon={<SaveOutlined />} type="primary" onClick={() => detailForm.submit()}>
                Lưu
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                Hủy
              </Button>
            </>
          ) : (
            <Button icon={<EditOutlined />} onClick={() => setIsEditingDetails(true)}>
              Sửa
            </Button>
          )}
          <Button onClick={onCancel}>Đóng</Button>
        </Space>
      }
      centered
      width={1000}
    >
      <div style={{ padding: '16px 0', fontFamily: 'Times New Roman' }}>
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
                dataSource={currentDetails}
                rowKey="NgayTrongTuan"
                pagination={false}
                loading={loadingDetails}
                size="small"
                scroll={{ x: 'max-content' }}
                rowClassName={(record) => {
                  return record.NgayTrongTuan === 1 ? 'sunday-row' : '';
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