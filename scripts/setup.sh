#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[1;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}    ZKUSD Oracle Setup Assistant    ${NC}"
echo -e "${CYAN}========================================${NC}"
echo

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check for Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker Compose V2 not found. Checking for legacy docker-compose...${NC}"
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Neither Docker Compose V2 nor legacy docker-compose is installed.${NC}"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Create directory for oracle
echo -e "${YELLOW}Creating oracle directory...${NC}"
mkdir -p zkusd-oracle
cd zkusd-oracle

# Download docker-compose.yml
echo -e "${YELLOW}Downloading docker-compose.yml...${NC}"
curl -s -o docker-compose.yml https://raw.githubusercontent.com/zkUSD-Protocol/oracle-price-provider/main/docker-compose.yml

if [ ! -f docker-compose.yml ]; then
    echo -e "${RED}Failed to download docker-compose.yml${NC}"
    exit 1
fi

# Ask for deployer key
while true; do
    echo
    read -p "Enter your deployer private key: " DEPLOYER_KEY
    if [[ -n "$DEPLOYER_KEY" ]]; then
        break
    else
        echo -e "${RED}Deployer key cannot be empty.${NC}"
    fi
done

# Ask for redis password
while true; do
    echo
    read -p "Enter your redis password: " REDIS_PASSWORD
    if [[ -n "$REDIS_PASSWORD" ]]; then
        break
    fi
done

# Ask for chain
echo
echo "Which network do you want to use?"
select CHAIN in "devnet" "mainnet"; do
    if [ -n "$CHAIN" ]; then
        break
    else
        echo -e "${RED}Please select a valid option.${NC}"
    fi
done

# Create .env file
echo -e "${YELLOW}Creating .env file...${NC}"
cat > .env << EOL
# Required
DEPLOYER_KEY=${DEPLOYER_KEY}
CHAIN=${CHAIN}

# Redis configuration
REDIS_PORT=6379
REDIS_HOST=
REDIS_PASSWORD=${REDIS_PASSWORD}

# Polling intervals
PRICE_POLLING_INTERVAL=180
CERTIFICATE_POLLING_INTERVAL=600

# All providers enabled by default
# Set to 0 to disable specific providers if needed
BINANCE=1
CRYPTOCOMPARE=1
COINPAPRIKA=1
MESSARI=1
COINCAP=1
COINLORE=1
COINCODEX=1
COINGECKO=1
KUCOIN=1
HUOBI=1
BYBIT=1
CEXIO=1
SWAPZONE=0
MEXC=1
GATEIO=1
OKX=1
EOL

echo -e "${GREEN}Configuration complete!${NC}"
echo -e "${YELLOW}Starting oracle services...${NC}"

# Pull and start the containers
$DOCKER_COMPOSE up -d

echo
echo -e "${GREEN}Oracle successfully started!${NC}"
echo -e "${CYAN}The oracle API is available at http://localhost:3000/api/price${NC}"
echo
echo -e "${YELLOW}To view logs:${NC} docker compose logs -f"
echo -e "${YELLOW}To stop the oracle:${NC} docker compose down"
echo
echo -e "${GREEN}Thank you for running a ZKUSD Oracle node!${NC}"