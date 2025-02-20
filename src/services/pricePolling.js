const { getPriceOf } = require("./priceService");
const { SELECTED_PROVIDERS } = require("../config/providers");
const { redis } = require("../utils/clients/redis");

const { POLLING_INTERVAL, PRICE_CACHE_KEY } = require("../constants/others");

async function fetchAndUpdatePrice() {
  console.log("\n+++++++++++ STARTING TASK +++++++++++");

  try {
    const results = await getPriceOf("mina");
    await redis.set(PRICE_CACHE_KEY, JSON.stringify(results[1]));

    console.log("+++++++++++ FINISHED TASK +++++++++++\n");
    return true;
  } catch (error) {
    console.error("Error in price update job:", error);
    return false;
  }
}

let pollingInterval;

function startPricePolling() {
  console.log(
    "Price polling service started. Interval set to :",
    POLLING_INTERVAL / 1000,
    "s"
  );
  console.log(
    `Fetching prices from ${
      Object.keys(SELECTED_PROVIDERS).length
    } data providers.`
  );

  fetchAndUpdatePrice();
  pollingInterval = setInterval(fetchAndUpdatePrice, POLLING_INTERVAL);
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
