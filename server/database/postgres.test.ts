import { ensureVisitor } from '../schema/types/User/helpers/ensureVisitor'
import { readProduct } from '../schema/types/Custom/Order/helpers/product'
import { addProduct } from '../schema/types/Custom/Order/helpers/service'
import { conceptSearchType } from '../schema/types/KBConcept/search/client'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import knex from 'knex'
import type { Request } from 'express'
import { expect, it, vi } from 'vitest'
import { createDatabase, migrateDatabase } from './index'
import { schema } from '../schema'
import { ChatStorage } from '../chat/storage'
import { usersQuery } from '../schema/types/User/helpers/queries'
import type { UserRecord } from '../schema/types/User/interfaces'
import { recordPageError } from '../schema/types/PageError/storage'
import { creditTopUp } from '../schema/types/Balance/resolvers/topUp'
import { createTransfer } from '../schema/types/Transaction/resolvers/createTransfer'
import { lockDatabaseWrite } from './lock'
import { completeCertificateAttempt } from '../schema/types/User/helpers/clientCertificate'

const { graphql } = createRequire(import.meta.url)(
  'graphql',
) as typeof import('graphql')

it.skipIf(!process.env.TEST_DATABASE_URL)(
  'creates a missing PostgreSQL database and runs migrations and application queries',
  async () => {
    const connection = process.env.TEST_DATABASE_URL
    if (!connection) {
      throw new Error('TEST_DATABASE_URL is required')
    }
    const url = new URL(connection)
    const admin = knex({ client: 'pg', connection: url.href })
    const name = `website-test.${randomUUID().replaceAll('-', '')}`
    url.pathname = `/${name}`
    vi.stubEnv('DATABASE_CLIENT', 'pg')
    vi.stubEnv('DATABASE_URL', url.href)
    const db = createDatabase()
    try {
      await migrateDatabase(db)
      expect((await db.migrate.latest())[1]).toEqual([])
      const [owner] = await db<UserRecord>('User')
        .insert({ id: 'owner', fullname: 'ПРИМЕР_100%', sudo: true })
        .returning('*')
      await db('User').insert({ id: 'recipient' })
      expect(owner.createdAt).toBeInstanceOf(Date)
      expect(owner.sudo).toBe(true)
      expect(owner.isAiAgent).toBe(false)
      expect(
        await usersQuery(
          db,
          {
            fullname: {
              contains: 'пример',
              mode: 'insensitive',
              startsWith: 'пример_',
              endsWith: '100%',
            },
          },
          owner,
        ),
      ).toHaveLength(1)
      await db('KBConcept').insert({
        id: 'concept',
        name: 'Пример_100%',
        type: conceptSearchType,
        size: '30 см',
        price: 12.34,
        hast: JSON.stringify({ type: 'root', children: [] }),
        tv: JSON.stringify([{ value: '30 см' }]),
        createdById: 'owner',
        lat: 55.75,
        lng: 37.61,
        data: JSON.stringify({ example: true }),
      })
      const context = { db, currentUser: owner, req: {} as Request }
      const result = await graphql({
        schema,
        source:
          '{ concepts(where: {name: {startsWith: "Пример_", contains: "ПРИМЕР"}, coords: {lat: 55.75, lng: 37.61}}) {id data} usersCount }',
        contextValue: context,
      })
      expect(result.errors).toBeUndefined()
      expect(result.data).toEqual({
        concepts: [{ id: 'concept', data: { example: true } }],
        usersCount: 2,
      })
      expect(
        await db('KBConcept').where('id', 'concept').first(),
      ).toMatchObject({
        size: '30 см',
        price: 12.34,
        hast: { type: 'root', children: [] },
        tv: [{ value: '30 см' }],
        searchable: true,
      })
      expect(await readProduct(db, 'concept')).toMatchObject({ price: 1234 })
      const order = await addProduct(context, {
        productId: 'concept',
        quantity: 2,
      })
      expect(
        await db('OrderProduct').where('orderId', order.id).first(),
      ).toMatchObject({ quantity: 2, price: 1234 })
      vi.stubEnv('JWT_SECRET', 'postgres-visitor-test')
      await Promise.all(
        [1, 2].map(() =>
          ensureVisitor('a'.repeat(64), { db, currentUser: null }),
        ),
      )
      expect(await db('VisitorSession')).toHaveLength(1)
      await creditTopUp(context, 1, 'test-tx', 10.123456)
      await createTransfer({ toUserId: 'recipient', amount: 1.123456 }, context)
      expect(
        await db('Balance').where('userId', 'owner').first(),
      ).toMatchObject({ amount: 9 })
      await expect(
        db.transaction(async (trx) => {
          await trx('User').insert({ id: 'rolled-back' })
          throw new Error('rollback')
        }),
      ).rejects.toThrow('rollback')
      expect(await db('User').where('id', 'rolled-back')).toHaveLength(0)
      const storage = new ChatStorage(db)
      const token = await storage.issue()
      const chatId = token.split('.')[0]
      expect(await storage.verify(`Bearer ${token}`)).toBe(chatId)
      await storage.appendUserMessage(chatId, {
        id: 'message',
        role: 'user',
        content: 'hello',
        createdAt: new Date().toISOString(),
      })
      expect(await storage.listDialogues()).toHaveLength(1)
      expect(await storage.read(chatId)).toHaveLength(1)
      const event = {
        eventId: 'page.viewed' as const,
        status: 'failed' as const,
        statusCode: 500,
        eventKey: 'event',
        timestamp: Date.now(),
        url: 'https://test.invalid/',
        referrer: '',
        title: '',
        language: 'en',
        viewport: { width: 390, height: 844 },
      }
      await Promise.all([
        recordPageError(db, event),
        recordPageError(db, event),
      ])
      await recordPageError(db, {
        ...event,
        eventKey: 'another',
        timestamp: event.timestamp + 1,
      })
      expect(await db('PageError').first()).toMatchObject({
        count: 2,
        lastOccurredAt: event.timestamp + 1,
      })
      await db.transaction(async (trx) => {
        await lockDatabaseWrite(trx, 'administrator')
        expect(
          await completeCertificateAttempt('fingerprint', trx, owner.id, false),
        ).toEqual({ kind: 'linked' })
      })
    } finally {
      await db.destroy()
      vi.unstubAllEnvs()
      await admin.raw(`DROP DATABASE IF EXISTS "${name}"`)
      await admin.destroy()
    }
  },
  30000,
)

it.skipIf(!process.env.TEST_DATABASE_URL)(
  'reports missing CREATEDB permission but can migrate an existing accessible database',
  async () => {
    const connection = process.env.TEST_DATABASE_URL
    if (!connection) {
      throw new Error('TEST_DATABASE_URL is required')
    }
    const url = new URL(connection)
    const admin = knex({ client: 'pg', connection: url.href })
    const suffix = randomUUID().replaceAll('-', '')
    const name = `website_permission_${suffix}`
    const role = `website_role_${suffix}`
    const password = randomUUID()
    const maintenanceHadMigrations =
      await admin.schema.hasTable('knex_migrations')
    await admin.raw(
      `CREATE ROLE "${role}" LOGIN PASSWORD '${password}' NOCREATEDB`,
    )
    url.pathname = `/${name}`
    url.username = role
    url.password = password
    vi.stubEnv('DATABASE_CLIENT', 'pg')
    vi.stubEnv('DATABASE_URL', url.href)
    const db = createDatabase()
    try {
      await expect(migrateDatabase(db)).rejects.toThrow(
        'Grant CREATEDB or create the database manually',
      )
      expect(await admin('pg_database').where('datname', name)).toHaveLength(0)
      await admin.raw(`CREATE DATABASE "${name}"`)
      const setupUrl = new URL(connection)
      setupUrl.pathname = `/${name}`
      const setup = knex({ client: 'pg', connection: setupUrl.href })
      try {
        await setup.raw(`GRANT USAGE, CREATE ON SCHEMA public TO "${role}"`)
      } finally {
        await setup.destroy()
      }
      await migrateDatabase(db)
      expect(await db.schema.hasTable('User')).toBe(true)
      expect(await db('knex_migrations')).toHaveLength(2)
      expect(await admin.schema.hasTable('knex_migrations')).toBe(
        maintenanceHadMigrations,
      )
    } finally {
      await db.destroy()
      vi.unstubAllEnvs()
      try {
        await admin.raw(`DROP DATABASE IF EXISTS "${name}"`)
        await admin.raw(`DROP ROLE "${role}"`)
      } finally {
        await admin.destroy()
      }
    }
  },
  30000,
)
