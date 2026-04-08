import {
  DashboardOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Typography } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  {
    key: "/admin",
    icon: <DashboardOutlined />,
    label: <Link to="/admin">Dashboard</Link>,
  },
  {
    key: "/admin/products",
    icon: <TagsOutlined />,
    label: <Link to="/admin/products">Products</Link>,
  },
  {
    key: "/admin/orders",
    icon: <ShoppingCartOutlined />,
    label: <Link to="/admin/orders">Orders</Link>,
  },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate("/admin/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light" width={260}>
        <div className="admin-brand">
          <Title level={4} style={{ margin: 0 }}>
            Control Center
          </Title>
          <Text type="secondary">Operations portal</Text>
        </div>
        <Menu items={menuItems} mode="inline" selectedKeys={[location.pathname]} />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              Admin Workspace
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.78)" }}>
              Manage catalog, orders, inventory and growth.
            </Text>
          </div>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong style={{ color: "#fff" }}>
              {user?.name ?? "Admin"}
            </Text>
            <Button ghost icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
