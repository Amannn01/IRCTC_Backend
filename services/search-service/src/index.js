const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3002);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "search-service" });
});

app.listen(port, () => {
  console.log("search-service listening on " + port);
});
