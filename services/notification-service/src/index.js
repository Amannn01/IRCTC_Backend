const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3007);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "notification-service" });
});

app.listen(port, () => {
  console.log("notification-service listening on " + port);
});
