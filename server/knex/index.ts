import 'dotenv/config'
import knex, { type Knex } from 'knex'

const mysqlUrl: string | undefined = process.env.MYSQL_URL
if (!mysqlUrl) {
  throw new Error('Не задана переменная MYSQL_URL')
}

export const knexClient: Knex = knex({
  client: 'mysql2',
  connection: mysqlUrl,
  pool: { min: 0, max: 10 },
})
