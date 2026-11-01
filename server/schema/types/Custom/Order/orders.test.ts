import { ownedOrder } from './helpers/access'
import { authorizeAction } from '../../User/helpers/ensureVisitor'
import { createRequire } from 'node:module'
import type { Request } from 'express'
import type { Knex } from 'knex'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createDatabase } from 'server/database'
import { schema } from 'server/schema'
import type { Context } from 'server/schema/builder'
import { ensureVisitor } from '../../User/resolvers/ensureVisitor'
import { authenticate, hashPassword } from '../../User/helpers/auth'
import type { UserRecord } from '../../User/interfaces'
import { ChatStorage } from 'server/chat/storage'
import {
  addProduct,
  createOrder,
  submitOrder,
  updateProduct,
  type ProductReader,
} from './helpers/service'

const { graphql } = createRequire(import.meta.url)(
  'graphql',
) as typeof import('graphql')
let db: Knex
const userId = (user: UserRecord | null): string => {
  if (!user) {
    throw new Error('Пользователь не создан')
  }
  return user.id
}
const context = (currentUser: UserRecord | null = null): Context => ({
  db,
  currentUser,
  knex: undefined,
  req: { headers: {} } as Request,
})
const product: ProductReader = async (_, productId) => ({
  productId,
  name: 'Площадка',
  price: 120050,
  oldPrice: 130000,
  image: null,
  uri: '/catalog/playground',
})
const checkout = {
  fullname: 'Покупатель',
  phone: '+79990000000',
  delivery: 'pickup' as const,
  payment: 'cash' as const,
}
const execute = (
  source: string,
  ctx: Context,
  variableValues?: Record<string, unknown>,
) => graphql({ schema, source, contextValue: ctx, variableValues })
beforeEach(() => {
  db = createDatabase()
})
afterEach(async () => {
  vi.restoreAllMocks()
  await db.destroy()
})

it('посетитель с нуля: повторная сессия, несколько корзин, профиль и чат сохраняют владельца', async () => {
  const tokens = await Promise.all([
    ensureVisitor('a'.repeat(64), context()),
    ensureVisitor('a'.repeat(64), context()),
  ])
  const user = await authenticate(tokens[0], db)
  expect(user).toMatchObject({ status: 'newbie', email: null })
  expect((await authenticate(tokens[1], db))?.id).toBe(user?.id)
  expect(await db('User')).toHaveLength(1)
  const ctx = context(user)
  const first = await addProduct(
    ctx,
    { productId: 'old:page:5', quantity: 2 },
    product,
  )
  const second = await createOrder(ctx)
  const storage = new ChatStorage(db)
  const chat = await storage.issue('chat', userId(user))
  const filled = await execute(
    'mutation { updateCurrentUser(data: {email:"Buyer@Example.test", fullname:"Покупатель", password:"Password123"}) {id email status} }',
    ctx,
  )
  expect(filled.errors).toBeUndefined()
  expect(filled.data?.updateCurrentUser).toMatchObject({
    id: userId(user),
    email: 'buyer@example.test',
    status: 'newbie',
  })
  expect(await db('VisitorSession')).toHaveLength(0)
  const updated = await authenticate(tokens[0], db)
  expect(await storage.authorize(chat, userId(updated))).toBe(
    chat.split('.')[0],
  )
  const list = await execute(
    '{ orders(status:draft) {id Products {quantity price}} myChatDialogues {chatId} }',
    context(updated),
  )
  expect(list.errors).toBeUndefined()
  expect(list.data?.orders).toHaveLength(2)
  const sent = await submitOrder(context(updated), {
    ...checkout,
    orderId: first.id,
  })
  expect(sent.status).toBe('submitted')
  expect((await db('Order').where({ id: second.id }).first()).status).toBe(
    'draft',
  )
  expect(
    (await db('OrderProduct').where({ orderId: first.id }).first()).price,
  ).toBe(120050)
})

it('вход переносит только выбранную корзину, сохраняя остальные корзины обоих аккаунтов', async () => {
  const visitor = await authenticate(
    await ensureVisitor('b'.repeat(64), context()),
    db,
  )
  const ctx = context(visitor)
  const moved = await addProduct(
    ctx,
    { productId: 'old:page:5', quantity: 1 },
    product,
  )
  const left = await createOrder(ctx)
  const [account] = await db<UserRecord>('User')
    .insert({
      id: 'account',
      email: 'buyer@example.test',
      password: await hashPassword('Password123'),
      status: 'active',
    })
    .returning('*')
  const prior = await createOrder(context(account))
  const storage = new ChatStorage(db)
  const chat = await storage.issue('chat', userId(visitor))
  const login = await execute(
    'mutation($id:String!){signin(where:{email:"buyer@example.test"},data:{password:"Password123",orderId:$id}){success token}}',
    ctx,
    { id: moved.id },
  )
  expect(login.errors).toBeUndefined()
  expect(login.data?.signin).toMatchObject({ success: true })
  expect((await db('Order').where({ id: moved.id }).first()).userId).toBe(
    account.id,
  )
  expect((await db('Order').where({ id: left.id }).first()).userId).toBe(
    userId(visitor),
  )
  expect((await db('Order').where({ id: prior.id }).first()).userId).toBe(
    account.id,
  )
  expect(await storage.authorize(chat, account.id)).toBeNull()
  expect(await storage.authorize(chat, userId(visitor))).toBe(
    chat.split('.')[0],
  )
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const unavailable = await execute(
    'query($id:String!){order(id:$id){id}}',
    ctx,
    { id: moved.id },
  )
  expect(unavailable.errors).toBeUndefined()
  expect(unavailable.data?.order).toBeNull()
  expect(error).toHaveBeenCalledWith(expect.any(String), { orderId: moved.id })
})

it('без переноса и при неверном пароле владелец не меняется; чужой и отправленный заказ не переносятся', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const visitor = await authenticate(
    await ensureVisitor('c'.repeat(64), context()),
    db,
  )
  const ctx = context(visitor)
  const cart = await addProduct(
    ctx,
    { productId: 'old:page:5', quantity: 1 },
    product,
  )
  await db('User').insert({
    id: 'account',
    email: 'buyer@example.test',
    password: await hashPassword('Password123'),
  })
  const source =
    'mutation($password:String!,$id:String){signin(where:{email:"buyer@example.test"},data:{password:$password,orderId:$id}){success}}'
  expect(
    (await execute(source, ctx, { password: 'wrong', id: cart.id })).data
      ?.signin,
  ).toMatchObject({ success: false })
  expect(
    (await execute(source, ctx, { password: 'Password123' })).data?.signin,
  ).toMatchObject({ success: true })
  expect((await db('Order').where({ id: cart.id }).first()).userId).toBe(
    userId(visitor),
  )
  const other = await authenticate(
    await ensureVisitor('d'.repeat(64), context()),
    db,
  )
  const foreignLogin = await execute(source, context(other), {
    password: 'Password123',
    id: cart.id,
  })
  expect(foreignLogin.errors).toBeUndefined()
  expect(foreignLogin.data?.signin).toMatchObject({ success: true })
  await submitOrder(ctx, { ...checkout, orderId: cart.id })
  const count = (await db('Token')).length
  const submittedLogin = await execute(source, ctx, {
    password: 'Password123',
    id: cart.id,
  })
  expect(submittedLogin.errors).toBeUndefined()
  expect(submittedLogin.data?.signin).toMatchObject({ success: true })
  expect(await db('Token')).toHaveLength(count + 1)
  expect(error).toHaveBeenCalledTimes(2)
  expect((await db('Order').where({ id: cart.id }).first()).userId).toBe(
    userId(visitor),
  )
})

it('оформление атомарно, повторное оформление и изменения отправленного заказа запрещены', async () => {
  const ctx = context(
    await authenticate(await ensureVisitor('e'.repeat(64), context()), db),
  )
  const empty = await createOrder(ctx)
  await expect(
    submitOrder(ctx, { ...checkout, orderId: empty.id }),
  ).rejects.toThrow('пуста')
  expect((await db('Order').where({ id: empty.id }).first()).status).toBe(
    'draft',
  )
  const order = await addProduct(
    ctx,
    { orderId: empty.id, productId: 'old:page:5', quantity: 2 },
    product,
  )
  const item = await db('OrderProduct').where({ orderId: order.id }).first()
  await updateProduct(ctx, order.id, item.id, 0)
  expect(await db('OrderProduct')).toHaveLength(0)
  await addProduct(
    ctx,
    { orderId: order.id, productId: 'old:page:5', quantity: 1 },
    product,
  )
  const results = await Promise.allSettled([
    submitOrder(ctx, { ...checkout, orderId: order.id }),
    submitOrder(ctx, { ...checkout, orderId: order.id }),
  ])
  expect(
    results.filter((result) => result.status === 'fulfilled'),
  ).toHaveLength(1)
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(
    updateProduct(ctx, order.id, item.id, 3),
  ).resolves.toBeUndefined()
  const replacement = await addProduct(
    ctx,
    { orderId: order.id, productId: 'old:page:5', quantity: 1 },
    product,
  )
  expect(replacement.id).not.toBe(order.id)
  expect(replacement.status).toBe('draft')
  expect(error).toHaveBeenCalledWith(expect.any(String), { orderId: order.id })
})

it('новичок редактирует свой профиль; нет доступа без сессии, чужого email и повышения статуса', async () => {
  const ctx = context(
    await authenticate(await ensureVisitor('f'.repeat(64), context()), db),
  )
  expect(
    (
      await execute(
        'mutation{updateCurrentUser(data:{fullname:"Новичок"}){fullname}}',
        ctx,
      )
    ).errors,
  ).toBeUndefined()
  expect(
    (
      await execute(
        'mutation{updateCurrentUser(data:{fullname:"Нет"}){id}}',
        context(),
      )
    ).errors,
  ).toBeDefined()
  expect(
    (
      await execute(
        'mutation{updateCurrentUser(data:{email:"visitor@example.test"}){id}}',
        ctx,
      )
    ).errors,
  ).toBeUndefined()
  await db('User').insert({ id: 'existing', email: 'buyer@example.test' })
  expect(
    (
      await execute(
        'mutation{updateCurrentUser(data:{email:"buyer@example.test",password:"Password123"}){id}}',
        ctx,
      )
    ).errors?.[0].message,
  ).toContain('занят')
  expect(
    (
      await db('User')
        .where({ id: userId(ctx.currentUser) })
        .first()
    ).status,
  ).toBe('newbie')
  expect(await db('VisitorSession')).toHaveLength(0)
})

it('новый чат имеет владельца, старый присоединяется по токену, чужой токен не даёт доступ', async () => {
  const user = await authenticate(
    await ensureVisitor('1'.repeat(64), context()),
    db,
  )
  const other = await authenticate(
    await ensureVisitor('2'.repeat(64), context()),
    db,
  )
  const created = await execute(
    'mutation{createChatToken(data:{})}',
    context(user),
  )
  expect(created.errors).toBeUndefined()
  const token = String(created.data?.createChatToken)
  const storage = new ChatStorage(db)
  expect(await storage.owner(token.split('.')[0])).toBe(userId(user))
  expect(await storage.authorize(token, userId(other))).toBeNull()
  expect(await storage.authorize(token, null)).toBeNull()
  const legacy = await storage.issue()
  expect(await storage.authorize(legacy, userId(user))).toBe(
    legacy.split('.')[0],
  )
  expect(await storage.authorize(legacy, userId(other))).toBeNull()
})

it('parallel cart and chat actions share a user and reuse the authenticated token', async () => {
  const ctx = context()
  ctx.req.headers['x-visitor-key'] = 'f'.repeat(64)
  const [cartSession, chatSession] = await Promise.all([
    authorizeAction(ctx),
    authorizeAction(ctx),
  ])
  expect(cartSession.user.id).toBe(chatSession.user.id)
  const order = await addProduct(
    { ...ctx, currentUser: cartSession.user },
    { productId: 'old:page:5', quantity: 1 },
    product,
  )
  const chat = await new ChatStorage(db).issue('chat', chatSession.user.id)
  expect(order.userId).toBe(await new ChatStorage(db).owner(chat.split('.')[0]))
  ctx.req.headers.authorization = `Bearer ${cartSession.token}`
  const next = await authorizeAction(ctx)
  expect(next.token).toBe(cartSession.token)
  expect(await db('User')).toHaveLength(1)
  expect(await db('Token')).toHaveLength(2)
})

it.each(['missing', 'foreign', 'submitted'] as const)(
  'adding a product with a %s order key creates a new cart',
  async (kind) => {
    const visitor = await authenticate(
      await ensureVisitor('3'.repeat(64), context()),
      db,
    )
    const other = await authenticate(
      await ensureVisitor('4'.repeat(64), context()),
      db,
    )
    const original = await addProduct(
      context(kind === 'foreign' ? other : visitor),
      { productId: 'old:page:5', quantity: 2 },
      product,
    )
    if (kind === 'submitted') {
      await submitOrder(context(visitor), { ...checkout, orderId: original.id })
    }
    const ordersBefore = await db('Order').orderBy('id')
    const productsBefore = await db('OrderProduct').orderBy('id')
    const orderId = kind === 'missing' ? 'invalid-order-key' : original.id
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const result = await addProduct(
      context(visitor),
      { orderId, productId: 'old:page:5', quantity: 3 },
      product,
    )
    expect(result).toMatchObject({ userId: userId(visitor), status: 'draft' })
    expect(result.id).not.toBe(orderId)
    expect(await db('Order').whereNot({ id: result.id }).orderBy('id')).toEqual(
      ordersBefore,
    )
    expect(
      await db('OrderProduct').whereNot({ orderId: result.id }).orderBy('id'),
    ).toEqual(productsBefore)
    expect(
      await db('OrderProduct').where({ orderId: result.id }),
    ).toMatchObject([{ productId: 'old:page:5', quantity: 3 }])
    expect(error).toHaveBeenCalledWith(expect.any(String), { orderId })
  },
)

it.each([
  'missing',
  'foreign',
  'submitted',
  'no-source',
  'blocked',
  'email',
] as const)(
  'signin succeeds when cart transfer is unavailable: %s',
  async (kind) => {
    const visitor = await authenticate(
      await ensureVisitor('5'.repeat(64), context()),
      db,
    )
    const other = await authenticate(
      await ensureVisitor('6'.repeat(64), context()),
      db,
    )
    const original = await addProduct(
      context(kind === 'foreign' ? other : visitor),
      { productId: 'old:page:5', quantity: 2 },
      product,
    )
    if (kind === 'submitted') {
      await submitOrder(context(visitor), { ...checkout, orderId: original.id })
    }
    await db('User').insert({
      id: 'account',
      email: 'buyer@example.test',
      password: await hashPassword('Password123'),
      status: 'active',
    })
    if (kind === 'blocked' || kind === 'email') {
      await db('User')
        .where({ id: userId(visitor) })
        .update(
          kind === 'blocked'
            ? { status: 'blocked' }
            : { email: 'visitor@example.test' },
        )
    }
    const source =
      kind === 'no-source'
        ? null
        : ((await db<UserRecord>('User')
            .where({ id: userId(visitor) })
            .first()) ?? null)
    const ordersBefore = await db('Order').orderBy('id')
    const productsBefore = await db('OrderProduct').orderBy('id')
    const orderId = kind === 'missing' ? 'invalid-order-key' : original.id
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const login = await execute(
      'mutation($id:String!){signin(where:{email:"buyer@example.test"},data:{password:"Password123",orderId:$id}){success token}}',
      context(source),
      { id: orderId },
    )
    expect(login.errors).toBeUndefined()
    expect(login.data?.signin).toMatchObject({
      success: true,
      token: expect.any(String),
    })
    const payload = login.data?.signin as { token: string }
    expect((await authenticate(payload.token, db))?.id).toBe('account')
    expect(await db('Order').orderBy('id')).toEqual(ordersBefore)
    expect(await db('OrderProduct').orderBy('id')).toEqual(productsBefore)
    expect(error).toHaveBeenCalledWith(expect.any(String), { orderId })
  },
)

it.each(['missing', 'foreign', 'submitted'] as const)(
  'unavailable %s orders return undefined and cannot be updated',
  async (kind) => {
    const visitor = await authenticate(
      await ensureVisitor('7'.repeat(64), context()),
      db,
    )
    const other = await authenticate(
      await ensureVisitor('8'.repeat(64), context()),
      db,
    )
    const ctx = context(visitor)
    const order = await addProduct(
      context(kind === 'foreign' ? other : visitor),
      { productId: 'old:page:5', quantity: 2 },
      product,
    )
    if (kind === 'submitted') {
      await submitOrder(ctx, { ...checkout, orderId: order.id })
    }
    const item = await db('OrderProduct').where({ orderId: order.id }).first()
    const orderId = kind === 'missing' ? 'invalid-order-key' : order.id
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(
      ownedOrder(db, orderId, userId(visitor), true),
    ).resolves.toBeUndefined()
    await expect(
      updateProduct(ctx, orderId, item.id, 10),
    ).resolves.toBeUndefined()
    expect(await db('OrderProduct').where({ id: item.id }).first()).toEqual(
      item,
    )
    expect(error).toHaveBeenCalledTimes(2)
  },
)
