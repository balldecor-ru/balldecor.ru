#!/usr/bin/env node
// @ts-check
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { createDatabase, migrateDatabase } from '../server/database/index.ts'
import { lockDatabaseWrite } from '../server/database/lock.ts'
import bcrypt from 'bcryptjs'

async function main() {
  const { values } = parseArgs({
    options: {
      username: { type: 'string' },
      email: { type: 'string' },
      database: { type: 'string' },
      'password-stdin': { type: 'boolean' },
      'allow-existing-users': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(`Usage: node scripts/create-admin.mjs --username <username> [--email <email>] [--password-stdin] [--database <path>]

Provide the password via ADMIN_PASSWORD or --password-stdin.
Creates an active administrator only when the User table is empty.
Default database: server/database/data/database.sqlite in this project.
Use --allow-existing-users to explicitly create an additional administrator. Existing accounts are never updated.`)
    return
  }
  const username = values.username?.trim()
  if (!username) throw new Error('--username is required')
  const email = values.email?.trim() || null
  let password = process.env.ADMIN_PASSWORD
  if (values['password-stdin']) {
    process.stdin.setEncoding('utf8')
    password = ''
    for await (const chunk of process.stdin) password += chunk
    password = password.replace(/\r?\n$/, '')
  }
  // eslint-disable-next-line no-undef
  if (!password || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error(
      'Provide a password of 1–72 UTF-8 bytes via ADMIN_PASSWORD or --password-stdin',
    )
  }
  const hash = await bcrypt.hash(password, 10)
  if (values.database) {
    if (process.env.DATABASE_CLIENT === 'pg')
      throw new Error('--database is only supported with SQLite')
    process.env.DATABASE_FILENAME = resolve(values.database)
  }
  const database = createDatabase()
  try {
    await migrateDatabase(database)
    await database.transaction(async (trx) => {
      await lockDatabaseWrite(trx, 'administrator')
      if (!values['allow-existing-users'] && (await trx('User').first('id'))) {
        throw new Error(
          'Cannot create administrator: the database already contains users',
        )
      }
      await trx('User').insert({
        id: randomUUID(),
        username,
        email,
        password: hash,
        status: 'active',
        sudo: true,
        isAiAgent: false,
      })
    })
    console.log(`Administrator "${username}" created`)
  } finally {
    await database.destroy()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
