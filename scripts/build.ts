import '../server/env'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import express from 'express'
import { setupGraphqlMiddleware } from '../server/middleware/graphql'
import { db } from '../server/database'

// Сборочный API изолирован от dev-сервера и использует ту же схему и БД.
const app = express()
const server = createServer(app)
const stop = await setupGraphqlMiddleware(app, server)
try {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Не удалось запустить сборочный API')
  }
  const code = await new Promise<number>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['node_modules/@react-router/dev/bin.cjs', 'build'],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          GRAPHQL_BUILD_ENDPOINT: `http://127.0.0.1:${address.port}/api/`,
        },
      },
    )
    child.once('error', reject)
    child.once('exit', (code) => resolve(code ?? 1))
  })
  process.exitCode = code
} finally {
  await stop()
  await db.destroy()
}
