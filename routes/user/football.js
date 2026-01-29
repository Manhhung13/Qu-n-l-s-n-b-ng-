// routes/football.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = "8926953903b64a9eabeed10a07f11e2a"; // <-- Điền key football-data.org của bạn
const BASE_URL = "https://api.football-data.org/v4";
const COMP_ID = "PL"; // Đổi sang CL nếu muốn Champions League

// Proxy lấy danh sách trận đấu gần nhất
router.get("/matches", async (req, res) => {
  try {
    const status = req.query.status || "FINISHED";
    const result = await axios.get(
      `${BASE_URL}/competitions/${COMP_ID}/matches?status=${status}`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được dữ liệu trận đấu." });
  }
});
// Proxy lấy standings
router.get("/standings", async (req, res) => {
  try {
    const result = await axios.get(
      `${BASE_URL}/competitions/${COMP_ID}/standings`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    console.log("Bảng xếp hạng :", result.data);
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được bảng xếp hạng." });
  }
});

// Proxy lấy top ghi bàn
router.get("/scorers", async (req, res) => {
  try {
    const result = await axios.get(
      `${BASE_URL}/competitions/${COMP_ID}/scorers?limit=20`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    console.log("Vua phá lưới :", result.data);
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được vua phá lưới." });
  }
});

// Nếu cần proxy thêm: teams, detail match,... bạn chỉ cần copy format trên

module.exports = router;
