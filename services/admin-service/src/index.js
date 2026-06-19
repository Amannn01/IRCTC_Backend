const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3003);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "admin-service" });
});

app.listen(port, () => {
  console.log("admin-service listening on " + port);
});
