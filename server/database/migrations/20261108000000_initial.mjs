/** @param {import('knex').Knex} db */
export async function up(db) {
  // Adopt the existing SQLite schema after the frozen legacy upgrader has run.
  if (
    db.client.config.client === 'better-sqlite3' &&
    (await db.schema.hasTable('User'))
  ) {
    const [{ user_version: version }] = await db.raw('PRAGMA user_version')
    if (version !== 11) throw new Error('Unsupported legacy database schema')
    return
  }
  const sqlite = db.client.config.client === 'better-sqlite3'
  /** @param {import('knex').Knex.CreateTableBuilder} table */
  const id = (table) => table.text('id').primary().notNullable()
  /** @param {import('knex').Knex.CreateTableBuilder} table
   * @param {boolean} [updated] */
  const dates = (table, updated = false) => {
    for (const field of updated ? ['createdAt', 'updatedAt'] : ['createdAt']) {
      if (sqlite)
        table
          .bigInteger(field)
          .notNullable()
          .defaultTo(db.raw('(unixepoch() * 1000)'))
      else
        table
          .timestamp(field, { useTz: true })
          .notNullable()
          .defaultTo(db.fn.now())
    }
  }
  /** @param {import('knex').Knex.CreateTableBuilder} table
   * @param {string} field
   * @param {string} target */
  const ref = (table, field, target) =>
    table.text(field).references('id').inTable(target)
  await db.schema.createTable('User', (t) => {
    id(t)
    dates(t, true)
    t.text('status')
      .notNullable()
      .defaultTo('active')
      .checkIn(['newbie', 'active', 'blocked'])
    t.text('username').unique()
    t.text('email').unique()
    for (const field of ['password', 'fullname', 'image', 'intro', 'content'])
      t.text(field)
    t.boolean('sudo').notNullable().defaultTo(false).checkIn([true, false])
    t.boolean('isAiAgent').notNullable().defaultTo(false).checkIn([true, false])
    ref(t, 'referrerId', 'User')
  })
  await db.schema.createTable('Token', (t) => {
    id(t)
    dates(t)
    if (sqlite) t.bigInteger('expiredAt')
    else t.timestamp('expiredAt', { useTz: true })
    ref(t, 'userId', 'User')
    t.index('userId')
  })
  await db.schema.createTable('EthAccount', (t) => {
    id(t)
    dates(t, true)
    t.text('address').notNullable().unique()
    ref(t, 'userId', 'User').unique()
  })
  await db.schema.createTable('TelegramAccount', (t) => {
    id(t)
    dates(t)
    t.text('photo_url')
    t.text('username')
    t.text('externalKey').unique()
    ref(t, 'userId', 'User').notNullable().unique()
  })
  await db.schema.createTable('Balance', (t) => {
    id(t)
    dates(t, true)
    t.double('amount').notNullable().defaultTo(0)
    ref(t, 'userId', 'User').notNullable().unique()
  })
  await db.schema.createTable('File', (t) => {
    id(t)
    dates(t, true)
    t.text('path').notNullable().unique()
    for (const field of ['filename', 'name', 'description', 'content'])
      t.text(field)
    t.text('mimetype').notNullable()
    t.text('encoding').notNullable()
    t.text('hash').unique()
    t.bigInteger('size')
    ref(t, 'createdById', 'User')
  })
  await db.schema.createTable('KBConcept', (t) => {
    id(t)
    dates(t, true)
    t.text('name').notNullable()
    t.text('uri').unique()
    for (const field of [
      'type',
      'description',
      'intro',
      'content',
      'image',
      'code',
      'path',
    ])
      t.text(field)
    ref(t, 'createdById', 'User').notNullable()
    ref(t, 'parentId', 'KBConcept')
    ref(t, 'rootId', 'KBConcept')
    t.double('quality').notNullable().defaultTo(0)
    t.text('visibility')
      .notNullable()
      .defaultTo('public')
      .checkIn(['public', 'hidden', 'unpublished'])
    t.text('data')
    t.check(
      sqlite
        ? '?? IS NULL OR json_valid(??)'
        : '?? IS NULL OR CAST(?? AS jsonb) IS NOT NULL',
      ['data', 'data'],
    )
    t.double('lat')
    t.double('lng')
    t.index(['visibility', 'updatedAt'])
  })
  await db.schema.createTable('SiteRoute', (t) => {
    id(t)
    t.text('path').notNullable().unique()
    ref(t, 'kBConceptId', 'KBConcept').notNullable().onDelete('CASCADE')
    t.index('kBConceptId')
  })
  await db.schema.createTable('KBConceptFile', (t) => {
    id(t)
    dates(t)
    ref(t, 'fileId', 'File').notNullable().onDelete('CASCADE')
    ref(t, 'kBConceptId', 'KBConcept').notNullable().onDelete('CASCADE')
    t.unique(['kBConceptId', 'fileId'])
  })
  await db.schema.createTable('ChatSetting', (t) => {
    id(t)
    t.text('value').notNullable()
  })
  await db.schema.createTable('ChatDialogue', (t) => {
    t.text('chatId').primary().notNullable()
    dates(t)
    t.text('channel')
      .notNullable()
      .defaultTo('chat')
      .checkIn(['chat', 'feedback'])
    t.index(['createdAt', 'chatId'])
  })
  await db.schema.createTable('ChatMessage', (t) => {
    t.increments('sequence')
    t.text('chatId')
      .notNullable()
      .references('chatId')
      .inTable('ChatDialogue')
      .onDelete('CASCADE')
    t.text('id')
    t.text('role')
      .notNullable()
      .checkIn(['user', 'assistant', 'tool_call', 'tool'])
    t.integer('indexed').notNullable().checkIn([0, 1])
    t.text('payload').notNullable()
    t.check(sqlite ? 'json_valid(??)' : 'CAST(?? AS jsonb) IS NOT NULL', [
      'payload',
    ])
    t.index(['chatId', 'sequence'])
    t.index(['chatId', 'id'])
    t.index(['indexed', 'sequence'])
  })
  await db.schema.createTable('Transaction', (t) => {
    id(t)
    dates(t)
    t.text('type').notNullable().checkIn(['TopUp', 'TransferIn', 'TransferOut'])
    t.double('amount').notNullable()
    t.text('title')
    ref(t, 'userId', 'User').notNullable()
    ref(t, 'balanceId', 'Balance').notNullable()
    ref(t, 'parentId', 'Transaction')
    t.index(['userId', 'createdAt', 'id'])
    t.index('parentId')
  })
  await db.schema.createTable('EthTransaction', (t) => {
    id(t)
    t.bigInteger('chainId').notNullable()
    t.text('txHash').notNullable()
    ref(t, 'transactionId', 'Transaction').notNullable().unique()
    t.unique(['chainId', 'txHash'])
  })
  await db.schema.createTable('ClientCertificateAccount', (t) => {
    t.text('fingerprint').primary().notNullable()
    ref(t, 'userId', 'User').notNullable()
  })
  await db.schema.createTable('PageError', (t) => {
    t.text('url').primary().notNullable()
    t.bigInteger('lastOccurredAt').notNullable()
    t.integer('count').notNullable().defaultTo(1)
    t.text('status').checkIn(['Review', 'Resolved'])
    t.integer('statusCode').checkBetween([400, 599])
    t.index('lastOccurredAt')
  })
  await db.schema.createTable('PageErrorEvent', (t) => {
    t.text('eventKey').primary().notNullable()
    t.text('url')
      .notNullable()
      .references('url')
      .inTable('PageError')
      .onDelete('CASCADE')
    t.index('url')
  })
}

export async function down() {
  throw new Error(
    'The initial schema cannot be rolled back: restore a backup instead',
  )
}
