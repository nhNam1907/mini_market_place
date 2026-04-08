import { ShopOutlined } from "@ant-design/icons";
import { Card, Empty, Typography } from "antd";

function SellerShopPage() {
  return (
    <Card bordered={false}>
      <Typography.Title level={3}>Shop Profile</Typography.Title>
      <Typography.Text type="secondary">
        Placeholder page for future seller shop settings and shop profile management.
      </Typography.Text>
      <Empty description="Shop settings module is coming next" image={<ShopOutlined style={{ fontSize: 48 }} />} />
    </Card>
  );
}

export default SellerShopPage;
