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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import LogoIcon from "../../assets/images/LogoIcon.png";
import "./mainLayout.css";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ReloadContext } from "../../context/reloadContext";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const location = useLocation();

  const reloadFnRef = useRef(() => {});

  const pathToTitle = useMemo(
    () => ({
      "/main-layout/trangchu": "Trang Chủ",
      "/main-layout/nhanvien": "Quản Lý Nhân Viên",
      "/main-layout/nghiphep": "Nghỉ Phép",
      "/main-layout/chamcong": "Chấm Công",
      "/main-layout/maychamcong": "Máy Chấm Công",
      "/main-layout/luong": "Lương",
      "/main-layout/baocao": "Báo Cáo",
      "/main-layout/caidat": "Cài Đặt",
    }),
    []
  );

  const taiKhoan = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("taiKhoan") || "{}");
    } catch (e) {
      console.error("Lỗi khi parse tài khoản từ localStorage:", e);
      return {};
    }
  }, []);

  const title = useMemo(() => {
    const currentPath = location.pathname;

    if (currentPath.startsWith("/main-layout/caidat")) {
      return "Cài Đặt";
    }

    return pathToTitle[currentPath] || "Quản lý nhân sự";
  }, [location.pathname, pathToTitle]);

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const setReloadFn = useCallback((fn) => {
    reloadFnRef.current = fn;
  }, []);

  const executeReload = useCallback(() => {
    reloadFnRef.current();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const isInEmployeeSubmenu =
      currentPath.startsWith("/main-layout/nhanvien") ||
      currentPath.startsWith("/main-layout/nghiphep");

    if (isInEmployeeSubmenu && !collapsed) {
      setOpenKeys(["sub1"]);
    } else {
      if (!isInEmployeeSubmenu) {
        setOpenKeys([]);
      }
    }
  }, [location.pathname, collapsed]);

  const handleOpenChange = useCallback(
    (keys) => {
      if (!collapsed || isMobile) {
        setOpenKeys(keys);
      } else {
        if (keys.length === 0) {
          setOpenKeys([]);
        } else {
          setOpenKeys(keys);
        }
      }
    },
    [collapsed, isMobile]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("taiKhoan");
    window.location.replace("/login");
  }, []);

  const menuItems = useMemo(
    () => {
      const baseItems = [
        // {
        //   key: "/main-layout/trangchu",
        //   icon: <HomeOutlined />,
        //   label: <Link to="/main-layout/trangchu">Trang Chủ</Link>,
        // },
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
        // {
        //   key: "/main-layout/baocao",
        //   icon: <BarChartOutlined />,
        //   label: <Link to="/main-layout/baocao">Báo Cáo</Link>,
        // },
        {
          key: "/main-layout/caidat",
          icon: <SettingFilled />,
          label: <Link to="/main-layout/caidat">Cài đặt</Link>,
        },
      ];

      if (collapsed && !isMobile) {
        return [
          ...baseItems.slice(0, 1), 
          {
            key: "/main-layout/nhanvien",
            icon: <TeamOutlined />, 
            label: <Link to="/main-layout/nhanvien">Nhân viên</Link>,
          },
          {
            key: "/main-layout/nghiphep",
            icon: <SolutionOutlined />,
            label: <Link to="/main-layout/nghiphep">Nghỉ Phép</Link>,
          },
          ...baseItems.slice(1), 
        ];
      } else {
        return [
          ...baseItems.slice(0, 1), 
          {
            key: "sub1",
            icon: <UserOutlined />, 
            label: "Quản Lý Nhân Viên",
            children: [
              {
                key: "/main-layout/nhanvien",
                icon: <TeamOutlined />, 
                label: <Link to="/main-layout/nhanvien">Nhân viên</Link>,
              },
              {
                key: "/main-layout/nghiphep",
                icon: <SolutionOutlined />,
                label: <Link to="/main-layout/nghiphep">Nghỉ Phép</Link>,
              },
            ],
          },
          ...baseItems.slice(1), 
        ];
      }
    },
    [collapsed, isMobile]
  );

  const getSelectedKeys = useMemo(() => {
    const currentPath = location.pathname;

    if (currentPath.startsWith("/main-layout/caidat")) {
      return ["/main-layout/caidat"];
    }

    const hasExactMatch = menuItems.some((item) => {
      if (item.key === currentPath) return true;
      if (item.children) {
        return item.children.some((child) => child.key === currentPath);
      }
      return false;
    });

    if (hasExactMatch) {
      return [currentPath];
    }

    if (currentPath.startsWith("/main-layout/nhanvien") || currentPath.startsWith("/main-layout/nghiphep")) {
        return [currentPath];
    }


    return ["/main-layout/trangchu"];
  }, [location.pathname, menuItems]);

  const contextValue = useMemo(
    () => ({
      reload: executeReload,
      setReload: setReloadFn,
    }),
    [executeReload, setReloadFn]
  );

  const menuContent = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          alignItems: "center",
          padding: isMobile ? "20px" : "16px",
          overflow: "hidden",
          transition: "width 0.2s ease",
          width: collapsed && !isMobile ? "80px" : "auto",
          minHeight: "64px",
          gap: collapsed && !isMobile ? "0px" : "10px",
        }}
      ></div>
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        theme="dark"
        inlineCollapsed={collapsed && !isMobile}
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
            icon={<ReloadOutlined />}
            onClick={executeReload}
            size="large"
          />
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="text"
            size="large"
            style={{ marginLeft: 12 }}
          />
        </Header>

        <Drawer
          title={null}
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width="80vw"
          styles={{
            body: {
              padding: 0,
              background: "#71A5E0",
              height: "100vh",
            },
            header: {
              display: "none",
            },
            wrapper: {
              overflowX: "hidden",
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

            {menuContent}
          </div>
        </Drawer>

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
          <ReloadContext.Provider value={contextValue}>
            <Outlet />
          </ReloadContext.Provider>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: "100dvh", minHeight: "100dvh" }}>
      <Sider
        width={300}
        style={{ background: "#71A5E0", height: "100vh", position: "relative" }}
        breakpoint="lg"
        collapsedWidth="80"
        collapsible
        collapsed={collapsed}
        trigger={null}
        className={collapsed ? "collapsed-sider" : ""}
      >
        <Button
          type="text"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "auto",
            height: "64px",
            background: "transparent",
            color: "white",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            zIndex: 1,
            padding: "0 16px",
          }}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        />
        {menuContent}
      </Sider>

      <Layout style={{ height: "100vh" }}>
        <Header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid grey",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            height: "64px",
            lineHeight: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <img
              src={LogoIcon}
              alt="Company Logo"
              style={{ height: "40px", objectFit: "contain" }}
            />
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={executeReload}
              size="large"
            />
            <span style={{ fontSize: 24 }}>
              Chào, <strong>{taiKhoan.tenVaiTro || "User"}</strong>
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
            flex: 1,
          }}
        >
          <ReloadContext.Provider value={contextValue}>
            <ScrollToTop />
            <Outlet />
          </ReloadContext.Provider>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;