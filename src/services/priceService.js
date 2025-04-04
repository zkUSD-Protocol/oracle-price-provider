const { getResultPath } = require("../utils/providerHelpers");
const _ = require("lodash");
const { CircuitString } = require("o1js");
const {
  testnetSignatureClient,
  mainnetSignatureClient,
} = require("../utils/clients/signature");
const { SELECTED_PROVIDERS, PROVIDER_WEIGHTS } = require("../config/providers");
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
const { logErrorToFile } = require("../utils/errorLogger");

const DEPLOYER_KEY = process.env.DEPLOYER_KEY;
const signerClient =
  process.env.MAINNET_SIGNER_CLIENT == undefined
    ? testnetSignatureClient
    : process.env.MAINNET_SIGNER_CLIENT == 1
    ? mainnetSignatureClient
    : testnetSignatureClient;

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
    const normalizedWeight = String(providerWeight * MULTIPLICATION_FACTOR); // Normalized to account for weights in decimals

    const fieldURL = BigInt(CircuitString.fromString(url).hash());
    const fieldPrice = BigInt(processFloatString(Price));
    const fieldWeightedPrice = BigInt(processFloatString(WeightedPrice));
    const fieldWeight = BigInt(processFloatString(normalizedWeight));
    const fieldDecimals = BigInt(MULTIPLICATION_FACTOR);
    const fieldTimestamp = BigInt(Timestamp);

    const signature = signerClient.signFields(
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
        PROVIDER_WEIGHTS[provider],
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

    const signedPrice = signerClient.signFields(
      [BigInt(processedMeanPrice)],
      DEPLOYER_KEY
    );
    const signedWeightedPrice = signerClient.signFields(
      [BigInt(processedWeightedMeanPrice)],
      DEPLOYER_KEY
    );

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
      signature: {
        signature: signedPrice.signature,
        publicKey: signedPrice.publicKey,
        data: signedPrice.data[0].toString(),
      },
      weightedSignature: {
        signature: signedWeightedPrice.signature,
        publicKey: signedWeightedPrice.publicKey,
        data: signedWeightedPrice.data[0].toString(),
      },
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
