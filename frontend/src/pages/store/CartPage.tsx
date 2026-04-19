import { ArrowLeftOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import {
  useCartQuery,
  useCheckoutMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemQuantityMutation,
} from "@/hooks/useSystem";

function CartPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCartQuery();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantityMutation();
  const removeCartItemMutation = useRemoveCartItemMutation();
  const checkoutMutation = useCheckoutMutation();
  const cart = data?.data;

  const handleApiError = (error: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;

      if (typeof apiMessage === "string") {
        void message.error(apiMessage);
        return;
      }
    }

    void message.error(fallbackMessage);
  };

  const handleIncreaseQuantity = async (cartItemId: string, quantity: number, stock: number) => {
    if (quantity >= stock) {
      void message.warning("You have reached the available stock for this product.");
      return;
    }

    try {
      await updateCartItemQuantityMutation.mutateAsync({
        cartItemId,
        payload: {
          quantity: quantity + 1,
        },
      });
      void message.success("Cart item quantity updated successfully.");
    } catch (error) {
      handleApiError(error, "Could not update cart item quantity.");
    }
  };

  const handleDecreaseQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 1) {
      return;
    }

    try {
      await updateCartItemQuantityMutation.mutateAsync({
        cartItemId,
        payload: {
          quantity: quantity - 1,
        },
      });
      void message.success("Cart item quantity updated successfully.");
    } catch (error) {
      handleApiError(error, "Could not update cart item quantity.");
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeCartItemMutation.mutateAsync(cartItemId);
      void message.success("Cart item removed successfully.");
    } catch (error) {
      handleApiError(error, "Could not remove cart item.");
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await checkoutMutation.mutateAsync();
      void message.success(response.message || "Checkout successful.");
      navigate("/orders");
    } catch (error) {
      handleApiError(error, "Could not complete checkout.");
    }
  };

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
          Review your selected items, adjust quantities, or remove products before moving on to the
          checkout flow.
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
                        <Tag icon={<ShoppingCartOutlined />}>Stock: {item.product.stock}</Tag>
                      </div>

                      <Space size={12} wrap>
                        <Space.Compact>
                          <Button
                            disabled={item.quantity <= 1 || updateCartItemQuantityMutation.isPending || checkoutMutation.isPending}
                            icon={<MinusOutlined />}
                            onClick={() => void handleDecreaseQuantity(item.id, item.quantity)}
                          />
                          <Button className="detail-quantity-value" disabled>
                            {item.quantity}
                          </Button>
                          <Button
                            disabled={item.quantity >= item.product.stock || updateCartItemQuantityMutation.isPending || checkoutMutation.isPending}
                            icon={<PlusOutlined />}
                            onClick={() => void handleIncreaseQuantity(item.id, item.quantity, item.product.stock)}
                          />
                        </Space.Compact>
                        <Button
                          danger
                          disabled={checkoutMutation.isPending}
                          icon={<DeleteOutlined />}
                          loading={removeCartItemMutation.isPending}
                          onClick={() => void handleRemoveItem(item.id)}
                        >
                          Remove
                        </Button>
                      </Space>
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

              <Button loading={checkoutMutation.isPending} onClick={() => void handleCheckout()} size="large" type="primary">
                Checkout Now
              </Button>

              <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                Cart page is now connected to fetch, update quantity, remove item, and checkout actions.
              </Typography.Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default CartPage;
