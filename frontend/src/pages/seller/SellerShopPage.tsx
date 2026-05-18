import type { UpdateSellerShopRequest } from "@market-place/shared/api";
import { ArrowRightOutlined, MailOutlined, ShopOutlined, UserOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Descriptions, Empty, Form, Input, Row, Skeleton, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import { useSellerShopProfileQuery, useUpdateSellerShopProfileMutation } from "@/hooks/useSellerShop";

type SellerShopFormValues = {
  name: string;
  description?: string;
};

function SellerShopPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<SellerShopFormValues>();
  const { data, isError, isLoading } = useSellerShopProfileQuery();
  const updateShopMutation = useUpdateSellerShopProfileMutation();
  const shop = data?.data;

  useEffect(() => {
    if (!shop) {
      return;
    }

    form.setFieldsValue({
      name: shop.name,
      description: shop.description ?? "",
    });
  }, [form, shop]);

  const handleUpdateShop = async (values: SellerShopFormValues) => {
    const payload: UpdateSellerShopRequest = {
      name: values.name,
      description: values.description?.trim() || null,
    };

    try {
      const response = await updateShopMutation.mutateAsync(payload);
      void message.success(response.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update shop profile";
      void message.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card bordered={false}>
        <Skeleton active />
      </Card>
    );
  }

  if (isError || !shop) {
    return (
      <Card bordered={false}>
        <Empty description="Shop profile could not be loaded" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card bordered={false}>
        <Row gutter={[24, 24]} justify="space-between">
          <Col lg={14} xs={24}>
            <Space direction="vertical" size={8}>
              <Typography.Text type="secondary">Seller workspace</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Shop Profile
              </Typography.Title>
              <Typography.Text type="secondary">
                Manage the public shop information customers see before buying your products.
              </Typography.Text>
            </Space>
          </Col>

          <Col>
            <Button icon={<ArrowRightOutlined />}>
              <Link to={`/shops/${shop.id}`}>View public shop</Link>
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col lg={9} xs={24}>
          <Card bordered={false}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Space align="center" size={12}>
                <ShopOutlined style={{ fontSize: 28 }} />
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {shop.name}
                  </Typography.Title>
                  <Typography.Text type="secondary">Shop ID: {shop.id.slice(0, 8)}</Typography.Text>
                </div>
              </Space>

              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {shop.description || "No shop description yet."}
              </Typography.Paragraph>

              <Descriptions column={1} size="small">
                <Descriptions.Item label={<Space><UserOutlined /> Owner</Space>}>
                  {shop.owner.name}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                  {shop.owner.email}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(shop.createdAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Updated">
                  {new Date(shop.updatedAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        <Col lg={15} xs={24}>
          <Card bordered={false} title="Edit shop information">
            <Form<SellerShopFormValues> form={form} layout="vertical" onFinish={handleUpdateShop}>
              <Form.Item
                label="Shop name"
                name="name"
                rules={[
                  { required: true, message: "Please enter shop name" },
                  { whitespace: true, message: "Shop name cannot be empty" },
                ]}
              >
                <Input placeholder="Your shop name" />
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea placeholder="Tell customers what your shop sells" rows={5} />
              </Form.Item>

              <Button htmlType="submit" loading={updateShopMutation.isPending} type="primary">
                Save shop profile
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default SellerShopPage;
