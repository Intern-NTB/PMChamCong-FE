import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Drawer } from "antd";
import ScrollToTop from "../../config/utils/scroll_to_top";
import {
  ReloadOutlined,
  UnorderedListOutlined,
  UserOutlined,
  DollarOutlined,
  BarChartOutlined,
  HomeOutlined,
  SolutionOutlined,
  ScheduleOutlined,
  SettingFilled,
  MenuOutlined,
  LogoutOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import LogoIcon from "../../assets/images/LogoIcon.png";
import "./mainLayout.css"; 
import { useState, useEffect, useMemo, useCallback } from "react";
import { ReloadContext } from "../../context/reloadContext";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const pathToTitle = useMemo(() => ({
    "/main-layout/trangchu": "Trang Chủ",
    "/main-layout/nhanvien": "Quản Lý Nhân Viên",
    "/main-layout/nghiphep": "Nghỉ Phép",
    "/main-layout/chamcong": "Chấm Công",
    "/main-layout/maychamcong": "Máy Chấm Công",
    "/main-layout/luong": "Lương",
    "/main-layout/baocao": "Báo Cáo",
    "/main-layout/caidat": "Cài Đặt",
  }), []);

  const taiKhoan = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("taiKhoan") || "{}");
    } catch (e) {
      console.error("Lỗi khi parse tài khoản từ localStorage:", e);
      return {};
    }
  }, []);

  const location = useLocation();
  const title = pathToTitle[location.pathname] || "Quản lý nhân sự";

  const [reloadFn, setReloadFnState] = useState(() => () => {});
  const setReloadFn = useCallback((fn) => {
    setReloadFnState(() => fn);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [collapsed, setCollapsed] = useState(true); 

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 992); 
    };

    checkScreenSize(); 
    window.addEventListener("resize", checkScreenSize); 
    return () => window.removeEventListener("resize", checkScreenSize); 
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token"); 
    window.location.replace("/login"); 
  }, []);

  const menuItems = useMemo(() => [
    {
      key: "/main-layout/trangchu",
      icon: <HomeOutlined />,
      label: <Link to="/main-layout/trangchu">Trang Chủ</Link>,
    },
    {
      key: "sub1", 
      icon: <UserOutlined />,
      label: "Quản Lý Nhân Viên",
      children: [
        {
          key: "/main-layout/nhanvien",
          icon: <UnorderedListOutlined />,
          label: <Link to="/main-layout/nhanvien">Nhân viên</Link>,
        },
        {
          key: "/main-layout/nghiphep",
          icon: <SolutionOutlined />,
          label: <Link to="/main-layout/nghiphep">Nghỉ Phép</Link>,
        },
      ],
    },
    {
      key: "/main-layout/chamcong",
      icon: <ScheduleOutlined />,
      label: <Link to="/main-layout/chamcong">Chấm Công</Link>,
    },
    {
      key: "/main-layout/maychamcong",
      icon: <DesktopOutlined />,
      label: <Link to="/main-layout/maychamcong">Máy Chấm Công</Link>,
    },
    {
      key: "/main-layout/luong",
      icon: <DollarOutlined />,
      label: <Link to="/main-layout/luong">Lương</Link>,
    },
    {
      key: "/main-layout/baocao",
      icon: <BarChartOutlined />,
      label: <Link to="/main-layout/baocao">Báo Cáo</Link>,
    },
    {
      key: "/main-layout/caidat",
      icon: <SettingFilled />,
      label: <Link to="/main-layout/caidat">Cài đặt</Link>,
    },
  ], []);

  const getSelectedKeys = useCallback(() => {
    const path = location.pathname;
    let keys = [];

    const directMatch = menuItems.find(item => item.key === path);
    if (directMatch) {
      keys.push(directMatch.key);
    }

    const subMenu = menuItems.find(item => item.children && item.children.some(child => child.key === path));
    if (subMenu) {
      keys.push(subMenu.key);
      keys.push(path);       
    }

    if (keys.length === 0) {
      keys.push("/main-layout/trangchu");
    }

    return keys;
  }, [location.pathname, menuItems]);

  const menuContent = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "20px 0" : "16px 0",
          overflow: 'hidden', 
          transition: 'width 0.2s ease', 
          width: collapsed ? '80px' : '300px', 
        }}
      >
        {/* Removed the MenuOutlined icon from here as requested */}
      </div>
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()} 
        theme="dark" 
        onClick={() => {
     
          if (isMobile) {
            setDrawerVisible(false);
          }
        }}
        style={{
          background: "transparent", 
          border: "none",
        }}
        items={menuItems} 
      />
    </>
  );

  if (isMobile) {
    return (
      <Layout style={{ height: "100dvh", minHeight: "100dvh" }}>
        <Header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid grey",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            height: "65px",
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            size="large"
            style={{ fontSize: "18px" }}
          />
          <h2 style={{ margin: 0, flex: 1, textAlign: "center" }}>{title}</h2>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="text"
            size="large"
            style={{ marginRight: 12 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => reloadFn()}
            size="large"
          />
        </Header>

        {/* Mobile Drawer for navigation */}
        <Drawer
          title={null}
          placement="left"
          closable={false} 
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width="100vw" 
          styles={{
            body: {
              padding: 0,
              background: "#71A5E0", 
              height: "100vh",
            },
            header: {
              display: "none",
            },
          }}
        >
          <div
            style={{
              height: "100vh",
              background: "#71A5E0",
              position: "relative",
            }}
          >
            {/* Custom close button for the drawer */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 1000,
              }}
            >
              <Button
                type="text"
                onClick={() => setDrawerVisible(false)}
                style={{
                  color: "white",
                  fontSize: "20px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </Button>
            </div>

            {menuContent} {/* Render the shared menu content */}
          </div>
        </Drawer>

        {/* Main content area for mobile */}
        <Content
          style={{
            margin: "12px",
            padding: "16px",
            background: "#fff",
            minHeight: 0,
            overflow: "auto",
            flex: 1,
          }}
        >
          <ReloadContext.Provider
            value={{ reload: reloadFn, setReload: setReloadFn }}
          >
            <Outlet /> {/* Renders the current route's component */}
          </ReloadContext.Provider>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: "100dvh", minHeight: "100dvh" }}>
      <Sider
        width={300} 
        style={{ background: "#71A5E0", height: "100vh" }}
        breakpoint="lg" 
        collapsedWidth="80" 
        collapsible 
        collapsed={collapsed} 
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}  
        trigger={null} 
        className={collapsed ? 'collapsed-sider' : ''} 
      >
        {menuContent} {/* Render the shared menu content */}
      </Sider>

      <Layout style={{ height: "100vh" }}>
        <Header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid grey",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // Align items vertically
            padding: "0 24px",
            height: "64px",
            lineHeight: "64px",
          }}
        >
          {/* Logo moved to the top-left of the main header, with 5px gap to title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img
              src={LogoIcon}
              alt="Company Logo" // More descriptive alt text
              style={{ height: '40px', objectFit: 'contain' }}
            />
            <h2 style={{ margin: 0 }}>{title}</h2> {/* Current page title */}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => reloadFn()}
              size="large"
            />
            <span style={{ fontSize: 24 }}>
              Chào, <strong>{taiKhoan.tenVaiTro}</strong> {/* Display user role */}
            </span>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              type="primary"
              danger
              size="large"
            >
              Đăng xuất
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: "12px",
            padding: "24px",
            background: "#fff",
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <ReloadContext.Provider
            value={{ reload: reloadFn, setReload: setReloadFn }}
          >
            <ScrollToTop /> {/* Ensures scroll position resets on route change */}
            <Outlet /> {/* Renders the current route's component */}
          </ReloadContext.Provider>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;