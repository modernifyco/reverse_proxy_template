#!/bin/bash

date "+%Y-%m-%d %H:%M:%S"

docker compose exec --no-TTY nginx nginx -s reload

echo "-=-=-=-=-=-=-=-=-"