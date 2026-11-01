import express, { type Express, type Request, type Response } from 'express'
import { logDevError } from '../errorLogging'
import { ChatStorage, chatStorage } from './storage'
import { createChatMessages } from './messages'
import { parsePageUrl } from './pageContext'
import { ChatAgent } from './agent/ChatAgent'
import { createAgentContext } from './agent/context'
import { authorizeAction } from '../schema/types/User/helpers/ensureVisitor'
import { AgentError } from './agent/errors'
import { createChatResponse } from './http/response'

type setupChatProps = {
  app: Express
  storage: ChatStorage | undefined
}

export const setupChat = ({
  app,
  storage = chatStorage,
}: setupChatProps): void => {
  const chatMessages = createChatMessages({ storage, sendNotify: undefined })
  const agent = new ChatAgent()
  app.post(
    '/api/chat',
    express.json({ limit: '256kb' }),
    async (req: Request, res: Response): Promise<void> => {
      res.setHeader('Cache-Control', 'no-store, no-transform')
      let chatId: string | undefined
      let token = req.get('dialog-token')
      if (
        typeof req.body?.message !== 'string' ||
        !req.body.message.trim() ||
        req.body.message.length > 16000
      ) {
        res.status(400).json({ error: 'Некорректное сообщение' })
        return
      }
      if (
        req.body.stream !== undefined &&
        typeof req.body.stream !== 'boolean'
      ) {
        res.status(400).json({ error: 'Некорректный режим ответа' })
        return
      }
      const stream: boolean = req.body.stream ?? true
      const pageUrl = parsePageUrl(req.get('X-Chat-Page-Url'))
      const origin =
        req.get('origin') || `${req.protocol}://${req.get('host') || 'unknown'}`
      const controller = new AbortController()
      const disconnect = (): void =>
        controller.abort(new Error('Клиент закрыл соединение'))
      res.on('close', disconnect)
      const delivery = createChatResponse(res, stream, controller.signal)
      try {
        const { token: userToken, user } = await authorizeAction({
          req,
          db: storage.database,
          currentUser: null,
        })
        if (token === undefined) {
          token = await storage.issue('chat', user.id)
        }
        res.setHeader('X-User-Token', userToken)
        res.setHeader('X-User-Id', user.id)
        res.setHeader('X-Dialog-Token', token)
        try {
          const verifiedId = await storage.verify(
            token ? `Bearer ${token}` : undefined,
          )
          if (
            verifiedId &&
            !(await storage.authorize(token, user?.id ?? null))
          ) {
            throw new AgentError('Диалог принадлежит другому пользователю', 403)
          }
        } catch (error) {
          if (error instanceof AgentError) {
            throw error
          }
          logDevError('chat.verify', error)
          throw new AgentError(
            error instanceof Error
              ? error.message
              : 'Не удалось проверить диалог',
            503,
            undefined,
            { cause: error },
          )
        }
        const context = createAgentContext({
          storage,
          pageUrl,
          authorization: `Bearer ${userToken}`,
          signal: controller.signal,
          endpoint: `http://127.0.0.1:${req.socket.localPort}/api`,
          receive: (message, context) =>
            chatMessages.receive(context.chatId, message, origin),
        })
        const result = await agent.run(req.body.message, token, context, {
          stream,
          onEvent: async (event, signal) => {
            if (event.type === 'authenticated') {
              chatId = event.chatId
            }
            await delivery.event(event, signal)
          },
          diagnostics: () => ({ headersSent: res.headersSent }),
        })
        try {
          await delivery.finish(result)
        } catch (error) {
          logDevError('chat.request', error, {
            chatId,
            answerId: result.id,
            stage: stream ? 'finish_stream' : 'finish_json',
            headersSent: res.headersSent,
            usage: result.usage,
          })
          throw error
        }
      } catch (error) {
        delivery.fail(error)
      } finally {
        res.off('close', disconnect)
        controller.abort()
      }
    },
  )
}
