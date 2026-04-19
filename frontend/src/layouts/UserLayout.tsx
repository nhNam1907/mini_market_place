import {
  AppstoreOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Typography } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const menuItems = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/catalog", label: <Link to="/catalog">Catalog</Link> },
    { key: "/account", label: <Link to="/account">My Account</Link> },
    { key: "/orders", label: <Link to="/orders">My Orders</Link> },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <Layout className="user-shell">
      <Header className="user-header">
        <div className="user-brand">
          <Title level={4} style={{ margin: 0, color: "#102a43" }}>
            Market Place
          </Title>
          <Text type="secondary">Storefront portal</Text>
        </div>
        <Menu
          className="user-menu"
          items={menuItems}
          mode="horizontal"
          selectedKeys={[location.pathname]}
        />
        <Space>
          <Button icon={<ShoppingCartOutlined />} onClick={() => navigate("/cart")} shape="round">
            Cart
          </Button>
          {user ? (
            <Space>
              <Avatar icon={<UserOutlined />} />
              <Text strong>{user.name}</Text>
              <Button icon={<LogoutOutlined />} onClick={handleLogout} type="text">
                Logout
              </Button>
            </Space>
          ) : (
            <>
              <Button icon={<LoginOutlined />} onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button icon={<AppstoreOutlined />} onClick={() => navigate("/admin/login")} type="primary">
                Admin
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content className="user-content">
        <Outlet />
      </Content>
      <Footer className="user-footer">
        Market Place storefront base for customers and public browsing.
      </Footer>
    </Layout>
  );
}

export default UserLayout;
