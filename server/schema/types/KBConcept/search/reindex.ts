import 'server/env'
import { db } from 'server/database'
import { reindexConcepts } from './indexer'
try {
  await reindexConcepts(db)
} catch (error) {
  console.error('Не удалось обновить поисковый индекс:', error)
  process.exitCode = 1
} finally {
  await db.destroy()
}
