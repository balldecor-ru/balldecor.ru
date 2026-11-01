import { randomUUID } from 'node:crypto'
import type { Context } from 'server/schema/builder'
import { ownedOrder, requireUser } from './access'
import { readProduct } from './product'
import type {
  OrderProductRecord,
  OrderRecord,
  ProductSnapshot,
} from '../interfaces'

export async function createOrder(ctx: Context): Promise<OrderRecord> {
  const user = requireUser(ctx)
  const [order] = await ctx
    .db<OrderRecord>('Order')
    .insert({
      id: randomUUID(),
      userId: user.id,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('*')
  return order
}

export interface AddProductData {
  orderId?: string | null
  productId: string
  quantity: number
}
export type ProductReader = (
  db: Context['db'],
  productId: string,
) => Promise<ProductSnapshot>

export async function addProduct(
  ctx: Context,
  data: AddProductData,
  reader: ProductReader = readProduct,
): Promise<OrderRecord> {
  const user = requireUser(ctx)
  if (
    !Number.isInteger(data.quantity) ||
    data.quantity < 1 ||
    data.quantity > 1000000
  ) {
    throw new Error('Некорректное количество')
  }
  const snapshot = await reader(ctx.db, data.productId)
  return ctx.db.transaction(async (db) => {
    // Первая операция получает блокировку до чтения изменяемой корзины.
    let existingOrder: OrderRecord | undefined
    if (data.orderId) {
      ;[existingOrder] = await db<OrderRecord>('Order')
        .where({ id: data.orderId, userId: user.id, status: 'draft' })
        .update({ updatedAt: new Date() })
        .returning('*')
      if (!existingOrder) {
        console.error('Корзина недоступна, создаётся новая', {
          orderId: data.orderId,
        })
      }
    }
    const order = existingOrder ?? (await createOrder({ ...ctx, db }))
    const existing = await db<OrderProductRecord>('OrderProduct')
      .where({
        orderId: order.id,
        productId: data.productId,
      })
      .first()
    if (existing) {
      if (existing.quantity + data.quantity > 1000000) {
        throw new Error('Слишком большое количество')
      }
      await db('OrderProduct')
        .where({ id: existing.id })
        .update({ quantity: existing.quantity + data.quantity })
    } else {
      await db('OrderProduct').insert({
        ...snapshot,
        id: randomUUID(),
        orderId: order.id,
        quantity: data.quantity,
      })
    }
    return order
  })
}

export async function updateProduct(
  ctx: Context,
  orderId: string,
  productId: string,
  quantity: number,
): Promise<OrderRecord | undefined> {
  const user = requireUser(ctx)
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1000000) {
    throw new Error('Некорректное количество')
  }
  return ctx.db.transaction(async (db) => {
    await db('Order')
      .where({ id: orderId, userId: user.id, status: 'draft' })
      .update({ updatedAt: new Date() })
    const order = await ownedOrder(db, orderId, user.id, true)
    if (!order) {
      return undefined
    }
    const query = db('OrderProduct').where({ id: productId, orderId })
    const changed =
      quantity === 0 ? await query.delete() : await query.update({ quantity })
    if (!changed) {
      throw new Error('Позиция не найдена')
    }
    return order
  })
}

export interface SubmitOrderData {
  orderId: string
  fullname: string
  phone: string
  email?: string | null
  phoneAdditional?: string | null
  address?: string | null
  comment?: string | null
  delivery: 'courier' | 'pickup' | 'transport'
  payment: 'cash' | 'card' | 'invoice'
}

export async function submitOrder(
  ctx: Context,
  data: SubmitOrderData,
): Promise<OrderRecord> {
  const user = requireUser(ctx)
  if (!data.fullname.trim() || !data.phone.trim()) {
    throw new Error('Укажите имя и телефон')
  }
  if (
    !['courier', 'pickup', 'transport'].includes(data.delivery) ||
    !['cash', 'card', 'invoice'].includes(data.payment)
  ) {
    throw new Error('Некорректный способ доставки или оплаты')
  }
  if (data.delivery !== 'pickup' && !data.address?.trim()) {
    throw new Error('Укажите адрес доставки')
  }
  const email = data.email?.trim().toLowerCase() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Некорректный email')
  }
  return ctx.db.transaction(async (db) => {
    const [order] = await db<OrderRecord>('Order')
      .where({ id: data.orderId, userId: user.id, status: 'draft' })
      .update({
        status: 'submitted',
        submittedAt: Date.now(),
        updatedAt: new Date(),
        fullname: data.fullname.trim(),
        phone: data.phone.trim(),
        email,
        phoneAdditional: data.phoneAdditional?.trim() || null,
        address: data.address?.trim() || null,
        comment: data.comment?.trim() || null,
        delivery: data.delivery,
        payment: data.payment,
      })
      .returning('*')
    if (!order) {
      throw new Error('Заказ недоступен или уже отправлен')
    }
    if (!(await db('OrderProduct').where({ orderId: order.id }).first())) {
      throw new Error('Корзина пуста')
    }
    // Контакты заказа — снимок; введённый email не меняет владельца и профиль.
    return order
  })
}
