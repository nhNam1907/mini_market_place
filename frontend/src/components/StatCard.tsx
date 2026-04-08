import { Card, Statistic } from "antd";

type StatCardProps = {
  title: string;
  value: number;
  suffix?: string;
};

function StatCard({ title, value, suffix }: StatCardProps) {
  return (
    <Card bordered={false}>
      <Statistic title={title} value={value} suffix={suffix} />
    </Card>
  );
}

export default StatCard;
