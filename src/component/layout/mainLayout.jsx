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
  const location = useLocation();

  const pathToTitle = useMemo(
    () => ({
      "/main-layout/trangchu": "Trang Chủ",
      "/main-layout/nhanvien": "Quản Lý Nhân Viên",
      "/main-layout/nghiphep": "Nghỉ Phép",
      "/main-layout/chamcong": "Chấm Công",
      "/main-layout/maychamcong": "Máy Chấm Công",
      "/main-layout/luong": "Lương",
      "/main-layout/caidat": "Cài Đặt",
      "/main-layout/baocao": "Báo Cáo",
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

  // Get title - xử lý đường dẫn con của cài đặt
  const title = useMemo(() => {
    const currentPath = location.pathname;
    
    // Kiểm tra nếu đang trong phần cài đặt (bao gồm các tab con)
    if (currentPath.startsWith("/main-layout/caidat")) {
      return "Cài Đặt";
    }
    
    return pathToTitle[currentPath] || "Quản lý nhân sự";
  }, [location.pathname, pathToTitle]);

  const [reloadFn, setReloadFnState] = useState(() => () => {});
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const setReloadFn = useCallback((fn) => {
    setReloadFnState(() => fn);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Set default openKeys based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (
      currentPath.startsWith("/main-layout/nhanvien") ||
      currentPath.startsWith("/main-layout/nghiphep")
    ) {
      setOpenKeys(["sub1"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  const handleOpenChange = useCallback((keys) => {
    setOpenKeys(keys);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("taiKhoan");
    window.location.replace("/login");
  }, []);

  const menuItems = useMemo(
    () => [
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
    ],
    []
  );

  // Get selected keys - sửa lại logic
  const getSelectedKeys = useMemo(() => {
    const currentPath = location.pathname;

    // Xử lý đường dẫn cài đặt và các tab con
    if (currentPath.startsWith("/main-layout/caidat")) {
      return ["/main-layout/caidat"];
    }

    // Kiểm tra exact match
    const hasExactMatch = menuItems.some(item => {
      if (item.key === currentPath) return true;
      if (item.children) {
        return item.children.some(child => child.key === currentPath);
      }
      return false;
    });

    if (hasExactMatch) {
      return [currentPath];
    }

    // Default fallback
    return ["/main-layout/trangchu"];
  }, [location.pathname, menuItems]);

  const menuContent = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "20px 0" : "16px 0",
        }}
      >
        <img src={LogoIcon} alt="Logo" />
      </div>
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
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
          />
          <Button
            style={{ marginLeft: 12 }}
            icon={<ReloadOutlined />}
            onClick={() => reloadFn()}
            size="large"
          />
        </Header>

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
          <ReloadContext.Provider
            value={{ reload: reloadFn, setReload: setReloadFn }}
          >
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
        style={{ background: "#71A5E0", height: "100vh" }}
        breakpoint="lg"
        collapsedWidth="0"
      >
        {menuContent}
      </Sider>

      <Layout style={{ height: "100vh" }}>
        <Header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid grey",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 24px",
            height: "64px",
            lineHeight: "64px",
          }}
        >
          <span></span>
          <div>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => reloadFn()}
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
          }}
        >
          <ReloadContext.Provider
            value={{ reload: reloadFn, setReload: setReloadFn }}
          >
            <ScrollToTop />
            <Outlet />
          </ReloadContext.Provider>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;