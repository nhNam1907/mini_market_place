import { ArrowLeftOutlined } from "@ant-design/icons";
import type {
  SellerOrderDetailItem,
  SellerOrderItemStatus,
  SellerOrderStatus,
} from "@market-place/shared/api";
import {
  Alert,
  App,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { Link, useParams } from "react-router-dom";

import {
  useSellerOrderDetailQuery,
  useUpdateSellerOrderItemStatusMutation,
} from "@/hooks/useSellerOrders";

const NEXT_STATUS_ACTION: Partial<
  Record<
    SellerOrderItemStatus,
    { label: string; status: SellerOrderItemStatus; type?: "primary" | "default" }
  >
> = {
  PENDING: { label: "Confirm", status: "CONFIRMED", type: "primary" },
  CONFIRMED: { label: "Ship", status: "SHIPPING", type: "primary" },
  SHIPPING: { label: "Mark delivered", status: "DELIVERED" },
  DELIVERED: { label: "Complete", status: "COMPLETED" },
};

const ITEM_STATUS_PRIORITY: Record<SellerOrderItemStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPING: 2,
  DELIVERED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

function getOrderStatusColor(status: SellerOrderStatus) {
  switch (status) {
    case "CANCELLED":
      return "red";
    case "COMPLETED":
      return "green";
    case "SHIPPING":
      return "blue";
    case "CONFIRMED":
      return "gold";
    default:
      return "processing";
  }
}

function getItemStatusColor(status: SellerOrderItemStatus) {
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

function SellerOrderDetailPage() {
  const { message } = App.useApp();
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isLoading, isError } = useSellerOrderDetailQuery(orderId);
  const updateStatusMutation = useUpdateSellerOrderItemStatusMutation();

  const orderDetail = data?.data;
  const sortedOrderItems = (orderDetail?.orderItems ?? []).slice().sort((left, right) => {
    const priorityDiff = ITEM_STATUS_PRIORITY[left.status] - ITEM_STATUS_PRIORITY[right.status];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
  const itemStatusSummary = sortedOrderItems.reduce<Record<SellerOrderItemStatus, number>>(
    (summary, item) => {
      summary[item.status] += 1;
      return summary;
    },
    {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    },
  );

  const handleAdvanceStatus = async (item: SellerOrderDetailItem) => {
    const nextAction = NEXT_STATUS_ACTION[item.status];

    if (!nextAction) {
      return;
    }

    try {
      const response = await updateStatusMutation.mutateAsync({
        orderItemId: item.id,
        status: nextAction.status,
      });
      message.success(response.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update order item status";
      message.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card bordered={false}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (isError || !orderDetail) {
    return (
      <Card bordered={false}>
        <Empty description="Seller order detail could not be loaded.">
          <Button type="primary">
            <Link to="/seller/orders">Back to orders</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Space direction="vertical" size={8}>
        <Breadcrumb
          items={[
            {
              title: <Link to="/seller">Seller Workspace</Link>,
            },
            {
              title: <Link to="/seller/orders">Orders</Link>,
            },
            {
              title: `Order #${orderDetail.order.id.slice(0, 8)}`,
            },
          ]}
        />
        <Button icon={<ArrowLeftOutlined />} type="link">
          <Link to="/seller/orders">Back to orders</Link>
        </Button>
      </Space>

      <Card bordered={false}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Order #{orderDetail.order.id.slice(0, 8)}
              </Typography.Title>
              <Typography.Text type="secondary">
                Created at {new Date(orderDetail.order.createdAt).toLocaleString("vi-VN")}
              </Typography.Text>
              <Typography.Text type="secondary">
                Buyer: {orderDetail.order.user.name} ({orderDetail.order.user.email})
              </Typography.Text>
            </Space>

            <Space direction="vertical" size={8} align="end">
              <Space direction="vertical" size={2}>
                <Typography.Text type="secondary">Order status</Typography.Text>
                <Tag color={getOrderStatusColor(orderDetail.order.status)} style={{ marginInlineEnd: 0 }}>
                  {orderDetail.order.status}
                </Tag>
              </Space>
              <Typography.Title level={4} style={{ color: "#d97706", margin: 0 }}>
                {orderDetail.totalAmount.toLocaleString("vi-VN")} VND
              </Typography.Title>
            </Space>
          </Space>

          <Row gutter={[16, 16]}>
            <Col lg={8} span={24}>
              <Card size="small">
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">Overall order status</Typography.Text>
                  <Tag color={getOrderStatusColor(orderDetail.order.status)} style={{ marginInlineEnd: 0, width: "fit-content" }}>
                    {orderDetail.order.status}
                  </Tag>
                  <Typography.Text type="secondary">
                    Updated at {new Date(orderDetail.order.updatedAt).toLocaleString("vi-VN")}
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
            <Col lg={8} span={24}>
              <Card size="small">
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">Seller-scoped total</Typography.Text>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {orderDetail.totalAmount.toLocaleString("vi-VN")} VND
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {orderDetail.totalItems} item(s) from your shop
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
            <Col lg={8} span={24}>
              <Card size="small">
                <Space direction="vertical" size={6}>
                  <Typography.Text type="secondary">Item status breakdown</Typography.Text>
                  <Space size={[8, 8]} wrap>
                    {Object.entries(itemStatusSummary)
                      .filter(([, count]) => count > 0)
                      .map(([status, count]) => (
                        <Tag color={getItemStatusColor(status as SellerOrderItemStatus)} key={status}>
                          {status}: {count}
                        </Tag>
                      ))}
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>

          <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
            <Descriptions.Item label="Buyer">{orderDetail.order.user.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{orderDetail.order.user.email}</Descriptions.Item>
            <Descriptions.Item label="Created at">
              {new Date(orderDetail.order.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Updated at">
              {new Date(orderDetail.order.updatedAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>

          <Alert
            message="Seller-scoped order view"
            description="Order status reflects the overall order. Item status below reflects only the products that belong to your shop, so you can fulfill your lines without losing context."
            showIcon
            type="info"
          />

          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {sortedOrderItems.map((item) => {
              const nextAction = NEXT_STATUS_ACTION[item.status];
              const isCurrentRowPending =
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.orderItemId === item.id;
              const isAnotherRowPending =
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.orderItemId !== item.id;

              return (
                <Card bodyStyle={{ padding: 16 }} key={item.id} size="small">
                  <Space align="start" size={16} style={{ justifyContent: "space-between", width: "100%" }} wrap>
                    <Space direction="vertical" size={6} style={{ flex: 1 }}>
                      <Typography.Text strong>{item.productName}</Typography.Text>
                      <Typography.Text type="secondary">
                        Product #{item.productId.slice(0, 8)}
                      </Typography.Text>
                      <Space size={[8, 8]} wrap>
                        <Tag>Qty: {item.quantity}</Tag>
                        <Tag color={getItemStatusColor(item.status)}>{item.status}</Tag>
                      </Space>
                      <Typography.Text type="secondary">
                        Item status controls fulfillment for this product line only.
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        Unit price: {item.unitPrice.toLocaleString("vi-VN")} VND
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        Last updated: {new Date(item.updatedAt).toLocaleString("vi-VN")}
                      </Typography.Text>
                    </Space>

                    <Space direction="vertical" size={8} align="end">
                      <Typography.Text strong>
                        {item.lineTotal.toLocaleString("vi-VN")} VND
                      </Typography.Text>
                      {nextAction ? (
                        <Button
                          disabled={isAnotherRowPending}
                          loading={isCurrentRowPending}
                          onClick={() => void handleAdvanceStatus(item)}
                          size="small"
                          type={nextAction.type ?? "default"}
                        >
                          {nextAction.label}
                        </Button>
                      ) : (
                        <Typography.Text type="secondary">No action</Typography.Text>
                      )}
                    </Space>
                  </Space>
                </Card>
              );
            })}
          </Space>
        </Space>
      </Card>
    </Space>
  );
}

export default SellerOrderDetailPage;
