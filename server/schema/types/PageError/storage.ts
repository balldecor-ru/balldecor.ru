import { lockDatabaseWrite } from '../../../database/lock'
import type { Knex } from 'knex'
import type { PageViewEvent } from '../../../../app/components/Statistics/transport'

export async function recordPageError(
  db: Knex,
  event: PageViewEvent,
): Promise<void> {
  if (event.status !== 'failed') {
    return
  }
  await db.transaction(async (trx) => {
    await lockDatabaseWrite(trx, `page-error:${event.url}`)
    if (
      await trx('PageErrorEvent').where({ eventKey: event.eventKey }).first()
    ) {
      return
    }
    await trx('PageError')
      .insert({
        url: event.url,
        lastOccurredAt: event.timestamp,
        statusCode: event.statusCode,
        count: 1,
        status: null,
      })
      .onConflict('url')
      .merge({
        lastOccurredAt: trx.raw('CASE WHEN ? > ?? THEN ? ELSE ?? END', [
          event.timestamp,
          'PageError.lastOccurredAt',
          event.timestamp,
          'PageError.lastOccurredAt',
        ]),
        statusCode: trx.raw('CASE WHEN ? >= ?? THEN ? ELSE ?? END', [
          event.timestamp,
          'PageError.lastOccurredAt',
          event.statusCode,
          'PageError.statusCode',
        ]),
        count: trx.raw('?? + 1', ['PageError.count']),
        status: null,
      })
    await trx('PageErrorEvent').insert({
      eventKey: event.eventKey,
      url: event.url,
    })
  })
}
