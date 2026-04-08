import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

const highlights = ["Fresh catalog architecture", "JWT auth flow", "Fast checkout-ready UI"];

function HomePage() {
  return (
    <div className="store-grid">
      <section className="hero-panel">
        <Space direction="vertical" size={20}>
          <Tag color="blue">User Portal</Tag>
          <Typography.Title>
            Build a shopping experience and admin workspace in one codebase.
          </Typography.Title>
          <Typography.Paragraph>
            This storefront is the public side of your ecommerce app. Customers can browse,
            sign in, and manage their own account, while admins work in a separate control
            center.
          </Typography.Paragraph>
          <Space wrap>
            <Button icon={<ArrowRightOutlined />} size="large" type="primary">
              <Link to="/catalog">Explore catalog</Link>
            </Button>
            <Button size="large">
              <Link to="/register">Create account</Link>
            </Button>
          </Space>
        </Space>
      </section>
      <section>
        <Row gutter={[16, 16]}>
          {highlights.map((item) => (
            <Col key={item} span={24}>
              <Card className="store-card">
                <Typography.Title level={4}>{item}</Typography.Title>
                <Typography.Text type="secondary">
                  Structured to help you connect authentication, catalog APIs, and role-based UX.
                </Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}

export default HomePage;
