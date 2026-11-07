import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { expect, it, vi } from 'vitest'
import { createDatabase, migrateDatabase } from './index'
import { initializeSchema } from './schema'

it('applies merged migrations by name even when their timestamp precedes completed migrations', async () => {
  const directory = await mkdtemp('server/database/data/migrations-test-')
  const db = createDatabase()
  const config = {
    directory: [resolve('server/database/migrations'), resolve(directory)],
  }
  try {
    await writeFile(
      join(directory, '20261110000000_clone.mjs'),
      `export async function up(db) { await db.schema.createTable('CloneFeature', t => t.integer('id')) } export async function down(db) { await db.schema.dropTable('CloneFeature') }`,
    )
    await db.migrate.latest(config)
    await writeFile(
      join(directory, '20261109000000_upstream.mjs'),
      `export async function up(db) { await db.schema.createTable('UpstreamFeature', t => t.integer('id')) } export async function down(db) { await db.schema.dropTable('UpstreamFeature') }`,
    )
    const [, applied] = await db.migrate.latest(config)
    expect(applied).toEqual(['20261109000000_upstream.mjs'])
    expect(await db.schema.hasTable('CloneFeature')).toBe(true)
    expect(await db.schema.hasTable('UpstreamFeature')).toBe(true)
    expect((await db.migrate.latest(config))[1]).toEqual([])
  } finally {
    await db.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})

it('adopts an existing SQLite database without recreating its tables or losing records', async () => {
  const directory = await mkdtemp('server/database/data/adoption-test-')
  const filename = join(directory, 'existing.sqlite')
  const legacy = new Database(filename)
  try {
    initializeSchema(legacy)
    legacy.prepare('INSERT INTO "User" (id) VALUES (?)').run('existing')
  } finally {
    legacy.close()
  }
  vi.stubEnv('DATABASE_FILENAME', filename)
  const db = createDatabase()
  try {
    await migrateDatabase(db)
    await migrateDatabase(db)
    expect(await db('User').select('id')).toEqual([{ id: 'existing' }])
    expect(await db('knex_migrations')).toHaveLength(2)
  } finally {
    await db.destroy()
    vi.unstubAllEnvs()
    await rm(directory, { recursive: true, force: true })
  }
})
