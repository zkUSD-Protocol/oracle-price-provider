require("dotenv").config();
const express = require("express");
const { startServices } = require("./services/polling.js");
const priceRoutes = require("./routes/price.js");
const { logErrorToFile } = require("./utils/errorLogger");
const { Mina } = require("o1js");
const { Mainnet, Devnet } = require("./config/networks");

const CHAIN = process.env.CHAIN === "mainnet" ? Mainnet : Devnet;

const app = express();
const PORT = process.env.PORT || 3000;

process.on("uncaughtException", async (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  await logErrorToFile(
    "UNCAUGHT_EXCEPTION",
    "Uncaught exception in application",
    error
  );
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
  await logErrorToFile(
    "UNHANDLED_REJECTION",
    "Unhandled promise rejection",
    reason instanceof Error ? reason : new Error(String(reason))
  );
});

app.use("/api", priceRoutes);

app.use(async (err, req, res, next) => {
  console.error("Express route error:", err);
  await logErrorToFile(
    "EXPRESS_ROUTE",
    `Error processing ${req.method} ${req.url}`,
    err
  );
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const minaInstance = Mina.Network(CHAIN.mina[0]);
  Mina.setActiveInstance(minaInstance);
  console.log(`Server running on port ${PORT}`);
  startServices();
});
