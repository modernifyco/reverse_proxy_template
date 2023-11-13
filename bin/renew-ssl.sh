#!/bin/bash

date "+%Y-%m-%d %H:%M:%S"

docker compose run --rm certbot renew 2>&1

echo "-=-=-=-=-=-=-=-=-"