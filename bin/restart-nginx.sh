#!/bin/bash

date "+%Y-%m-%d %H:%M:%S"

docker compose exec nginx nginx -s reload 2>&1

echo "-=-=-=-=-=-=-=-=-"