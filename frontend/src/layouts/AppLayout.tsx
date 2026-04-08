import {
  HomeOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: <Link to="/">Dashboard</Link>,
  },
  {
    key: "/products",
    icon: <TagsOutlined />,
    label: <Link to="/products">Products</Link>,
  },
  {
    key: "/orders",
    icon: <ShoppingCartOutlined />,
    label: <Link to="/orders">Orders</Link>,
  },
];

function AppLayout() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light" width={240}>
        <div style={{ padding: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            Market Place
          </Title>
          <Text type="secondary">Admin starter</Text>
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#1677ff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            Ecommerce Management
          </Title>
        </Header>
        <Content style={{ padding: 24, background: "#f5f5f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
