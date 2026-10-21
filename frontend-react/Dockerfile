# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Build argument with production default fallback for Vite compile-time injection
ARG VITE_API_URL=https://ems-backend-jisu.onrender.com
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Render requires listening on port 10000 by default,
# but we use the PORT env var via envsubst
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
