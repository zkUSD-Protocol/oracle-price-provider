const PRICE_CACHE_KEY = "fizk:mina:latest_price";
const CERTIFICATE_CACHE_KEY = "fizk:doh:latest_certificates";

const POLLING_INTERVAL = 1 * 60 * 1000; // 3 Minutes
const CERTIFICATE_CHECK_INTERVAL = 1 * 60 * 1000; // 60 Minutes

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
  SUPER_BRIGHT_CYAN: "\x1b[1;96m",

  BG_RED: "\x1b[41m",
  BG_GREEN: "\x1b[42m",
  BG_YELLOW: "\x1b[43m",
};

module.exports = {
  PRICE_CACHE_KEY,
  CERTIFICATE_CACHE_KEY,
  POLLING_INTERVAL,
  CERTIFICATE_CHECK_INTERVAL,
  MULTIPLICATION_FACTOR,
  COLORS,
};
