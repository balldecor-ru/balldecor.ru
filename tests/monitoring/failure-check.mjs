import { Buffer } from 'node:buffer'
import { setTimeout } from 'node:timers'
// Explicitly invoked destructive-to-preview check. Never run automatically against production.
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const compose = [
  'compose',
  '--env-file',
  'docker/.env',
  '-p',
  'haih-site',
  '-f',
  'docker/compose.yaml',
  '-f',
  'docker/compose.prod.yaml',
]
const password = (
  await readFile('docker/monitoring/.secrets/grafana_admin_password', 'utf8')
).trim()
const headers = {
  authorization: 'Basic ' + Buffer.from('admin:' + password).toString('base64'),
}
const api = async (path) => {
  const r = await fetch(
    'http://127.0.0.1:13000/api/datasources/proxy/uid/' + path,
    { headers },
  )
  assert.equal(r.status, 200)
  return r.json()
}
const query = async (expr) =>
  (await api('prometheus/api/v1/query?query=' + encodeURIComponent(expr))).data
    .result
const poll = async (check, ms) => {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (await check()) return
    await new Promise((r) => setTimeout(r, 5000))
  }
  throw Error('Timed out waiting for alert state')
}
let paused = false
try {
  // Warm the same Host/path cache key as the internal probe.
  execFileSync(
    'curl',
    ['-fsS', '-H', 'Host: haih.site', 'http://127.0.0.1:18080/'],
    { stdio: 'ignore' },
  )
  execFileSync('docker', [...compose, 'pause', 'app'], { stdio: 'inherit' })
  paused = true
  console.log(
    'Application paused; waiting for the uncached API alarm while page remains cached.',
  )
  await poll(async () => {
    const alerts = await api('alertmanager/api/v2/alerts')
    return alerts.some(
      (a) =>
        a.labels.alertname === 'SiteProbeFailed' && a.labels.probe === 'api',
    )
  }, 160000)
  const probes = await query('probe_success{site="haih.site"}')
  assert.equal(probes.find((p) => p.metric.probe === 'page').value[1], '1')
  assert.equal(probes.find((p) => p.metric.probe === 'api').value[1], '0')
  console.log(
    'PASS: cached page is UP, API is DOWN, SiteProbeFailed reached Alertmanager.',
  )
} finally {
  if (paused)
    execFileSync('docker', [...compose, 'unpause', 'app'], { stdio: 'inherit' })
}
await poll(async () => {
  const alerts = await api('alertmanager/api/v2/alerts')
  const probes = await query('probe_success{site="haih.site"}')
  return (
    probes.length === 2 &&
    probes.every((p) => p.value[1] === '1') &&
    !alerts.some((a) => a.labels.alertname === 'SiteProbeFailed')
  )
}, 100000)
console.log('PASS: probes recovered and the failure alert resolved.')
