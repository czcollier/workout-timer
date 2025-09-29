#!/bin/bash

# This script builds the Docker image, tags it with the current git commit hash,
# pushes it to Google Artifact Registry, and deploys it to Cloud Run.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# TODO: Update these variables with your own project settings if they are different.
export PROJECT_ID=$(gcloud config get-value project)
export REGION="us-central1"
export REPO_NAME="workout-repo"
export IMAGE_NAME="workout-timer"
export SERVICE_NAME="workout-timer-app"
:
# --- Script Logic ---

# 1. Get the short git commit hash to use as the image tag.
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "✅ Using Git commit hash as tag: $COMMIT_HASH"

# 2. Construct the full image path for Artifact Registry.
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:${COMMIT_HASH}"
echo "➡️  Image will be tagged as: $IMAGE_TAG"

# 3. Build the Docker image locally.
echo "🚀 Starting Docker build..."
docker build -t "$IMAGE_TAG" .
echo "✅ Docker build complete."

# 4. Push the image to Google Artifact Registry.
echo "🚀 Pushing image to Artifact Registry..."
docker push "$IMAGE_TAG"
echo "✅ Image pushed successfully."

# 5. Deploy the new image version to Cloud Run.
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image="$IMAGE_TAG" \
  --platform=managed \
  --region="$REGION" \
  --allow-unauthenticated

echo "🎉 Deployment complete! Your service is updated."
