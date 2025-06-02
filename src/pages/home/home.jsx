import React, { useEffect, useState } from 'react';
import { 
  FaCalendarAlt, 
  FaChalkboardTeacher, 
  FaUserClock, 
  FaClipboardList, 
  FaUsers, 
  FaMoneyBillWave,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import './home.css';

function CountUp({ end, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const increment = end / (duration / 30);
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [end, duration]);
  return <span>{count}</span>;
}

export default function Home() {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Hội thảo Đào tạo kỹ năng mềm',
      date: '05/06/2025',
      description: 'Đào tạo kỹ năng giao tiếp và quản lý thời gian cho nhân viên.',
      icon: <FaChalkboardTeacher />,
      color: '#ff7f50',
    },
    {
      id: 2,
      title: 'Tập huấn phần mềm quản lý mới',
      date: '12/06/2025',
      description: 'Hướng dẫn sử dụng phần mềm chấm công và quản lý nghỉ phép mới.',
      icon: <FaCalendarAlt />,
      color: '#1e90ff',
    },
  ];

  const stats = [
    { label: 'Nhân viên đi muộn', value: 8, color: '#f5222d', icon: <FaUserClock /> },
    { label: 'Đơn nghỉ phép mới', value: 4, color: '#fa8c16', icon: <FaClipboardList /> },
    { label: 'Nhân viên nghỉ hôm nay', value: 15, color: '#1890ff', icon: <FaUsers /> },
    { label: 'Nhân viên hết hợp đồng', value: 3, color: '#722ed1', icon: <FaMoneyBillWave /> },
  ];

  const pieData = [
    { name: 'Đi muộn', value: 8 },
    { name: 'Nghỉ phép', value: 4 },
    { name: 'Nghỉ hôm nay', value: 15 },
    { name: 'Hết hợp đồng', value: 3 },
  ];
  const pieColors = ['#f5222d', '#fa8c16', '#1890ff', '#722ed1'];

  const barData = [
    { name: 'Phòng Kinh Doanh', employees: 25 },
    { name: 'Phòng Kỹ Thuật', employees: 30 },
    { name: 'Phòng Hành Chính', employees: 18 },
    { name: 'Phòng Marketing', employees: 12 },
  ];

  return (
    <div className="container">
      {/* Banner */}
      <div className="banner">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1350&q=80"
          alt="Banner sự kiện"
          className="banner-img"
          loading="lazy"
        />
        <div className="banner-overlay" />
        <div className="banner-text">
          <h1>Chào mừng đến với Phần mềm Quản lý Nhân sự</h1>
        </div>
      </div>
      <section className="events-section">
        <h2>Sự kiện đang và sắp diễn ra</h2>
        <ul className="events-list">
          {upcomingEvents.map((event) => (
            <li key={event.id} className="event-item" style={{ borderColor: event.color }}>
              <div className="event-icon" style={{ color: event.color }}>{event.icon}</div>
              <div>
                <h3>{event.title}</h3>
                <p><strong>Ngày:</strong> {event.date}</p>
                <p>{event.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="stats-section">
        <h2>Thống kê nhanh</h2>
        <div className="stats-cards">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className="stat-card" 
              style={{ background: stat.color + '33', borderColor: stat.color }}
            >
              <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="stat-value" style={{ color: stat.color }}>
                <CountUp end={stat.value} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="extra-info-section">
          <div className="charts-container">
            <div className="chart-box">
              <h3>Phân bố trạng thái nhân viên</h3>
              <PieChart width={280} height={280}>
                <Pie 
                  data={pieData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={100} 
                  fill="#8884d8" 
                  paddingAngle={4} 
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <ReLegend verticalAlign="bottom" height={36}/>
              </PieChart>
            </div>

            <div className="chart-box">
              <h3>Số lượng nhân viên theo phòng ban</h3>
              <BarChart
                width={380}
                height={280}
                data={barData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Bar dataKey="employees" fill="#108ee9" />
              </BarChart>
            </div>
          </div>

          <div className="alert-box">
            <FaExclamationTriangle size={24} color="#d4380d" style={{ marginRight: 12 }} />
            <div>
              <strong>Cảnh báo:</strong> Một số nhân viên chưa cập nhật dữ liệu chấm công trong tuần này. Vui lòng kiểm tra lại để đảm bảo tính chính xác của báo cáo.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}