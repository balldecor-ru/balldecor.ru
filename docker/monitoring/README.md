# Monitoring sites on one server

One monitoring installation observes sites routed by the server's Traefik. The explicit registry is `sites.json`; it is not a public uptime-checking service. Probes connect to an internal Traefik address with each site's Host header. No request blocking is installed: bot traffic is currently included.

## Run the production preview

From the repository root, using Node 22.22.3 and Docker Compose:

```bash
npm ci
npm run monitoring:configure
SITE_BIND_ADDRESS=127.0.0.1 SITE_PORT=18080 SITE_PORT_HTTPS=18443 \
  docker compose --env-file docker/.env -p haih-site -f docker/compose.yaml -f docker/compose.prod.yaml up -d --build
```

Use the existing `docker/.env` for `NETWORK_NAME` and the existing external Docker network. The command above selects free loopback ports for a production preview. Normal production uses the same base/prod files with the established 80/443 defaults. Development uses `compose.yaml` + `compose.dev.yaml` with project name `haih-site-dev` (Grafana defaults to loopback port 13001 and its default network is `haih-monitoring-dev`). Override `SITE_PORT`, `SITE_PORT_HTTPS`, `MONITORING_GRAFANA_PORT` or `MONITORING_NETWORK` when necessary. Check port availability first. Monitoring service definitions, volumes, labels and secrets live in `compose.yaml`; environment-specific ports/restarts remain in the dev/prod files.

Development HTTP/HTTPS ports are 8080/8443 by default, with HMR on the same port as the page and Varnish in pass mode. See the [development proxy guide](../traefik/README.md#development-http-https-and-hmr). The default dev project name can be overridden by `COMPOSE_PROJECT_NAME` in `docker/.env` or by `-p`; use distinct names when running dev and production preview together.

- Site: http://127.0.0.1:18080
- Grafana: http://127.0.0.1:13000/d/haih-overview
- Login: `admin`; generated password: `docker/monitoring/.secrets/grafana_admin_password`.
- API/metrics/log backends have no published host ports. Grafana requires login and binds to loopback. Use an SSH tunnel for remote access, or deliberately configure a protected HTTPS route.

`monitoring:configure` preserves existing passwords. The `.secrets` directory is excluded from Git and Docker build context. Secret files are readable inside their assigned containers; the host directory is accessible only to its owner. Changing the initial password file does not reset an existing Grafana database password.

## What is running and why

| Component         | Purpose                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Traefik           | Request counts, statuses, latency histograms, HTTP byte counters and JSON access logs                    |
| Prometheus        | Metric storage for 30 days, capped at 2 GiB of TSDB retention; alert rules                               |
| Grafana           | Provisioned site selector, performance dashboard, log views and Alertmanager connection                  |
| Loki              | Individual requests and application logs, single process with filesystem storage and seven-day retention |
| Alloy             | Collects logs only from Docker containers explicitly labelled `monitoring.logs=true`                     |
| Blackbox Exporter | Internal page/API checks every 30 seconds through Traefik                                                |
| Node Exporter     | Host CPU, RAM and filesystem metrics                                                                     |
| Alertmanager      | Grouping and delivery of firing/recovery notifications; email and Telegram are optional                  |

Application metrics use a separate internal listener at port 9464. It exposes Node process memory/CPU/event-loop metrics and GraphQL error counters, including errors returned with HTTP 200. It is not mounted on the public Express application. Varnish explicitly passes `/api` requests without caching. Normal public requests still follow Traefik → Varnish → Node.js.

Docker logs rotate at 10 MiB × three files per container in this stack. Loki retention is age-based, not a hard disk quota; the host free-space alert remains important. Prometheus retention does not cap temporary WAL/head usage. Volumes preserve history across container recreation; `down -v` destroys that history.

Alloy reads the Docker API through the daemon socket. A read-only socket mount does not restrict Docker API methods; this collector is a trusted host-level component. Node Exporter reads the host filesystem/proc/sys mounts. Neither endpoint is exposed publicly.

## Add a site behind the same Traefik

Edit `sites.json`, adding one entry per site:

```json
{
  "site": "second.example.com",
  "traefik": "http://traefik",
  "routers": ["second-pages@file", "second-api@file"],
  "checks": [
    { "name": "page", "path": "/", "bodyMatches": "Expected page content" },
    { "name": "health", "path": "/health", "bodyMatches": "ok" }
  ]
}
```

The router names must match Traefik's actual metric labels and be unique per site. Configure separate routers for pages/API/assets when those breakdowns are useful. `appMetrics` is optional and names a compatible application metrics listener, such as `app:9464`. `graphql: true` creates a POST `{ health }` check and rejects both an `errors` response and a missing `health: ok` value. Other checks are GET with expected status 200 and optional `bodyMatches` regular expression. Redirects are not followed, so checks stay at their configured ingress; select the correct internal HTTPS entry point if HTTP redirects. For HTTPS, certificate verification uses the site's name.

Regenerate and reload after changing the registry:

```bash
npm run monitoring:configure
docker compose --env-file docker/.env -p haih-site -f docker/compose.yaml -f docker/compose.prod.yaml restart prometheus blackbox alloy
```

The generator writes probe modules, file-discovery targets, router-to-site metric/log mappings and expected-probe alerts. Edit `prometheus/base.json` for scrape configuration, not the generated `prometheus.yml`. Edit `alloy/template.alloy`, not its generated `config.alloy`.

On a server with existing websites, use the existing `compose.yaml` + `compose.prod.yaml` installation once per server. The default Traefik configuration uses the existing file provider; Docker discovery is not enabled because Traefik has no daemon socket mount. Traefik and monitoring share the default network (`haih-monitoring`, configurable with `MONITORING_NETWORK`); application services retain their existing external network. Attach additional applications as needed using unique service aliases. Set the Traefik scrape address in `prometheus/base.json` and probe addresses in `sites.json`. Metrics and JSON stdout access logs are enabled in `docker/traefik/traefik.yml` and the production configuration example. A custom `TRAEFIK_STATIC_CONFIG` must include those same settings while preserving its TLS and routing.

For collected containers, set:

```yaml
labels:
  monitoring.logs: 'true'
  monitoring.site: second.example.com
logging:
  driver: json-file
  options:
    max-size: 10m
    max-file: '3'
```

Traefik access records receive the site label from their router mapping. Other container logs retain `monitoring.site`. The dashboard can filter by site or show all sites. No automatic registration of arbitrary containers or public sites occurs.

## Optional email and Telegram

Copy `alertmanager/notifications.example.json` to `.secrets/notifications.json`. Enable either channel or both. Supply SMTP server/from/to and authentication username for email, and the Telegram chat ID for Telegram. Put the SMTP password in `.secrets/smtp_password` and bot token in `.secrets/telegram_bot_token`; the example uses `/run/secrets/...` file references rather than embedding credentials. Leave TLS enabled for real SMTP.

Run `npm run monitoring:configure`, validate, then restart Alertmanager:

```bash
docker compose --env-file docker/.env -p haih-site -f docker/compose.yaml exec -T alertmanager amtool check-config /etc/alertmanager/generated.json
docker compose --env-file docker/.env -p haih-site -f docker/compose.yaml restart alertmanager
```

Both channels receive firing and resolved messages. Defaults: group wait 10 seconds, group interval one minute, repeat interval four hours. Disabled channels send nothing; alerts remain visible in Grafana. Real credential validity and provider delivery require a real end-to-end test after configuration. Do not commit generated notification config, addresses or credentials.

## Reading the dashboard

- Availability is measured from **inside this server through its Traefik**. It does not establish external DNS/network/TLS reachability or alert when the entire monitoring host loses power.
- Availability percentage is successful observed probes / observed probes. Coverage shows collected / expected 30-second samples. Missing history is not counted as successful uptime. Select a day/week/month using Grafana's time range, but assess coverage before interpreting the percentage.
- Traefik durations are HTTP handling time, not browser rendering or full page-load time. p50/p95 are split by router; probes themselves contribute a small, steady traffic baseline. Low-volume percentiles are noisy.
- HTTP byte counters describe HTTP requests/responses, not TLS/IP wire traffic. Host CPU/RAM is shared across all workloads on the server.
- Request logs include method/path/status/duration/bytes. Headers are omitted by Traefik; query strings are removed before Loki ingestion. Raw rotating Docker access logs still contain query strings, so keep access to the Docker daemon restricted. Application GraphQL error logs omit queries, variables and arbitrary error messages.
- Existing browser JavaScript errors are not collected. Server/application logs and GraphQL counters cover the server side; frontend error reporting is a separate integration.

Initial alert thresholds: failed probes or scrapes for one minute; HTTP 5xx >5% and at least five failures in five minutes, sustained two minutes; p95 >1 second with at least 20 requests in five minutes, sustained five minutes; GraphQL server errors; missing configured probe samples; less than 10% available memory/disk; dropped log entries. These are initial operational thresholds, not performance guarantees. Tune latency thresholds from the site's normal workload.

Diagnosis: compare page and API probes, then edge 5xx/latency, application logs/GraphQL errors and host resources. A warm page with a failed API can mean the cache is masking an unavailable origin. Check scrape health and log delivery before assuming missing data means there were no errors.

## Verification

```bash
npm run types
npm test
npm run test:integration
TEST_URL=http://haih.localhost npm run test:integration:stack
# Pauses ONLY the preview app, checks alert delivery and then restores it:
npm run test:monitoring:failure
# Isolated local SMTP and Telegram API fixtures; never sends external messages:
npm run test:monitoring:notifications
```

See `verification.md` for the observed results and limits. Container images and application dependencies are pinned; Grafana's Prometheus/Loki plugins are pinned and automatic plugin updates disabled. Initial image/plugin downloads need network access.
