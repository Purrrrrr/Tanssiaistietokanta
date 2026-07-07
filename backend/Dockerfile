FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install dependencies
RUN npm ci

FROM node:22-slim

RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

COPY --from=builder /app .

# Add pandoc
COPY --from=pandoc/minimal:latest /pandoc /bin/pandoc

# Copy the application code to the working directory
COPY config config
COPY public public
COPY tsconfig.json tsconfig.json
COPY codegen.ts codegen.ts
COPY src src

RUN npm run compile

# Expose port 8082 for the Node.js application
EXPOSE 8082

# Start the Node.js application
CMD [ "npm", "start" ]
