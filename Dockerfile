# Stage 1: Build the Vite React App
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies strictly
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled react app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle React Router routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
