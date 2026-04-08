import { Col, Row, Tag, Typography } from "antd";

import AuthFormCard from "@/components/auth/AuthFormCard";

function UserLoginPage() {
  return (
    <Row align="middle" gutter={[32, 32]} justify="center" style={{ minHeight: "70vh" }}>
      <Col lg={10} xs={24}>
        <Tag color="blue">User Portal</Tag>
        <Typography.Title>Customer login</Typography.Title>
        <Typography.Paragraph>
          Sign in to access your account, upcoming order history, and checkout flow.
        </Typography.Paragraph>
      </Col>
      <Col lg={8} xs={24}>
        <AuthFormCard mode="login" portal="user" />
      </Col>
    </Row>
  );
}

export default UserLoginPage;
