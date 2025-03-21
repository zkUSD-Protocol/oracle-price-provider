const PRICE_CACHE_KEY = "mina:latest_price";
const POLLING_INTERVAL = 3 * 60 * 1000; // Can be changed. In ms.
const MULTIPLICATION_FACTOR = 10;
const COLORS = {
  RESET: "\x1b[0m",
  BRIGHT: "\x1b[1m",
  DIM: "\x1b[2m",

  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",

  BG_RED: "\x1b[41m",
  BG_GREEN: "\x1b[42m",
  BG_YELLOW: "\x1b[43m",
};

module.exports = {
  PRICE_CACHE_KEY,
  POLLING_INTERVAL,
  MULTIPLICATION_FACTOR,
  COLORS,
};
