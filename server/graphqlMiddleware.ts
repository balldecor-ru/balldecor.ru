import type { Express } from 'express'
import type { Server } from 'node:http'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import cors from 'cors'
import express from 'express'

import { schema } from './schema'
import { knexClient } from './knex'
import type { Context } from './schema/builder'

export async function setupGraphqlMiddleware(
  app: Express,
  httpServer: Server,
): Promise<() => Promise<void>> {
  const apolloServer = new ApolloServer<Context>({
    schema,
    introspection: true,
    includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    formatError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('GraphQL Error', error)
      }
      return error
    },
  })

  await apolloServer.start()

  app.use(
    '/api',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async () => ({ knex: knexClient }),
    }),
  )

  // eslint-disable-next-line no-console
  console.log('GraphQL middleware ready at /api')

  return async () => {
    try {
      await apolloServer.stop()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (
        !message.includes('The server is not running') &&
        !message.includes('Server is not running')
      ) {
        throw err
      }
    } finally {
      await knexClient.destroy()
    }
  }
}
