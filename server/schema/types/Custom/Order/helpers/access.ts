import type { Knex } from 'knex'
import type { Context } from 'server/schema/builder'
import type { UserRecord } from '../../../User/interfaces'
import type { OrderRecord } from '../interfaces'

export function requireUser(ctx: Pick<Context, 'currentUser'>): UserRecord {
  if (!ctx.currentUser || ctx.currentUser.status === 'blocked') {
    throw new Error('Необходимо войти в учётную запись')
  }
  return ctx.currentUser
}

export async function ownedOrder(
  db: Knex,
  id: string,
  userId: string,
  draft = false,
): Promise<OrderRecord | undefined> {
  const order = await db<OrderRecord>('Order').where({ id, userId }).first()
  if (!order) {
    console.error('Корзина или заказ не найдены', { orderId: id })
    return undefined
  }
  if (draft && order.status !== 'draft') {
    console.error('Заказ уже отправлен', { orderId: id })
    return undefined
  }
  return order
}

export async function transferOrder(
  db: Knex,
  id: string,
  source: UserRecord | null,
  targetId: string,
): Promise<void> {
  if (!source || source.status === 'blocked' || source.email?.trim()) {
    console.error('Перенос доступен из профиля без email', { orderId: id })
    return
  }
  const changed = await db('Order')
    .where({ id, userId: source.id, status: 'draft' })
    .update({ userId: targetId, updatedAt: new Date() })
  if (changed !== 1) {
    console.error(
      'Нельзя перенести чужой, отсутствующий или отправленный заказ',
      {
        orderId: id,
      },
    )
  }
}
