# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code (server.js and codegen.js, plus any other .js files it needs)
COPY server.js ./
COPY codegen.js ./

# Expose port
EXPOSE 6565

# Start the server
CMD ["node", "server.js"]