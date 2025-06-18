import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, DatePicker, Tag, Space, ConfigProvider, Row, Col, Typography, Card, Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";

import {
    CalendarOutlined,
    MinusCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    HourglassOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import isBetween from "dayjs/plugin/isBetween";
import duration from "dayjs/plugin/duration";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(isBetween);
dayjs.extend(duration);

dayjs.locale("vi");

const { Text, Title } = Typography;

import { exportPersonalAttendanceExcel } from './exportAttendance';

/**
 * @param {string} text
 * @returns {string}
 */
const formatTime = (text) => {
    if (!text) return "00:00:00";
    try {
        const d = dayjs(text);
        if (d.isValid()) {
            return d.format('HH:mm:ss');
        }
        const parts = String(text).split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${(parts[2] || '00').padStart(2, '0')}`;
        }
        return "00:00:00";
    } catch (error) {
        console.error("Error formatting time:", text, error);
        return "00:00:00";
    }
};

/**
 * @param {dayjs.Dayjs} selectedMonth
 * @param {Array<Object>} danhSachChamCongChiTiet
 * @param {string} maNhanVien
 * @returns {Array<Object>}
 */
const processAttendanceDataForCalendar = (selectedMonth, danhSachChamCongChiTiet, maNhanVien) => {
    if (!selectedMonth || !selectedMonth.isValid()) {
        return [];
    }

    const startOfMonth = selectedMonth.startOf('month');
    const endOfMonth = selectedMonth.endOf('month');
    const daysInMonth = selectedMonth.daysInMonth();

    const processedData = {};

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDay = startOfMonth.date(i);
        processedData[currentDay.format('YYYY-MM-DD')] = {
            date: currentDay,
            dayOfMonth: i,
            dayOfWeek: currentDay.weekday(),
            chamCong: null,
            isWeekend: currentDay.day() === 0,
            isHoliday: false,
            isLeave: false,
            isAbsent: false,
            isHalfDayAbsent: false,
            isOvertimeDay: false,
        };
    }

    danhSachChamCongChiTiet.forEach(item => {
        if (item.maNhanVien === maNhanVien) {
            const itemDate = dayjs(item.ngayChamCong);
            if (itemDate.isBetween(startOfMonth, endOfMonth, 'day', '[]')) {
                const dateKey = itemDate.format('YYYY-MM-DD');
                if (processedData[dateKey]) {
                    processedData[dateKey].chamCong = item;
                    if (item.trangThai === "Tăng ca" || item.trangThai === "Tăng ca hoàn tất") {
                        processedData[dateKey].isOvertimeDay = true;
                    }
                    if (item.trangThai === "Chưa hoàn tất" && !item.thoiGianVao && !item.thoiGianRa) {
                        processedData[dateKey].isAbsent = true;
                    } else if (item.cong !== undefined && item.cong !== null && item.cong < 1 && item.cong > 0) {
                        if (item.cong === 0.5) {
                            processedData[dateKey].isHalfDayAbsent = true;
                        }
                    }
                }
            }
        }
    });

    return Object.values(processedData);
};

export default function ModalChiTietChamCong({
    isVisible,
    onCancel,
    selectedNhanVien,
    danhSachChamCongChiTiet,
}) {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const processedCalendarData = useMemo(() => {
        if (!selectedNhanVien || !danhSachChamCongChiTiet) {
            return [];
        }
        return processAttendanceDataForCalendar(selectedMonth, danhSachChamCongChiTiet, selectedNhanVien.maNhanVien);
    }, [selectedNhanVien, danhSachChamCongChiTiet, selectedMonth]);

    const attendanceStatistics = useMemo(() => {
        let totalWorkDays = 0;
        let totalActualWorkHours = 0;
        let totalAbsentDays = 0;
        let totalHalfDayAbsent = 0;
        let totalOvertimeDays = 0;
        let totalLeaveDays = 0;
        let totalHolidayDays = 0;

        processedCalendarData.forEach(day => {
            if (day.chamCong) {
                totalWorkDays += (day.chamCong.cong || 0);

                if (day.chamCong.thoiGianVao && day.chamCong.thoiGianRa) {
                    const checkIn = dayjs(day.chamCong.ngayChamCong + 'T' + formatTime(day.chamCong.thoiGianVao));
                    const checkOut = dayjs(day.chamCong.ngayChamCong + 'T' + formatTime(day.chamCong.thoiGianRa));
                    if (checkOut.isValid() && checkIn.isValid() && checkOut.isAfter(checkIn)) {
                        const diffMinutes = dayjs.duration(checkOut.diff(checkIn)).asMinutes();
                        totalActualWorkHours += diffMinutes;
                    }
                }
            }

            if (day.isAbsent) {
                totalAbsentDays += 1;
            }
            if (day.isHalfDayAbsent) {
                totalHalfDayAbsent += 1;
            }
            if (day.isOvertimeDay) {
                totalOvertimeDays += 1;
            }
            if (day.isLeave) {
                totalLeaveDays += 1;
            }
            if (day.isHoliday) {
                totalHolidayDays += 1;
            }
        });

        const hours = Math.floor(totalActualWorkHours / 60);
        const minutes = Math.round(totalActualWorkHours % 60);
        const formattedTotalHours = `${hours}h ${minutes}m`;

        return {
            totalWorkDays: totalWorkDays.toFixed(2),
            totalActualWorkHours: formattedTotalHours,
            totalAbsentDays,
            totalHalfDayAbsent,
            totalOvertimeDays,
            totalLeaveDays,
            totalHolidayDays,
            annualLeaveQuota: 'N/A',
            leaveTaken: 'N/A',
            leaveRemaining: 'N/A',
            unpaidLeave: 'N/A',
        };
    }, [processedCalendarData]);


    useEffect(() => {
        if (selectedNhanVien) {
            setSelectedMonth(dayjs());
        }
    }, [selectedNhanVien]);

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
    };

    const handleExport = useCallback(() => {
        exportPersonalAttendanceExcel(selectedNhanVien, selectedMonth, processedCalendarData, attendanceStatistics);
    }, [selectedNhanVien, selectedMonth, processedCalendarData, attendanceStatistics]);


    const renderDayCell = useCallback((dayData) => {
        const { date, dayOfMonth, chamCong, isWeekend, isHoliday, isLeave, isAbsent, isHalfDayAbsent, isOvertimeDay } = dayData;

        let backgroundColor = "#fff";
        let textColor = "#333";
        let dayNumberColor = 'inherit';

        if (isAbsent) {
            backgroundColor = "#fef2f2";
            textColor = "#ef4444";
            dayNumberColor = '#ef4444';
        } else if (isHalfDayAbsent) {
            backgroundColor = "#fdf2f8";
            textColor = "#db2777";
            dayNumberColor = '#db2777';
        } else if (isHoliday) {
            backgroundColor = "#fde68a";
            textColor = "#b45309";
            dayNumberColor = '#b45309';
        } else if (isLeave) {
            backgroundColor = "#bfdbfe";
            textColor = "#2563eb";
            dayNumberColor = '#2563eb';
        } else if (isOvertimeDay) {
            backgroundColor = chamCong?.trangThai === "Tăng ca hoàn tất" ? "#e0f2f1" : "#fee2e2";
            textColor = chamCong?.trangThai === "Tăng ca hoàn tất" ? "#00796b" : "#dc2626";
            dayNumberColor = chamCong?.trangThai === "Tăng ca hoàn tất" ? '#00796b' : '#dc2626';
        } else if (chamCong && chamCong.trangThai === "Hoàn tất") {
            backgroundColor = "#dcfce7";
            textColor = "#16a34a";
            dayNumberColor = '#16a34a';
        } else if (chamCong?.cong !== undefined && chamCong?.cong !== null && chamCong.cong < 1 && chamCong.cong > 0) {
            backgroundColor = "#f0f2f5";
            textColor = "#555";
        } else if (isWeekend) {
            backgroundColor = "#f0f0f0";
            dayNumberColor = 'red';
        }

        let dayCellClass = "day-cell";
        if (date.isSame(dayjs(), 'day')) {
            dayCellClass += " current-day";
            if (!isAbsent && !isHalfDayAbsent && !isHoliday && !isLeave && !isOvertimeDay) {
                backgroundColor = "#e3f2fd";
                textColor = "#1976d2";
                dayNumberColor = '#1976d2';
            }
        }

        const gioVao = chamCong?.thoiGianVao ? formatTime(chamCong.thoiGianVao).substring(0, 5) : '-';
        const gioRa = chamCong?.thoiGianRa ? formatTime(chamCong.thoiGianRa).substring(0, 5) : '-';
        const cong = chamCong?.cong !== undefined && chamCong?.cong !== null ? chamCong.cong.toFixed(2) : '-';
        const caHC = chamCong?.caLamViec || 'HC';

        return (
            <Col
                key={date.format('YYYY-MM-DD')}
                className={dayCellClass}
                span={24 / 7}
                style={{
                    border: '1px solid #e0e0e0',
                    padding: '8px',
                    textAlign: 'center',
                    backgroundColor: backgroundColor,
                    color: textColor,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '100px',
                }}
            >
                <div style={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: dayNumberColor
                }}>
                    {dayOfMonth}
                </div>
                <div style={{ fontSize: '11px', lineHeight: '1.2' }}>
                    {chamCong ? (
                        <>
                            <div>V: {gioVao}</div>
                            <div>R: {gioRa}</div>
                            <div>{cong} công</div>
                            <div>{caHC}</div>
                        </>
                    ) : (
                        <>
                            {isAbsent && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>0 N</div>}
                            {isHalfDayAbsent && <div style={{ color: '#db2777', fontWeight: 'bold' }}>0.5 VN</div>}
                            {!(isAbsent || isHalfDayAbsent || isWeekend || isHoliday || isLeave || isOvertimeDay) && <div>-</div>}
                            {!(isAbsent || isHalfDayAbsent) && <div>-</div>}
                            {!(isAbsent || isHalfDayAbsent) && <div>-</div>}
                            {!(isAbsent || isHalfDayAbsent) && <div>{isWeekend ? 'Nghỉ' : 'HC'}</div>}
                        </>
                    )}
                </div>
            </Col>
        );
    }, []);

    const weekDays = useMemo(() => {
        return [
            { name: 'T2', color: 'inherit' },
            { name: 'T3', color: 'inherit' },
            { name: 'T4', color: 'inherit' },
            { name: 'T5', color: 'inherit' },
            { name: 'T6', color: 'inherit' },
            { name: 'T7', color: 'inherit' },
            { name: 'CN', color: 'red' },
        ];
    }, []);

    const firstDayOfMonth = selectedMonth.startOf('month').weekday();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const emptyCells = Array.from({ length: startOffset }, (_, i) => (
        <Col key={`empty-${i}`} className="day-cell-empty" span={24 / 7}>
        </Col>
    ));

    return (
        <Modal
            title={
                selectedNhanVien
                    ? `Lịch chấm công của ${selectedNhanVien.hoTen} (${selectedNhanVien.maNhanVien})`
                    : "Lịch chấm công chi tiết"
            }
            open={isVisible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            style={{ top: 20 }}
            styles={{
                body: {
                    padding: 0
                }
            }}
        >
            <ConfigProvider locale={viVN}>
                <div style={{ padding: '0 0 24px 0' }}>
                    <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', padding: '0 24px' }}>
                        <DatePicker
                            picker="month"
                            placeholder="Chọn tháng"
                            onChange={handleMonthChange}
                            value={selectedMonth}
                            format="MM/YYYY"
                            style={{ width: 150 }}
                            allowClear={false}
                        />
                        <Button
                            type="primary"
                            icon={<FileExcelOutlined />}
                            onClick={handleExport}
                            disabled={!selectedNhanVien || !processedCalendarData.length}
                        >
                            Xuất Excel
                        </Button>
                    </Space>

                    <Row gutter={[16, 0]} style={{ padding: '0 24px' }}>
                        <Col span={16}>
                            <Card size="small" style={{ marginBottom: 20, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                <Space wrap size={[16, 8]}>
                                    <Tag color="#dcfce7" style={{ color: '#16a34a', borderColor: '#bbf7d0' }}>Hoàn tất</Tag>
                                    <Tag color="#fee2e2" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>Ngày tăng ca: TC</Tag>
                                    <Tag color="#fde68a" style={{ color: '#b45309', borderColor: '#fcd34d' }}>Nghỉ lễ: NL</Tag>
                                    <Tag color="#bfdbfe" style={{ color: '#2563eb', borderColor: '#93c5fd' }}>Xin nghỉ: XN</Tag>
                                    <Tag color="#fef2f2" style={{ color: '#ef4444', borderColor: '#fecaca' }}>Vắng: 0 N</Tag>
                                    <Tag color="#fdf2f8" style={{ color: '#db2777', borderColor: '#fbcfe8' }}>Vắng nửa ngày: 0.5 VN</Tag>
                                    <Tag color="#f0f2f5" style={{ color: '#555', borderColor: '#ccc' }}>Thiếu công: 0.xx</Tag>
                                </Space>
                            </Card>

                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                <Row justify="start" style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                    {weekDays.map(day => (
                                        <Col key={day.name} span={24 / 7} style={{ textAlign: 'center', padding: '8px 0', color: day.color }}>{day.name}</Col>
                                    ))}
                                </Row>
                                <Row gutter={[0, 0]}>
                                    {emptyCells}
                                    {processedCalendarData.map(renderDayCell)}
                                </Row>
                            </div>
                        </Col>
                        <Col span={8}>
                            <Card
                                title={
                                    <Space size={8}>
                                        <CalendarOutlined style={{ color: '#1890ff' }} />
                                        <Title level={5} style={{ marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            Thống kê tháng {selectedMonth.format('MM/YYYY')}
                                        </Title>
                                    </Space>
                                }
                                size="small"
                                style={{ marginBottom: 16, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                            >
                                <Row gutter={[16, 8]}>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                          
                                            <Text strong>Tổng số công:</Text>
                                            <Text>{attendanceStatistics.totalWorkDays}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                           
                                            <Text strong>Tổng giờ làm thực tế:</Text>
                                            <Text>{attendanceStatistics.totalActualWorkHours}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                      
                                            <Text strong>Số ngày vắng:</Text>
                                            <Text>{attendanceStatistics.totalAbsentDays}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                          
                                            <Text strong>Số ngày vắng nửa buổi:</Text>
                                            <Text>{attendanceStatistics.totalHalfDayAbsent}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                         
                                            <Text strong>Số ngày tăng ca:</Text>
                                            <Text>{attendanceStatistics.totalOvertimeDays}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                           
                                            <Text strong>Số ngày nghỉ lễ/phép:</Text>
                                            <Text>{attendanceStatistics.totalHolidayDays + attendanceStatistics.totalLeaveDays}</Text>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>

                            <Card
                                title={
                                    <Space size={8}>
                                        <CalendarOutlined style={{ color: '#1890ff' }} />
                                        <Title level={5} style={{ marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            Tổng kết nghỉ phép năm
                                        </Title>
                                    </Space>
                                }
                                size="small"
                                style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                            >
                                <Row gutter={[16, 8]}>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                        
                                            <Text strong>Số ngày phép cả năm:</Text>
                                            <Text>{attendanceStatistics.annualLeaveQuota}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                            
                                            <Text strong>Số ngày phép đã nghỉ:</Text>
                                            <Text>{attendanceStatistics.leaveTaken}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                      
                                            <Text strong>Số ngày phép còn lại:</Text>
                                            <Text>{attendanceStatistics.leaveRemaining}</Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                         
                                            <Text strong>Số ngày nghỉ không lương:</Text>
                                            <Text>{attendanceStatistics.unpaidLeave}</Text>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </ConfigProvider>
            <style jsx>{`
                .day-cell {
                    box-sizing: border-box;
                }
                .day-cell-empty {
                    box-sizing: border-box;
                    background-color: #f9f9f9;
                    border: 1px solid #f0f0f0;
                    min-height: 100px;
                }
                .current-day {
                    border: 2px solid #1890ff !important;
                }
            `}</style>
        </Modal>
    );
}