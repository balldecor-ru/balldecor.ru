import { conceptUri } from '../server/schema/types/KBConcept/helpers/uri'
import { findConcept } from '../server/schema/types/KBConcept/helpers/queries'
import '../server/env'
import { parseArgs } from 'node:util'
import { ChatAgent } from '../server/chat/agent/ChatAgent'
import { createAgentContext } from '../server/chat/agent/context'

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      token: { type: 'string' },
      endpoint: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    process.stdout.write(
      'Usage: npm run chat -- [--endpoint URL] [--token TOKEN] "Message"\n',
    )
    return
  }
  const message = positionals.join(' ').trim()
  if (!message) {
    throw new Error('Provide a message. Use --help for usage.')
  }
  const { chatStorage } = await import('../server/chat/storage')
  const { db, migrateDatabase } = await import('../server/database')
  const controller = new AbortController()
  const cancel = (): void => controller.abort(new Error('Interrupted'))
  process.once('SIGINT', cancel)
  process.once('SIGTERM', cancel)
  try {
    await migrateDatabase(db)
    const token = values.token ?? (await chatStorage.issue())
    if (values.token === undefined) {
      console.error(`Token: ${token}`)
    }
    const context = createAgentContext({
      storage: chatStorage,
      endpoint: values.endpoint,
      signal: controller.signal,
      readSitePage: async (uri) => {
        const page = await findConcept({ db, currentUser: null }, { uri })
        return page ? { ...page, uri: await conceptUri(db, page) } : null
      },
    })
    await new ChatAgent().run(message, token, context, {
      onEvent: (event) => {
        if (event.type === 'authenticated') {
          console.error(`Dialogue: ${event.chatId}`)
        }
        if (event.type === 'content') {
          process.stdout.write(event.content)
        }
      },
    })
    process.stdout.write('\n')
  } finally {
    process.removeListener('SIGINT', cancel)
    process.removeListener('SIGTERM', cancel)
    await db.destroy()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
