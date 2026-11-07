import type { Knex } from 'knex'

/** Acquire inside a transaction, before reading state that will be updated. */
export async function lockDatabaseWrite(db: Knex, key: string): Promise<void> {
  if (db.client.config.client === 'pg') {
    await db.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key])
  } else {
    await db('User')
      .whereRaw('false')
      .update({ id: db.ref('id') })
  }
}
