import {
  ArrowForward,
  CameraAltOutlined,
  CloudQueueOutlined,
  DataObject,
  GroupOutlined,
  Inventory2Outlined,
  MemoryOutlined,
  PlayArrowOutlined,
  SmartToyOutlined,
  TaskAltOutlined,
  UploadFileOutlined,
  InsightsOutlined,
} from "@mui/icons-material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { useState } from "react";
import TermsDialog from "../components/landing/Terms";
import PrivacyDialog from "../components/landing/Privacy";

const features = [
  {
    icon: <CameraAltOutlined sx={{ fontSize: 24 }} />,
    title: "AI-Powered Bookkeeper",
    desc: "Upload a photo or PDF. Our OCR instantly recognizes merchants, dates, and line items without manual data entry.",
  },
  {
    icon: <InsightsOutlined sx={{ fontSize: 24 }} />,
    title: "Financial Clarity",
    desc: "Interactive charts, monthly breakdowns, and 6-month trend analysis to see exactly where your money goes.",
  },
  {
    icon: <GroupOutlined sx={{ fontSize: 24 }} />,
    title: "Personal & Group Wallets",
    desc: "Manage your own spending or share a wallet to easily split costs with roommates and partners.",
  },
];

const steps = [
  {
    number: "1",
    icon: <UploadFileOutlined sx={{ fontSize: 26 }} />,
    title: "Snap & Upload",
    desc: "Take a photo of any receipt or upload a PDF from your device.",
  },
  {
    number: "2",
    icon: <MemoryOutlined sx={{ fontSize: 26 }} />,
    title: "AI Processing",
    desc: "Our AI engine extracts merchant, date, items, and totals in seconds.",
  },
  {
    number: "3",
    icon: <TaskAltOutlined sx={{ fontSize: 26 }} />,
    title: "Review & Save",
    desc: "Verify the data with a tap and it's categorized in your wallet.",
  },
];

const technologies = [
  { icon: <DataObject sx={{ fontSize: 24 }} />, label: "React" },
  { icon: <MemoryOutlined sx={{ fontSize: 24 }} />, label: "Python" },
  { icon: <Inventory2Outlined sx={{ fontSize: 24 }} />, label: "Docker" },
  { icon: <CloudQueueOutlined sx={{ fontSize: 24 }} />, label: "Azure" },
  { icon: <SmartToyOutlined sx={{ fontSize: 24 }} />, label: "Groq" },
];

export default function LandingPage() {
  const theme = useTheme();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const featureCardBg =
    theme.palette.mode === "dark"
      ? "rgba(4,12,44,0.7)"
      : alpha(theme.palette.background.paper, 0.92);
  const featureIconBg =
    theme.palette.mode === "dark"
      ? "rgba(69,83,211,0.15)"
      : alpha("#4553d3", 0.1);

  return (
    <Box sx={{ width: "100%", color: "text.primary" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 5, md: 10 },
          background:
            "radial-gradient(800px 400px at 85% 85%, rgba(0,129,255,0.2) 0%, rgba(0,129,255,0) 70%)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
              gap: { xs: 4, md: 7 },
              alignItems: "center",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.7,
                  borderRadius: 999,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "rgba(69,83,211,0.08)",
                  mb: 2.5,
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2fc6b7" }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  AI-powered expense tracking
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 42, sm: 58, md: 64 },
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: -1.2,
                }}
              >
                Stop typing.
                <br />
                <Box component="span" sx={{ color: "#4553d3" }}>
                  Start scanning.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 520,
                  color: "text.secondary",
                  fontSize: { xs: 22, sm: 26 },
                  lineHeight: 1.5,
                }}
              >
                Track your expenses with AI. Just snap a photo of your receipt, and our Azure &amp; Groq-powered engine extracts the data instantly.
              </Typography>

                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2.5,
                    px: 3.5,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#4553d3",
                    "&:hover": { bgcolor: "#3d4ac2" },
                  }}
                >
                  Try it for free
                </Button>
            </Box>

            <Box
              sx={{
                borderRadius: 4,
                bgcolor: "#dfe4ea",
                minHeight: { xs: 260, sm: 380, md: 520 },
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                backgroundImage:
                  "linear-gradient(145deg, #f2f5f8 0%, #dde3e9 50%, #f7f8fa 100%)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: { xs: 160, sm: 220, md: 260 },
                  height: { xs: 320, sm: 440, md: 510 },
                  borderRadius: 7,
                  bgcolor: "#111827",
                  border: "6px solid #2a3342",
                  boxShadow: "0 18px 35px rgba(0,0,0,0.35)",
                  transform: "rotate(-26deg)",
                  position: "relative",
                }}
              >
                <Box sx={{ px: 1.5, pt: 1.8, display: "grid", gap: 1.1 }}>
                  {["#56CFE1", "#72EFDD", "#80ED99", "#FFD166", "#EF476F"].map((color) => (
                    <Box key={color} sx={{ height: 12, borderRadius: 1, bgcolor: color, opacity: 0.9 }} />
                  ))}
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <Box sx={{ height: 54, borderRadius: 1.5, bgcolor: "#1f2937" }} />
                    <Box sx={{ height: 54, borderRadius: 1.5, bgcolor: "#1f2937" }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "rgba(93,104,182,0.12)" }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              letterSpacing: 1.8,
              fontWeight: 700,
              fontSize: 14,
              textTransform: "uppercase",
              mb: 3,
            }}
          >
            Powered by modern technology
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 4 }}
            useFlexGap
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
          >
            {technologies.map((tech) => (
              <Stack key={tech.label} direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
                {tech.icon}
                <Typography sx={{ fontWeight: 600 }}>{tech.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: "rgba(88,99,173,0.14)" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: 36, md: 56 },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Everything you need
            <br />
            to manage your money
          </Typography>
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              fontSize: { xs: 18, md: 21 },
              mb: 5,
            }}
          >
            Powerful features designed for the way you spend, save, and share.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {features.map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: featureCardBg,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: featureIconBg,
                    color: "#4553d3",
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.2 }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ textAlign: "center", fontWeight: 800, mb: 1, fontSize: { xs: 34, md: 50 } }}
          >
            How it works
          </Typography>
          <Typography sx={{ textAlign: "center", color: "text.secondary", mb: 5, fontSize: { xs: 18, md: 21 } }}>
            Three simple steps to financial clarity.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 3,
            }}
          >
            {steps.map((step, index) => (
              <Box key={step.title} sx={{ textAlign: "center", position: "relative" }}>
                <Box
                  sx={{
                    width: 84,
                    height: 84,
                    borderRadius: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(69,83,211,0.12)",
                    color: "#4553d3",
                    border: 1,
                    borderColor: "divider",
                    mb: 2.2,
                    position: "relative",
                  }}
                >
                  {step.icon}
                  <Box
                    sx={{
                      position: "absolute",
                      right: -10,
                      top: -10,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      bgcolor: "#2fc6b7",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {step.number}
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", maxWidth: 330, mx: "auto" }}>
                  {step.desc}
                </Typography>
                {index < steps.length - 1 && (
                  <ArrowForward
                    sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute",
                      top: 40,
                      right: -26,
                      color: "text.secondary",
                      opacity: 0.5,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              borderRadius: 4,
              px: { xs: 3, md: 10 },
              py: { xs: 5, md: 8 },
              background: "linear-gradient(135deg, #4568c2 0%, #4856cc 65%, #4a66c8 100%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, fontSize: { xs: 38, md: 58 }, lineHeight: 1.1, mb: 2 }}
            >
              Ready to take control
              <br />
              of your finances?
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3, fontSize: { xs: 18, md: 22 } }}>
              Join thousands of students who are already tracking smarter, not harder.
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                minHeight: 44,
                borderRadius: 2.5,
                px: 3.5,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#2fc6b7",
                color: "#fff",
                "&:hover": { bgcolor: "#25b4a8" },
              }}
            >
              Create Free Account
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ borderTop: 1, borderColor: "divider", py: 3.5, bgcolor: "rgba(88,99,173,0.1)" }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AccountBalanceWalletOutlinedIcon
                sx={{
                  bgcolor: "#353e8c",
                  color: "white",
                  borderRadius: "30%",
                  p: 0.5,
                  height: 26,
                  width: 26,
                }}
              />
              <Typography sx={{ fontWeight: 700 }}>FinanceAI</Typography>
            </Stack>
            <Typography sx={{ color: "text.secondary" }}>© 2026 FinanceAI. All rights reserved.</Typography>
            <Stack direction="row" spacing={2.5}>
              <Typography 
                sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { color: "text.primary" } }}
                onClick={() => setTermsOpen(true)}
              >
                Terms
              </Typography>
              <Typography 
                sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { color: "text.primary" } }}
                onClick={() => setPrivacyOpen(true)}
              >
                Privacy
              </Typography>

              <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
              <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}