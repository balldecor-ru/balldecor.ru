import { execFileSync } from 'node:child_process'
import { mkdtemp, cp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import assert from 'node:assert/strict'
const directory = await mkdtemp(join(tmpdir(), 'haih-notifications-'))
const mock = 'haih-monitoring-notification-fixture'
const manager = 'haih-monitoring-notification-test'
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8' })
try {
  await cp('docker/monitoring', directory, {
    recursive: true,
    filter: (source) => !source.includes('.secrets'),
  })
  await import('node:fs/promises').then((m) =>
    m.mkdir(join(directory, '.secrets'), { recursive: true }),
  )
  await writeFile(
    join(directory, '.secrets/notifications.json'),
    JSON.stringify({
      email: {
        enabled: true,
        to: 'test@example.invalid',
        from: 'monitor@example.invalid',
        smarthost: mock + ':2525',
        require_tls: false,
      },
      telegram: {
        enabled: true,
        chat_id: 1,
        bot_token: '123:fixture',
        api_url: 'http://' + mock + ':8080',
      },
    }),
  )
  execFileSync(process.execPath, [
    'scripts/configure-monitoring.mjs',
    directory,
  ])
  const config = JSON.parse(
    await readFile(join(directory, 'alertmanager/generated.json'), 'utf8'),
  )
  assert.equal(config.receivers[0].email_configs.length, 1)
  assert.equal(config.receivers[0].telegram_configs.length, 1)
  docker(
    'run',
    '--rm',
    '--entrypoint',
    'amtool',
    '-v',
    directory + '/alertmanager:/etc/alertmanager:ro',
    'prom/alertmanager:v0.34.1',
    'check-config',
    '/etc/alertmanager/generated.json',
  )
  docker(
    'run',
    '-d',
    '--rm',
    '--name',
    mock,
    '--network',
    'haih-monitoring',
    '-v',
    resolve('tests/monitoring/notification-fixture.mjs') + ':/fixture.mjs:ro',
    'node:22.22.3-bookworm-slim',
    'node',
    '/fixture.mjs',
  )
  docker(
    'run',
    '-d',
    '--rm',
    '--name',
    manager,
    '--network',
    'haih-monitoring',
    '-v',
    directory + '/alertmanager:/etc/alertmanager:ro',
    'prom/alertmanager:v0.34.1',
    '--config.file=/etc/alertmanager/generated.json',
  )
  const request = (url, body) =>
    JSON.parse(
      docker(
        'exec',
        mock,
        'node',
        '-e',
        `fetch(${JSON.stringify(url)},${body ? JSON.stringify({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) : '{}'}).then(async r=>console.log(JSON.stringify({status:r.status,body:await r.text()})))`,
      ),
    )
  await sleep(1000)
  const alert = {
    labels: {
      alertname: 'NotificationIntegrationTest',
      site: 'fixture.invalid',
      severity: 'warning',
    },
    annotations: { summary: 'Local fixture only' },
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 300000).toISOString(),
  }
  assert.equal(
    request('http://' + manager + ':9093/api/v2/alerts', [alert]).status,
    200,
  )
  let received
  for (let i = 0; i < 20; i++) {
    received = JSON.parse(request('http://' + mock + ':8080/messages').body)
    if (received.email.length && received.telegram.length) break
    await sleep(1000)
  }
  assert.ok(
    received.email.length,
    'Email was not delivered to the local SMTP fixture',
  )
  assert.ok(
    received.telegram.length,
    'Telegram request was not delivered to the local API fixture',
  )
  alert.endsAt = new Date().toISOString()
  request('http://' + manager + ':9093/api/v2/alerts', [alert])
  for (let i = 0; i < 75; i++) {
    received = JSON.parse(request('http://' + mock + ':8080/messages').body)
    if (received.email.length >= 2 && received.telegram.length >= 2) break
    await sleep(1000)
  }
  assert.ok(received.email.length >= 2, 'Missing recovery email')
  assert.ok(received.telegram.length >= 2, 'Missing recovery Telegram message')
  console.log(
    'PASS: generated dual-channel configuration delivered firing and resolved notifications to local SMTP/Telegram fixtures. No external messages sent.',
  )
} finally {
  for (const name of [manager, mock]) {
    try {
      docker('rm', '-f', name)
    } catch {
      /* Container may not have started. */
    }
  }
  await rm(directory, { recursive: true, force: true })
}
