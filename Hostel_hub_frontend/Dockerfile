# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json to cache dependency layer
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build arguments to pass values into Vite env
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Expose environment variables to Vite build process
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:8080}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Build the production assets
RUN npm run build

# Production runtime stage
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
