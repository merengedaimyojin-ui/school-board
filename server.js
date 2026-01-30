const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "messages.json";
const BAN_FILE = "bans.json";

// 初期化
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}
if (!fs.existsSync(BAN_FILE)) {
  fs.writeFileSync(BAN_FILE, "[]");
}

// BANチェック
function isBanned(user) {
  const bans = JSON.parse(fs.readFileSync(BAN_FILE));
  return bans.includes(user);
}

// メッセージ取得
app.get("/api/messages", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

// メッセージ追加
app.post("/api/messages", (req, res) => {
  const { text, user } = req.body;
  if (isBanned(user)) {
    return res.status(403).json({ error: "banned" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push({
    id: Date.now(),
    text,
    user,
    time: new Date().toLocaleString()
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

// 管理者：削除
app.delete("/api/messages/:id", (req, res) => {
  const id = Number(req.params.id);
  let data = JSON.parse(fs.readFileSync(DATA_FILE));
  data = data.filter(m => m.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

// 管理者：BAN
app.post("/api/ban", (req, res) => {
  const { user } = req.body;
  const bans = JSON.parse(fs.readFileSync(BAN_FILE));
  if (!bans.includes(user)) bans.push(user);
  fs.writeFileSync(BAN_FILE, JSON.stringify(bans, null, 2));
  res.sendStatus(200);
});

// ★ Render対応ポート（超重要）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
