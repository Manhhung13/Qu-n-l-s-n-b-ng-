import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  DatePicker,
  Spin,
  message,
  Typography,
} from "antd";
import axiosClient from "../../api/axiosClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import moment from "moment";
const { RangePicker } = DatePicker;
const { Text } = Typography;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    moment().startOf("month"),
    moment().endOf("month"),
  ]);
  const [stats, setStats] = useState({});
  const [revenueByDay, setRevenueByDay] = useState([]);
  const [revenueByField, setRevenueByField] = useState([]);
  const [orders, setOrders] = useState([]);

  // Tối ưu hóa phạm vi ngày cho RangePicker
  const minDate = moment("2018-01-01");
  const maxDate = moment("2035-12-31");

  const fetchData = async () => {
    setLoading(true);
    try {
      const formattedRange = [
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
      ];
      const response = await axiosClient.get("/admin/dashboard", {
        params: { startDate: formattedRange[0], endDate: formattedRange[1] },
      });
      const { data } = response;
      setStats(data.stats);
      setRevenueByDay(data.revenueByDay);
      setRevenueByField(data.revenueByField);
      setOrders(data.orders);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const columns = [
    { title: "Mã đơn", dataIndex: "orderId", key: "orderId" },
    { title: "Khách hàng", dataIndex: "customerName", key: "customerName" },
    { title: "Sân", dataIndex: "fieldName", key: "fieldName" },
    { title: "Giờ", dataIndex: "timeSlot", key: "timeSlot" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  // Hiện ngày đã chọn trên dashboard (ngắn gọn, rõ ràng)
  const selectedStart = dateRange[0]?.format("YYYY-MM-DD");
  const selectedEnd = dateRange[1]?.format("YYYY-MM-DD");

  // Hàm khóa (disable) ngày ngoài phạm vi cho phép, UX tối ưu
  const disabledDate = (current) =>
    current && (current < minDate || current > maxDate);

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue || 0}
              suffix="VND"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng số đơn đặt" value={stats.totalOrders || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khách hàng quay lại"
              value={stats.returningCustomers || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates)}
                allowClear={false}
                style={{
                  width: "100%",
                  fontSize: "1.2rem",
                  padding: 10,
                  borderRadius: 8,
                }}
                size="large"
                format="YYYY-MM-DD"
                inputReadOnly={true}
                placement="bottomLeft"
                disabledDate={disabledDate}
                bordered={true}
                showNow={true}
                showToday={true}
                dropdownClassName="custom-range-picker-panel"
              />
              <Text type="secondary" style={{ fontSize: "1rem", marginTop: 4 }}>
                {selectedStart} → {selectedEnd}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Doanh thu theo ngày">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={revenueByDay.map((item) => ({
                  ...item,
                  date: item.date ? item.date.slice(0, 10) : "",
                }))}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis tickFormatter={(v) => v.toLocaleString("vi-VN")} />
                <Tooltip
                  labelFormatter={(val) => `Ngày: ${val}`}
                  formatter={(v) => `${v.toLocaleString("vi-VN")} VND`}
                />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Doanh thu theo sân">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={revenueByField.map((item) => ({
                    ...item,
                    revenue: Number(item.revenue),
                  }))}
                  dataKey="revenue"
                  nameKey="field"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ field, percent }) =>
                    `${field}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {revenueByField.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value, name, props) =>
                    `${value.toLocaleString("vi-VN")} VND`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Danh sách đơn đặt sân">
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="orderId"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default Dashboard;
