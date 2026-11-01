import type { Knex } from 'knex'
import { sendEmail as sendMail } from '../../../ChatMessage/helpers/sendEmail'
import type { OrderProductRecord, OrderRecord } from '../interfaces'

export async function notifyOrder(db: Knex, order: OrderRecord): Promise<void> {
  try {
    const products = await db<OrderProductRecord>('OrderProduct').where({
      orderId: order.id,
    })
    const amount = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    })
    const lines = products.map(
      (item) =>
        `${item.name}: ${item.quantity} × ${amount.format(item.price / 100)}`,
    )
    const delivery = {
      courier: 'Доставка',
      pickup: 'Самовывоз',
      transport: 'Срочная доставка',
    }
    const payment = {
      cash: 'Наличными при получении',
      card: 'Картой при получении',
      invoice: 'По счёту',
    }
    const text = [
      `Заказ ${order.id}`,
      ...lines,
      `Итого: ${amount.format(products.reduce((total, item) => total + item.price * item.quantity, 0) / 100)}`,
    ].join('\n')
    const contacts = [
      order.fullname,
      order.phone,
      order.phoneAdditional,
      order.email,
      order.address,
      delivery[order.delivery as keyof typeof delivery],
      payment[order.payment as keyof typeof payment],
      order.comment,
    ]
      .filter(Boolean)
      .join('\n')
    const recipients = (
      process.env.ORDER_ADMIN_EMAILS ||
      process.env.MAIL_TO ||
      process.env.MAIL_FROM ||
      ''
    )
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)
    const deliveries = recipients.map((to) =>
      sendMail({
        to,
        subject: `Получен заказ ${order.id}`,
        text: `${text}\n\n${contacts}`,
      }),
    )
    if (order.email) {
      deliveries.push(
        sendMail({ to: order.email, subject: 'Данные вашего заказа', text }),
      )
    }
    const results = await Promise.allSettled(deliveries)
    if (results.some((result) => result.status === 'rejected')) {
      throw new Error(`Не все уведомления заказа ${order.id} доставлены`)
    }
  } catch (error) {
    console.error('Ошибка отправки уведомлений о заказе SQLite:', error)
  }
}
