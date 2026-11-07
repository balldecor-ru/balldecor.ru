import { randomUUID } from 'node:crypto'
import type { Knex } from 'knex'
import type { BalanceRecord } from '../../User/types'

export async function upsertBalance(
  db: Knex,
  userId: string,
): Promise<BalanceRecord> {
  await db<BalanceRecord>('Balance')
    .insert({
      id: randomUUID(),
      userId,
      amount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflict('userId')
    .ignore()
  const query = db<BalanceRecord>('Balance').where({ userId }).first()
  if (db.client.config.client === 'pg') {
    query.forUpdate()
  }
  const balance = await query
  if (!balance) {
    throw new Error('Баланс не найден')
  }
  return balance
}

export function validateAmount(amount: number): void {
  const units = amount * 1e6
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(Math.round(units)) ||
    Math.abs(units - Math.round(units)) > 0.00001
  ) {
    throw new Error(
      'Сумма должна быть положительной и содержать не более шести знаков после запятой',
    )
  }
}
