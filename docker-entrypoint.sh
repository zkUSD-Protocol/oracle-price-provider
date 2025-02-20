#!/bin/bash

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
    swapzone: ${SWAPZONE:-1},
    mexc: ${MEXC:-1},
    'gate.io': ${GATEIO:-1},
    okx: ${OKX:-1}
};

module.exports = { SELECTED_PROVIDERS };
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