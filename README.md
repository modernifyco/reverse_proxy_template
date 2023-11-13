# reverse_proxy_template

## Cron jobs

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
