#!/bin/sh
set -eu

# Substitute the PORT environment variable into the nginx config template.
# This allows Cloud Run to set the port our container listens on.
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx in the foreground.
exec nginx -g 'daemon off;'
