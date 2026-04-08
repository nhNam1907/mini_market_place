import { Col, Row, Tag, Typography } from "antd";

import AuthFormCard from "@/components/auth/AuthFormCard";

function AdminLoginPage() {
  return (
    <div className="admin-login-shell">
      <Row align="middle" gutter={[32, 32]} justify="center" style={{ minHeight: "100vh" }}>
        <Col lg={10} xs={24}>
          <Tag color="purple">Admin Portal</Tag>
          <Typography.Title style={{ color: "#f8fbff" }}>Operations login</Typography.Title>
          <Typography.Paragraph style={{ color: "rgba(255,255,255,0.78)" }}>
            Access the admin workspace for catalog management, inventory, and order operations.
          </Typography.Paragraph>
        </Col>
        <Col lg={8} xs={24}>
          <AuthFormCard mode="login" portal="admin" />
        </Col>
      </Row>
    </div>
  );
}

export default AdminLoginPage;
