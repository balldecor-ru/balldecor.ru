/** @param {import('knex').Knex} db */
export async function up(db) {
  await db.raw(
    `WITH RECURSIVE subtree(id) AS (
      SELECT id FROM "KBConcept" WHERE id = ?
      UNION
      SELECT child.id
      FROM "KBConcept" AS child
      JOIN subtree ON child."parentId" = subtree.id
    )
    UPDATE "KBConcept"
    SET visibility = ?, searchable = ?
    WHERE id IN (SELECT id FROM subtree)`,
    ['old:page:2348', 'hidden', false],
  )
}

export async function down() {
  throw new Error(
    'Откат скрытия концепта old:page:2348 и его потомков запрещён: восстановите исходные значения из резервной копии',
  )
}
