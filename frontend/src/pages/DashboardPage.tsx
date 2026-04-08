import type { HealthResponse, ProductSummary } from "@market-place/shared/api";
import { Col, List, Row, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";

import { apiClient } from "@/api/client";
import StatCard from "@/components/StatCard";

const demoProducts: ProductSummary[] = [
  {
    id: "p-1",
    name: "Laptop gaming",
    category: "Laptop",
    price: 32000000,
    stock: 12,
  },
  {
    id: "p-2",
    name: "Tai nghe bluetooth",
    category: "Accessories",
    price: 1200000,
    stock: 48,
  },
  {
    id: "p-3",
    name: "Chuot khong day",
    category: "Accessories",
    price: 650000,
    stock: 30,
  },
  {
    id: "p-4",
    name: "Ban phim co",
    category: "Accessories",
    price: 1900000,
    stock: 20,
  },
];

function DashboardPage() {
  const [health, setHealth] = useState<string>("Checking...");

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await apiClient.get<HealthResponse>("/health");
        setHealth(response.data.message);
      } catch {
        setHealth("Cannot connect to backend");
      }
    }

    void fetchHealth();
  }, []);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={2}>Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Base structure for managing products, orders, customers and reports.
        </Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <StatCard title="Products" value={128} />
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Orders" value={32} />
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Revenue" value={12800000} suffix="VND" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Typography.Title level={4}>Featured products</Typography.Title>
          <List
            bordered
            dataSource={demoProducts}
            renderItem={(item) => <List.Item>{item.name}</List.Item>}
            rowKey="id"
            style={{ background: "#fff", borderRadius: 12 }}
          />
        </Col>
        <Col xs={24} lg={10}>
          <Typography.Title level={4}>Backend status</Typography.Title>
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #f0f0f0",
            }}
          >
            <Space direction="vertical">
              <Typography.Text>Ket noi API:</Typography.Text>
              <Tag color={health === "Backend is running" ? "success" : "error"}>
                {health}
              </Tag>
            </Space>
          </div>
        </Col>
      </Row>
    </Space>
  );
}

export default DashboardPage;
