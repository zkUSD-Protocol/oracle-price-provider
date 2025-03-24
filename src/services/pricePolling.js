const { getPriceOf } = require("./priceService");
const { SELECTED_PROVIDERS } = require("../config/providers");
const { redis } = require("../utils/clients/redis");

const { POLLING_INTERVAL, PRICE_CACHE_KEY } = require("../constants/others");

async function fetchAndUpdatePrice() {
  console.log("\n+++++++++++ STARTING TASK +++++++++++");

  try {
    const results = await getPriceOf("mina");
    // Store only the price data without the block height and signature
    const priceData = {
      price: results[1].price,
      floatingPrice: results[1].floatingPrice,
      decimals: results[1].decimals,
      aggregationTimestamp: results[1].aggregationTimestamp,
      prices_returned: results[1].prices_returned,
      signatures: results[1].signatures,
      timestamps: results[1].timestamps,
      urls: results[1].urls,
    };

    console.log("Setting price to redis: ", PRICE_CACHE_KEY);
    console.log(JSON.stringify(priceData, null, 2));
    await redis.set(PRICE_CACHE_KEY, JSON.stringify(priceData));

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
