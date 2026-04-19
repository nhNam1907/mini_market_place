import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Pagination, Skeleton, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useUserOrdersQuery } from "@/hooks/useSystem";

function OrdersPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const { data, isLoading, isError } = useUserOrdersQuery({ pageNumber, pageSize });
  const orders = data?.data.orders ?? [];
  const meta = data?.data.meta;

  if (isLoading) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty description="Orders could not be loaded.">
          <Button type="primary">
            <Link to="/catalog">Back to catalog</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty description="You have not placed any orders yet.">
          <Button type="primary">
            <Link to="/catalog">Browse products</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />} type="link">
        <Link to="/catalog">Back to catalog</Link>
      </Button>

      <div>
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          My Orders
        </Typography.Title>
        <Typography.Text type="secondary">
          Review your completed checkouts and the items captured in each order.
        </Typography.Text>
      </div>

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`}>
            <Card bordered={false} className="catalog-product-card">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Space align="center" style={{ justifyContent: "space-between", width: "100%" }} wrap>
                  <Space direction="vertical" size={4}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      Order #{order.id.slice(0, 8)}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      Placed on {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </Typography.Text>
                  </Space>
                  <Space size={12} wrap>
                    <Tag color="blue">{order.status}</Tag>
                    <Typography.Title level={4} style={{ color: "#d97706", margin: 0 }}>
                      {Number(order.totalAmount).toLocaleString("vi-VN")} VND
                    </Typography.Title>
                  </Space>
                </Space>

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
                          <Typography.Text type="secondary">
                            Unit price: {Number(item.unitPrice).toLocaleString("vi-VN")} VND
                          </Typography.Text>
                        </Space>
                        <Typography.Text strong>
                          {Number(item.lineTotal).toLocaleString("vi-VN")} VND
                        </Typography.Text>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Space>
            </Card>
          </Link>
        ))}
      </Space>

      {meta ? (
        <div className="catalog-pagination-wrap">
          <Pagination
            current={meta.pageNumber}
            onChange={(nextPageNumber) => setPageNumber(nextPageNumber)}
            pageSize={meta.pageSize}
            total={meta.totalItems}
          />
        </div>
      ) : null}
    </Space>
  );
}

export default OrdersPage;
