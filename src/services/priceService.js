const { getResultPath, getHeaderName } = require("../utils/providerHelpers");
const axios = require("axios");
const _ = require("lodash");
const { CircuitString } = require("o1js");
const { testnetSignatureClient } = require("../utils/clients/signature");
const { SELECTED_PROVIDERS } = require("../config/providers");
const { fetchCryptoData } = require("../utils/security/DoH");
const { CoinGekoSymbols, endpoint } = require("../constants/data_providers");
const { MULTIPLICATION_FACTOR } = require("../constants/others");
const { getHeaderConfig } = require("../utils/providerHelpers");
const {
  getMedian,
  getMAD,
  processFloatString,
  getTimestamp,
} = require("../utils/helpers");

const DEPLOYER_KEY = process.env.DEPLOYER_KEY;

async function callSignAPICall(url, resultPath, provider, coinId) {
  try {
    const config = getHeaderConfig(provider);
    const response = await fetchCryptoData(provider, coinId, {
      useDoh: true,
      headers: config?.headers || {},
    });

    const price = _.get(response, resultPath);

    const Price =
      provider === "swapzone" ? String(price / 1000) : String(price);
    const Timestamp = getTimestamp(response.headers["date"]);

    const fieldURL = BigInt(CircuitString.fromString(url).hash());
    const fieldPrice = BigInt(processFloatString(Price));
    const fieldDecimals = BigInt(MULTIPLICATION_FACTOR);
    const fieldTimestamp = BigInt(Timestamp);

    const signature = testnetSignatureClient.signFields(
      [fieldURL, fieldPrice, fieldDecimals, fieldTimestamp],
      DEPLOYER_KEY
    );

    return [
      Price,
      Timestamp,
      {
        signature: signature.signature,
        publicKey: signature.publicKey,
        data: signature.data[0].toString(),
      },
      url,
    ];
  } catch (error) {
    console.error(`Error calling API ${url}:`, error.message);
    return ["0", 0, null, url];
  }
}

async function removeOutliers(
  prices,
  timestamps,
  signatures,
  urls,
  threshold = 2.5
) {
  try {
    const median = getMedian(prices);
    const mad = getMAD(prices);

    const result = prices.reduce(
      (acc, price, i) => {
        if (isNaN(Number(price))) return acc;

        const deviation = Math.abs(price - median);
        if (deviation <= threshold * mad) {
          acc.prices.push(price);
          acc.timestamps.push(timestamps[i]);
          acc.signatures.push(signatures[i]);
          acc.urls.push(urls[i]);
        }
        return acc;
      },
      { prices: [], timestamps: [], signatures: [], urls: [] }
    );

    console.log(
      `Data Points Considered: ${result.prices.length}/${prices.length}`
    );
    return [result.prices, result.signatures, result.timestamps, result.urls];
  } catch (error) {
    console.error("Error removing outliers:", error.message);
    throw error;
  }
}

async function getPriceOf(token = "mina") {
  try {
    const providers = Object.keys(SELECTED_PROVIDERS).filter(
      (provider) => SELECTED_PROVIDERS[provider]
    );

    const pricePromises = providers.map(async (provider) => {
      const url = endpoint(provider, token);
      if (!url) return ["0", 0, null, ""];

      const endpointInfo = endpoint(provider, token);
      if (!endpointInfo) return ["0", 0, null, ""];

      // Special case for CoinGecko
      const tokenId =
        provider === "coingecko" ? CoinGekoSymbols[token.toLowerCase()] : null;

      const resultPath = getResultPath(provider, tokenId);
      return callSignAPICall(
        endpointInfo.url,
        resultPath,
        provider,
        endpointInfo.id
      );
    });

    const results = await Promise.all(pricePromises);

    const validResults = results.reduce(
      (acc, [price, timestamp, signature, url]) => {
        if (price !== "0" && signature) {
          acc.prices.push(parseFloat(price));
          acc.timestamps.push(timestamp);
          acc.signatures.push(signature);
          acc.urls.push(url);
        }
        return acc;
      },
      { prices: [], timestamps: [], signatures: [], urls: [] }
    );

    const [cleanPrices, cleanSignatures, cleanTimestamps, cleanUrls] =
      await removeOutliers(
        validResults.prices,
        validResults.timestamps,
        validResults.signatures,
        validResults.urls
      );

    const meanPrice =
      cleanPrices.reduce((sum, price) => sum + price, 0) / cleanPrices.length;
    const aggregatedAt = Date.now();
    const processedMeanPrice = processFloatString(meanPrice);

    const signedPrice = testnetSignatureClient.signFields(
      [BigInt(processedMeanPrice)],
      DEPLOYER_KEY
    );

    console.log(`Mean: ${meanPrice} | Processed Mean: ${processedMeanPrice}`);

    const assetCacheObject = {
      price: processedMeanPrice,
      floatingPrice: meanPrice,
      decimals: MULTIPLICATION_FACTOR,
      aggregationTimestamp: aggregatedAt,
      signature: {
        signature: signedPrice.signature,
        publicKey: signedPrice.publicKey,
        data: signedPrice.data[0].toString(),
      },
      prices_returned: cleanPrices,
      signatures: cleanSignatures,
      timestamps: cleanTimestamps,
      urls: cleanUrls,
    };

    return [meanPrice, assetCacheObject];
  } catch (error) {
    console.error("Error in getPriceOf:", error.message);
    throw error;
  }
}

module.exports = {
  getPriceOf,
};
