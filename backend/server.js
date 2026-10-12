require("dotenv").config();
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

app.get("/same-origin-test", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html lang="ja">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Same-origin Cookie Test</title>
    <body style="font-family:sans-serif;padding:24px">
      <h1>Same-origin Cookie Test</h1>
      <button id="set">1. Cookieを発行</button>
      <button id="check">2. Cookieを確認</button>
      <pre id="result">テスト開始前</pre>
      <script>
        const result = document.getElementById("result");

        document.getElementById("set").onclick = async () => {
          try {
            const r = await fetch("/set-cookie", {
              cache: "no-store"
            });
            result.textContent = await r.text();
          } catch (e) {
            result.textContent = e.message;
          }
        };

        document.getElementById("check").onclick = async () => {
          try {
            const r = await fetch("/check-cookie", {
              cache: "no-store"
            });
            result.textContent = JSON.stringify(
              await r.json(), null, 2
            );
          } catch (e) {
            result.textContent = e.message;
          }
        };
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Cookie test server listening on ${PORT}`);
});
