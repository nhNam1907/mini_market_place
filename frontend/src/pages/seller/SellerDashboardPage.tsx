import { Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";

import { useSellerProductsQuery } from "@/hooks/useSellerProducts";

function SellerDashboardPage() {
  const { data, isLoading } = useSellerProductsQuery();
  const products = data?.data ?? [];
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={2}>Seller Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Quick overview of your storefront inventory and catalog activity.
        </Typography.Text>
      </div>
      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card><Statistic loading={isLoading} title="Products" value={products.length} /></Card>
        </Col>
        <Col md={8} xs={24}>
          <Card><Statistic loading={isLoading} title="Inventory Units" value={totalStock} /></Card>
        </Col>
        <Col md={8} xs={24}>
          <Card>
            <Typography.Text strong>Your role</Typography.Text>
            <div style={{ marginTop: 12 }}>
              <Tag color="processing">SELLER</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default SellerDashboardPage;
