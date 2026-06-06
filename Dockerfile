# Stage 1: Build the React app
FROM node:20 AS build
WORKDIR /app

# Accept build-time environment variable for React
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the files (after deps to leverage Docker cache)
COPY . .

# Build the app with the API URL injected
RUN npm run build

# Stage 2: Serve the build with nginx
FROM nginx:alpine

# Copy build output to nginx public folder
COPY --from=build /app/build /usr/share/nginx/html

# Enable SPA routing fallback so page refresh works on client-side routes.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose nginx port
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
