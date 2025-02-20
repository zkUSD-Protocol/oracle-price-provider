# Oracle Price Provider

A price oracle service for zkUSD that aggregates cryptocurrency price data from multiple providers.

## Quick Start Guide

### Docker Setup

1. Clone and navigate to the repository:

```bash
git clone <repository-url>
cd oracle-price-provider
```

2. Build the Docker image:

```bash
docker build -t oracle-price-provider .
```

3. Run with default configuration:

```bash
docker run -p 3000:3000 oracle-price-provider
```

### Local Development Setup

1. Clone and navigate to the repository:

```bash
git clone <repository-url>
cd oracle-price-provider
```

2. Run the setup script:

```bash
./setup.sh
```

3. Install dependencies:

```bash
pnpm install
```

4. Start the application:

```bash
pnpm start
```

The application will be accessible at `http://localhost:3000`.

## Configuration

### Default Configuration

By default, the oracle service:

- Polls every 180 seconds (3 minutes)
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

#### Setting Polling Interval

```bash
docker run -p 3000:3000 -e POLLING_INTERVAL=60 oracle-price-provider
```

- `POLLING_INTERVAL`: Time in seconds between price updates (default: 180)

#### Enabling/Disabling Price Providers

Use environment variables to enable (1) or disable (0) specific providers:

```bash
docker run -p 3000:3000 \
  -e POLLING_INTERVAL=60 \
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
- `SWAPZONE`: Swapzone API
- `MEXC`: MEXC API
- `GATEIO`: Gate.io API
- `OKX`: OKX API

Example with multiple configurations:

```bash
docker run -p 3000:3000 \
  -e POLLING_INTERVAL=30 \
  -e BINANCE=1 \
  -e COINGECKO=1 \
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

### Testing in a New Directory

To test an existing build in a new location:

```bash
mkdir oracle-price-provider-test
cd oracle-price-provider-test

# Run with default configuration
docker run -p 3000:3000 oracle-price-provider

# Clean up after testing
docker stop $(docker ps -q --filter ancestor=oracle-price-provider)
docker container prune
```

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
   - Generates providers.js based on environment variables
   - Generates others.js with specified polling interval
   - Properly starts the Node.js application
2. Application becomes accessible on the mapped port

## Production Deployment

For production deployments, consider using Docker Compose or Kubernetes for better orchestration and configuration management.

Both local and Docker setups result in:

1. Configured providers.js file
2. Configured others.js file with polling interval
3. Running Node.js application
4. Application accessible on configured port
