import { logDevError } from '../../../../errorLogging'
import { builder } from '../../../builder'
import { ChatStorage } from '../../../../chat/storage'

import { requireUser } from '../../Custom/Order/helpers/access'
import { ChatMessageCreateTokenDataInput } from '../inputs'

builder.mutationField('createChatToken', (t) =>
  t.string({
    nullable: false,
    authScopes: { authenticated: true },
    args: {
      data: t.arg({ type: ChatMessageCreateTokenDataInput, required: true }),
    },
    resolve: async (_root, { data }, ctx): Promise<string> => {
      try {
        return await new ChatStorage(ctx.db).issue(
          data.channel ?? 'chat',
          requireUser(ctx).id,
        )
      } catch (error) {
        logDevError('chat.create_token', error)
        throw new Error('Не удалось создать чат', { cause: error })
      }
    },
  }),
)
