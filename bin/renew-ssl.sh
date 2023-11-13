#!/bin/bash

date "+%Y-%m-%d %H:%M:%S"

docker compose run --no-TTY --rm certbot renew

echo "-=-=-=-=-=-=-=-=-"