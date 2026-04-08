import type { ProductSummary } from "@market-place/shared/api";
import type { TableProps } from "antd";
import { Button, Card, Space, Table, Typography } from "antd";

const columns: TableProps<ProductSummary>["columns"] = [
  { title: "Product name", dataIndex: "name", key: "name" },
  { title: "Category", dataIndex: "category", key: "category" },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (value: number) => value.toLocaleString("vi-VN"),
  },
  { title: "Stock", dataIndex: "stock", key: "stock" },
];

const dataSource: ProductSummary[] = [
  { id: "1", name: "Laptop Dell XPS", category: "Laptop", price: 35000000, stock: 12 },
  { id: "2", name: "iPhone 15", category: "Phone", price: 24000000, stock: 20 },
];

function AdminProductsPage() {
  return (
    <Card bordered={false}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <div>
            <Typography.Title level={3}>Products</Typography.Title>
            <Typography.Text type="secondary">
              Admin catalog table ready for CRUD APIs and query hooks.
            </Typography.Text>
          </div>
          <Button type="primary">Add product</Button>
        </Space>
        <Table columns={columns} dataSource={dataSource} pagination={false} rowKey="id" />
      </Space>
    </Card>
  );
}

export default AdminProductsPage;
