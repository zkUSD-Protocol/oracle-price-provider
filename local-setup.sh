#!/bin/bash

declare -A selected_providers
declare -A provider_weights

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'
echo -e "${CYAN}Welcome to Fizk Price Oracle Setup!${NC}"
echo

command -v bc >/dev/null || { echo "bc not found. Please install bc"; exit 1; }

# Price polling interval
while true; do
    read -p "Enter price polling interval in seconds (default is 180): " price_polling_interval
    if [[ -z "$price_polling_interval" ]]; then
        price_polling_interval=180
        break
    elif [[ "$price_polling_interval" =~ ^[0-9]+$ ]]; then
        break
    else
        echo -e "${YELLOW}Please enter a valid number${NC}"
    fi
done

# Certificate polling interval
while true; do
    read -p "Enter certificate polling interval in seconds (default is 600): " certificate_polling_interval
    if [[ -z "$certificate_polling_interval" ]]; then
        certificate_polling_interval=600
        break
    elif [[ "$certificate_polling_interval" =~ ^[0-9]+$ ]]; then
        break
    else
        echo -e "${YELLOW}Please enter a valid number${NC}"
    fi
done

# Redis configuration
read -p "Enter Redis host (default is localhost): " redis_host
redis_host=${redis_host:-localhost}

while true; do
    read -p "Enter Redis port (default is 6379): " redis_port
    if [[ -z "$redis_port" ]]; then
        redis_port=6379
        break
    elif [[ "$redis_port" =~ ^[0-9]+$ ]]; then
        break
    else
        echo -e "${YELLOW}Please enter a valid port number${NC}"
    fi
done

read -p "Enter Redis password (leave blank if none): " redis_password

# Deployer key
while true; do
    read -p "Enter deployer key (required): " deployer_key
    if [[ -n "$deployer_key" ]]; then
        break
    else
        echo -e "${YELLOW}Deployer key is required${NC}"
    fi
done

# Chain selection
while true; do
    read -p "Which chain do you want to run on? (mainnet/devnet, default is devnet): " chain
    if [[ -z "$chain" ]]; then
        chain="devnet"
        break
    elif [[ "$chain" == "mainnet" || "$chain" == "devnet" ]]; then
        break
    else
        echo -e "${YELLOW}Please enter 'mainnet' or 'devnet' only.${NC}"
    fi
done


echo
echo -e "${CYAN}Please select the data providers you want to use:${NC}"
echo

providers=("binance" "cryptocompare" "coinpaprika" "messari" "coincap" "coinlore" "coincodex" "coingecko" "kucoin" "huobi" "bybit" "cex.io" "swapzone" "mexc" "gate.io" "okx")
provider_names=("Binance" "Crypto Compare" "Coin Paprika" "Messari" "Coin Cap" "Coin Lore" "Coin Codex" "Coin Gecko" "KuCoin" "Huobi" "ByBit" "Cex.io" "Swapzone" "MEXC" "Gate.io" "OKX")

for i in "${!providers[@]}"; do
    provider="${providers[$i]}"
    provider_name="${provider_names[$i]}"

    # Direct implementation instead of function call
    while true; do
        read -p "${provider_name} (y/n): " response
        if [[ "$response" == "y" || "$response" == "Y" ]]; then
            selected_providers[$provider]="1"
            break
        elif [[ "$response" == "n" || "$response" == "N" ]]; then
            selected_providers[$provider]="0"
            break
        else
            echo -e "${YELLOW}Please enter y/n only.${NC}"
        fi
    done

    if [[ "${selected_providers[$provider]}" == "1" ]]; then
        while true; do
            read -p "Weight for ${provider_name} (positive number, default is 1): " weight
            if [[ -z "$weight" ]]; then
                provider_weights[$provider]=1
                break
            # Check if it's a valid decimal number format
            elif [[ "$weight" =~ ^[0-9]*[.][0-9]+$ || "$weight" =~ ^[0-9]+$ || "$weight" =~ ^[.][0-9]+$ ]]; then
                # Convert to numeric value to validate it's positive
                numeric_value=$(echo "$weight" | bc -l)
                if (( $(echo "$numeric_value > 0" | bc -l) )); then
                    # Store the normalized numeric value instead of raw input
                    provider_weights[$provider]=$numeric_value
                    break
                else
                    echo -e "${YELLOW}Please enter a positive number${NC}"
                fi
            else
                echo -e "${YELLOW}Please enter a valid positive number${NC}"
            fi
        done
    else
        provider_weights[$provider]=1
    fi
done

# Check if Swapzone is enabled and ask for API key
if [[ "${selected_providers[swapzone]}" == "1" ]]; then
    while true; do
        read -p "Enter Swapzone API key (required): " swapzone_api_key
        if [[ -n "$swapzone_api_key" ]]; then
            break
        else
            echo -e "${YELLOW}Swapzone API key is required when Swapzone is enabled${NC}"
        fi
    done
fi

# Create environment file
echo "Creating .env file..."
env_file=".env"

cat > $env_file << EOL
# Generated environment configuration
DEPLOYER_KEY=${deployer_key}
REDIS_HOST=${redis_host}
REDIS_PORT=${redis_port}
REDIS_PASSWORD=${redis_password}
CHAIN=${chain}
PRICE_POLLING_INTERVAL=${price_polling_interval}
CERTIFICATE_POLLING_INTERVAL=${certificate_polling_interval}
EOL

# Add Swapzone API key if enabled
if [[ "${selected_providers[swapzone]}" == "1" ]]; then
    echo "SWAPZONE_API_KEY=${swapzone_api_key}" >> $env_file
fi

# Create providers configuration
echo "Creating providers configuration..."
config_dir="src/config"
mkdir -p $config_dir

cat > "$config_dir/providers.js" << EOL
// Generated provider configuration
const SELECTED_PROVIDERS = {
EOL

for provider in "${!selected_providers[@]}"; do
    if [[ $provider == *"."* ]]; then
        echo "    '$provider': ${selected_providers[$provider]}," >> "$config_dir/providers.js"
    else
        echo "    $provider: ${selected_providers[$provider]}," >> "$config_dir/providers.js"
    fi
done

cat >> "$config_dir/providers.js" << EOL
};

const PROVIDER_WEIGHTS = {
EOL

for provider in "${!provider_weights[@]}"; do
    if [[ $provider == *"."* ]]; then
        echo "    '$provider': ${provider_weights[$provider]}," >> "$config_dir/providers.js"
    else
        echo "    $provider: ${provider_weights[$provider]}," >> "$config_dir/providers.js"
    fi
done

cat >> "$config_dir/providers.js" << EOL
};

module.exports = { SELECTED_PROVIDERS, PROVIDER_WEIGHTS };
EOL

# Update others.js with polling intervals
constants_dir="src/constants"
mkdir -p $constants_dir

# Convert seconds to milliseconds
price_polling_ms=$((price_polling_interval * 1000))
certificate_polling_ms=$((certificate_polling_interval * 1000))

cat > "$constants_dir/others.js" << EOL
const PRICE_CACHE_KEY = "fizk:mina:latest_price";
const CERTIFICATE_CACHE_KEY = "fizk:doh:latest_certificates";

const PRICE_POLLING_INTERVAL = ${price_polling_ms};
const CERTIFICATE_POLLING_INTERVAL = ${certificate_polling_ms};

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
EOL

# Create errors directory
mkdir -p src/errors
touch src/errors/log.txt

echo -e "${GREEN}Setup completed! Configuration files have been generated:${NC}"
echo -e "  - .env"
echo -e "  - src/config/providers.js"
echo -e "  - src/constants/others.js"
echo -e "  - src/errors/log.txt (created)"
echo
echo -e "${CYAN}You can now run the application with:${NC}"
echo -e "  pnpm start"
echo -e "  or"
echo -e "  node src/index.js"
