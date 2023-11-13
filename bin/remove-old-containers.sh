#!/bin/bash
# cleanup exited docker containers
EXITED_CONTAINERS=$(docker compose ps -a | grep Exited | awk '{ print $1 }')
if [ -z "$EXITED_CONTAINERS" ]
then
  echo "No exited containers to clean"
else
  docker rm $EXITED_CONTAINERS
fi
