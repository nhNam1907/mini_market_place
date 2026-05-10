import type { SellerProduct } from "@market-place/shared/api";
import type { TableProps } from "antd";
import { Button, Card, Space, Table, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { useSellerProductsQuery } from "@/hooks/useSellerProducts";

const columns: TableProps<SellerProduct>["columns"] = [
  {
    title: "Product",
    dataIndex: "name",
    key: "name",
    render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
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
  {
    title: "Images",
    key: "images",
    render: (_, record) => record.images.length,
  },
];

function SellerProductsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useSellerProductsQuery();
  const products = data?.data ?? [];

  return (
    <Card bordered={false}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <div>
            <Typography.Title level={3}>My Products</Typography.Title>
            <Typography.Text type="secondary">
              Click a row to view product detail. Create products from a dedicated page.
            </Typography.Text>
          </div>
          <Button type="primary">
            <Link to="/seller/products/new">Add product</Link>
          </Button>
        </Space>

        <Table<SellerProduct>
          columns={columns}
          dataSource={products}
          loading={isLoading}
          onRow={(record) => ({
            className: "seller-product-row",
            onClick: () => navigate(`/seller/products/${record.id}`),
          })}
          pagination={false}
          rowKey="id"
        />
      </Space>
    </Card>
  );
}

export default SellerProductsPage;
