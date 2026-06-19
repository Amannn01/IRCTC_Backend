const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3004);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "booking-service" });
});

app.listen(port, () => {
  console.log("booking-service listening on " + port);
});
