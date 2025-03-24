require("dotenv").config();
const express = require("express");
const { startPricePolling } = require("./services/pricePolling.js");
const priceRoutes = require("./routes/price.js");
const { Mina } = require("o1js");
const { Mainnet, Devnet } = require("./config/networks.js");

const app = express();
const PORT = process.env.PORT || 3000;
const CHAIN = process.env.CHAIN === "mainnet" ? Mainnet : Devnet;
// API routes
app.use("/api", priceRoutes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const minaInstance = Mina.Network(CHAIN.mina[0]);
  Mina.setActiveInstance(minaInstance);
  startPricePolling();
});
