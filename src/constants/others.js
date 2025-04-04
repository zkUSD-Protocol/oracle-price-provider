const PRICE_CACHE_KEY = "fizk:mina:latest_price:9446";
const CERTIFICATE_CACHE_KEY = "fizk:doh:latest_certificates";

const PRICE_POLLING_INTERVAL = 180000;
const CERTIFICATE_POLLING_INTERVAL = 600000;

const MULTIPLICATION_FACTOR = 9;
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
  PRICE_POLLING_INTERVAL,
  CERTIFICATE_POLLING_INTERVAL,
  MULTIPLICATION_FACTOR,
  COLORS,
};
