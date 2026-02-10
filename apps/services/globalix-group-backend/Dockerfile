FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3002

CMD ["npm", "run", "start"]
