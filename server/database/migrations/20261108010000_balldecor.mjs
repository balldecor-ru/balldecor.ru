/** @param {import('knex').Knex} db */
export async function up(db) {
  // Существующая SQLite уже содержит расширения BallDecor.
  const sqlite = db.client.config.client === 'better-sqlite3'
  if (!(await db.schema.hasColumn('KBConcept', 'hast'))) {
    await db.schema.alterTable('KBConcept', (t) => {
      for (const field of ['hast', 'tv']) {
        t.specificType(
          field,
          sqlite
            ? `TEXT CHECK (${field} IS NULL OR json_valid(${field}))`
            : `TEXT CHECK (${field} IS NULL OR CAST(${field} AS jsonb) IS NOT NULL)`,
        )
      }
      t.text('contentMode')
        .notNullable()
        .defaultTo('default')
        .checkIn(['hast', 'default'])
      t.boolean('searchable').notNullable().defaultTo(true)
      t.integer('packCount')
      t.text('size')
      t.boolean('available')
      t.decimal('price', 10, 2)
    })
  }
  if (await db.schema.hasTable('Order')) return
  await db.schema.createTable('VisitorSession', (t) => {
    t.text('keyHash').primary().notNullable()
    t.text('userId')
      .notNullable()
      .references('id')
      .inTable('User')
      .onDelete('CASCADE')
    t.index('userId')
  })
  await db.schema.createTable('Order', (t) => {
    t.text('id').primary().notNullable()
    t.text('userId').notNullable().references('id').inTable('User')
    t.text('status')
      .notNullable()
      .defaultTo('draft')
      .checkIn(['draft', 'submitted'])
    for (const field of ['createdAt', 'updatedAt']) {
      if (sqlite) t.bigInteger(field).notNullable()
      else t.timestamp(field, { useTz: true }).notNullable()
    }
    t.bigInteger('submittedAt')
    for (const field of [
      'fullname',
      'email',
      'phone',
      'phoneAdditional',
      'address',
      'comment',
      'delivery',
      'payment',
    ])
      t.text(field)
    t.index(['userId', 'status', 'updatedAt'])
  })
  await db.schema.createTable('OrderProduct', (t) => {
    t.text('id').primary().notNullable()
    t.text('orderId')
      .notNullable()
      .references('id')
      .inTable('Order')
      .onDelete('CASCADE')
    t.text('productId').notNullable()
    t.text('name').notNullable()
    t.text('image')
    t.text('uri')
    t.integer('price').notNullable()
    t.check('?? >= 0', ['price'])
    t.integer('oldPrice')
    t.check('?? IS NULL OR ?? >= 0', ['oldPrice', 'oldPrice'])
    t.integer('quantity').notNullable().checkBetween([1, 1000000])
    t.unique(['orderId', 'productId'])
  })
  await db.schema.alterTable('ChatDialogue', (t) => {
    t.text('userId').references('id').inTable('User')
    t.index(['userId', 'createdAt'])
  })
  await db.schema.createTable('SearchLog', (t) => {
    t.text('id').primary().notNullable()
    if (sqlite) t.bigInteger('createdAt').notNullable()
    else t.timestamp('createdAt', { useTz: true }).notNullable()
    t.text('query').notNullable()
    t.text('productId')
    t.text('parameters').notNullable()
    t.text('results').notNullable()
    t.integer('total').notNullable()
    t.integer('durationMs').notNullable()
    t.text('error')
    t.text('type')
      .notNullable()
      .defaultTo('SEARCH')
      .checkIn(['SEARCH', 'RECOMMENDATIONS'])
    t.index('createdAt')
    t.index(['productId', 'createdAt'])
    t.index(['type', 'createdAt'])
  })
}

export async function down() {
  throw new Error(
    'Откат схемы BallDecor запрещён: восстановите резервную копию',
  )
}
