import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { formatCurrency } from "../../utils";

type MonthlyPoint = {
  month: string;
  income?: number;
  expenses?: number;
};

interface IncomeExpensesChartProps {
  userMonthly: MonthlyPoint[];
}

const IncomeExpensesChart: React.FC<IncomeExpensesChartProps> = ({
  userMonthly,
}) => {
  const theme = useTheme();

  const data = userMonthly.slice(-6).map((m) => ({
    month: new Date(`${m.month}-01`).toLocaleString("en-US", {
      month: "short",
    }),
    income: m.income ?? 0,
    expenses: Math.abs(m.expenses ?? 0),
  }));

  return (
    <Container
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 5,
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        width: "100%",
        minWidth: 0,
      }}
    >
      <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
        Income vs Expenses
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        Last 6 months overview
      </Typography>

      <Box
        sx={{
          width: "100%",
          height: { xs: 240, sm: 300 },
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.default",
          p: { xs: 0.5, sm: 1 },
        }}
      >
        {data.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ color: "text.secondary" }}>
              No monthly data yet
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke={theme.palette.divider}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickFormatter={(v) => `$${Number(v) / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                }}
                labelStyle={{ color: theme.palette.text.secondary }}
                formatter={(value: number) => formatCurrency(value)}
                cursor={{
                  fill:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: 8,
                  color: theme.palette.text.secondary,
                }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill={theme.palette.success.main}
                radius={[8, 8, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill={theme.palette.error.main}
                radius={[8, 8, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Container>
  );
};

export default IncomeExpensesChart;
