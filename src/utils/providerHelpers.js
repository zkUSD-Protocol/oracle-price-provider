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
    swapzone: {
      headerName: "x-api-key",
      envVar: "SWAPZONE_API_KEY",
    },
    "cex.io": { headerName: "", envVar: "" },
    coincodex: { headerName: "", envVar: "" },
    coingecko: { headerName: "", envVar: "" },
    binance: { headerName: "", envVar: "" },
    cryptocompare: { headerName: "", envVar: "" },
    coinpaprika: { headerName: "", envVar: "" },
    messari: { headerName: "", envVar: "" },
    coincap: { headerName: "", envVar: "" },
    coinlore: { headerName: "", envVar: "" },
    kucoin: { headerName: "", envVar: "" },
    huobi: { headerName: "", envVar: "" },
    bybit: { headerName: "", envVar: "" },
    mexc: { headerName: "", envVar: "" },
    "gate.io": { headerName: "", envVar: "" },
    okx: { headerName: "", envVar: "" },
  };

  return headers[provider] || { headerName: "", envVar: "" };
}

function getHeaderConfig(provider) {
  const headerInfo = getHeaderName(provider);

  if (headerInfo.headerName) {
    const apiKey = process.env[headerInfo.envVar];
    return { headers: { [headerInfo.headerName]: apiKey } };
  }

  return { headers: {} };
}

module.exports = {
  getResultPath,
  getHeaderName,
  getHeaderConfig,
};
