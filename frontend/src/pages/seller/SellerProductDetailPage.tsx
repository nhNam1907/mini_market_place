import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Empty, Image, Row, Skeleton, Space, Typography } from "antd";
import { Link, useParams } from "react-router-dom";

import { useSellerProductQuery } from "@/hooks/useSellerProducts";

function SellerProductDetailPage() {
  const { productId } = useParams();
  const { data, isLoading } = useSellerProductQuery(productId);
  const product = data?.data;

  if (isLoading) {
    return (
      <Card bordered={false}>
        <Skeleton active />
      </Card>
    );
  }

  if (!product) {
    return (
      <Card bordered={false}>
        <Empty description="Product not found" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Button icon={<ArrowLeftOutlined />}>
        <Link to="/seller/products">Back to products</Link>
      </Button>

      <Card bordered={false}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={3}>{product.name}</Typography.Title>
            <Typography.Text type="secondary">
              Product detail scoped to your seller shop.
            </Typography.Text>
          </div>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="Category">{product.category.name}</Descriptions.Item>
            <Descriptions.Item label="Shop">{product.shop.name}</Descriptions.Item>
            <Descriptions.Item label="Price">
              {product.price.toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Stock">{product.stock}</Descriptions.Item>
            <Descriptions.Item label="Created at">
              {new Date(product.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Updated at">
              {new Date(product.updatedAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {product.description || "No description"}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Title level={4}>Images</Typography.Title>
            {product.images.length === 0 ? (
              <Empty description="No product images" />
            ) : (
              <Row gutter={[16, 16]}>
                {product.images.map((image) => (
                  <Col key={image.id} lg={6} md={8} sm={12} xs={24}>
                    <Image
                      alt={product.name}
                      className="seller-product-detail-image"
                      preview={false}
                      src={image.imageUrl}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Space>
      </Card>
    </Space>
  );
}

export default SellerProductDetailPage;
