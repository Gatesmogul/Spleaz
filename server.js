const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

// Expo Router / SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Spleaz Frontend] Web server running on port ${PORT}`);
});
