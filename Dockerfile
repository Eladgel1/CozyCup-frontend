# ----------------------------
# Base builder (Node + build)
# ----------------------------
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Copy manifests and install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Allow overriding API base at build-time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build static assets into /app/dist
RUN npm run build

# ----------------------------
# Runtime: use Vite preview server
# ----------------------------
FROM node:${NODE_VERSION}-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Copy built node_modules & dist from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose Vite preview default port
EXPOSE 5173

# Use non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# Start Vite preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
