import React from "react";
import { Box, Container, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { formatCurrency } from "../../utils";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import MovingSharpIcon from "@mui/icons-material/MovingSharp";
import { mdiBullseye } from "@mdi/js";

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
    borderRadius: 5,
    p: 3,
    bgcolor: "background.paper",
    width: "25%",
    display: "flex",
    flexDirection: "row",
    gap: 2,
    justifyContent: "space-between",
  };

  return (
    <Box
      sx={{ display: "flex", gap: 2, py: 4, maxWidth: "75%", minWidth: "75%" }}
    >
      <Container sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Total Balance
          </Typography>
          <Typography variant="h5" color="text.primary">
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
              p: 0.75,
              borderRadius: 2,
              bgcolor: "#191d3b",
              color: "#4553d3",
            }}
          >
            <AttachMoneyIcon />
          </Box>
        </Box>
      </Container>

      <Container sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Monthly Income
          </Typography>
          <Typography variant="h5" color="text.primary">
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
              p: 0.75,
              borderRadius: 2,
              bgcolor: "#172938",
              color: "#2fc6b7",
            }}
          >
            <SouthWestIcon />
          </Box>
        </Box>
      </Container>

      <Container sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Monthly Spending
          </Typography>
          <Typography variant="h5" color="text.primary">
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
              p: 0.75,
              borderRadius: 2,
              bgcolor: "#1f1828",
              color: "#7f1d1d",
            }}
          >
            <MovingSharpIcon />
          </Box>
        </Box>
      </Container>

      <Container sx={cardSx}>
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            Budget Health
          </Typography>
          <Typography variant="h5" color={budgetHealth.status.color}>
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
              p: 0.75,
              borderRadius: 2,
              bgcolor: "#172938",
              color: "#2fc6b7",
            }}
          >
            <Icon path={mdiBullseye} size={1} color="currentColor" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SummaryCards;
