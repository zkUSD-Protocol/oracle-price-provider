# Dockerfile
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install bash for our scripts
RUN apk add --no-cache bash

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

ENV NODE_ENV=production \
    POLLING_INTERVAL=180

# Make our entry point script executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["pnpm", "start"]
