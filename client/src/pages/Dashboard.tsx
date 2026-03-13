import React, { useState } from "react";
import { Box } from "@mui/material";
import { useTransactions, useWallets } from "../services/walletService";
import { useStatistics } from "../services/statisticsService";
import SummaryCards from "../components/dashboard/SummaryCards";
import IncomeExpensesChart from "../components/dashboard/IncomeExpensesChart";
import CategoryDonutChart from "../components/dashboard/CategoryDonutChart";
import RecentTransactionsTable from "../components/dashboard/RecentTransactionsTable";

const Dashboard: React.FC = () => {
  const { wallets } = useWallets();
  const [walletId, setWalletId] = useState<string>("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { transactions = [] } = useTransactions(walletId);

  const { userSummary, userMonthly, categories } = useStatistics(
    walletId || null,
  );

  const monthWithYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const currentMonthData = userMonthly.find((m) => m.month === monthWithYear);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, py: 4 }}>
      {/* cards */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <SummaryCards
          userSummary={userSummary ?? undefined}
          currentMonthData={currentMonthData}
        />
      </Box>

      {/* charts */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box
          sx={{ display: "flex", flexDirection: "row", gap: 2, width: "75%" }}
        >
          <IncomeExpensesChart userMonthly={userMonthly} />
          <CategoryDonutChart categories={categories || []} />
        </Box>
      </Box>

      {/* table */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <RecentTransactionsTable
          transactions={transactions}
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onAddClick={() => {}}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
