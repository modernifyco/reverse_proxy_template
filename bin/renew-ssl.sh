#!/bin/bash

date "+%Y-%m-%d %H:%M:%S"

docker compose run --rm certbot renew

echo "-=-=-=-=-=-=-=-=-"