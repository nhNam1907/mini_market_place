import { ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

import { useCartQuery } from "@/hooks/useSystem";

function CartPage() {
  const { data, isLoading, isError } = useCartQuery();
  const cart = data?.data;

  if (isLoading) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (isError || !cart) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty description="Cart could not be loaded.">
          <Button type="primary">
            <Link to="/catalog">Continue shopping</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty description="Your cart is empty.">
          <Button type="primary">
            <Link to="/catalog">Browse products</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Space className="cart-page" direction="vertical" size={24}>
      <Button icon={<ArrowLeftOutlined />} type="link">
        <Link to="/catalog">Back to catalog</Link>
      </Button>

      <div>
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          Your Cart
        </Typography.Title>
        <Typography.Text type="secondary">
          Review the products already added from your backend cart before we build add, update, and
          checkout actions.
        </Typography.Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col lg={16} xs={24}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {cart.items.map((item) => (
              <Card bordered={false} className="cart-item-card" key={item.id}>
                <Row align="middle" gutter={[20, 20]}>
                  <Col md={6} xs={24}>
                    {item.product.imageUrl ? (
                      <img alt={item.product.name} className="cart-item-image" src={item.product.imageUrl} />
                    ) : (
                      <div className="catalog-product-placeholder cart-item-placeholder">
                        <Typography.Text strong>{item.product.category.name}</Typography.Text>
                      </div>
                    )}
                  </Col>
                  <Col md={12} xs={24}>
                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                      <Space size={[8, 8]} wrap>
                        <Tag color="geekblue">{item.product.category.name}</Tag>
                        <Link to={`/shops/${item.product.shop.id}`}>
                          <Tag>{item.product.shop.name}</Tag>
                        </Link>
                      </Space>

                      <Link to={`/products/${item.product.id}`}>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {item.product.name}
                        </Typography.Title>
                      </Link>

                      <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                        {item.product.description ?? "No product description available."}
                      </Typography.Paragraph>

                      <div className="cart-meta-row">
                        <Tag icon={<ShoppingCartOutlined />}>Quantity: {item.quantity}</Tag>
                        <Tag>Stock: {item.product.stock}</Tag>
                      </div>
                    </Space>
                  </Col>
                  <Col md={6} xs={24}>
                    <Space align="end" direction="vertical" size={8} style={{ width: "100%" }}>
                      <Typography.Text type="secondary">Unit price</Typography.Text>
                      <Typography.Text strong>{item.product.price.toLocaleString("vi-VN")} VND</Typography.Text>
                      <Typography.Text type="secondary">Line total</Typography.Text>
                      <Typography.Title className="cart-line-total" level={4}>
                        {item.lineTotal.toLocaleString("vi-VN")} VND
                      </Typography.Title>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Col>

        <Col lg={8} xs={24}>
          <Card bordered={false} className="cart-summary-card">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Cart Summary
              </Typography.Title>

              <Row justify="space-between">
                <Typography.Text type="secondary">Total items</Typography.Text>
                <Typography.Text className="cart-summary-value" strong>
                  {cart.summary.totalItems}
                </Typography.Text>
              </Row>

              <Row justify="space-between">
                <Typography.Text type="secondary">Subtotal</Typography.Text>
                <Typography.Title className="cart-summary-value" level={4} style={{ margin: 0 }}>
                  {cart.summary.subtotal.toLocaleString("vi-VN")} VND
                </Typography.Title>
              </Row>

              <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                This page is now connected to your backend cart API. The next step can focus on add
                to cart, update quantity, and remove item actions.
              </Typography.Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default CartPage;
