import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve, sep } from 'node:path'

const root =
  resolve(
    process.argv[2] ??
      fileURLToPath(new URL('../docker/monitoring/', import.meta.url)),
  ) + sep
const read = async (path) => JSON.parse(await readFile(root + path, 'utf8'))
const write = async (path, value) =>
  writeFile(root + path, JSON.stringify(value, null, 2) + '\n')
const sites = await read('sites.json')
const modules = {}
const probes = []
const apps = []
const metricRules = []
const names = new Set()
const routers = new Set()
for (const site of sites) {
  if (!/^[a-z0-9.-]+$/.test(site.site) || names.has(site.site))
    throw Error('Invalid or duplicate site')
  names.add(site.site)
  const edge = new URL(site.traefik)
  if (
    !['http:', 'https:'].includes(edge.protocol) ||
    edge.username ||
    edge.password
  )
    throw Error('Invalid internal Traefik URL')
  for (const router of site.routers) {
    if (routers.has(router))
      throw Error(`Router ${router} belongs to multiple sites`)
    routers.add(router)
  }
  metricRules.push({
    source_labels: ['router'],
    regex: site.routers
      .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    target_label: 'site',
    replacement: site.site,
  })
  if (site.appMetrics)
    apps.push({ targets: [site.appMetrics], labels: { site: site.site } })
  for (const check of site.checks) {
    if (
      !/^[a-z0-9_-]+$/.test(check.name) ||
      !check.path.startsWith('/') ||
      check.path.startsWith('//')
    )
      throw Error('Invalid check name/path')
    const name = `${site.site}_${check.name}`
    if (modules[name]) throw Error(`Duplicate check ${name}`)
    const http = {
      preferred_ip_protocol: 'ip4',
      valid_status_codes: [200],
      headers: { Host: site.site },
      follow_redirects: false,
      tls_config: { server_name: site.site },
    }
    if (check.graphql) {
      Object.assign(http, {
        method: 'POST',
        body: '{"query":"{ health }"}',
        fail_if_body_matches_regexp: ['"errors"[[:space:]]*:'],
        fail_if_body_not_matches_regexp: [
          '"health"[[:space:]]*:[[:space:]]*"ok"',
        ],
      })
      http.headers['Content-Type'] = 'application/json'
    } else if (check.bodyMatches)
      http.fail_if_body_not_matches_regexp = [check.bodyMatches]
    modules[name] = { prober: 'http', timeout: '8s', http }
    const url = new URL(check.path, edge)
    if (url.origin !== edge.origin)
      throw Error('Check must stay on its configured Traefik')
    probes.push({
      targets: [url.href],
      labels: { site: site.site, probe: check.name, module: name },
    })
  }
}
const alloyRules = sites
  .map((site) => {
    const pattern = site.routers
      .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')
    const selector = `{service="traefik",router=~${JSON.stringify(pattern)}}`
    return `  stage.match {
    selector = ${JSON.stringify(selector)}
    stage.static_labels {
      values = { site = ${JSON.stringify(site.site)} }
    }
  }`
  })
  .join('\n')
await writeFile(
  root + 'alloy/config.alloy',
  (await readFile(root + 'alloy/template.alloy', 'utf8')).replace(
    '  // SITE_RULES',
    alloyRules,
  ),
)
await write('blackbox/config.yml', { modules })
await write('prometheus/probes.json', probes)
await write('prometheus/apps.json', apps)
await write('prometheus/expected-probes.yml', {
  groups: [
    {
      name: 'expected-probes',
      rules: probes.map(({ labels }) => ({
        alert: 'ExpectedProbeMissing',
        expr: `absent(probe_success{site=${JSON.stringify(labels.site)},probe=${JSON.stringify(labels.probe)}})`,
        for: '1m',
        labels: {
          severity: 'critical',
          site: labels.site,
          probe: labels.probe,
        },
        annotations: {
          summary: `No probe samples for ${labels.site} / ${labels.probe}`,
        },
      })),
    },
  ],
})
// Use JSON, which is valid YAML, to avoid an extra configuration-parser dependency.
const prometheus = await read('prometheus/base.json')
prometheus.scrape_configs.find(
  (x) => x.job_name === 'traefik',
).metric_relabel_configs = metricRules
await write('prometheus/prometheus.yml', prometheus)
const secrets = root + '.secrets/'
await mkdir(secrets, { recursive: true, mode: 0o700 })
try {
  await access(secrets + 'grafana_admin_password')
} catch {
  await writeFile(
    secrets + 'grafana_admin_password',
    randomBytes(24).toString('hex') + '\n',
    { mode: 0o644, flag: 'wx' },
  )
}
for (const file of ['smtp_password', 'telegram_bot_token']) {
  try {
    await access(secrets + file)
  } catch {
    await writeFile(secrets + file, '', { mode: 0o644, flag: 'wx' })
  }
}
let notifications
try {
  notifications = await read('.secrets/notifications.json')
} catch (e) {
  if (e.code !== 'ENOENT') throw e
  notifications = await read('alertmanager/notifications.example.json')
}
const receiver = { name: 'configured-channels' }
if (notifications.email?.enabled) {
  const email = { ...notifications.email }
  delete email.enabled
  receiver.email_configs = [{ ...email, send_resolved: true }]
}
if (notifications.telegram?.enabled) {
  const telegram = { ...notifications.telegram }
  delete telegram.enabled
  if (!Number.isSafeInteger(telegram.chat_id) || telegram.chat_id === 0)
    throw Error('Telegram chat_id must be a nonzero integer')
  receiver.telegram_configs = [
    { ...telegram, send_resolved: true, parse_mode: '' },
  ]
}
await write('alertmanager/generated.json', {
  route: {
    receiver: receiver.name,
    group_by: ['alertname', 'site', 'probe', 'job'],
    group_wait: '10s',
    group_interval: '1m',
    repeat_interval: '4h',
  },
  receivers: [receiver],
})
console.log(
  `Configured ${sites.length} site(s), ${probes.length} internal checks. Email: ${!!receiver.email_configs}; Telegram: ${!!receiver.telegram_configs}.`,
)
