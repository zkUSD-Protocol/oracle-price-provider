# Oracle Price Provider

A price oracle service for zkUSD that aggregates cryptocurrency price data from multiple providers.

## Quick Start Guide

### Using Pre-built Docker Image

Pull and run the latest version from Docker Hub:

```bash
docker pull botdock/oracle-price-provider:latest
docker run -p 3000:3000 --env-file .env botdock/oracle-price-provider:latest
```

### Docker Setup (Building from Source)

1. Clone and navigate to the repository:

```bash
git clone https://github.com/zkUSD-Protocol/oracle-price-provider.git
cd oracle-price-provider
```

2. Build the Docker image:

```bash
docker build -t oracle-price-provider .
```

3. Prepare Environment Variables

Before running the Docker image, you must set the required environment variables. Create a `.env` file with the following mandatory variables:

```
DEPLOYER_KEY='your_deployer_key'
REDIS_PORT='your_redis_port'
REDIS_HOST='your_redis_host'
REDIS_PASSWORD='your_redis_password'
MAINNET_SIGNER_CLIENT=1
```

**Important Environment Variable Notes:**

- `DEPLOYER_KEY`: Required for signing the fetched values.
- `REDIS_PORT`: Port for Redis connection.
- `REDIS_HOST`: Hostname or IP for Redis server.
- `REDIS_PASSWORD`: Password for Redis authentication.
- `MAINNET_SIGNER_CLIENT`: Set to 1 to use Mainnet signer client. Defaults to Testnet client if not set.
- `SWAPZONE_API_KEY`: **Required if Swapzone is enabled** - API key for the Swapzone provider.
  - By default, Swapzone is enabled in the provider list.
  - If you're using Swapzone, you must add this environment variable.

Example setup:

```bash
# Create .env file
mkdir oracle-test
cd oracle-test
cat > .env << EOL
DEPLOYER_KEY='test_key'
REDIS_PORT='your_redis_port'
REDIS_HOST='your_redis_host'
REDIS_PASSWORD='your_redis_password'
MAINNET_SIGNER_CLIENT=1

# Only add if using Swapzone (required if SWAPZONE=1, which is the default)
SWAPZONE_API_KEY='your_swapzone_api_key'
EOL
```

4. Run with Environment Variables:

```bash
# Run the locally built container with environment variables
docker run -p 3000:3000 --env-file .env oracle-price-provider
```

### Local Development Setup

1. Clone and navigate to the repository:

```bash
git clone <repository-url>
cd oracle-price-provider
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your environment variables:

```bash
# Copy the example env file
cp .env.example .env

# Edit with your own values
nano .env
```

4. Start the application:

```bash
pnpm start
```

The application will be accessible at `http://localhost:3000`.

## Configuration

### Default Configuration

By default, the oracle service:

- Polls prices every 180 seconds (3 minutes)
- Polls certificates every 600 seconds (10 minutes)
- Enables all available price providers:
  - Binance
  - Crypto Compare
  - Coin Paprika
  - Messari
  - Coin Cap
  - Coin Lore
  - Coin Codex
  - Coin Gecko
  - KuCoin
  - Huobi
  - ByBit
  - Cex.io
  - Swapzone
  - MEXC
  - Gate.io
  - OKX

### Custom Configuration

#### Setting Polling Intervals

```bash
docker run -p 3000:3000 -e PRICE_POLLING_INTERVAL=60 -e CERTIFICATE_POLLING_INTERVAL=300 oracle-price-provider
```

- `PRICE_POLLING_INTERVAL`: Time in seconds between price updates (default: 180)
- `CERTIFICATE_POLLING_INTERVAL`: Time in seconds between certificate updates (default: 600)

#### Enabling/Disabling Price Providers

Use environment variables to enable (1) or disable (0) specific providers:

```bash
docker run -p 3000:3000 \
  -e PRICE_POLLING_INTERVAL=60 \
  -e BINANCE=1 \
  -e COINGECKO=1 \
  -e COINPAPRIKA=0 \
  oracle-price-provider
```

Available provider environment variables:

- `BINANCE`: Binance API
- `CRYPTOCOMPARE`: Crypto Compare API
- `COINPAPRIKA`: Coin Paprika API
- `MESSARI`: Messari API
- `COINCAP`: Coin Cap API
- `COINLORE`: Coin Lore API
- `COINCODEX`: Coin Codex API
- `COINGECKO`: Coin Gecko API
- `KUCOIN`: KuCoin API
- `HUOBI`: Huobi API
- `BYBIT`: ByBit API
- `CEXIO`: Cex.io API
- `SWAPZONE`: Swapzone API (requires SWAPZONE_API_KEY when enabled)
- `MEXC`: MEXC API
- `GATEIO`: Gate.io API
- `OKX`: OKX API

#### Configuring Provider Weights

You can customize the weight of each provider in the final price calculation:

```bash
docker run -p 3000:3000 \
  -e BINANCE=1 \
  -e BINANCE_WEIGHT=2 \
  -e COINGECKO=1 \
  -e COINGECKO_WEIGHT=3 \
  oracle-price-provider
```

Available weight environment variables:

- `BINANCE_WEIGHT`: Weight for Binance (default: 1)
- `CRYPTOCOMPARE_WEIGHT`: Weight for Crypto Compare (default: 1)
- `COINPAPRIKA_WEIGHT`: Weight for Coin Paprika (default: 1)
- `MESSARI_WEIGHT`: Weight for Messari (default: 1)
- `COINCAP_WEIGHT`: Weight for Coin Cap (default: 1)
- `COINLORE_WEIGHT`: Weight for Coin Lore (default: 1)
- `COINCODEX_WEIGHT`: Weight for Coin Codex (default: 1)
- `COINGECKO_WEIGHT`: Weight for Coin Gecko (default: 1)
- `KUCOIN_WEIGHT`: Weight for KuCoin (default: 1)
- `HUOBI_WEIGHT`: Weight for Huobi (default: is 1)
- `BYBIT_WEIGHT`: Weight for ByBit (default: 1)
- `CEXIO_WEIGHT`: Weight for Cex.io (default: 1)
- `SWAPZONE_WEIGHT`: Weight for Swapzone (default: 1)
- `MEXC_WEIGHT`: Weight for MEXC (default: 1)
- `GATEIO_WEIGHT`: Weight for Gate.io (default: 1)
- `OKX_WEIGHT`: Weight for OKX (default: 1)

Example with multiple configurations:

```bash
docker run -p 3000:3000 \
  -e PRICE_POLLING_INTERVAL=30 \
  -e CERTIFICATE_POLLING_INTERVAL=300 \
  -e BINANCE=1 \
  -e BINANCE_WEIGHT=3 \
  -e COINGECKO=1 \
  -e COINGECKO_WEIGHT=2 \
  -e COINPAPRIKA=1 \
  -e MESSARI=0 \
  -e COINCAP=0 \
  -e COINLORE=0 \
  -e COINCODEX=1 \
  -e KUCOIN=1 \
  -e HUOBI=0 \
  -e BYBIT=0 \
  -e CEXIO=0 \
  -e SWAPZONE=0 \
  -e MEXC=1 \
  -e GATEIO=1 \
  -e OKX=1 \
  oracle-price-provider
```

## Development Details

### Docker Image Details

The Docker image is built using:

- node:20-alpine as the base image
- pnpm for package management
- bash for scripting support

Latest version tags:

- `latest`: Most recent stable build
- `v1.0.0`: Initial release

To use a specific version:

```bash
docker pull botdock/oracle-price-provider:v1.0.0
```

### Port Mapping

The application runs on port 3000 inside the container. You can map this to any port on your host machine:

```bash
# Default port mapping
docker run -p 3000:3000 oracle-price-provider

# Map to port 8080
docker run -p 8080:3000 oracle-price-provider

# Map to port 80 (might require sudo)
docker run -p 80:3000 oracle-price-provider
```

Port mapping format: `HOST_PORT:CONTAINER_PORT`

### Development Workflows

#### Local Development

- Interactive setup process through setup.sh
- Manual configuration required
- Good for development and testing
- Configuration done once during setup

#### Docker Environment

- Environment-variable driven
- No interactive configuration
- All providers enabled by default
- Can be reconfigured on each run
- Suitable for production deployment

### Container Startup Process

When the container starts:

1. docker-entrypoint.sh executes:
   - Checks for required environment variables
   - Generates providers.js with enabled providers and their weights
   - Generates others.js with specified polling intervals
   - Properly starts the Node.js application
2. Application becomes accessible on the mapped port

## Production Deployment

For production deployments, consider using Docker Compose or Kubernetes for better orchestration and configuration management.

Both local and Docker setups result in:

1. Configured providers.js file
2. Configured others.js file with polling intervals
3. Running Node.js application
4. Application accessible on configured port

## Complete Environment Variable Reference

Here's a complete list of all available environment variables:

### Required Variables

- `DEPLOYER_KEY`: Private key for signing data
- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis server password
- `MAINNET_SIGNER_CLIENT`: Set to 1 to use Mainnet signer client

### Conditional Variables

- `SWAPZONE_API_KEY`: Required only if SWAPZONE=1 (default)

### Optional Variables

- `PRICE_POLLING_INTERVAL`: Price update interval in seconds (default: 180)
- `CERTIFICATE_POLLING_INTERVAL`: Certificate update interval in seconds (default: 600)

### Provider Selection Variables (1=enabled, 0=disabled)

- `BINANCE`, `CRYPTOCOMPARE`, `COINPAPRIKA`, `MESSARI`, `COINCAP`, `COINLORE`
- `COINCODEX`, `COINGECKO`, `KUCOIN`, `HUOBI`, `BYBIT`, `CEXIO`
- `SWAPZONE`, `MEXC`, `GATEIO`, `OKX`

### Provider Weight Variables (default: 1)

- `BINANCE_WEIGHT`, `CRYPTOCOMPARE_WEIGHT`, `COINPAPRIKA_WEIGHT`, `MESSARI_WEIGHT`
- `COINCAP_WEIGHT`, `COINLORE_WEIGHT`, `COINCODEX_WEIGHT`, `COINGECKO_WEIGHT`
- `KUCOIN_WEIGHT`, `HUOBI_WEIGHT`, `BYBIT_WEIGHT`, `CEXIO_WEIGHT`
- `SWAPZONE_WEIGHT`, `MEXC_WEIGHT`, `GATEIO_WEIGHT`, `OKX_WEIGHT`
