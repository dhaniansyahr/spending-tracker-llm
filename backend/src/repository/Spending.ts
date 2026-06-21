import { prisma } from "@/pkg/prisma/index.js"
import { ulid } from "ulid"
import * as EzFilter from "@nodewave/prisma-ezfilter"
import type { CreateSpendingDTO, UpdateSpendingDTO } from "@/entity/Spending.js"

export async function getAll(filters: EzFilter.FilteringQuery, tx = prisma) {
  const queryBuilder = new EzFilter.BuildQueryFilter()
  const usedFilters = queryBuilder.build(filters)

  const [items, totalData] = await Promise.all([
    tx.spending.findMany(usedFilters.query as any),
    tx.spending.count({ where: usedFilters.query.where }),
  ])

  let totalPage = 1
  if (totalData > usedFilters.query.take) totalPage = Math.ceil(totalData / usedFilters.query.take)

  return { entries: items, totalData, totalPage }
}

export async function getById(id: string, tx = prisma) {
  return tx.spending.findUnique({ where: { id } })
}

export async function create(data: CreateSpendingDTO, tx = prisma) {
  return tx.spending.create({
    data: {
      id: ulid(),
      title: data.title,
      amount: data.amount,
      category: data.category,
      source: data.source ?? "MANUAL",
      note: data.note,
      receiptUrl: data.receiptUrl,
      rawText: data.rawText,
      date: data.date ? new Date(data.date) : new Date(),
    },
  })
}

export async function update(id: string, data: UpdateSpendingDTO, tx = prisma) {
  return tx.spending.update({
    where: { id },
    data: data
  })
}

export async function deleteById(id: string, tx = prisma) {
  return tx.spending.delete({ where: { id } })
}
