require("dotenv").config();
const express = require("express");
const { startPricePolling } = require("./services/pricePolling.js");
const priceRoutes = require("./routes/price.js");

const app = express();
const PORT = process.env.PORT || 3000;

// API routes
app.use("/api", priceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPricePolling();
});
