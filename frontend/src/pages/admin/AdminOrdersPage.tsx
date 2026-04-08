import type { OrderSummary } from "@market-place/shared/api";
import { Card, List, Tag, Typography } from "antd";

const orders: OrderSummary[] = [
  { id: "#1001", customer: "Nguyen Van A", status: "Pending" },
  { id: "#1002", customer: "Tran Thi B", status: "Shipping" },
  { id: "#1003", customer: "Le Van C", status: "Completed" },
];

const colorMap: Record<OrderSummary["status"], string> = {
  Pending: "gold",
  Shipping: "blue",
  Completed: "green",
};

function AdminOrdersPage() {
  return (
    <Card bordered={false}>
      <Typography.Title level={3}>Orders</Typography.Title>
      <Typography.Text type="secondary">
        Admin fulfillment area to monitor order flow and state transitions.
      </Typography.Text>
      <List
        bordered
        dataSource={orders}
        renderItem={(order) => (
          <List.Item>
            <div>
              <Typography.Text strong>{order.id}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {order.customer}
              </Typography.Paragraph>
            </div>
            <Tag color={colorMap[order.status]}>{order.status}</Tag>
          </List.Item>
        )}
        rowKey="id"
        style={{ marginTop: 24 }}
      />
    </Card>
  );
}

export default AdminOrdersPage;
