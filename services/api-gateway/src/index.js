const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3000);

const serviceRoutes = {
  users: process.env.USER_SERVICE_URL || "http://user-service:3001",
  search: process.env.SEARCH_SERVICE_URL || "http://search-service:3002",
  admin: process.env.ADMIN_SERVICE_URL || "http://admin-service:3003",
  bookings: process.env.BOOKING_SERVICE_URL || "http://booking-service:3004",
  payments: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3005",
  inventory: process.env.INVENTORY_SERVICE_URL || "http://inventory-service:3006",
  notifications: process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3007"
};

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "api-gateway", serviceRoutes });
});

app.listen(port, () => {
  console.log(`api-gateway listening on ${port}`);
});
