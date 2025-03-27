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

# Generate others.js with polling interval
polling_ms=$((${POLLING_INTERVAL:-180} * 1000))

cat > src/constants/others.js << EOL
const POLLING_INTERVAL = ${polling_ms}; // Polling interval in ms
const PRICE_CACHE_KEY = "mina:latest_price";
const MULTIPLICATION_FACTOR = 10;

module.exports = {
  PRICE_CACHE_KEY,
  POLLING_INTERVAL,
  MULTIPLICATION_FACTOR,
};
EOL

# Execute the CMD
exec "$@"