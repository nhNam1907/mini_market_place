import type {
  SellerDashboardRecentOrderItem,
  SellerOrderItemStatus,
} from "@market-place/shared/api";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

import { useSellerDashboardMetricsQuery } from "@/hooks/useSellerDashboard";

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function getStatusColor(status: SellerOrderItemStatus) {
  switch (status) {
    case "CANCELLED":
      return "red";
    case "COMPLETED":
      return "green";
    case "DELIVERED":
      return "cyan";
    case "SHIPPING":
      return "blue";
    case "CONFIRMED":
      return "gold";
    default:
      return "processing";
  }
}

function getProductLabel(item: SellerDashboardRecentOrderItem) {
  return item.productName || `Product #${item.productId.slice(0, 8)}`;
}

function SellerDashboardPage() {
  const { data, isError, isLoading } = useSellerDashboardMetricsQuery();
  const metrics = data?.data;
  const products = metrics?.products;
  const orders = metrics?.orders;
  const revenue = metrics?.revenue;
  const recentOrderItems = metrics?.recentOrderItems ?? [];

  const columns: ColumnsType<SellerDashboardRecentOrderItem> = [
    {
      title: "Order",
      dataIndex: "orderId",
      key: "orderId",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Link to={`/seller/orders/${record.orderId}`}>#{record.orderId.slice(0, 8)}</Link>
          <Typography.Text type="secondary">
            {new Date(record.createdAt).toLocaleString("vi-VN")}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Buyer",
      dataIndex: ["buyer", "name"],
      key: "buyer",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.buyer.name}</Typography.Text>
          <Typography.Text type="secondary">{record.buyer.email}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{getProductLabel(record)}</Typography.Text>
          <Typography.Text type="secondary">Qty: {record.quantity}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Line Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SellerOrderItemStatus) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
        <div>
          <Typography.Title level={2}>Seller Dashboard</Typography.Title>
          <Typography.Text type="secondary">
            Live overview of your products, fulfillment pipeline, and completed revenue.
          </Typography.Text>
        </div>
        <Space wrap>
          <Button>
            <Link to="/seller/products/new">Add product</Link>
          </Button>
          <Button type="primary">
            <Link to="/seller/orders">Manage orders</Link>
          </Button>
        </Space>
      </Space>

      {isError ? (
        <Alert
          message="Seller metrics could not be loaded"
          showIcon
          type="error"
        />
      ) : null}

      <Row gutter={[16, 16]}>
        <Col lg={6} sm={12} xs={24}>
          <Card bordered={false}>
            <Statistic
              loading={isLoading}
              prefix={<AppstoreOutlined />}
              title="Total Products"
              value={products?.totalProducts ?? 0}
            />
          </Card>
        </Col>
        <Col lg={6} sm={12} xs={24}>
          <Card bordered={false}>
            <Statistic
              loading={isLoading}
              prefix={<CheckCircleOutlined />}
              title="Active Products"
              value={products?.activeProducts ?? 0}
            />
          </Card>
        </Col>
        <Col lg={6} sm={12} xs={24}>
          <Card bordered={false}>
            <Statistic
              loading={isLoading}
              prefix={<InboxOutlined />}
              title="Inactive Products"
              value={products?.inactiveProducts ?? 0}
            />
          </Card>
        </Col>
        <Col lg={6} sm={12} xs={24}>
          <Card bordered={false}>
            <Statistic
              loading={isLoading}
              prefix={<DollarOutlined />}
              title="Completed Revenue"
              value={revenue?.revenue ?? 0}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col lg={10} xs={24}>
          <Card bordered={false} title="Order Pipeline">
            <Row gutter={[12, 12]}>
              <Col sm={12} xs={24}>
                <Statistic
                  loading={isLoading}
                  prefix={<ShoppingCartOutlined />}
                  title="Order Items"
                  value={orders?.totalOrderedProducts ?? 0}
                />
              </Col>
              <Col sm={12} xs={24}>
                <Statistic
                  loading={isLoading}
                  prefix={<ClockCircleOutlined />}
                  title="Pending"
                  value={orders?.pending ?? 0}
                />
              </Col>
              <Col sm={12} xs={24}>
                <Statistic loading={isLoading} title="Confirmed" value={orders?.confirmed ?? 0} />
              </Col>
              <Col sm={12} xs={24}>
                <Statistic loading={isLoading} title="Shipping" value={orders?.shipping ?? 0} />
              </Col>
              <Col sm={12} xs={24}>
                <Statistic loading={isLoading} title="Delivered" value={orders?.delivered ?? 0} />
              </Col>
              <Col sm={12} xs={24}>
                <Statistic loading={isLoading} title="Completed" value={orders?.completed ?? 0} />
              </Col>
              <Col sm={12} xs={24}>
                <Statistic loading={isLoading} title="Cancelled" value={orders?.cancelled ?? 0} />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col lg={14} xs={24}>
          <Card
            bordered={false}
            extra={<Link to="/seller/orders">View all orders</Link>}
            title="Recent Order Items"
          >
            <Table<SellerDashboardRecentOrderItem>
              columns={columns}
              dataSource={recentOrderItems}
              loading={isLoading}
              locale={{
                emptyText: <Empty description="No recent order items" />,
              }}
              pagination={false}
              rowKey="id"
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default SellerDashboardPage;
