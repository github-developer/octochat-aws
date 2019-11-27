#!/bin/sh

cd $( dirname "$0" )/..

port=${1:-49160}

# Stop the container, don't wait to kill it
docker stop --time 0 octochat > /dev/null 2>&1

# Remove the container
docker rm octochat > /dev/null 2>&1

echo "Running. To stop:\ndocker stop --time 0 octochat"

# Run the container
container=$( docker run --name octochat \
  -p $port:8000 \
  --detach \
  --mount type=bind,source="$(pwd)"/app/lib,target=/app/lib \
  --env-file ./.env \
  octochat )

open http://localhost:$port/

docker logs --follow $container
