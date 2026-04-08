import { Col, Row, Tag, Typography } from "antd";

import AuthFormCard from "@/components/auth/AuthFormCard";

function UserRegisterPage() {
  return (
    <Row align="middle" gutter={[32, 32]} justify="center" style={{ minHeight: "70vh" }}>
      <Col lg={10} xs={24}>
        <Tag color="green">Join the storefront</Tag>
        <Typography.Title>Create a customer account</Typography.Title>
        <Typography.Paragraph>
          Register as a normal user. New accounts are created with the USER role and use the
          backend register API you built in step 6.
        </Typography.Paragraph>
      </Col>
      <Col lg={8} xs={24}>
        <AuthFormCard mode="register" portal="user" />
      </Col>
    </Row>
  );
}

export default UserRegisterPage;
