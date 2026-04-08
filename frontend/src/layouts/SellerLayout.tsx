import {
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
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
    key: "/seller",
    icon: <DashboardOutlined />,
    label: <Link to="/seller">Dashboard</Link>,
  },
  {
    key: "/seller/products",
    icon: <TagsOutlined />,
    label: <Link to="/seller/products">Products</Link>,
  },
  {
    key: "/seller/shop",
    icon: <ShopOutlined />,
    label: <Link to="/seller/shop">Shop</Link>,
  },
];

function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light" width={260}>
        <div className="admin-brand">
          <Title level={4} style={{ margin: 0 }}>
            Seller Studio
          </Title>
          <Text type="secondary">Your shop workspace</Text>
        </div>
        <Menu items={menuItems} mode="inline" selectedKeys={[location.pathname]} />
      </Sider>
      <Layout>
        <Header className="seller-header">
          <div>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              Seller Workspace
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.78)" }}>
              Manage your catalog, pricing, and storefront content.
            </Text>
          </div>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong style={{ color: "#fff" }}>
              {user?.name ?? "Seller"}
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

export default SellerLayout;
