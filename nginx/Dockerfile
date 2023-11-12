FROM nginx:stable-alpine

COPY . /etc/nginx/

RUN apk add --no-cache openssl && \
    openssl dhparam -out /etc/nginx/dhparam.pem 2048 && \
    apk del openssl && \
    mkdir -p /var/www/_letsencrypt && \
    chown nginx /var/www/_letsencrypt
