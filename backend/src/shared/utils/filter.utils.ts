import type { PrismaWhereCondition } from "@nodewave/prisma-ezfilter"

export function addCustomWhere(
  base: PrismaWhereCondition,
  ...conditions: PrismaWhereCondition[]
): PrismaWhereCondition {
  return conditions.reduce((acc, condition) => {
    if (!condition || Object.keys(condition).length === 0) return acc
    const existingAnd = Array.isArray(acc.AND) ? acc.AND : acc.AND ? [acc.AND] : []
    existingAnd.push(condition)
    acc.AND = existingAnd
    return acc
  }, base)
}
