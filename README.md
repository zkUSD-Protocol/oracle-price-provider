# Mina Price Oracle

A service that fetches Mina token prices from multiple providers and calculates an aggregated price.

## Setup Instructions

1. First, run the setup script to configure your data providers:

```bash
./setup.sh
```

This will prompt you to select which price data providers you want to use.

2. After setup is complete, build the Docker image:

```bash
docker build -t mina-oracle .
```

3. Run the container:

```bash
docker run -d -p 3000:3000 mina-oracle
```

The service will now:

- Fetch Mina prices every 3 minutes
- Store the latest price in Redis
- Expose an API endpoint at `http://localhost:3000/api/price`

OR

Simply run

```bash
pnpm install
```

And start the service by executing

```bash
pnpm start
```

## Environment Variables

Create a `.env` file with:

```
REDIS_PORT=6379
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
DEPLOYER_KEY=your-deployer-key
```
