const https = require("https");
const crypto = require("crypto");
const { DOH_PROVIDERS } = require("../config/doh");
const { CERTIFICATE_CACHE_KEY } = require("../constants/others");
const { redis } = require("../utils/clients/redis");
const {
  logSuccess,
  logWarning,
  logError,
  logInfo,
  logAlert,
} = require("../utils/helpers");
const { logErrorToFile } = require("../utils/errorLogger");

function fetchCertificate(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      method: "HEAD",
      timeout: 10000,
      rejectUnauthorized: false,
      headers: {
        Connection: "close",
      },
      agent: new https.Agent({
        keepAlive: false,
        maxSockets: 1,
        rejectUnauthorized: false,
      }),
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate(true);

      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error(`No certificate found for ${hostname}`));
        return;
      }

      resolve(cert);

      res.socket.destroy();
    });

    req.on("error", (error) => {
      reject(
        new Error(
          `Failed to fetch certificate for ${hostname}: ${error.message}`
        )
      );
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout while fetching certificate for ${hostname}`));
    });

    req.end();
  });
}

function calculateSHA256Fingerprint(cert) {
  if (!cert || !cert.raw) {
    throw new Error("Invalid certificate or missing raw data");
  }

  const hash = crypto.createHash("sha256");
  hash.update(cert.raw);
  return hash.digest("base64");
}

async function initializeFingerprintsInRedis(providers) {
  for (const provider of providers) {
    const { name, fingerprints } = provider;
    const redisKey = `${CERTIFICATE_CACHE_KEY}:${name}`;

    const existingFingerprints = await redis.lrange(redisKey, 0, -1);

    if (existingFingerprints.length === 0) {
      if (
        fingerprints &&
        fingerprints.sha256 &&
        fingerprints.sha256.length > 0
      ) {
        await redis.rpush(redisKey, ...fingerprints.sha256);
        logInfo(`Initialized ${name} certificate fingerprints in Redis`);
      }
    }
  }
}

async function getFingerprintsFromRedis(providerName) {
  const redisKey = `${CERTIFICATE_CACHE_KEY}:${providerName}`;
  return redis.lrange(redisKey, 0, -1);
}

async function updateFingerprintsInRedis(
  providerName,
  newFingerprint,
  maxEntries = 4
) {
  const redisKey = `${CERTIFICATE_CACHE_KEY}:${providerName}`;

  await redis.lpush(redisKey, newFingerprint);

  await redis.ltrim(redisKey, 0, maxEntries - 1);

  logInfo(`Updated ${providerName} certificate fingerprints in Redis`);
}

async function validateCertificates() {
  for (const provider of DOH_PROVIDERS) {
    try {
      const { name, hostname } = provider;
      logInfo(`Checking certificates for ${name} (${hostname})`);

      const knownFingerprints = await getFingerprintsFromRedis(name);

      const cert = await fetchCertificate(hostname);
      const currentFingerprint = calculateSHA256Fingerprint(cert);

      const isKnown = knownFingerprints.includes(currentFingerprint);

      if (isKnown) {
        if (knownFingerprints[0] === currentFingerprint) {
          logInfo(`Certificate for ${name} is current and valid.`);
        } else {
          logWarning(
            `Certificate for ${name} matches a previous/backup fingerprint`
          );
          await updateFingerprintsInRedis(name, currentFingerprint);
        }
      } else {
        logWarning("---------- CERTIFICATE CHANGE DETECTED ----------");
        logAlert(`Provider: ${name} (${hostname})`);
        logAlert("Current known fingerprints:");
        knownFingerprints.forEach((fp, i) => {
          logAlert(`  ${i === 0 ? "Current" : "Previous"}: ${fp}`);
        });
        logAlert(`New certificate fingerprint: ${currentFingerprint}`);

        await updateFingerprintsInRedis(name, currentFingerprint);

        logSuccess("Certificate fingerprints updated in Redis.");
        logAlert(
          "----------------------------------------------------------------"
        );
        console.log("");
      }
    } catch (error) {
      logError(
        `Error validating certificate for ${provider.name}: ${error.message}`
      );
      await logErrorToFile(
        "CERTIFICATE_SERVICE",
        `Error validating certificate for ${provider.name}`,
        error
      );
    }
  }
}

async function initializeCertificateValidation() {
  await initializeFingerprintsInRedis(DOH_PROVIDERS);
  logInfo("Certificate validation service initialized.");
  return true;
}

module.exports = {
  validateCertificates,
  initializeCertificateValidation,
};
