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
} from "@mui/material";

const MATCHES_PER_PAGE = 10;

// Tạo theme riêng
const theme = createTheme({
  palette: {
    mode: "light", // hoặc "dark"
    primary: { main: "#1a237e" }, // Xanh đậm chủ đạo
    secondary: { main: "#f50057" }, // Hồng nhấn
    background: { default: "#f9fafd" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "Montserrat, Arial, Tahoma, sans-serif",
    h4: { fontWeight: 800 },
    h6: { fontWeight: 600, letterSpacing: 0.5 },
  },
});

function History() {
  const [recentMatches, setRecentMatches] = useState([]);
  const [nextMatches, setNextMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentPage, setRecentPage] = useState(1);
  const [nextPage, setNextPage] = useState(1);

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
      .catch(() => {
        setError("Không lấy được dữ liệu bóng đá.");
        setLoading(false);
      });
  }, []);

  // Phân trang
  const totalRecentPages = Math.ceil(recentMatches.length / MATCHES_PER_PAGE);
  const totalNextPages = Math.ceil(nextMatches.length / MATCHES_PER_PAGE);
  const recentDisplay = recentMatches.slice(
    (recentPage - 1) * MATCHES_PER_PAGE,
    recentPage * MATCHES_PER_PAGE
  );
  const nextDisplay = nextMatches.slice(
    (nextPage - 1) * MATCHES_PER_PAGE,
    nextPage * MATCHES_PER_PAGE
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ maxWidth: 1300, mx: "auto", py: 4 }}>
        <Typography
          variant="h4"
          align="center"
          mb={4}
          color="primary"
          style={{
            textShadow: "1px 1px 6px #dde",
          }}
        >
          Lịch sử Premier League
        </Typography>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <>
            <Grid
              container
              spacing={4}
              justifyContent="center"
              alignItems="stretch"
              mb={2}
            >
              <Grid item md={5.8} xs={12}>
                <MatchesTable
                  title="Trận đã diễn ra"
                  matches={recentDisplay}
                  page={recentPage}
                  totalPages={totalRecentPages}
                  onPageChange={setRecentPage}
                  isNext={false}
                />
              </Grid>
              <Grid item md={5.8} xs={12}>
                <MatchesTable
                  title="Trận sắp tới"
                  matches={nextDisplay}
                  page={nextPage}
                  totalPages={totalNextPages}
                  onPageChange={setNextPage}
                  isNext={true}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={4}
              justifyContent="center"
              alignItems="stretch"
            >
              <Grid item md={6} xs={12}>
                <StandingsTable standings={standings} />
              </Grid>
              <Grid item md={6} xs={12}>
                <ScorersTable scorers={scorers} />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

function MatchesTable({
  title,
  matches,
  page,
  totalPages,
  onPageChange,
  isNext,
}) {
  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        p: 2,
        background: "linear-gradient(135deg,#e3e9fa 30%,#ffffff 100%)",
        minHeight: 380,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" align="center" color="primary" mb={2}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell align="center">Chủ nhà</TableCell>
              <TableCell align="center">-</TableCell>
              <TableCell align="center">Khách</TableCell>
              <TableCell align="center">Tỉ số</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  style={{ color: "#bdbdbd" }}
                >
                  Không có dữ liệu trận đấu
                </TableCell>
              </TableRow>
            ) : (
              matches.map((match) => (
                <TableRow
                  key={match.id}
                  sx={{ "&:hover": { background: "#eceff1" } }}
                >
                  <TableCell>
                    {new Date(match.utcDate).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={match.homeTeam.crest}
                      alt={match.homeTeam.name}
                      sx={{
                        width: 27,
                        height: 27,
                        mr: 1,
                        display: "inline-flex",
                      }}
                    />
                    {match.homeTeam.name}
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell>
                    <Avatar
                      src={match.awayTeam.crest}
                      alt={match.awayTeam.name}
                      sx={{
                        width: 27,
                        height: 27,
                        mr: 1,
                        display: "inline-flex",
                      }}
                    />
                    {match.awayTeam.name}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {isNext
                      ? "-"
                      : `${match.score.fullTime.home} : ${match.score.fullTime.away}`}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box flexGrow={1}></Box>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          variant="outlined"
          color="primary"
          count={totalPages}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          size="small"
        />
      </Box>
    </Paper>
  );
}

function StandingsTable({ standings }) {
  return (
    <Paper
      elevation={5}
      sx={{
        borderRadius: 4,
        p: 2,
        background: "linear-gradient(135deg,#e1f5fe 30%,#f1f8fd 90%)",
        minHeight: 320,
      }}
    >
      <Typography variant="h6" align="center" color="primary" mb={2}>
        Bảng xếp hạng
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Đội</TableCell>
              <TableCell>Trận</TableCell>
              <TableCell>Điểm</TableCell>
              <TableCell>GF</TableCell>
              <TableCell>GA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map((team, idx) => (
              <TableRow key={team.team.id}>
                <TableCell sx={{ fontWeight: "bold" }}>{idx + 1}</TableCell>
                <TableCell>
                  <Avatar
                    src={team.team.crest}
                    alt={team.team.name}
                    sx={{
                      width: 22,
                      height: 22,
                      mr: 1,
                      display: "inline-flex",
                    }}
                  />
                  {team.team.name}
                </TableCell>
                <TableCell>{team.playedGames}</TableCell>
                <TableCell sx={{ color: "#1e88e5", fontWeight: 600 }}>
                  {team.points}
                </TableCell>
                <TableCell>{team.goalsFor}</TableCell>
                <TableCell>{team.goalsAgainst}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function ScorersTable({ scorers }) {
  return (
    <Paper
      elevation={5}
      sx={{
        borderRadius: 4,
        p: 2,
        background: "linear-gradient(135deg,#fce4ec 30%,#fff 90%)",
        minHeight: 320,
      }}
    >
      <Typography variant="h6" align="center" color="secondary" mb={2}>
        Cầu thủ ghi bàn
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Cầu thủ</TableCell>
              <TableCell>Đội</TableCell>
              <TableCell>Bàn</TableCell>
              <TableCell>Kiến tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scorers.map((item, idx) => (
              <TableRow key={item.player.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{item.player.name}</TableCell>
                <TableCell>
                  <Avatar
                    src={item.team.crest}
                    alt={item.team.name}
                    sx={{
                      width: 22,
                      height: 22,
                      mr: 1,
                      display: "inline-flex",
                    }}
                  />
                  {item.team.name}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{item.goals}</TableCell>
                <TableCell>{item.assists ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default History;
