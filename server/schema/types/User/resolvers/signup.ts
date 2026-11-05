import { insertUser } from '../helpers/insertUser'
import { builder, type Context } from '../../../builder'
import { AuthPayload, UserSignupDataInput } from '../inputs'
import { createToken, hashPassword } from '../helpers/auth'
import { checkReferrerToken } from '../helpers/checkReferrerToken'
import { validateRegistration } from '../helpers/validateRegistration'
import type { UserRecord } from '../interfaces'

export async function signup(
  data: typeof UserSignupDataInput.$inferInput,
  ctx: Context,
): Promise<{ success: boolean; message: string | null; token: string }> {
  const currentUser = ctx.currentUser
  if (
    currentUser &&
    (currentUser.email ||
      currentUser.username ||
      currentUser.password ||
      currentUser.status === 'blocked')
  ) {
    throw new Error('Вы уже вошли в учётную запись')
  }
  const username = data.username?.trim() || null
  const email = data.email?.trim().toLowerCase() || null
  const error = validateRegistration({
    username,
    email,
    password: data.password,
  })
  if (error) {
    throw new Error(error)
  }
  const status = process.env.USER_DEFAULT_STATUS || 'active'
  if (!['active', 'newbie', 'blocked'].includes(status)) {
    throw new Error('Некорректный USER_DEFAULT_STATUS')
  }
  const { referrerToken, ...profile } = data
  const referrerId = await checkReferrerToken(referrerToken, ctx.db)
  try {
    return await ctx.db.transaction(async (db) => {
      let user: UserRecord
      if (currentUser) {
        const visitor = await db('VisitorSession')
          .where({ userId: currentUser.id })
          .first()
        if (!visitor) {
          throw new Error('Вы уже вошли в учётную запись')
        }
        const [registered] = await db<
          UserRecord & { referrerId: string | null }
        >('User')
          .where({ id: currentUser.id })
          .whereNull('email')
          .whereNull('username')
          .whereNull('password')
          .update({
            username,
            email,
            fullname: data.fullname?.trim() || currentUser.fullname,
            password: await hashPassword(data.password),
            referrerId,
            updatedAt: new Date(),
          })
          .returning('*')
        if (!registered) {
          throw new Error('Вы уже вошли в учётную запись')
        }
        user = registered
        await db('VisitorSession').where({ userId: user.id }).delete()
      } else {
        user = await insertUser(db, { ...profile, email }, referrerId)
      }
      return {
        success: true,
        message: null,
        token: await createToken(user, db),
      }
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed: User.username')
    ) {
      throw new Error('Логин уже занят')
    }
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed: User.email')
    ) {
      throw new Error('Электронная почта уже зарегистрирована')
    }
    throw error
  }
}
builder.mutationField('signup', (t) =>
  t.field({
    type: AuthPayload,
    args: { data: t.arg({ type: UserSignupDataInput, required: true }) },
    resolve: (_root, { data }, ctx) => signup(data, ctx),
  }),
)
