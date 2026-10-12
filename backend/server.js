const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.TEST_FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Safari Cookie Test API is running" });
});

// 1. Cookieを発行する
app.get("/set-cookie", (req, res) => {
  res.cookie("safari_cookie_test", "cookie_received_123", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 10 * 60 * 1000,
  });

  res.json({
    message: "Cookie発行レスポンスを返しました",
  });
});

// 2. SafariがCookieを送信したか確認する
app.get("/check-cookie", (req, res) => {
  const cookieHeader = req.headers.cookie || "";
  const received = cookieHeader
    .split(";")
    .some((item) => item.trim() === "safari_cookie_test=cookie_received_123");

  console.log("[Cookie Test]", {
    path: req.path,
    cookieReceived: received,
  });

  res.json({
    cookieReceived: received,
    message: received ? "Cookieを受信しました" : "Cookieを受信できませんでした",
  });
});

// 3. テスト用Cookieを削除する
app.get("/clear-cookie", (req, res) => {
  res.clearCookie("safari_cookie_test", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({ message: "テスト用Cookieを削除しました" });
});

app.listen(PORT, () => {
  console.log(`Cookie test server listening on ${PORT}`);
});
