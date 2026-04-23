import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { formatCurrency } from "../../utils";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import MovingSharpIcon from "@mui/icons-material/MovingSharp";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

type UserSummary = {
  income?: number;
  expenses?: number;
};

type MonthlyPoint = {
  month: string;
  income?: number;
  expenses?: number;
};

interface SummaryCardsProps {
  userSummary?: UserSummary | null;
  currentMonthData?: MonthlyPoint;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  userSummary,
  currentMonthData,
}) => {
  const theme = useTheme();
  const income = userSummary?.income ?? 0;
  const expensesAbs = Math.abs(userSummary?.expenses ?? 0);
  const savingsRate = income > 0 ? ((income - expensesAbs) / income) * 100 : 0;

  const budgetHealth = {
    percent: Math.max(0, Math.min(100, savingsRate)),
    status:
      savingsRate >= 80
        ? { text: "On track!", color: "success.main" as const }
        : savingsRate >= 50
          ? { text: "Good progress", color: "info.main" as const }
          : { text: "Over budget", color: "error.main" as const },
  };

  const cardSx = {
    border: 1,
    borderColor: "divider",
    borderRadius: 4,
    p: { xs: 2, sm: 3 },
    bgcolor: "background.paper",
    display: "flex",
    flexDirection: "row",
    gap: { xs: 1.5, sm: 2 },
    justifyContent: "space-between",
    minWidth: 0,
  };

  const iconBgByTone = {
    blue: theme.palette.mode === "dark" ? "rgba(69, 83, 211, 0.18)" : "rgba(69, 83, 211, 0.12)",
    teal: theme.palette.mode === "dark" ? "rgba(47, 198, 183, 0.18)" : "rgba(47, 198, 183, 0.12)",
    maroon: theme.palette.mode === "dark" ? "rgba(127, 29, 29, 0.2)" : "rgba(127, 29, 29, 0.12)",
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2,
        width: { xs: "100%", xl: "75%" },
        mx: "auto",
      }}
    >
      <Box sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Total Balance
          </Typography>
          <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: 24, sm: 28 } }}>
            {formatCurrency(
              (userSummary?.income ?? 0) + (userSummary?.expenses ?? 0),
            )}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Income minus expenses
          </Typography>
        </Box>
        <Box>
          <Box
            sx={{
              display: "inline-flex",
              p: 1,
              borderRadius: 2,
              bgcolor: iconBgByTone.blue,
              color: "#4553d3",
            }}
          >
            <AttachMoneyIcon />
          </Box>
        </Box>
      </Box>

      <Box sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Monthly Income
          </Typography>
          <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: 24, sm: 28 } }}>
            {formatCurrency(currentMonthData?.income ?? 0)}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Total income this month
          </Typography>
        </Box>
        <Box>
          <Box
            sx={{
              display: "inline-flex",
              p: 1,
              borderRadius: 2,
              bgcolor: iconBgByTone.teal,
              color: "#2fc6b7",
            }}
          >
            <SouthWestIcon />
          </Box>
        </Box>
      </Box>

      <Box sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Monthly Spending
          </Typography>
          <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: 24, sm: 28 } }}>
            {formatCurrency(-(currentMonthData?.expenses ?? 0))}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Total expenses this month
          </Typography>
        </Box>
        <Box>
          <Box
            sx={{
              display: "inline-flex",
              p: 1,
              borderRadius: 2,
              bgcolor: iconBgByTone.maroon,
              color: "#7f1d1d",
            }}
          >
            <MovingSharpIcon />
          </Box>
        </Box>
      </Box>

      <Box sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Budget Health
          </Typography>
          <Typography variant="h5" color={budgetHealth.status.color} sx={{ fontSize: { xs: 24, sm: 28 } }}>
            {budgetHealth.percent.toFixed(0)}%
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {budgetHealth.status.text}
          </Typography>
        </Box>
        <Box>
          <Box
            sx={{
              display: "inline-flex",
              p: 1,
              borderRadius: 2,
              bgcolor: iconBgByTone.teal,
              color: "#2fc6b7",
            }}
          >
            <TrackChangesIcon />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryCards;
