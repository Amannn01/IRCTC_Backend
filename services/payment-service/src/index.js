const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3005);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "payment-service" });
});

app.listen(port, () => {
  console.log("payment-service listening on " + port);
});
