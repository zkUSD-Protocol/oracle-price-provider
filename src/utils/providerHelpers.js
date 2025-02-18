function getResultPath(provider, id) {
  const paths = {
    binance: "data.price",
    cryptocompare: "data.USD",
    coinpaprika: "data.quotes.USD.price",
    messari: "data.data.market_data.price_usd",
    coincap: "data.data.priceUsd",
    coinlore: "data[0].price_usd",
    coincodex: "data.last_price_usd",
    coingecko: `data[${id}].usd`,
    kucoin: "data.data.price",
    huobi: "data.data[0].data[0].price",
    bybit: "data.result.list[0].usdIndexPrice",
    "cex.io": "data.lprice",
    swapzone: "data.amountTo",
    mexc: "data.price",
    "gate.io": "data[0].last",
    okx: "data.data[0].last",
  };

  return paths[provider];
}

function getHeaderName(provider) {
  const headers = {
    swapzone: "x-api-key",
    "cex.io": "",
    coincodex: "",
    coingecko: "",
    binance: "",
    cryptocompare: "",
    coinpaprika: "",
    messari: "",
    coincap: "",
    coinlore: "",
    kucoin: "",
    huobi: "",
    bybit: "",
    mexc: "",
    "gate.io": "",
    okx: "",
  };

  return headers[provider] || "";
}

module.exports = {
  getResultPath,
  getHeaderName,
};
