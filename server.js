const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* メッセージ取得 */
app.get("/api/messages", async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json(error);
  }

  res.json(data);
});

/* メッセージ投稿 */
app.post("/api/messages", async (req, res) => {
  const { text, user } = req.body;
  if (!text || !user) {
    return res.status(400).json({ error: "invalid" });
  }

  const { data: banned } = await supabase
    .from("bans")
    .select("*")
    .eq("user", user);

  if (banned && banned.length > 0) {
    return res.status(403).json({ error: "banned" });
  }

  const { error } = await supabase
    .from("messages")
    .insert([{ text, user }]);

  if (error) {
    console.error(error);
    return res.status(500).json(error);
  }

  res.sendStatus(200);
});

/* 管理人：削除 */
app.delete("/api/messages/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return res.status(500).json(error);
  }

  res.sendStatus(200);
});

/* 管理人：BAN */
app.post("/api/ban", async (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ error: "invalid" });
  }

  const { error } = await supabase
    .from("bans")
    .insert([{ user }]);

  if (error) {
    console.error(error);
    return res.status(500).json(error);
  }

  res.sendStatus(200);
});

/* Render対応ポート */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
