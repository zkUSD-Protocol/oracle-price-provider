#!/bin/bash

# Function to check required environment variables
check_required_env() {
  local missing=()
  for var in "$@"; do
    if [ -z "${!var}" ]; then
      missing+=("$var")
    fi
  done
  
  if [ ${#missing[@]} -ne 0 ]; then
    echo "Error: Required environment variables are not set:"
    printf '%s\n' "${missing[@]}"
    exit 1
  fi
}

# Always required variables
check_required_env \
  "DEPLOYER_KEY" \
  "REDIS_HOST" \
  "REDIS_PORT" \
  "REDIS_PASSWORD" \
  "MAINNET_SIGNER_CLIENT"

# Check if Swapzone is enabled (defaults to 1 if not set)
SWAPZONE=${SWAPZONE:-1}
if [ "$SWAPZONE" = "1" ]; then
  # Check for Swapzone API key only if Swapzone is enabled
  if [ -z "${SWAPZONE_API_KEY}" ]; then    
    echo "Error: Swapzone is enabled but SWAPZONE_API_KEY is not set"
    exit 1
  fi
fi

# Generate provider configuration
cat > src/config/providers.js << EOL
// Generated provider configuration
const SELECTED_PROVIDERS = {
    binance: ${BINANCE:-1},
    cryptocompare: ${CRYPTOCOMPARE:-1},
    coinpaprika: ${COINPAPRIKA:-1},
    messari: ${MESSARI:-1},
    coincap: ${COINCAP:-1},
    coinlore: ${COINLORE:-1},
    coincodex: ${COINCODEX:-1},
    coingecko: ${COINGECKO:-1},
    kucoin: ${KUCOIN:-1},
    huobi: ${HUOBI:-1},
    bybit: ${BYBIT:-1},
    'cex.io': ${CEXIO:-1},
    swapzone: ${SWAPZONE},
    mexc: ${MEXC:-1},
    'gate.io': ${GATEIO:-1},
    okx: ${OKX:-1}
};

const PROVIDER_WEIGHTS = {
    binance: ${BINANCE_WEIGHT:-1},
    cryptocompare: ${CRYPTOCOMPARE_WEIGHT:-1},
    coinpaprika: ${COINPAPRIKA_WEIGHT:-1},
    messari: ${MESSARI_WEIGHT:-1},
    coincap: ${COINCAP_WEIGHT:-1},
    coinlore: ${COINLORE_WEIGHT:-1},
    coincodex: ${COINCODEX_WEIGHT:-1},
    coingecko: ${COINGECKO_WEIGHT:-1},
    kucoin: ${KUCOIN_WEIGHT:-1},
    huobi: ${HUOBI_WEIGHT:-1},
    bybit: ${BYBIT_WEIGHT:-1},
    'cex.io': ${CEXIO_WEIGHT:-1},
    swapzone: ${SWAPZONE_WEIGHT:-1},
    mexc: ${MEXC_WEIGHT:-1},
    'gate.io': ${GATEIO_WEIGHT:-1},
    okx: ${OKX_WEIGHT:-1}
};

module.exports = { SELECTED_PROVIDERS, PROVIDER_WEIGHTS };
EOL

price_polling_ms=$((${PRICE_POLLING_INTERVAL:-180} * 1000))
certificate_polling_ms=$((${CERTIFICATE_POLLING_INTERVAL:-600} * 1000))

cat > src/constants/others.js << EOL
const PRICE_CACHE_KEY = "fizk:mina:latest_price";
const CERTIFICATE_CACHE_KEY = "fizk:doh:latest_certificates";

const PRICE_POLLING_INTERVAL = ${price_polling_ms}; 
const CERTIFICATE_POLLING_INTERVAL = ${certificate_polling_ms}; 

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
  PRICE_POLLING_INTERVAL,
  CERTIFICATE_POLLING_INTERVAL,
  MULTIPLICATION_FACTOR,
  COLORS,
};
EOL

# Execute the CMD
exec "$@"