import { ArrowLeftOutlined, MinusOutlined, PlusOutlined, ShopOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAddCartItemMutation, usePublicProductDetailQuery } from "@/hooks/useSystem";
import { useAuthStore } from "@/store/authStore";

function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError } = usePublicProductDetailQuery(id);
  const addCartItemMutation = useAddCartItemMutation();
  const product = data?.data;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  const handleDecreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  };

  const handleIncreaseQuantity = () => {
    if (!product) {
      return;
    }

    setQuantity((currentQuantity) => Math.min(product.stock, currentQuantity + 1));
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "USER") {
      void message.warning("Only customer accounts can add products to cart.");
      return;
    }

    try {
      await addCartItemMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      void message.success("Product added to cart successfully.");
      setQuantity(1);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        if (typeof apiMessage === "string") {
          void message.error(apiMessage);
          return;
        }
      }

      void message.error("Could not add product to cart.");
    }
  };

  if (isLoading) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (isError || !product) {
    return (
      <Card bordered={false} className="catalog-empty-card">
        <Empty description="Product not found or could not be loaded.">
          <Button type="primary">
            <Link to="/catalog">Back to catalog</Link>
          </Button>
        </Empty>
      </Card>
    );
  }

  const isOutOfStock = product.stock < 1;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />} type="link">
        <Link to="/catalog">Back to catalog</Link>
      </Button>

      <Row gutter={[24, 24]}>
        <Col lg={12} xs={24}>
          <Card bordered={false} className="catalog-product-card detail-media-card">
            {product.imageUrl ? (
              <img alt={product.name} className="detail-product-image" src={product.imageUrl} />
            ) : (
              <div className="catalog-product-placeholder detail-product-image">
                <Typography.Text strong>{product.category.name}</Typography.Text>
              </div>
            )}
          </Card>
        </Col>

        <Col lg={12} xs={24}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card bordered={false} className="catalog-product-card detail-info-card">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Space size={[8, 8]} wrap>
                  <Tag color="geekblue">{product.category.name}</Tag>
                  <Link state={{ shopName: product.shop.name }} to={`/shops/${product.shop.id}`}>
                    <Tag className="detail-shop-tag">{product.shop.name}</Tag>
                  </Link>
                </Space>

                <Typography.Title level={2} style={{ margin: 0 }}>
                  {product.name}
                </Typography.Title>

                <Typography.Title level={3} style={{ color: "#d97706", margin: 0 }}>
                  {product.price.toLocaleString("vi-VN")} VND
                </Typography.Title>

                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {product.description ?? "No product description available."}
                </Typography.Paragraph>

                <div className="detail-meta-grid">
                  <Card size="small">
                    <Typography.Text type="secondary">Stock</Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {product.stock}
                    </Typography.Title>
                  </Card>
                  <Card size="small">
                    <Typography.Text type="secondary">Shop</Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {product.shop.name}
                    </Typography.Title>
                  </Card>
                  <Card size="small">
                    <Typography.Text type="secondary">Category</Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {product.category.name}
                    </Typography.Title>
                  </Card>
                </div>

                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Typography.Text strong>Quantity</Typography.Text>
                  <Space size={12} wrap>
                    <Space.Compact>
                      <Button disabled={quantity <= 1 || isOutOfStock} icon={<MinusOutlined />} onClick={handleDecreaseQuantity} />
                      <Button className="detail-quantity-value" disabled>
                        {quantity}
                      </Button>
                      <Button
                        disabled={quantity >= product.stock || isOutOfStock}
                        icon={<PlusOutlined />}
                        onClick={handleIncreaseQuantity}
                      />
                    </Space.Compact>
                    <Typography.Text type="secondary">
                      {isOutOfStock ? "Out of stock" : `Available: ${product.stock}`}
                    </Typography.Text>
                  </Space>
                </Space>

                <Space size={12} wrap>
                  <Button
                    disabled={isOutOfStock}
                    icon={<ShoppingCartOutlined />}
                    loading={addCartItemMutation.isPending}
                    onClick={() => void handleAddToCart()}
                    size="large"
                    type="primary"
                  >
                    Add {quantity} to cart
                  </Button>
                  {!user ? (
                    <Button onClick={() => navigate("/login")} size="large">
                      Login to buy
                    </Button>
                  ) : null}
                </Space>
              </Space>
            </Card>

            <Link state={{ shopName: product.shop.name }} to={`/shops/${product.shop.id}`}>
              <Card bordered={false} className="catalog-product-card detail-shop-card hoverable-shop-card">
                <Space align="start" size={16}>
                  <div className="detail-shop-icon">
                    <ShopOutlined />
                  </div>
                  <Space direction="vertical" size={4}>
                    <Typography.Text type="secondary">Sold by</Typography.Text>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {product.shop.name}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      Open the public shop page for this seller.
                    </Typography.Text>
                  </Space>
                </Space>
              </Card>
            </Link>
          </Space>
        </Col>
      </Row>
    </Space>
  );
}

export default ProductDetailPage;
