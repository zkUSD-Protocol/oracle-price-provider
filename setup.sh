#!/bin/bash

declare -A selected_providers

GREEN='\033[0;32m'
NC='\033[0m' 
echo "Welcome to Mina Price Oracle Setup!"

# Get polling interval
while true; do
    read -p "Enter polling interval in seconds (default is 180): " polling_interval
    if [[ -z "$polling_interval" ]]; then
        polling_interval=180
        break
    elif [[ "$polling_interval" =~ ^[0-9]+$ ]]; then
        break
    else
        echo "Please enter a valid number"
    fi
done

echo
echo "Please select the data providers you want to use (y/n for each):"
echo

get_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) echo "1"; return;;
            [Nn]* ) echo "0"; return;;
            * ) echo "Please answer y or n.";;
        esac
    done
}

providers=("binance" "cryptocompare" "coinpaprika" "messari" "coincap" "coinlore" "coincodex" "coingecko" "kucoin" "huobi" "bybit" "cex.io" "swapzone" "mexc" "gate.io" "okx")
provider_names=("Binance" "Crypto Compare" "Coin Paprika" "Messari" "Coin Cap" "Coin Lore" "Coin Codex" "Coin Gecko" "KuCoin" "Huobi" "ByBit" "Cex.io" "Swapzone" "MEXC" "Gate.io" "OKX")

for i in "${!providers[@]}"; do
    response=$(get_yes_no "${provider_names[$i]}")
    selected_providers[${providers[$i]}]=$response
done

# Create providers configuration
echo "Creating providers configuration..."
config_file="src/config/providers.js"
mkdir -p src/config

cat > $config_file << 'EOL'
// Generated provider configuration
const SELECTED_PROVIDERS = {
EOL

for provider in "${!selected_providers[@]}"; do
    if [[ $provider == *"."* ]]; then
        echo "    '$provider': ${selected_providers[$provider]}," >> $config_file
    else
        echo "    $provider: ${selected_providers[$provider]}," >> $config_file
    fi
done

cat >> $config_file << 'EOL'
};

module.exports = { SELECTED_PROVIDERS };
EOL

# Update others.js with polling interval
others_file="src/constants/others.js"
mkdir -p src/constants

# Convert seconds to milliseconds
polling_ms=$((polling_interval * 1000))

cat > $others_file << EOL
const POLLING_INTERVAL = ${polling_ms}; // Polling interval in ms
const PRICE_CACHE_KEY = "mina:latest_price";
const MULTIPLICATION_FACTOR = 10;

module.exports = {
  PRICE_CACHE_KEY,
  POLLING_INTERVAL,
  MULTIPLICATION_FACTOR,
};
EOL

echo -e "${GREEN}Setup completed! Provider configuration and polling interval have been generated.${NC}"