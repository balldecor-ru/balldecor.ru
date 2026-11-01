import { requireUser } from '../../Custom/Order/helpers/access'
import { builder } from 'server/schema/builder'
import { chatStorage } from 'server/chat/storage'
import { ChatDialogue } from '../types'

builder.queryField('chatDialogues', (t) =>
  t.field({
    authScopes: { sudo: true },
    type: [ChatDialogue],
    nullable: false,
    resolve: async (_root, _args) => {
      return chatStorage.listDialogues()
    },
  }),
)

// Пользователь получает только собственные диалоги.
builder.queryField('myChatDialogues', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: [ChatDialogue],
    nullable: false,
    resolve: async (_, __, ctx) => {
      const rows = await ctx
        .db<{
          userId: string
          chatId: string
          createdAt: number
          channel: 'chat' | 'feedback'
        }>('ChatDialogue')
        .where({ userId: requireUser(ctx).id })
        .orderBy('createdAt', 'desc')
        .orderBy('chatId')
      return rows.map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt).toISOString(),
      }))
    },
  }),
)
