import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";
import { formatCurrency } from "../../utils";

type CategoryPoint = {
  category?: string;
  total?: number;
};

interface CategoryDonutChartProps {
  categories: CategoryPoint[];
}

const categoryColors = ["#2F49D1", "#2FC6B7", "#E8C766", "#F2A45B", "#244E63"];

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
}) => {
  const theme = useTheme();

  const data = (categories || [])
    .filter((c) => (c.total ?? 0) !== 0)
    .map((c) => ({
      name: c.category || "Other",
      value: Math.abs(c.total ?? 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <Container
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 5,
        p: 3,
        bgcolor: "background.paper",
        width: "40%",
      }}
    >
      <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
        Spending by Category
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        {new Date().toLocaleDateString("en-US", { month: "long" })} breakdown
      </Typography>

      <Box sx={{ width: "100%", height: 260 }}>
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
              No category spending data
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[index % categoryColors.length]}
                  />
                ))}
              </Pie>

              <RechartsTooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                }}
                labelStyle={{ color: theme.palette.text.secondary }}
              />

              <RechartsLegend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  color: theme.palette.text.secondary,
                  fontSize: 12,
                  paddingTop: 10,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Container>
  );
};

export default CategoryDonutChart;
