import { GraphQLError } from 'graphql'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import { builder } from '../../../builder'
import { User } from '../types'
import {
  CurrentUserUpdateInput,
  UserUpdateDataInput,
  UserWhereUniqueInput,
} from '../inputs'
import { hashPassword } from '../helpers/auth'
import { validateRegistration } from '../helpers/validateRegistration'
import type { UserRecord } from '../interfaces'

builder.mutationField('updateCurrentUser', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: User,
    nullable: true,
    args: { data: t.arg({ type: CurrentUserUpdateInput, required: true }) },
    resolve: async (_root, { data }, ctx) => {
      if (!ctx.currentUser) {
        throw new GraphQLError('Authorization required', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }
      const { password, isAiAgent, email: rawEmail, ...profile } = data
      const email =
        rawEmail === undefined
          ? undefined
          : rawEmail?.trim().toLowerCase() || null
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Неверный формат email')
      }
      if (password) {
        const error = validateRegistration({
          email: email || ctx.currentUser.email || 'visitor@example.test',
          password,
        })
        if (error) {
          throw new Error(error)
        }
      }
      if (profile.content) {
        try {
          unified().use(remarkParse).use(remarkMdx).parse(profile.content)
        } catch {
          throw new GraphQLError('Invalid content', {
            extensions: { code: 'BAD_USER_INPUT' },
          })
        }
      }
      const changes: Partial<UserRecord> = { ...profile, updatedAt: new Date() }
      if (isAiAgent !== null && isAiAgent !== undefined) {
        changes.isAiAgent = isAiAgent
      }
      if (password) {
        changes.password = await hashPassword(password)
      }
      if (email !== undefined) {
        changes.email = email
      }
      const userId = ctx.currentUser.id
      try {
        return await ctx.db.transaction(async (db) => {
          if (
            email &&
            (await db('User')
              .whereRaw('lower(email) = ?', [email])
              .whereNot('id', userId)
              .first())
          ) {
            throw new Error('Email уже занят. Войдите в существующий аккаунт')
          }
          const [user] = await db<UserRecord>('User')
            .where('id', userId)
            .update(changes)
            .returning('*')
          // После персонализации ключ посетителя больше не даёт доступ к аккаунту.
          if (user?.email) {
            await db('VisitorSession').where({ userId }).delete()
          }
          return user ?? null
        })
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('UNIQUE constraint failed: User.email')
        ) {
          throw new Error('Email уже занят. Войдите в существующий аккаунт')
        }
        throw error
      }
    },
  }),
)
builder.mutationField('updateUser', (t) =>
  t.field({
    authScopes: { active: true },
    type: User,
    nullable: true,
    args: {
      data: t.arg({ type: UserUpdateDataInput, required: true }),
      where: t.arg({ type: UserWhereUniqueInput, required: true }),
    },
    resolve: async (_root, { data, where }, ctx) => {
      if (!ctx.currentUser?.sudo) {
        throw new GraphQLError('Access denied', {
          extensions: { code: 'FORBIDDEN' },
        })
      }
      if (!where.id) {
        throw new GraphQLError('id did not provided', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      if (where.id === ctx.currentUser.id) {
        throw new GraphQLError('Can not update self account via this method', {
          extensions: { code: 'FORBIDDEN' },
        })
      }
      const changes: Partial<UserRecord> = { updatedAt: new Date() }
      if (data.status !== null && data.status !== undefined) {
        changes.status = data.status
      }
      if (data.password) {
        changes.password = await hashPassword(data.password)
      }
      const [user] = await ctx
        .db<UserRecord>('User')
        .where('id', where.id)
        .update(changes)
        .returning('*')
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      return user
    },
  }),
)
