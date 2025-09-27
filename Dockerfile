# Stage 1: Build the Angular app
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use the 'browser' build configuration for a static site
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the built app from the 'build' stage
COPY --from=build /app/dist/workout-timer/browser /usr/share/nginx/html

# Copy the Nginx config template. It will be processed by the entrypoint script.
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy and make the entrypoint script executable.
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

# Expose the default port Cloud Run will use.
EXPOSE 8080

# Run the entrypoint script when the container starts.
ENTRYPOINT ["/entrypoint.sh"]

