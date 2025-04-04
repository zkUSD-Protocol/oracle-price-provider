const { getResultPath } = require("../utils/providerHelpers");
const _ = require("lodash");
const { CircuitString } = require("o1js");
const { SELECTED_PROVIDERS, PROVIDER_WEIGHTS } = require("../config/providers");
const { fetchCryptoData } = require("../utils/security/DoH");
const { CoinGekoSymbols, endpoint } = require("../constants/data_providers");
const { MULTIPLICATION_FACTOR, MINIMAL_VALID_PROVIDED_PRICES } = require("../constants/others");
const { getHeaderConfig } = require("../utils/providerHelpers");
const { signatureClient } = require("../utils/clients/signature");
const {
  getMedian,
  getMAD,
  processFloatString,
  getTimestamp,
} = require("../utils/helpers");
const { logErrorToFile } = require("../utils/errorLogger");

const DEPLOYER_KEY = process.env.DEPLOYER_KEY;

async function callSignAPICall(
  url,
  resultPath,
  provider,
  providerWeight,
  coinId
) {
  try {
    const config = getHeaderConfig(provider);
    const response = await fetchCryptoData(provider, coinId, {
      useDoh: true,
      headers: config?.headers || {},
    });

    const price = _.get(response, resultPath);
    if (!price || isNaN(Number(price))) {
      console.error(`Error calling API ${url},`, `received price-${price}.`);
      await logErrorToFile(
        "API_CALL",
        `Error calling API ${url},`,
        `received price-${price}.`,
        ""
      );
      return ["0", 0, null, url];
    }

    const weightedPrice = price * providerWeight;

    const Price =
      provider === "swapzone" ? String(price / 1000) : String(price);
    const WeightedPrice =
      provider === "swapzone"
        ? String(weightedPrice / 1000)
        : String(weightedPrice);
    const Timestamp = getTimestamp(response.headers["date"]);
    if (!dateHeader) {
      throw new Error(
        `Missing date header in response for provider ${provider}`
      );
    }
    const normalizedWeight = String(providerWeight * MULTIPLICATION_FACTOR); // Normalized to account for weights in decimals

    const fieldURL = BigInt(CircuitString.fromString(url).hash());
    const fieldPrice = BigInt(processFloatString(Price));
    const fieldWeightedPrice = BigInt(processFloatString(WeightedPrice));
    const fieldWeight = BigInt(processFloatString(normalizedWeight));
    const fieldDecimals = BigInt(MULTIPLICATION_FACTOR);
    const fieldTimestamp = BigInt(Timestamp);

    const signature = signatureClient.signFields(
      [
        fieldURL,
        fieldPrice,
        fieldWeightedPrice,
        fieldWeight,
        fieldDecimals,
        fieldTimestamp,
      ],
      DEPLOYER_KEY
    );

    return [
      Price,
      WeightedPrice,
      providerWeight,
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
    await logErrorToFile(
      "API_CALL",
      `Error calling API ${url} for provider ${provider} and coin ${coinId}`,
      error
    );
    return ["0", 0, null, url];
  }
}

async function removeOutliers(
  prices,
  weightedPrices,
  weights,
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
          acc.weightedPrices.push(weightedPrices[i]);
          acc.weights.push(weights[i]);
          acc.timestamps.push(timestamps[i]);
          acc.signatures.push(signatures[i]);
          acc.urls.push(urls[i]);
        }
        return acc;
      },
      {
        prices: [],
        weightedPrices: [],
        weights: [],
        timestamps: [],
        signatures: [],
        urls: [],
      }
    );

    console.log(
      `\nData Points Considered: ${result.prices.length}/${prices.length}`
    );
    return [
      result.prices,
      result.weightedPrices,
      result.weights,
      result.signatures,
      result.timestamps,
      result.urls,
    ];
  } catch (error) {
    console.error("Error removing outliers:", error.message);
    await logErrorToFile(
      "PRICE_SERVICE",
      "Error removing price outliers",
      error
    );
    throw error;
  }
}

async function getPriceOf(token = "mina") {
  try {
    const providers = Object.keys(SELECTED_PROVIDERS).filter(
      (provider) => SELECTED_PROVIDERS[provider]
    );

    const pricePromises = providers.map(async (provider) => {
      const weight = PROVIDER_WEIGHTS[provider];

      if (typeof weight !== 'number' || weight < 0) {
        throw new Error(`Invalid provider weight for "${provider}": ${weight}`);
      }

      const endpointInfo = endpoint(provider, token);
      if (!endpointInfo) return ["0", 0, null, ""];

      const tokenId =
        provider === "coingecko" ? CoinGekoSymbols[token.toLowerCase()] : null;

      const resultPath = getResultPath(provider, tokenId);

      return callSignAPICall(
        endpointInfo.url,
        resultPath,
        provider,
        weight,
        endpointInfo.id
      );
    });

    const results = await Promise.all(pricePromises);

    const validResults = results.reduce(
      (acc, [price, weightedPrice, weight, timestamp, signature, url]) => {
        if (price !== "0" && signature) {
          acc.prices.push(parseFloat(price));
          acc.weightedPrices.push(parseFloat(weightedPrice));
          acc.weights.push(parseFloat(weight));
          acc.timestamps.push(timestamp);
          acc.signatures.push(signature);
          acc.urls.push(url);
        }
        return acc;
      },
      {
        prices: [],
        weightedPrices: [],
        weights: [],
        timestamps: [],
        signatures: [],
        urls: [],
      }
    );

    const [
      cleanPrices,
      cleanWeightedPrices,
      cleanWeights,
      cleanSignatures,
      cleanTimestamps,
      cleanUrls,
    ] = await removeOutliers(
      validResults.prices,
      validResults.weightedPrices,
      validResults.weights,
      validResults.timestamps,
      validResults.signatures,
      validResults.urls
    );
    if (resultArrays.some((arr) => arr.length < MINIMAL_VALID_PROVIDED_PRICES)) {
      throw new Error(
        `Insufficient data after filtering: expected at least ${limit} consistent data points, got ${cleanPrices.length}.`
      );
    }

    const weightedSum = cleanWeightedPrices.reduce(
      (sum, weightedPrice) => sum + weightedPrice,
      0
    );
    const totalWeight = cleanWeights.reduce((sum, weight) => sum + weight, 0);

    const weightedMeanPrice = weightedSum / totalWeight;
    const meanPrice =
      cleanPrices.reduce((sum, price) => sum + price, 0) / cleanPrices.length;
    const aggregatedAt = Date.now();

    const processedWeightedMeanPrice = processFloatString(weightedMeanPrice);
    const processedMeanPrice = processFloatString(meanPrice);

    console.log(`Mean: ${meanPrice} | Processed Mean: ${processedMeanPrice}`);
    console.log(
      `Weighted Mean: ${weightedMeanPrice} | Processed Weighted Mean: ${processedWeightedMeanPrice}`
    );

    const assetCacheObject = {
      price: processedMeanPrice,
      weightedPrice: processedWeightedMeanPrice,
      floatingPrice: meanPrice,
      floatingWeightedPrice: weightedMeanPrice,
      decimals: MULTIPLICATION_FACTOR,
      aggregationTimestamp: aggregatedAt,
      prices_returned: cleanPrices,
      weighted_prices: cleanWeightedPrices,
      weights: cleanWeights,
      signatures: cleanSignatures,
      timestamps: cleanTimestamps,
      urls: cleanUrls,
    };

    return [meanPrice, weightedMeanPrice, assetCacheObject];
  } catch (error) {
    console.error("Error in getPriceOf:", error.message);
    await logErrorToFile(
      "PRICE_SERVICE",
      `Error fetching price of ${token}`,
      error
    );
    throw error;
  }
}

module.exports = {
  getPriceOf,
};
