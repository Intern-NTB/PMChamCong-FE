import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Drawer } from "antd";
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
} from "@ant-design/icons";
import LogoIcon from "../../assets/images/LogoIcon.png";
import "./mainLayout.css";
import { useState, useEffect } from "react";
import { ReloadContext } from "../../context/reloadContext";

const MainLayout = () => {
  const pathToTitle = {
    "/main-layout/trangchu": "Trang Chủ",
    "/main-layout/nhanvien": "Quản Lý Nhân Viên",
    "/main-layout/nghiphep": "Nghỉ Phép",
    "/main-layout/chamcong": "Chấm Công",
    "/main-layout/luong": "Lương",
    "/main-layout/caidat": "Cài Đặt",
    "/main-layout/baocao": "Báo Cáo",
  };

  const taiKhoan = JSON.parse(localStorage.getItem("taiKhoan") || "{}");

  const location = useLocation();
  const title = pathToTitle[location.pathname] || "Quản lý nhân sự";

  const [reloadFn, setReloadFn] = useState(() => () => {});
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleLogout = () => {
    // Xử lý logout: ví dụ xóa token, chuyển hướng...
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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
        defaultSelectedKeys={["1"]}
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
      >
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/main-layout/trangchu">Trang Chủ</Link>
        </Menu.Item>

        <Menu.SubMenu
          key="sub1"
          icon={<UserOutlined />}
          title="Quản Lý Nhân Viên"
          trigger="click"
          mode="inline"
        >
          <Menu.Item key="2" icon={<UnorderedListOutlined />}>
            <Link to="/main-layout/nhanvien">Nhân viên</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<SolutionOutlined />}>
            <Link to="/main-layout/nghiphep">Nghỉ Phép</Link>
          </Menu.Item>
        </Menu.SubMenu>

        <Menu.Item key="4" icon={<ScheduleOutlined />}>
          <Link to="/main-layout/chamcong">Chấm Công</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<DollarOutlined />}>
          <Link to="/main-layout/luong">Lương</Link>
        </Menu.Item>

        <Menu.Item key="7" icon={<BarChartOutlined />}>
          <Link to="/main-layout/baocao">Báo Cáo</Link>
        </Menu.Item>

        <Menu.Item key="6" icon={<SettingFilled />}>
          <Link to="/main-layout/caidat">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </>
  );

  if (isMobile) {
    return (
      <Layout style={{ height: "100dvh", minHeight: "100dvh" }}>
        <Layout.Header
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
            onClick={() => handleLogout()}
            type="text"
            size="large"
          />
          <Button
          style={{marginLeft:12}}
            icon={<ReloadOutlined />}
            onClick={() => reloadFn()}
            size="large"
          />
        </Layout.Header>

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

        <Layout.Content
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
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: "100dvh", minHeight: "100dvh" }}>
      <Layout.Sider
        width={300}
        style={{ background: "#71A5E0", height: "100vh" }}
        breakpoint="lg"
        collapsedWidth="0"
      >
        {menuContent}
      </Layout.Sider>

      <Layout style={{ height: "100vh" }}>
        <Layout.Header
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
              Chào, <strong>{taiKhoan.tenVaiTro}</strong>
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
        </Layout.Header>

        <Layout.Content
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
            <Outlet />
          </ReloadContext.Provider>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
