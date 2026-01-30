const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "messages.json";
const REPORT_FILE = "reports.json";
const BAN_FILE = "ban.json";

// 初期化
for (const file of [DATA_FILE, REPORT_FILE, BAN_FILE]) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
}

// メッセージ取得
app.get("/api/messages", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
});

// メッセージ追加（BANチェック）
app.post("/api/messages", (req, res) => {
  const banned = JSON.parse(fs.readFileSync(BAN_FILE));
  if (banned.includes(req.body.user)) {
    return res.status(403).json({ error: "banned" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push({
    id: Date.now(), // ← 投稿ID
    text: req.body.text,
    user: req.body.user,
    time: new Date().toLocaleString()
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

// 投稿削除（管理人用）
app.post("/api/delete", (req, res) => {
  let data = JSON.parse(fs.readFileSync(DATA_FILE));
  data = data.filter(m => m.id !== req.body.id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

// BAN追加
app.post("/api/ban", (req, res) => {
  const banned = JSON.parse(fs.readFileSync(BAN_FILE));
  if (!banned.includes(req.body.user)) {
    banned.push(req.body.user);
    fs.writeFileSync(BAN_FILE, JSON.stringify(banned, null, 2));
  }
  res.sendStatus(200);
});

// 通報
app.post("/api/report", (req, res) => {
  const reports = JSON.parse(fs.readFileSync(REPORT_FILE));
  reports.push({
    user: req.body.user,
    text: req.body.text,
    reason: req.body.reason,
    time: new Date().toLocaleString()
  });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(reports, null, 2));
  res.sendStatus(200);
});

// 通報取得
app.get("/api/reports", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(REPORT_FILE)));
});

app.listen(3000, () => {
  console.log("http://localhost:3000 で起動しました");
});
