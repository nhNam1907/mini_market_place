import { Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";

import { useHealthQuery } from "@/hooks/useSystem";

function AdminDashboardPage() {
  const { data, isLoading } = useHealthQuery();

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={2}>Admin Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Overview area for management KPIs, API status, and operational monitoring.
        </Typography.Text>
      </div>
      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card><Statistic title="Products" value={128} /></Card>
        </Col>
        <Col md={8} xs={24}>
          <Card><Statistic title="Orders" value={32} /></Card>
        </Col>
        <Col md={8} xs={24}>
          <Card><Statistic suffix="VND" title="Revenue" value={12800000} /></Card>
        </Col>
      </Row>
      <Card>
        <Typography.Title level={4}>Backend status</Typography.Title>
        <Tag color={data?.message === "Backend is running" ? "success" : "processing"}>
          {isLoading ? "Checking backend..." : data?.message ?? "Unavailable"}
        </Tag>
      </Card>
    </Space>
  );
}

export default AdminDashboardPage;
