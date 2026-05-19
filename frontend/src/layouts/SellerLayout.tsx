import {
  DashboardOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  ShopOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Typography } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useLogout } from "@/hooks/useLogout";
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
    key: "/seller/orders",
    icon: <ShoppingOutlined />,
    label: <Link to="/seller/orders">Orders</Link>,
  },
  {
    key: "/seller/shop",
    icon: <ShopOutlined />,
    label: <Link to="/seller/shop">Shop</Link>,
  },
];

function SellerLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout("/login");
  const selectedMenuKey = location.pathname.startsWith("/seller/orders/")
    ? "/seller/orders"
    : location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={260}>
        <div className="admin-brand">
          <Title level={4} style={{ margin: 0 }}>
            Seller Studio
          </Title>
          <Text type="secondary">Your shop workspace</Text>
        </div>
        <Menu items={menuItems} mode="inline" selectedKeys={[selectedMenuKey]} />
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
            <Button ghost icon={<LogoutOutlined />} onClick={logout}>
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
