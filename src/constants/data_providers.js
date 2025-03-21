const { SELECTED_PROVIDERS } = require("../config/providers");

const CoinGekoSymbols = {
  ethereum: "ethereum",
  bitcoin: "bitcoin",
  chainlink: "chainlink",
  mina: "mina-protocol",
  solana: "solana",
  ripple: "ripple",
  dogecoin: "dogecoin",
  polygon: "matic-network",
  avalanche: "avalanche-2",
  cardano: "cardano",
};

const BinanceSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  chainlink: "LINK",
  mina: "MINA",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "MATIC",
  avalanche: "AVAX",
  cardano: "ADA",
};

const CMCSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  chainlink: "LINK",
  mina: "MINA",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "MATIC",
  avalanche: "AVAX",
  cardano: "ADA",
};

const CryptoCompareSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  chainlink: "LINK",
  mina: "MINA",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "MATIC",
  avalanche: "AVAX",
  cardano: "ADA",
};

const CoinAPISymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  chainlink: "LINK",
  mina: "MINA",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "MATIC",
  avalanche: "AVAX",
  cardano: "ADA",
};

const PricePaprikeSymbols = {
  ethereum: "eth-ethereum",
  bitcoin: "btc-bitcoin",
  chainlink: "link-chainlink",
  mina: "mina-mina-protocol",
  solana: "sol-solana",
  ripple: "xrp-xrp",
  dogecoin: "doge-dogecoin",
  polygon: "matic-polygon",
  avalanche: "avax-avalanche",
  cardano: "ada-cardano",
};

const PriceMessariSymbols = {
  ethereum: "ethereum",
  bitcoin: "bitcoin",
  chainlink: "link",
  mina: "mina",
  solana: "solana",
  ripple: "xrp",
  dogecoin: "doge",
  polygon: "matic",
  avalanche: "avalanche",
  cardano: "cardano",
};

const CoinCapSymbols = {
  ethereum: "ethereum",
  bitcoin: "bitcoin",
  chainlink: "chainlink",
  mina: "mina",
  solana: "solana",
  ripple: "xrp",
  dogecoin: "dogecoin",
  polygon: "polygon",
  avalanche: "avalanche",
  cardano: "cardano",
};

const CoinLoreSymbols = {
  ethereum: 80,
  bitcoin: 90,
  chainlink: 2751,
  mina: 62645,
  solana: 48543,
  ripple: 58,
  dogecoin: 2,
  polygon: 33536,
  avalanche: 44883,
  cardano: 257,
};

const CoinRankingSymbols = {
  ethereum: "razxDUgYGNAdQ",
  bitcoin: "Qwsogvtv82FCd",
  chainlink: "VLqpJwogdhHNb",
  mina: "",
  solana: "zNZHO_Sjf",
  ripple: "-l8Mn2pVlRs-p",
  dogecoin: "a91GCGd_u96cF",
  polygon: "uW2tk-ILY0ii",
  avalanche: "dvUj0CzDZ",
  cardano: "qzawljRxB5bYu",
};

const CoinCodexSymbols = {
  ethereum: "eth",
  bitcoin: "btc",
  chainlink: "link",
  mina: "mina",
  solana: "sol",
  ripple: "xrp",
  dogecoin: "doge",
  polygon: "pol",
  avalanche: "avax",
  cardano: "ada",
};

const KuCoinSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  solana: "SOL",
  chainlink: "LINK",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const HuobiSymbols = {
  ethereum: "eth",
  bitcoin: "btc",
  mina: "mina",
  chainlink: "link",
  solana: "sol",
  ripple: "xrp",
  dogecoin: "doge",
  polygon: "pol",
  avalanche: "avax",
  cardano: "ada",
};

const ByBitSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "MATIC",
  avalanche: "AVAX",
  cardano: "ADA",
};

const CexIOSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const SwapZoneSymbols = {
  ethereum: "eth",
  bitcoin: "btc",
  mina: "mina",
  chainlink: "link",
  solana: "sol",
  ripple: "xrp",
  dogecoin: "doge",
  polygon: "matic",
  avalanche: "avax",
  cardano: "ada",
};

const MEXCSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const GateIOSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const OKXSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const PoloniexSymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const BTSESymbols = {
  ethereum: "ETH",
  bitcoin: "BTC",
  mina: "MINA",
  chainlink: "LINK",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  polygon: "POL",
  avalanche: "AVAX",
  cardano: "ADA",
};

const ALL_SYMBOLS = {
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
  btse: BTSESymbols,
  poloniex: PoloniexSymbols,
  coinranking: CoinRankingSymbols,
  coinapi: CoinAPISymbols,
  coinmarketcap: CMCSymbols,
};

function endpoint(provider, token) {
  if (!SELECTED_PROVIDERS[provider]) return null;

  const id = ALL_SYMBOLS[provider][token.toLowerCase()];
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

  return {
    url: endpoints[provider],
    id: id,
  };
}

module.exports = {
  CoinGekoSymbols,
  BinanceSymbols,
  CMCSymbols,
  CryptoCompareSymbols,
  CoinAPISymbols,
  PricePaprikeSymbols,
  PriceMessariSymbols,
  CoinCapSymbols,
  CoinLoreSymbols,
  CoinRankingSymbols,
  CoinCodexSymbols,
  KuCoinSymbols,
  HuobiSymbols,
  ByBitSymbols,
  CexIOSymbols,
  SwapZoneSymbols,
  MEXCSymbols,
  GateIOSymbols,
  OKXSymbols,
  PoloniexSymbols,
  BTSESymbols,
  ALL_SYMBOLS,
  endpoint,
};
