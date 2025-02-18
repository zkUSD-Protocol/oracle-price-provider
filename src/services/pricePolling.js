const { getPriceOf } = require("./priceService");
const { redis } = require("../utils/redis");

const POLLING_INTERVAL = 3 * 60 * 1000;
const PRICE_CACHE_KEY = "mina:latest_price";

async function fetchAndUpdatePrice() {
  console.log("\n+++++++++++ STARTING JOB +++++++++++");

  try {
    console.log("++ Fetching Mina price\n");
    const results = await getPriceOf("mina");

    await redis.set(PRICE_CACHE_KEY, JSON.stringify(results[1]));

    console.log("+++++++++++ FINISHED JOB +++++++++++\n");
    return true;
  } catch (error) {
    console.error("Error in price update job:", error);
    return false;
  }
}

let pollingInterval;

function startPricePolling() {
  fetchAndUpdatePrice();

  pollingInterval = setInterval(fetchAndUpdatePrice, POLLING_INTERVAL);
  console.log("Price polling started - running every 3 minutes");
}

function stopPricePolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("Price polling stopped");
  }
}

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Cleaning up...");
  stopPricePolling();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Cleaning up...");
  stopPricePolling();
  process.exit(0);
});

module.exports = {
  startPricePolling,
  stopPricePolling,
  fetchAndUpdatePrice,
};
