import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Descriptions, Empty, Image, Row, Skeleton, Space, Tag, Typography } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useDeleteSellerProductMutation,
  useRestoreSellerProductMutation,
  useSellerProductQuery,
} from "@/hooks/useSellerProducts";

function SellerProductDetailPage() {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data, isLoading } = useSellerProductQuery(productId);
  const deleteMutation = useDeleteSellerProductMutation(productId ?? "");
  const restoreMutation = useRestoreSellerProductMutation(productId ?? "");
  const product = data?.data;

  const handleDeleteProduct = () => {
    if (!product) {
      return;
    }

    modal.confirm({
      title: "Delete product?",
      content: "This product will be hidden from the marketplace. Existing order history will be kept.",
      okText: "Delete",
      okButtonProps: {
        danger: true,
        loading: deleteMutation.isPending,
      },
      onOk: async () => {
        const response = await deleteMutation.mutateAsync();
        await message.success(response.message);
        navigate("/seller/products");
      },
    });
  };

  const handleRestoreProduct = async () => {
    const response = await restoreMutation.mutateAsync();
    await message.success(response.message);
  };

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
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
            <div>
              <Space align="center">
                <Typography.Title level={3} style={{ marginBottom: 0 }}>
                  {product.name}
                </Typography.Title>
                <Tag color={product.isActive ? "green" : "red"}>
                  {product.isActive ? "Active" : "Deleted"}
                </Tag>
              </Space>
              <Typography.Text type="secondary">
                Product detail scoped to your seller shop.
              </Typography.Text>
            </div>
            <Space>
              {product.isActive ? (
                <>
                  <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProduct}>
                    Delete product
                  </Button>
                  <Button icon={<EditOutlined />} type="primary">
                    <Link to={`/seller/products/${product.id}/edit`}>Edit product</Link>
                  </Button>
                </>
              ) : (
                <Button
                  icon={<ReloadOutlined />}
                  loading={restoreMutation.isPending}
                  onClick={handleRestoreProduct}
                  type="primary"
                >
                  Restore product
                </Button>
              )}
            </Space>
          </Space>

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
            <Descriptions.Item label="Deleted at">
              {product.deletedAt ? new Date(product.deletedAt).toLocaleString("vi-VN") : "Not deleted"}
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
