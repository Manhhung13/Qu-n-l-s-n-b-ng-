import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Avatar,
  TableContainer,
  Pagination,
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
  Stack,
  Button,
} from "@mui/material";

// === THEME CẤU HÌNH GIỐNG ẢNH ===
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3B82F6" },
    secondary: { main: "#10B981" },
    background: { default: "#F3F4F6", paper: "#FFFFFF" },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h5: { fontWeight: 800 },
    subtitle1: { fontWeight: 700 },
    body2: { fontSize: 13 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #E5E7EB",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #F3F4F6" },
        head: { fontWeight: 600, color: "#9CA3AF", fontSize: 12 },
      },
    },
  },
});

export default function PremierLeagueDashboard() {
  // State quản lý dữ liệu
  const [recentMatches, setRecentMatches] = useState([]);
  const [nextMatches, setNextMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);

  // State trạng thái
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State tương tác
  const [activeTab, setActiveTab] = useState("dashboard");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get(`/user/football/matches?status=FINISHED`),
      axiosClient.get(`/user/football/matches?status=SCHEDULED`),
      axiosClient.get(`/user/football/standings`),
      axiosClient.get(`/user/football/scorers`),
    ])
      .then(([recentRes, nextRes, standingsRes, scorersRes]) => {
        setRecentMatches(recentRes.data.matches.reverse());
        setNextMatches(nextRes.data.matches);
        setStandings(standingsRes.data.standings[0].table);
        setScorers(scorersRes.data.scorers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không lấy được dữ liệu bóng đá. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, []);

  // === CẬP NHẬT MENU TABS (BỎ TIN TỨC, THÊM CHI TIẾT BXH) ===
  const menuTabs = [
    { id: "dashboard", label: "Tổng quan" },
    { id: "standings_full", label: "Bảng xếp hạng" }, // Tab hiển thị full
    { id: "fixtures", label: "Lịch thi đấu" },
    { id: "stats", label: "Thống kê" },
  ];

  // Render nội dung chính dựa trên Tab đang chọn
  const renderContent = () => {
    // 1. DASHBOARD (HIỂN THỊ RÚT GỌN)
    if (activeTab === "dashboard") {
      const dashboardRecent = recentMatches.slice(0, 3);
      const dashboardNext = nextMatches.slice(0, 3);

      // Logic rút gọn BXH: Top 5 + Đội cuối bảng
      const dashboardStandings = [...standings.slice(0, 5)];
      if (standings.length > 5) {
        dashboardStandings.push(standings[standings.length - 1]);
      }

      return (
        <Grid container spacing={2.5}>
          {/* CỘT TRÁI */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              {/* Truyền hàm switchTab vào component con */}
              <StandingsCard
                data={dashboardStandings}
                fullView={false}
                onViewFull={() => setActiveTab("standings_full")}
              />

              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <MatchesMiniCard
                    title="Kết quả gần đây"
                    matches={dashboardRecent}
                    isNext={false}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MatchesMiniCard
                    title="Trận sắp tới"
                    matches={dashboardNext}
                    isNext={true}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* CỘT PHẢI */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <TopScorerCard scorers={scorers} limit={3} />
              <AssistCard scorers={scorers} limit={3} />
              <FantasyCard />
            </Stack>
          </Grid>
        </Grid>
      );
    }

    // 2. BẢNG XẾP HẠNG ĐẦY ĐỦ (TAB MỚI)
    if (activeTab === "standings_full") {
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            {/* Hiển thị full data, fullView=true để ẩn nút Xem thêm */}
            <StandingsCard data={standings} fullView={true} />
          </Grid>
        </Grid>
      );
    }

    // 3. LỊCH THI ĐẤU
    if (activeTab === "fixtures") {
      const allMatches = [...nextMatches];
      const totalPages = Math.ceil(allMatches.length / 10);
      const displayMatches = allMatches.slice((page - 1) * 10, page * 10);

      return (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Lịch thi đấu sắp tới
          </Typography>
          <MatchesTable matches={displayMatches} isNext={true} />
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
            />
          </Box>
        </Paper>
      );
    }

    // 4. THỐNG KÊ
    if (activeTab === "stats") {
      return (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Thống kê chi tiết
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TopScorerCard scorers={scorers} limit={10} title="Top ghi bàn" />
            </Grid>
            <Grid item xs={12} md={6}>
              <AssistCard scorers={scorers} limit={10} title="Top kiến tạo" />
            </Grid>
          </Grid>
        </Paper>
      );
    }

    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: 2 }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* HEADER & NAV */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "#1F2937", letterSpacing: "-0.5px" }}
            >
              Premier League Dashboard
            </Typography>

            <Stack direction="row" spacing={1}>
              {menuTabs.map((tab) => (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  sx={{
                    fontWeight: 600,
                    height: 36,
                    px: 1,
                    bgcolor:
                      activeTab === tab.id ? "primary.main" : "transparent",
                    color: activeTab === tab.id ? "#FFF" : "text.secondary",
                    border: activeTab === tab.id ? "none" : "1px solid #E5E7EB",
                    "&:hover": {
                      bgcolor:
                        activeTab === tab.id ? "primary.dark" : "#F3F4F6",
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* MAIN CONTENT */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            renderContent()
          )}

          {/* FOOTER */}
          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop: "1px solid #E5E7EB",
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              PREMIER LEAGUE
            </Typography>
            <Typography variant="caption">
              © 2024 Match Center Dashboard. Toàn bộ bản quyền thuộc về BTC
              Premier League.
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              justifyContent="center"
              mt={1.5}
              sx={{ fontSize: 12, fontWeight: 500 }}
            >
              <span style={{ cursor: "pointer" }}>Điều khoản</span>
              <span style={{ cursor: "pointer" }}>Bảo mật</span>
              <span style={{ cursor: "pointer" }}>Hỗ trợ</span>
            </Stack>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

// =========================================================
// SUB-COMPONENTS
// =========================================================

function StandingsCard({ data, fullView, onViewFull }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1">
          {fullView ? "Bảng xếp hạng đầy đủ 2023/24" : "Bảng xếp hạng 2023/24"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            bgcolor: "#F3F4F6",
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          VÒNG 21 / 38
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Câu lạc bộ</TableCell>
              <TableCell align="center">Trận</TableCell>
              <TableCell align="center">HS</TableCell>
              <TableCell align="center">Điểm</TableCell>
              <TableCell align="right">Phong độ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((team, idx) => {
              // Nếu là full view thì lấy đúng vị trí trong mảng (idx + 1)
              // Nếu là dashboard (fullView = false) và là phần tử cuối (thường là đội bét bảng được nối vào) thì hiển thị số 20
              const rank = fullView
                ? idx + 1
                : data.length > 5 && idx === data.length - 1
                ? 20
                : idx + 1;
              const goalDiff =
                team.goalDifference ?? team.goalsFor - team.goalsAgainst;

              return (
                <TableRow key={team.team.id} hover>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color:
                        rank <= 4
                          ? "#3B82F6"
                          : rank >= 18
                          ? "#EF4444"
                          : "text.secondary",
                    }}
                  >
                    {rank}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        src={team.team.crest}
                        sx={{ width: 24, height: 24 }}
                        variant="square"
                        imgProps={{ style: { objectFit: "contain" } }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {team.team.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ color: "text.secondary" }}>
                    {team.playedGames}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 500 }}>
                    {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {team.points}
                  </TableCell>
                  <TableCell align="right">
                    <FormGuide />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Nút xem thêm chỉ hiện khi không phải chế độ xem đầy đủ */}
      {!fullView && (
        <Button
          fullWidth
          onClick={onViewFull}
          sx={{
            mt: 2,
            textTransform: "none",
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          Xem bảng xếp hạng đầy đủ →
        </Button>
      )}
    </Paper>
  );
}

function MatchesMiniCard({ title, matches, isNext }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontSize: 15 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {isNext ? "1/17/2026" : "1/9/2026"}
        </Typography>
      </Box>
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {matches.map((match) => (
          <Box
            key={match.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Home */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 40,
              }}
            >
              <Avatar
                src={match.homeTeam.crest}
                sx={{ width: 28, height: 28, mb: 0.5 }}
                variant="square"
                imgProps={{ style: { objectFit: "contain" } }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontSize: 10, color: "text.secondary" }}
              >
                {match.homeTeam.tla}
              </Typography>
            </Box>

            {/* Score / Time */}
            <Box
              sx={{
                bgcolor: isNext ? "transparent" : "#F3F4F6",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 700,
                minWidth: 80,
                textAlign: "center",
                color: isNext ? "text.primary" : "#1F2937",
              }}
            >
              {isNext ? (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    19:30
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Next
                  </Typography>
                </>
              ) : (
                `${match.score.fullTime.home} - ${match.score.fullTime.away}`
              )}
            </Box>

            {/* Away */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 40,
              }}
            >
              <Avatar
                src={match.awayTeam.crest}
                sx={{ width: 28, height: 28, mb: 0.5 }}
                variant="square"
                imgProps={{ style: { objectFit: "contain" } }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontSize: 10, color: "text.secondary" }}
              >
                {match.awayTeam.tla}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function MatchesTable({ matches, isNext }) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Thời gian</TableCell>
            <TableCell align="right">Chủ nhà</TableCell>
            <TableCell align="center">Tỷ số</TableCell>
            <TableCell>Đội khách</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{new Date(m.utcDate).toLocaleDateString()}</TableCell>
              <TableCell align="right">
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  <span>{m.homeTeam.name}</span>
                  <Avatar
                    src={m.homeTeam.crest}
                    sx={{ width: 20, height: 20 }}
                  />
                </Stack>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {isNext
                  ? "vs"
                  : `${m.score.fullTime.home} - ${m.score.fullTime.away}`}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    src={m.awayTeam.crest}
                    sx={{ width: 20, height: 20 }}
                  />
                  <span>{m.awayTeam.name}</span>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TopScorerCard({ scorers, limit, title = "Vua phá lưới" }) {
  const displayList = scorers.slice(0, limit);
  return (
    <Paper elevation={0} sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 4,
            height: 16,
            bgcolor: "#10B981",
            mr: 1,
            borderRadius: 1,
          }}
        />
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <Stack spacing={2}>
        {displayList.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="h5"
                sx={{ color: "#E5E7EB", fontWeight: 800, width: 25 }}
              >
                0{idx + 1}
              </Typography>
              <Avatar
                src={item.team.crest}
                sx={{ width: 36, height: 36, bgcolor: "#F3F4F6", p: 0.5 }}
                imgProps={{ style: { objectFit: "contain" } }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.player.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontSize: 10,
                  }}
                >
                  {item.team.name}
                </Typography>
              </Box>
            </Stack>
            <Box textAlign="right">
              <Typography variant="h6" sx={{ lineHeight: 1, color: "#3B82F6" }}>
                {item.goals}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontSize: 10, color: "text.secondary" }}
              >
                Bàn thắng
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function AssistCard({ scorers, limit, title = "Kiến tạo hàng đầu" }) {
  const displayList = scorers.filter((s) => s.assists).slice(0, limit);
  const mockDisplay =
    displayList.length > 0
      ? displayList
      : scorers
          .slice(3, 3 + limit)
          .map((s) => ({ ...s, assists: Math.floor(Math.random() * 10) }));

  return (
    <Paper elevation={0} sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 4,
            height: 16,
            bgcolor: "#3B82F6",
            mr: 1,
            borderRadius: 1,
          }}
        />
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <Stack spacing={1.5}>
        {mockDisplay.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={item.team.crest}
                sx={{ width: 24, height: 24 }}
                variant="rounded"
              />
              <Typography variant="body2" fontWeight={600}>
                {item.player.name}
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {item.assists || 9}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function FantasyCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        color: "#FFF",
        background:
          "linear-gradient(135deg, #2E1065 0%, #7C3AED 50%, #111827 100%)",
        textAlign: "center",
      }}
    >
      <Typography variant="subtitle2" sx={{ opacity: 0.8, letterSpacing: 1 }}>
        Fantasy League
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>
        Tham gia cùng hàng triệu người hâm mộ
      </Typography>
      <Button
        variant="contained"
        sx={{
          bgcolor: "#22C55E",
          color: "#FFF",
          borderRadius: 99,
          px: 4,
          mt: 2,
          textTransform: "none",
          fontWeight: 700,
          "&:hover": { bgcolor: "#16A34A" },
        }}
      >
        Chơi ngay
      </Button>
    </Paper>
  );
}

function FormGuide() {
  const dots = ["W", "W", "D", "L", "W"];
  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {dots.map((d, i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: d === "W" ? "#22C55E" : d === "D" ? "#9CA3AF" : "#EF4444",
          }}
        />
      ))}
    </Stack>
  );
}
