#!/bin/bash

date "+%Y-%m-%d %H:%M:%S"

docker compose exec nginx nginx -s reload

echo "-=-=-=-=-=-=-=-=-"