FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 7000

# Start the application in development mode
CMD ["npm", "run", "dev"]
