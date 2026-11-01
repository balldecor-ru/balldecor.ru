import { createHash, randomUUID } from 'node:crypto'
import type { Context } from '../../../builder'
import { createToken, authenticate } from './auth'
import type { UserRecord } from '../interfaces'

// Ключ браузера позволяет безопасно повторить первый запрос после сбоя сети.
export async function ensureVisitor(
  key: string,
  ctx: Pick<Context, 'db' | 'currentUser'>,
): Promise<string> {
  if (ctx.currentUser) {
    if (ctx.currentUser.status === 'blocked') {
      throw new Error('Доступ запрещён')
    }
    return createToken(ctx.currentUser, ctx.db)
  }
  if (!/^[a-f0-9]{64}$/.test(key)) {
    throw new Error('Некорректный ключ посетителя')
  }
  const keyHash = createHash('sha256').update(key).digest('hex')
  return ctx.db.transaction(async (db) => {
    // Сначала запись: параллельные запросы сериализуются блокировкой SQLite.
    const id = randomUUID()
    await db('User').insert({ id, status: 'newbie' })
    const inserted = await db('VisitorSession')
      .insert({ keyHash, userId: id })
      .onConflict('keyHash')
      .ignore()
      .returning('userId')
    if (!inserted.length) {
      await db('User').where({ id }).delete()
    }
    const session = await db<{ userId: string; keyHash: string }>(
      'VisitorSession',
    )
      .where({ keyHash })
      .first()
    const user =
      session &&
      (await db<UserRecord>('User').where({ id: session.userId }).first())
    if (!user || user.status === 'blocked' || user.email?.trim()) {
      throw new Error('Сессия посетителя недоступна')
    }
    return createToken(user, db)
  })
}

export async function authorizeAction(
  ctx: Pick<Context, 'db' | 'currentUser' | 'req'>,
): Promise<{ token: string; user: UserRecord }> {
  const existing =
    ctx.req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1]
  const currentUser =
    ctx.currentUser ?? (existing ? await authenticate(existing, ctx.db) : null)
  if (currentUser && existing) {
    if (currentUser.status === 'blocked') {
      throw new Error('Доступ запрещён')
    }
    return { token: existing, user: currentUser }
  }
  const key = ctx.req.headers['x-visitor-key']
  const token = await ensureVisitor(
    typeof key === 'string'
      ? key
      : randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', ''),
    { ...ctx, currentUser },
  )
  const user = await authenticate(token, ctx.db)
  if (!user) {
    throw new Error('Не удалось создать сессию')
  }
  return { token, user }
}
