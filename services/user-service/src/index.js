const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

app.listen(port, () => {
  console.log("user-service listening on " + port);
});
