import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Popconfirm, Skeleton, Space, Tag, Typography, message } from "antd";
import { Link, useParams } from "react-router-dom";

import {
  useCancelOrderItemMutation,
  useCancelOrderMutation,
  useUserOrderDetailQuery,
} from "@/hooks/useSystem";

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED"]);
const CANCELLABLE_ITEM_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function getOrderStatusColor(status: string) {
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

function getItemStatusColor(status: string) {
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
      return "default";
  }
}

function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isLoading, isError } = useUserOrderDetailQuery(orderId);
  const cancelOrderMutation = useCancelOrderMutation();
  const cancelOrderItemMutation = useCancelOrderItemMutation();
  const order = data?.data;

  const handleCancelOrder = async () => {
    if (!orderId) {
      return;
    }

    try {
      const response = await cancelOrderMutation.mutateAsync(orderId);
      message.success(response.message || "Order cancelled successfully");
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : "Could not cancel this order";
      message.error(fallbackMessage);
    }
  };

  const handleCancelOrderItem = async (orderItemId: string) => {
    if (!orderId) {
      return;
    }

    try {
      const response = await cancelOrderItemMutation.mutateAsync({
        orderId,
        orderItemId,
      });
      message.success(response.message || "Order item cancelled successfully");
    } catch (error) {
      const fallbackMessage =
        error instanceof Error ? error.message : "Could not cancel this order item";
      message.error(fallbackMessage);
    }
  };

  if (isLoading) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (isError || !order) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty description="Order detail could not be loaded.">
          <Button type="primary">
            <Link to="/orders">Back to orders</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  const canCancelOrder = CANCELLABLE_STATUSES.has(order.status);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />} type="link">
        <Link to="/orders">Back to orders</Link>
      </Button>

      <Card bordered={false} className="catalog-product-card">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }} wrap>
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Order #{order.id.slice(0, 8)}
              </Typography.Title>
              <Typography.Text type="secondary">
                Created at {new Date(order.createdAt).toLocaleString("vi-VN")}
              </Typography.Text>
            </Space>
            <Space size={12} wrap>
              <Space direction="vertical" size={2}>
                <Typography.Text type="secondary">Order status</Typography.Text>
                <Tag color={getOrderStatusColor(order.status)} style={{ marginInlineEnd: 0 }}>
                  {order.status}
                </Tag>
              </Space>
              {canCancelOrder ? (
                <Popconfirm
                  okButtonProps={{ danger: true, loading: cancelOrderMutation.isPending }}
                  okText="Cancel order"
                  onConfirm={() => void handleCancelOrder()}
                  title="Cancel this order?"
                >
                  <Button danger loading={cancelOrderMutation.isPending}>
                    Cancel order
                  </Button>
                </Popconfirm>
              ) : null}
              <Typography.Title level={4} style={{ color: "#d97706", margin: 0 }}>
                {Number(order.totalAmount).toLocaleString("vi-VN")} VND
              </Typography.Title>
            </Space>
          </Space>

          <Card
            bodyStyle={{ padding: 16 }}
            size="small"
            style={{ background: "#fffaf0", borderColor: "#fcd34d" }}
          >
            <Space direction="vertical" size={4}>
              <Typography.Text strong>Order summary</Typography.Text>
              <Typography.Text type="secondary">
                Order status reflects the whole purchase. Item status below reflects each product line
                independently.
              </Typography.Text>
            </Space>
          </Card>

          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {order.items.map((item) => (
              <Card bodyStyle={{ padding: 16 }} key={item.id} size="small">
                <Space align="start" size={16} style={{ width: "100%" }}>
                  {item.productImage ? (
                    <img
                      alt={item.productName}
                      className="cart-item-image"
                      src={item.productImage}
                      style={{ height: 88, maxWidth: 88 }}
                    />
                  ) : (
                    <div className="catalog-product-placeholder" style={{ borderRadius: 16, height: 88, width: 88 }}>
                      <Typography.Text strong>{item.categoryName ?? "Item"}</Typography.Text>
                    </div>
                  )}
                  <Space direction="vertical" size={6} style={{ flex: 1 }}>
                    <Typography.Text strong>{item.productName}</Typography.Text>
                    <Space size={[8, 8]} wrap>
                      <Tag>{item.shopName}</Tag>
                      {item.categoryName ? <Tag color="geekblue">{item.categoryName}</Tag> : null}
                      <Tag>Qty: {item.quantity}</Tag>
                    </Space>
                    <Space direction="vertical" size={2}>
                      <Typography.Text type="secondary">Item status</Typography.Text>
                      <Tag color={getItemStatusColor(item.status)} style={{ marginInlineEnd: 0, width: "fit-content" }}>
                        {item.status}
                      </Tag>
                    </Space>
                    <Typography.Text type="secondary">
                      Unit price: {Number(item.unitPrice).toLocaleString("vi-VN")} VND
                    </Typography.Text>
                  </Space>
                  <Space align="end" direction="vertical" size={8}>
                    <Typography.Text strong>
                      {Number(item.lineTotal).toLocaleString("vi-VN")} VND
                    </Typography.Text>
                    {CANCELLABLE_ITEM_STATUSES.has(item.status) ? (
                      <Popconfirm
                        okButtonProps={{
                          danger: true,
                          loading:
                            cancelOrderItemMutation.isPending &&
                            cancelOrderItemMutation.variables?.orderItemId === item.id,
                        }}
                        okText="Cancel item"
                        onConfirm={() => void handleCancelOrderItem(item.id)}
                        title="Cancel this item?"
                      >
                        <Button
                          danger
                          loading={
                            cancelOrderItemMutation.isPending &&
                            cancelOrderItemMutation.variables?.orderItemId === item.id
                          }
                          size="small"
                        >
                          Cancel item
                        </Button>
                      </Popconfirm>
                    ) : null}
                  </Space>
                </Space>
              </Card>
            ))}
          </Space>
        </Space>
      </Card>
    </Space>
  );
}

export default OrderDetailPage;
