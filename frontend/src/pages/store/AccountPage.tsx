import { Card, Descriptions, Space, Typography } from "antd";

import { useAuthStore } from "@/store/authStore";

function AccountPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Typography.Title>My Account</Typography.Title>
        <Typography.Text type="secondary">
          Protected area for the signed-in customer profile.
        </Typography.Text>
      </div>
      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">{user?.name ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Role">{user?.role ?? "-"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}

export default AccountPage;
