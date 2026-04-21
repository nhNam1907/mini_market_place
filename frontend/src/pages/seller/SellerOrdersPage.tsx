import type { SellerOrderItem, SellerOrderItemStatus } from "@market-place/shared/api";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { App, Button, Card, Select, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  useSellerOrderItemsQuery,
  useUpdateSellerOrderItemStatusMutation,
} from "@/hooks/useSellerOrders";

const STATUS_OPTIONS: Array<{ label: string; value: SellerOrderItemStatus }> = [
  { label: "PENDING", value: "PENDING" },
  { label: "CONFIRMED", value: "CONFIRMED" },
  { label: "SHIPPING", value: "SHIPPING" },
  { label: "DELIVERED", value: "DELIVERED" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "CANCELLED", value: "CANCELLED" },
];

const NEXT_STATUS_ACTION: Partial<
  Record<SellerOrderItemStatus, { label: string; status: SellerOrderItemStatus; type?: "primary" | "default" }>
> = {
  PENDING: { label: "Confirm", status: "CONFIRMED", type: "primary" },
  CONFIRMED: { label: "Ship", status: "SHIPPING", type: "primary" },
  SHIPPING: { label: "Mark delivered", status: "DELIVERED" },
  DELIVERED: { label: "Complete", status: "COMPLETED" },
};

function getStatusColor(status: SellerOrderItemStatus) {
  switch (status) {
    case "CANCELLED":
      return "red";
    case "COMPLETED":
      return "green";
    case "DELIVERED":
      return "cyan";
    case "SHIPPING":
      return "blue";
    case "CONFIRMED":
      return "gold";
    default:
      return "processing";
  }
}

function SellerOrdersPage() {
  const { message } = App.useApp();
  const [status, setStatus] = useState<SellerOrderItemStatus | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const updateStatusMutation = useUpdateSellerOrderItemStatusMutation();
  const { data, isLoading } = useSellerOrderItemsQuery({
    pageNumber,
    pageSize,
    status,
  });

  const sellerOrderData = data?.data;
  const items = sellerOrderData?.items ?? [];
  const meta = sellerOrderData?.meta;

  const handleAdvanceStatus = async (item: SellerOrderItem) => {
    const nextAction = NEXT_STATUS_ACTION[item.status];

    if (!nextAction) {
      return;
    }

    try {
      const response = await updateStatusMutation.mutateAsync({
        orderItemId: item.id,
        status: nextAction.status,
      });
      message.success(response.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update order item status";
      message.error(errorMessage);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPageNumber(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 12);
  };

  const columns: ColumnsType<SellerOrderItem> = [
    {
      title: "Order",
      dataIndex: ["order", "id"],
      key: "orderId",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Link to={`/seller/orders/${record.order.id}`}>#{record.order.id.slice(0, 8)}</Link>
          <Typography.Text type="secondary">
            {new Date(record.order.createdAt).toLocaleString("vi-VN")}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Buyer",
      dataIndex: ["order", "user", "name"],
      key: "buyer",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.order.user.name}</Typography.Text>
          <Typography.Text type="secondary">{record.order.user.email}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.productName}</Typography.Text>
          <Typography.Text type="secondary">Qty: {record.quantity}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Line Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right",
      render: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: SellerOrderItemStatus) => <Tag color={getStatusColor(value)}>{value}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_value, record) => {
        const nextAction = NEXT_STATUS_ACTION[record.status];

        if (!nextAction) {
          return <Typography.Text type="secondary">No action</Typography.Text>;
        }

        const isCurrentRowPending =
          updateStatusMutation.isPending &&
          updateStatusMutation.variables?.orderItemId === record.id;

        return (
          <Space size={8} wrap>
            <Link to={`/seller/orders/${record.order.id}`}>
              <Button size="small" type="default">
                View detail
              </Button>
            </Link>
            <Button
              loading={isCurrentRowPending}
              onClick={() => void handleAdvanceStatus(record)}
              size="small"
              type={nextAction.type ?? "default"}
            >
              {nextAction.label}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Card bordered={false}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
          <div>
            <Typography.Title level={3}>Shop Orders</Typography.Title>
            <Typography.Text type="secondary">
              Track the order items that belong to your shop and move them through fulfillment.
            </Typography.Text>
          </div>
          <Select
            allowClear
            onChange={(value) => {
              setStatus(value);
              setPageNumber(1);
            }}
            options={STATUS_OPTIONS}
            placeholder="Filter by status"
            style={{ minWidth: 220 }}
            value={status}
          />
        </Space>

        <Table<SellerOrderItem>
          columns={columns}
          dataSource={items}
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: meta?.currentPage ?? pageNumber,
            pageSize: meta?.pageSize ?? pageSize,
            total: meta?.totalItems ?? 0,
            showSizeChanger: true,
          }}
          rowKey="id"
        />
      </Space>
    </Card>
  );
}

export default SellerOrdersPage;
