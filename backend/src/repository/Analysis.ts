import { prisma } from "@/pkg/prisma/index.js"

export async function getByDateRange(dateFrom: string, dateTo: string, tx = prisma) {
  const from = new Date(`${dateFrom.split("T")[0]}T00:00:00.000Z`)
  const to = new Date(`${dateTo.split("T")[0]}T23:59:59.999Z`)

  return tx.spending.findMany({
    where: {
      date: { gte: from, lte: to },
    },
    orderBy: { amount: "desc" },
  })
}
