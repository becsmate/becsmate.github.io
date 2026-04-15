import React, { useState } from "react";
import {
  Box,
  Chip,
  Container,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Select,
  Typography,
  Button,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import { formatCurrency, formatDate } from "../../utils";

type Transaction = {
  id: string | number;
  date: string;
  description: string | null;
  category: string | null;
  amount: number;
  ai_tag?: boolean;
};

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: "all" | "income" | "expense";
  onTypeFilterChange: (value: "all" | "income" | "expense") => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onAddClick?: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  width?: string | number;
}

const categoryChipSx: Record<string, any> = {
  Groceries: {
    bgcolor: "rgba(47,73,209,0.18)",
    color: "#5f7cff",
    borderColor: "rgba(47,73,209,0.4)",
  },
  Salary: {
    bgcolor: "rgba(47,198,183,0.16)",
    color: "#2fc6b7",
    borderColor: "rgba(47,198,183,0.38)",
  },
  Entertainment: {
    bgcolor: "rgba(168,85,247,0.18)",
    color: "#c084fc",
    borderColor: "rgba(168,85,247,0.38)",
  },
  Transport: {
    bgcolor: "rgba(236,72,153,0.18)",
    color: "#f472b6",
    borderColor: "rgba(236,72,153,0.38)",
  },
  Utilities: {
    bgcolor: "rgba(6,182,212,0.16)",
    color: "#22d3ee",
    borderColor: "rgba(6,182,212,0.38)",
  },
  Dining: {
    bgcolor: "rgba(245,158,11,0.18)",
    color: "#f59e0b",
    borderColor: "rgba(245,158,11,0.38)",
  },
  Investment: {
    bgcolor: "rgba(59,130,246,0.18)",
    color: "#60a5fa",
    borderColor: "rgba(59,130,246,0.38)",
  },
  default: {
    bgcolor: "rgba(148,163,184,0.16)",
    color: "#cbd5e1",
    borderColor: "rgba(148,163,184,0.35)",
  },
};

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onAddClick,
  onEditTransaction,
  onDeleteTransaction,
  width = "75%",
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setMenuAnchor(event.currentTarget);
    setMenuTransaction(transaction);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTransaction(null);
  };

  const handleEdit = () => {
    if (menuTransaction && onEditTransaction) {
      onEditTransaction(menuTransaction);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (menuTransaction && onDeleteTransaction) {
      onDeleteTransaction(menuTransaction);
    }
    handleMenuClose();
  };

  const categories = Array.from(
    new Set(transactions.map((t) => t.category ?? "Other")),
  );

  const filtered = transactions.filter((t) => {
    const description = (t.description ?? "").toLowerCase();
    const category = (t.category ?? "").toLowerCase();

    const matchesSearch =
      description.includes(search.toLowerCase()) ||
      category.includes(search.toLowerCase());

    const matchesType =
      typeFilter === "all"
        ? true
        : typeFilter === "income"
          ? t.amount > 0
          : t.amount < 0;

    const matchesCategory =
      categoryFilter === "all"
        ? true
        : (t.category ?? "Other") === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <Container
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        p: 0,
        bgcolor: "background.paper",
        width,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: { xs: "stretch", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: 22, sm: 28 }, fontWeight: 700, color: "text.primary" }}
        >
          Recent Transactions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "minmax(220px, 1.4fr) auto auto auto" },
            alignItems: "center",
            gap: 1,
            width: "100%",
            maxWidth: { md: 760 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.25,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.default",
              minWidth: 0,
              height: 40,
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
            <InputBase
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ color: "text.primary", width: "100%" }}
            />
          </Box>

          <Select
            size="small"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as any)}
            sx={{
              minWidth: 0,
              borderRadius: 2,
              bgcolor: "background.default",
              height: 40,
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>

          <Select
            size="small"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            sx={{
              minWidth: 0,
              borderRadius: 2,
              bgcolor: "background.default",
              height: 40,
            }}
            startAdornment={
              <TuneIcon
                sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }}
              />
            }
          >
            <MenuItem value="all">All...</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{ borderRadius: 2, textTransform: "none", height: 40, whiteSpace: "nowrap" }}
          >
            Add
          </Button>
        </Box>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1.1fr 2.3fr 1.5fr 1fr 40px",
            px: { xs: 2, sm: 3 },
            py: 1.75,
            color: "text.secondary",
            borderBottom: 1,
            borderColor: "divider",
            minWidth: 760,
          }}
        >
          <Typography>Date</Typography>
          <Typography>Description</Typography>
          <Typography>Category</Typography>
          <Typography align="right">Amount</Typography>
          <Box />
        </Box>

        {filtered.map((t) => {
          const isIncome = t.amount > 0;
          const categoryName = t.category ?? "Other";
          const chipStyle =
            categoryChipSx[categoryName] || categoryChipSx.default;

          return (
            <Box
              key={t.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.1fr 2.3fr 1.5fr 1fr 40px",
                px: { xs: 2, sm: 3 },
                py: 2,
                alignItems: "center",
                borderBottom: 1,
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
                minWidth: 760,
              }}
            >
              <Typography sx={{ color: "text.secondary" }}>
                {formatDate(t.date)}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isIncome
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)",
                    color: isIncome ? "success.main" : "error.main",
                  }}
                >
                  {isIncome ? (
                    <SouthWestIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <NorthEastIcon sx={{ fontSize: 14 }} />
                  )}
                </Box>
                <Typography sx={{ color: "text.primary" }} noWrap>
                  {t.description ?? "No description"}
                </Typography>
                {t.ai_tag ? (
                  <Chip
                    size="small"
                    label="AI"
                    sx={{
                      height: 22,
                      fontSize: 12,
                      borderRadius: 999,
                      bgcolor: "rgba(47,198,183,0.12)",
                      color: "#2fc6b7",
                      border: "1px solid rgba(47,198,183,0.35)",
                    }}
                  />
                ) : null}
              </Box>

              <Box>
                <Chip
                  label={categoryName}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    bgcolor: chipStyle.bgcolor,
                    color: chipStyle.color,
                    borderColor: chipStyle.borderColor,
                    fontWeight: 500,
                  }}
                />
              </Box>

              <Typography
                align="right"
                sx={{
                  color: isIncome ? "success.main" : "text.primary",
                  fontFamily: "monospace",
                  fontSize: 20,
                }}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(Math.abs(t.amount))}
              </Typography>

              <IconButton
                size="small"
                onClick={(event) => handleMenuOpen(event, t)}
              >
                <MoreHorizIcon sx={{ color: "text.secondary" }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Container>
  );
};

export default RecentTransactionsTable;
