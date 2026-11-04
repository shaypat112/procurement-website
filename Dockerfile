# Development image. Docker Compose mounts the source directory for live editing.
FROM node:20-bookworm-slim

WORKDIR /app

# Prisma needs OpenSSL in the container.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
