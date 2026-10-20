# Verification — 2026-10-04

Environment: local Docker host, Node 22.22.3, production application image built from the current working tree. Requests used loopback port 18080 and the internal Docker network. This is a production-artifact preview, not deployment to the public haih.site server.

## Observed

- `npm run types` and focused ESLint passed. Docker production build passed, including its type check and React Router prerendering.
- All five existing HTTP integration tests passed through Traefik → Varnish → Node.js: initial HTML/head, 404s, methods, HTML/asset caching and GraphQL health.
- Monitoring integration test passed: nine scrape targets healthy, both site probes successful, request/byte counters populated, GraphQL validation errors counted, a request found in Loki, query/header test markers absent from the collected record, public `/metrics` returns 404.
- A separate Apollo HTTP fixture verified that an execution failure with HTTP 200 increments the GraphQL **server** error counter. No fault endpoint was added to the real application.
- Config generation for two sites sharing one Traefik produced separate Host-specific modules, site labels and expected-probe alerts. Duplicate router ownership was rejected. The running site remains haih.site only.
- `promtool check config` and `promtool test rules` passed. The probe rule unit check covered its pending delay, firing and recovery.
- Controlled preview failure: application paused; a warmed page remained available from Varnish, while the uncached API probe failed. `SiteProbeFailed` reached Alertmanager. Application was unpaused in cleanup; probes returned to success and the alert resolved.
- A generated configuration with both email and Telegram enabled delivered firing and recovery notifications to isolated local SMTP and Telegram API fixtures. No external messages were sent. Real SMTP authentication/TLS, bot permissions and recipient delivery remain unverified without owner credentials.
- Grafana login and dashboard were checked in headless Chrome at 1440×1100, including scrolling to request/application logs. No browser page errors were observed. Every dashboard query was also executed against its real data source and returned successfully.
- No request-blocking rules were installed. Example attack paths and ordinary 404s are still visible in the request logs/statistics.

## Resource observations

After dashboard browsing and local test traffic, one `docker stats --no-stream` snapshot showed approximately **714 MiB** across the seven monitoring containers, excluding the application, Varnish and Traefik:

| Service           | Memory (MiB) | CPU snapshot (% of one core) |
| ----------------- | -----------: | ---------------------------: |
| Grafana           |       459.70 |                         0.62 |
| Prometheus        |        64.88 |                         0.24 |
| Loki              |        93.14 |                         0.49 |
| Alloy             |        55.82 |                         0.36 |
| Alertmanager      |        19.81 |                         0.08 |
| Blackbox Exporter |        10.84 |                         0.02 |
| Node Exporter     |         9.86 |                         0.00 |

An earlier quiet snapshot was approximately 594 MiB. Memory and CPU vary with queries, scrape activity and ingestion. This is a short observation on a shared host, not a resource ceiling or sustained-load capacity test.

A 300-request sequential loopback sample against cached `/solutions`, with monitoring enabled, completed in approximately 274 ms, with client-observed p50 0.80 ms and p95 1.20 ms. This checks the local path under a small synthetic workload; it does **not** isolate monitoring overhead, establish uncached/remote latency or prove production capacity. No monitoring-disabled comparison was performed.

## Limits and remaining deployment work

Availability is observed from inside the same server. A whole-host/network failure cannot be independently observed by this installation. Test pauses and restarts deliberately appear in the current availability history; collection began today, so a week/month percentage has incomplete coverage.

The active data is local preview traffic, including tests and probes. The real server's existing Traefik must be connected using the integration instructions before this dashboard represents its live sites. Browser JavaScript errors, long-term retention expiry and sustained production workload overhead have not been tested. Email and Telegram remain disabled until configured. Filtering is explicitly deferred.

## Compose integration update

Monitoring now runs from the existing `docker/compose.yaml` and `docker/compose.prod.yaml`; development uses the same base with `docker/compose.dev.yaml`. The two extra monitoring Compose files were deleted. Both merged configurations validate. The running production preview was recreated with these existing files, preserving Grafana and metric/log volumes and loopback ports 18080/13000 (HTTPS 18443). HTTP integration checks passed after the move. Unique default-network aliases for the origin and cache prevent the shared external network's generic `app`/`varnish` aliases from routing to another project's containers. The default Traefik config uses file routing; its unused Docker provider was removed because no Docker socket is mounted into Traefik.
