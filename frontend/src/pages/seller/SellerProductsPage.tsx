import type { SellerProduct, SellerProductStatus } from "@market-place/shared/api";
import type { TableProps } from "antd";
import { Button, Card, Segmented, Space, Table, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useSellerProductsQuery } from "@/hooks/useSellerProducts";

type SellerProductStatusFilter = "all" | SellerProductStatus;

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
  const [status, setStatus] = useState<SellerProductStatusFilter>("all");
  const statusParam = status === "all" ? undefined : status;
  const { data, isLoading } = useSellerProductsQuery(statusParam);
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

        <Segmented<SellerProductStatusFilter>
          onChange={setStatus}
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Deleted", value: "inactive" },
          ]}
          value={status}
        />

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
