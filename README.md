# reverse_proxy_template

## nginx config

[nginxconfig.io](https://www.digitalocean.com/community/tools/nginx?domains.0.php.php=false&domains.0.reverseProxy.reverseProxy=true&domains.0.routing.root=false&global.reverseProxy.proxyConnectTimeout=180&global.reverseProxy.proxySendTimeout=180&global.reverseProxy.proxyReadTimeout=180&global.nginx.user=nginx&global.nginx.pid=%2Fvar%2Frun%2Fnginx.pid&global.docker.dockerfile=true&global.docker.dockerCompose=true)

## Cron jobs

[Reference 1](https://pentacent.medium.com/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71)
[Reference 2](https://phoenixnap.com/kb/letsencrypt-docker)
[Reference 3](https://blog.jarrousse.org/2022/04/09/an-elegant-way-to-use-docker-compose-to-obtain-and-renew-a-lets-encrypt-ssl-certificate-with-certbot-and-configure-the-nginx-service-to-use-it/)


### Docker container removal

Something more than SSL renewal time

```sh
30 */12 * * * bash /path/to/reverse_proxy_template/bin/remove-old-containers.sh > /path/to/reverse_proxy_template/app/log/remove-old-containers.log
```

### SSL renewal

Every 12 hours recommended

```sh
* */12 * * * bash /path/to/reverse_proxy_template/bin/renew-ssl.sh > /path/to/reverse_proxy_template/app/log/renew-ssl.log
```

### nginx reload

Every 6 hours recommended

```sh
* */6 * * * bash /path/to/reverse_proxy_template/bin/restart-nginx.sh > /path/to/reverse_proxy_template/app/log/restart-nginx.log
```
