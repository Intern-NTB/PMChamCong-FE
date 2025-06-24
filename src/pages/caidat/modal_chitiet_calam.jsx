import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Space, Typography, Tag, Table, Button, Form, TimePicker, Switch, Popconfirm, Spin } from 'antd';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAppNotification } from "../../component/ui/notification";

dayjs.extend(customParseFormat);

const { Text } = Typography;

const ModalChiTietCaLam = ({ isVisible, onCancel, shiftData, shiftDetailsByDay, loadingDetails, onSaveDailyShiftDetails, fetchShiftDetailsByMaCa }) => {
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [detailForm] = Form.useForm();
    const [currentDetailsState, setCurrentDetailsState] = useState([]);
    const apiNotification = useAppNotification();

    const calculateWorkingHours = useCallback((start, end, breakStart, breakEnd) => {
        if (!start || !end) return null;

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

        const totalDurationMinutes = endTime.diff(startTime, 'minute', true);
        const breakDurationMinutes = (breakStartTime && breakEndTime) ? breakEndTime.diff(breakStartTime, 'minute', true) : 0;

        const netWorkingMinutes = Math.max(0, totalDurationMinutes - breakDurationMinutes);

        return parseFloat((netWorkingMinutes / 60).toFixed(2));
    }, []);

    useEffect(() => {
        if (isVisible && shiftDetailsByDay) { // Check for shiftDetailsByDay presence
            const mappedDetails = shiftDetailsByDay.map(detail => {
                const gioBatDau = detail.GioBatDau ? dayjs(detail.GioBatDau, 'HH:mm:ss') : null;
                const gioKetThuc = detail.GioKetThuc ? dayjs(detail.GioKetThuc, 'HH:mm:ss') : null;
                const gioNghiTruaBatDau = detail.GioNghiTruaBatDau ? dayjs(detail.GioNghiTruaBatDau, 'HH:mm:ss') : null;
                const gioNghiTruaKetThuc = detail.GioNghiTruaKetThuc ? dayjs(detail.GioNghiTruaKetThuc, 'HH:mm:ss') : null;

                const calculatedHours = detail.CoLamViec === 1 && gioBatDau && gioKetThuc
                    ? calculateWorkingHours(
                        gioBatDau.format('HH:mm:ss'),
                        gioKetThuc.format('HH:mm:ss'),
                        gioNghiTruaBatDau ? gioNghiTruaBatDau.format('HH:mm:ss') : null,
                        gioNghiTruaKetThuc ? gioNghiTruaKetThuc.format('HH:mm:ss') : null
                    )
                    : null;

                return {
                    ...detail,
                    GioBatDau: gioBatDau,
                    GioKetThuc: gioKetThuc,
                    GioNghiTruaBatDau: gioNghiTruaBatDau,
                    GioNghiTruaKetThuc: gioNghiTruaKetThuc,
                    SoGioLamViec: calculatedHours,
                };
            });
            setCurrentDetailsState(mappedDetails);

            const initialFormValues = mappedDetails.reduce((acc, curr) => {
                acc[`${curr.NgayTrongTuan}_CoLamViec`] = curr.CoLamViec === 1;
                acc[`${curr.NgayTrongTuan}_GioBatDau`] = curr.GioBatDau;
                acc[`${curr.NgayTrongTuan}_GioKetThuc`] = curr.GioKetThuc;
                acc[`${curr.NgayTrongTuan}_GioNghiTruaBatDau`] = curr.GioNghiTruaBatDau;
                acc[`${curr.NgayTrongTuan}_GioNghiTruaKetThuc`] = curr.GioNghiTruaKetThuc;
                acc[`${curr.NgayTrongTuan}_SoGioLamViec`] = curr.SoGioLamViec;
                return acc;
            }, {});
            detailForm.setFieldsValue(initialFormValues);
            setIsEditingDetails(false); // Reset editing state on modal open
        } else if (!isVisible) {
            // Reset state when modal is closed
            setIsEditingDetails(false);
            setCurrentDetailsState([]);
            detailForm.resetFields();
        }
    }, [isVisible, shiftDetailsByDay, detailForm, calculateWorkingHours]);


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
        } else {
            // Recalculate hours if turning on "Co Lam Viec"
            const currentValues = detailForm.getFieldsValue();
            const currentGioBatDau = currentValues[`${dayNumber}_GioBatDau`];
            const currentGioKetThuc = currentValues[`${dayNumber}_GioKetThuc`];
            const currentGioNghiTruaBatDau = currentValues[`${dayNumber}_GioNghiTruaBatDau`];
            const currentGioNghiTruaKetThuc = currentValues[`${dayNumber}_GioNghiTruaKetThuc`];

            const calculatedHours = currentGioBatDau && currentGioKetThuc
                ? calculateWorkingHours(
                    currentGioBatDau.format('HH:mm:ss'),
                    currentGioKetThuc.format('HH:mm:ss'),
                    currentGioNghiTruaBatDau ? currentGioNghiTruaBatDau.format('HH:mm:ss') : null,
                    currentGioNghiTruaKetThuc ? currentGioNghiTruaKetThuc.format('HH:mm:ss') : null
                )
                : null;
            updatedFields[`${dayNumber}_SoGioLamViec`] = calculatedHours;
        }
        detailForm.setFieldsValue(updatedFields);
    };

    const handleDetailFormChange = useCallback((changedValues, allValues) => {
        let updatedDayNumber = null;
        for (const key in changedValues) {
            if (key.endsWith('_GioBatDau') || key.endsWith('_GioKetThuc') ||
                key.endsWith('_GioNghiTruaBatDau') || key.endsWith('_GioNghiTruaKetThuc') ||
                key.endsWith('_CoLamViec')) {
                updatedDayNumber = parseInt(key.split('_')[0]);
                break;
            }
        }

        if (updatedDayNumber) {
            const coLamViec = allValues[`${updatedDayNumber}_CoLamViec`];
            const gioBatDau = allValues[`${updatedDayNumber}_GioBatDau`];
            const gioKetThuc = allValues[`${updatedDayNumber}_GioKetThuc`];
            const gioNghiTruaBatDau = allValues[`${updatedDayNumber}_GioNghiTruaBatDau`];
            const gioNghiTruaKetThuc = allValues[`${updatedDayNumber}_GioNghiTruaKetThuc`];

            let calculatedHours = null;
            if (coLamViec && gioBatDau && gioKetThuc) {
                calculatedHours = calculateWorkingHours(
                    gioBatDau.format('HH:mm:ss'),
                    gioKetThuc.format('HH:mm:ss'),
                    gioNghiTruaBatDau ? gioNghiTruaBatDau.format('HH:mm:ss') : null,
                    gioNghiTruaKetThuc ? gioNghiTruaKetThuc.format('HH:mm:ss') : null
                );
            }

            detailForm.setFieldsValue({
                [`${updatedDayNumber}_SoGioLamViec`]: calculatedHours,
            });

            setCurrentDetailsState(prevDetails =>
                prevDetails.map(detail =>
                    detail.NgayTrongTuan === updatedDayNumber
                        ? { ...detail, SoGioLamViec: calculatedHours }
                        : detail
                )
            );
        }
    }, [detailForm, calculateWorkingHours]);


    const handleSaveDetails = async () => {
        if (!shiftData?.maCa) return;

        try {
            const values = await detailForm.validateFields();

            const formattedDetails = Array.from({ length: 7 }, (_, i) => {
                const dayNumber = i + 1;
                const coLamViec = values[`${dayNumber}_CoLamViec`];
                const gioBatDau = values[`${dayNumber}_GioBatDau`];
                const gioKetThuc = values[`${dayNumber}_GioKetThuc`];
                const gioNghiTruaBatDau = values[`${dayNumber}_GioNghiTruaBatDau`];
                const gioNghiTruaKetThuc = values[`${dayNumber}_GioNghiTruaKetThuc`];

                const soGioLamViec = coLamViec && gioBatDau && gioKetThuc
                    ? calculateWorkingHours(
                        gioBatDau.format('HH:mm:ss'),
                        gioKetThuc.format('HH:mm:ss'),
                        gioNghiTruaBatDau ? gioNghiTruaBatDau.format('HH:mm:ss') : null,
                        gioNghiTruaKetThuc ? gioNghiTruaKetThuc.format('HH:mm:ss') : null
                    )
                    : null;

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

            await onSaveDailyShiftDetails(shiftData.maCa, formattedDetails);
            setIsEditingDetails(false); // Exit edit mode on successful save
        } catch (errorInfo) {
            console.error("Lỗi khi lưu chi tiết ca làm:", errorInfo);
            apiNotification.error("Lưu chi tiết ca làm thất bại. Vui lòng kiểm tra lại thông tin.");
        }
    };

    const handleCancelEdit = () => {
        setIsEditingDetails(false);
        // Reset form fields to original details from props (shiftDetailsByDay)
        if (shiftDetailsByDay && shiftDetailsByDay.length > 0) {
            const mappedDetails = shiftDetailsByDay.map(detail => ({
                ...detail,
                GioBatDau: detail.GioBatDau ? dayjs(detail.GioBatDau, 'HH:mm:ss') : null,
                GioKetThuc: detail.GioKetThuc ? dayjs(detail.GioKetThuc, 'HH:mm:ss') : null,
                GioNghiTruaBatDau: detail.GioNghiTruaBatDau ? dayjs(detail.GioNghiTruaBatDau, 'HH:mm:ss') : null,
                GioNghiTruaKetThuc: detail.GioNghiTruaKetThuc ? dayjs(detail.GioNghiTruaKetThuc, 'HH:mm:ss') : null,
            }));
            setCurrentDetailsState(mappedDetails);
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
            detailForm.resetFields();
            setCurrentDetailsState([]);
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
                    : text;

                return isEditingDetails && detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`) ? (
                    <Form.Item
                        name={`${record.NgayTrongTuan}_GioBatDau`}
                        rules={[{ required: detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`), message: 'Bắt buộc' }]}
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
                    : text;

                return isEditingDetails && detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`) ? (
                    <Form.Item
                        name={`${record.NgayTrongTuan}_GioKetThuc`}
                        rules={[{ required: detailForm.getFieldValue(`${record.NgayTrongTuan}_CoLamViec`), message: 'Bắt buộc' }]}
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
                    : record.GioNghiTruaBatDau;
                const endValue = isEditingDetails
                    ? detailForm.getFieldValue(`${record.NgayTrongTuan}_GioNghiTruaKetThuc`)
                    : record.GioNghiTruaKetThuc;

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
                            <Popconfirm
                                title="Hủy bỏ thay đổi"
                                description="Bạn có chắc chắn muốn hủy bỏ các thay đổi?"
                                onConfirm={handleCancelEdit}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button icon={<CloseOutlined />}>
                                    Hủy
                                </Button>
                            </Popconfirm>
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
                                dataSource={currentDetailsState}
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