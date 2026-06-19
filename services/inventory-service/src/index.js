const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3006);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "inventory-service" });
});

app.listen(port, () => {
  console.log("inventory-service listening on " + port);
});
