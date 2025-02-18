const { getResultPath, getHeaderName } = require("../utils/providerHelpers");
const axios = require("axios");
const _ = require("lodash");
const { CircuitString } = require("o1js");
const { testnetSignatureClient } = require("../utils/signature");
const { SELECTED_PROVIDERS } = require("../config/providers");
const {
  CoinGekoSymbols,
  BinanceSymbols,
  CryptoCompareSymbols,
  PricePaprikeSymbols,
  PriceMessariSymbols,
  CoinCapSymbols,
  CoinLoreSymbols,
  CoinCodexSymbols,
  KuCoinSymbols,
  HuobiSymbols,
  ByBitSymbols,
  CexIOSymbols,
  SwapZoneSymbols,
  MEXCSymbols,
  GateIOSymbols,
  OKXSymbols,
} = require("../constants/symbols");

const MULTIPLICATION_FACTOR = 10;
const DEPLOYER_KEY = process.env.DEPLOYER_KEY;

function processFloatString(input) {
  const floatValue = parseFloat(input);
  if (isNaN(floatValue)) return "Invalid input";
  const multipliedValue = floatValue * Math.pow(10, MULTIPLICATION_FACTOR);
  const integerValue = Math.floor(multipliedValue);
  return integerValue.toString();
}

function getTimestamp(data) {
  const date = new Date(data);
  return Math.floor(date.getTime() / 1000);
}

function getDataProviderEndpoint(provider, token) {
  if (!SELECTED_PROVIDERS[provider]) return null;

  const symbols = {
    binance: BinanceSymbols,
    coingecko: CoinGekoSymbols,
    cryptocompare: CryptoCompareSymbols,
    coinpaprika: PricePaprikeSymbols,
    messari: PriceMessariSymbols,
    coincap: CoinCapSymbols,
    coinlore: CoinLoreSymbols,
    coincodex: CoinCodexSymbols,
    kucoin: KuCoinSymbols,
    huobi: HuobiSymbols,
    bybit: ByBitSymbols,
    "cex.io": CexIOSymbols,
    swapzone: SwapZoneSymbols,
    mexc: MEXCSymbols,
    "gate.io": GateIOSymbols,
    okx: OKXSymbols,
  };

  const id = symbols[provider][token.toLowerCase()];
  if (!id) return null;

  const endpoints = {
    binance: `https://api.binance.com/api/v3/ticker/price?symbol=${id}USDT`,
    cryptocompare: `https://min-api.cryptocompare.com/data/price?fsym=${id}&tsyms=USD`,
    coinpaprika: `https://api.coinpaprika.com/v1/tickers/${id}`,
    messari: `https://data.messari.io/api/v1/assets/${id}/metrics`,
    coincap: `https://api.coincap.io/v2/assets/${id}`,
    coinlore: `https://api.coinlore.net/api/ticker/?id=${id}`,
    coincodex: `https://coincodex.com/api/coincodex/get_coin/${id}`,
    coingecko: `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
    kucoin: `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${id}-USDT`,
    huobi: `https://api.huobi.pro/market/history/trade?symbol=${id}usdt&size=1`,
    bybit: `https://api-testnet.bybit.com/v5/market/tickers?category=spot&symbol=${id}USDT`,
    "cex.io": `https://cex.io/api/last_price/${id}/USD`,
    swapzone: `https://api.swapzone.io/v1/exchange/get-rate?from=${id}&to=usdc&amount=1000`,
    mexc: `https://api.mexc.com/api/v3/ticker/price?symbol=${id}USDT`,
    "gate.io": `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${id}_USDT`,
    okx: `https://www.okx.com/api/v5/market/ticker?instId=${id}-USDT`,
  };

  return endpoints[provider];
}

function getHeaderConfig(provider) {
  const headerName = getHeaderName(provider);

  if (headerName) {
    const apiKey = process.env[`${headerName}`];
    return { headers: { [headerName]: apiKey } };
  }

  return { headerName: null, config: {} };
}

async function callSignAPICall(url, resultPath, provider) {
  try {
    const config = getHeaderConfig(provider);
    const response = await axios.get(url, config);

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

function getMedian(array) {
  const sorted = array.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function getMAD(array) {
  const median = getMedian(array);
  return getMedian(array.map((value) => Math.abs(value - median)));
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
    console.log(`Fetching prices from ${providers.length} selected providers`);

    const pricePromises = providers.map(async (provider) => {
      const endpoint = getDataProviderEndpoint(provider, token);
      if (!endpoint) return ["0", 0, null, ""];

      const tokenId =
        provider === "coingecko" ? CoinGekoSymbols[token.toLowerCase()] : null;

      const resultPath = getResultPath(provider, tokenId);
      return callSignAPICall(endpoint, resultPath, provider);
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
