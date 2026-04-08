import type { CreateSellerProductRequest, SellerProduct } from "@market-place/shared/api";
import type { TableProps } from "antd";
import { App, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Typography } from "antd";
import { useMemo, useState } from "react";

import { useCreateSellerProductMutation, useSellerProductsQuery } from "@/hooks/useSellerProducts";
import { useCategoriesQuery } from "@/hooks/useSystem";

const columns: TableProps<SellerProduct>["columns"] = [
  {
    title: "Product",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Category",
    dataIndex: ["category", "name"],
    key: "category",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (value: number) => value.toLocaleString("vi-VN"),
  },
  {
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
  },
];

function SellerProductsPage() {
  const { message } = App.useApp();
  const { data, isLoading } = useSellerProductsQuery();
  const { data: categoryResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const createMutation = useCreateSellerProductMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CreateSellerProductRequest>();

  const products = data?.data ?? [];
  const categoryOptions = useMemo(
    () =>
      (categoryResponse?.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoryResponse?.data],
  );

  const handleCreateProduct = async (values: CreateSellerProductRequest) => {
    try {
      const response = await createMutation.mutateAsync(values);
      await message.success(response.message);
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create product";
      message.error(errorMessage);
    }
  };

  return (
    <Card bordered={false}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <div>
            <Typography.Title level={3}>My Products</Typography.Title>
            <Typography.Text type="secondary">
              Seller product management using `GET /api/seller/products` and `POST /api/seller/products`.
            </Typography.Text>
          </div>
          <Button onClick={() => setIsModalOpen(true)} type="primary">
            Add product
          </Button>
        </Space>

        <Table<SellerProduct>
          columns={columns}
          dataSource={products}
          loading={isLoading}
          pagination={false}
          rowKey="id"
        />
      </Space>

      <Modal
        destroyOnHidden
        okButtonProps={{ htmlType: "submit", loading: createMutation.isPending }}
        okText="Create"
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
        title="Create product"
        modalRender={(modal) => (
          <Form<CreateSellerProductRequest> form={form} layout="vertical" onFinish={handleCreateProduct}>
            {modal}
          </Form>
        )}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter product name" }]}
        >
          <Input placeholder="Mechanical Keyboard" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Short product description" rows={3} />
        </Form.Item>

        <Form.Item
          initialValue={1}
          label="Price"
          name="price"
          rules={[{ required: true, message: "Please enter price" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          initialValue={0}
          label="Stock"
          name="stock"
          rules={[{ required: true, message: "Please enter stock" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Image URL" name="imageUrl">
          <Input placeholder="https://example.com/product.jpg" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="categoryId"
          rules={[{ required: true, message: "Please choose a category" }]}
        >
          <Select
            loading={isCategoriesLoading}
            options={categoryOptions}
            placeholder="Select category"
          />
        </Form.Item>
      </Modal>
    </Card>
  );
}

export default SellerProductsPage;
