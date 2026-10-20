# Traefik configuration

## Development: HTTP, HTTPS and HMR

From `docker/`, start the three website services:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d --build app varnish traefik
```

Prepare the local certificate first using the [root README](../../README.md#local-tls-certificates).

| Endpoint        | Default URL                 | Host port variable       |
| --------------- | --------------------------- | ------------------------ |
| HTTP            | http://haih.localhost:8080  | `SITE_PORT`              |
| HTTPS           | https://haih.localhost:8443 | `SITE_PORT_HTTPS`        |
| Direct app HTTP | http://127.0.0.1:3001       | `APP_PORT`               |
| Dashboard       | http://127.0.0.1:8088       | `TRAEFIK_DASHBOARD_PORT` |

Development ports bind to loopback. HTTP and HTTPS serve the same app, without an automatic HTTP-to-HTTPS redirect. Internally Traefik listens on ports 80 and 443; the app listens on 3000.

`compose.dev.yaml` selects `dynamic/development/` and `../varnish/development.vcl`. Normal requests follow Traefik → Varnish → app. Development Varnish passes every request and returns `X-Cache: PASS` and `Cache-Control: no-store`.

Traefik routes `/__vite_hmr` directly to the app, bypassing Varnish. Vite attaches its WebSocket server to the app's HTTP listener. The client uses the page's host and port automatically:

- HTTP page: `ws://haih.localhost:8080/__vite_hmr`.
- HTTPS page: `wss://haih.localhost:8443/__vite_hmr`.
- Direct app page: `ws://127.0.0.1:3001/__vite_hmr`.

No separate HMR port is published. TLS terminates at Traefik; its connection to the app is plain HTTP/WebSocket. Certificate files are `certs/localhost.crt` and `certs/localhost.key`; self-signed certificates require browser acceptance or local trust. See the [verification record](../../README.md#development-ports-and-hot-reload) for the Chromium HTTPS HMR check.

## Configuration files

- `traefik.yml`: shared static configuration with `web`, `websecure` and internal metrics entrypoints, file provider and local dashboard.
- `dynamic/development/app.yml`: development HTTP/HTTPS routes, local certificates and HMR routes.
- `dynamic/local/`: default routes used by the base Compose file, forwarding website requests through Varnish.
- `dynamic/prod/`: placeholder for deployment-specific routes; no production routes are supplied there yet.
- `traefik.prod.example.yml`: production configuration example requiring adaptation before use.
- `certs/` and `logs/`: local files excluded from Git and Docker build context.
- `../varnish/default.vcl`: production cache policy.
- `../varnish/development.vcl`: development pass policy.

## Production and cache experiments

`compose.prod.yaml` publishes HTTP/HTTPS on ports 80/443 by default. `TRAEFIK_STATIC_CONFIG` selects the static configuration; `TRAEFIK_DYNAMIC_DIR` selects the dynamic directory in the base/production composition. The development override explicitly replaces the dynamic directory with `dynamic/development/`.

The default local routes forward requests to Varnish. The production VCL bypasses `/api`, caches successful matching asset extensions for seven days and other successful responses for one hour, and reports `X-Cache: HIT` or `MISS`. It also strips cookies from cacheable requests and removes backend `Set-Cookie` headers. Do not assume an application `Cache-Control: no-store` overrides this explicit policy. Use development pass mode for normal source editing; cache experiments require an intentionally selected VCL.

For public TLS, adapt the production example and create matching domain routes with a certificate resolver. Its HTTPS entrypoint is named `websec`, whereas local routes use `websecure`; align those names. The example also enables a Docker provider, but the supplied Compose configuration does not mount a Docker socket; remove that provider when using file routing only. Configure the ACME email in the static YAML and protect the ACME storage file. The example is not a complete deployment configuration.

The [monitoring runbook](../monitoring/README.md) documents the production-artifact preview. Define and verify publication cache invalidation before declaring production readiness.
