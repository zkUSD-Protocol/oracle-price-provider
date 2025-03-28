// polling.js

const { getPriceOf } = require("./priceService");
const {
  validateCertificates,
  initializeCertificateValidation,
} = require("./certificateService");
const { SELECTED_PROVIDERS } = require("../config/providers");
const { redis } = require("../utils/clients/redis");
const {
  PRICE_CACHE_KEY,
  PRICE_POLLING_INTERVAL,
  CERTIFICATE_POLLING_INTERVAL,
} = require("../constants/others");
const {
  logSuccess,
  logError,
  logInfo,
  logHeading,
} = require("../utils/helpers");

let isTaskRunning = false; // Lock for avoiding overlaps.

let pricePollingInterval;
let certificateCheckInterval;

async function fetchAndUpdatePrice() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    if (isTaskRunning) {
      logInfo(
        `Another task is running. Price update will wait 10 seconds (attempt ${attempt}/5)...`
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    isTaskRunning = true;
    console.log("");
    logHeading("+++++++++++ STARTING PRICE UPDATE TASK +++++++++++");
    console.log();

    try {
      const results = await getPriceOf("mina");
      await redis.set(PRICE_CACHE_KEY, JSON.stringify(results[1]));

      logHeading("+++++++++++ FINISHED PRICE UPDATE TASK +++++++++++\n");
      isTaskRunning = false;
      return true;
    } catch (error) {
      logError("Error in price update job:", error);
      isTaskRunning = false;
      return false;
    }
  }

  logError("ERR! Price update skipped after 5 wait attempts.");
  return false;
}

async function runCertificateValidation() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    if (isTaskRunning) {
      logInfo(
        `Another task is running. Certificate validation will wait 10 seconds (attempt ${attempt}/5)...`
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    // We can now run the task
    isTaskRunning = true;
    try {
      logHeading(
        `+++++++++++ STARTING DoH CERTIFICATE UPDATE TASK +++++++++++`
      );
      console.log("");

      await validateCertificates();
      isTaskRunning = false;

      console.log();
      logHeading(
        "+++++++++++++ FINISHED CERTIFICATES UPDATE TASK ++++++++++++"
      );
      console.log();

      return true;
    } catch (error) {
      logError("Error in certificate validation:", error);
      isTaskRunning = false;
      return false;
    }
  }

  logError("ERR! Certificate validation skipped after 5 wait attempts.");
  return false;
}

async function startServices() {
  logInfo(
    "\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ STARTING ORACLE SERVICES ////////////////////"
  );
  console.log();

  await initializeCertificateValidation();

  logInfo(`Price polling interval set to: ${PRICE_POLLING_INTERVAL / 1000}s`);
  logInfo(
    `Certificate check interval set to: ${CERTIFICATE_POLLING_INTERVAL / 1000}s`
  );
  logInfo(
    `Fetching prices from ${
      Object.keys(SELECTED_PROVIDERS).length
    } data providers.`
  );

  await fetchAndUpdatePrice();
  await runCertificateValidation();

  pricePollingInterval = setInterval(
    fetchAndUpdatePrice,
    PRICE_POLLING_INTERVAL
  );
  certificateCheckInterval = setInterval(
    runCertificateValidation,
    CERTIFICATE_POLLING_INTERVAL
  );

  logSuccess("All services started successfully");
}

function stopServices() {
  logInfo("Stopping oracle services...");

  if (pricePollingInterval) {
    clearInterval(pricePollingInterval);
    pricePollingInterval = null;
  }

  if (certificateCheckInterval) {
    clearInterval(certificateCheckInterval);
    certificateCheckInterval = null;
  }

  logInfo("All services stopped");
}

process.on("SIGTERM", () => {
  logInfo("Received SIGTERM. Cleaning up...");
  stopServices();
  process.exit(0);
});

process.on("SIGINT", () => {
  logInfo("Received SIGINT. Cleaning up...");
  stopServices();
  process.exit(0);
});

module.exports = {
  startServices,
  stopServices,
  fetchAndUpdatePrice,
  runCertificateValidation,
};
