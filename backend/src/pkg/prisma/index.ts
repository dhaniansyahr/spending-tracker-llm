import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as Graceful from "@/pkg/graceful/index.js";
import { ulidExtension } from "./extension.js";

export class PrismaInstance {
  private static instance: PrismaInstance;
  private prisma: PrismaClient;

  private constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const adapter = new PrismaPg(pool);

    const base = new PrismaClient({ adapter } as any);
    this.prisma = base.$extends(ulidExtension) as unknown as PrismaClient;

    Graceful.registerProcessForShutdown("prisma", async () => {
      await this.prisma.$disconnect();
      await pool.end();
    });
  }

  public static getInstance(): PrismaInstance {
    if (!PrismaInstance.instance) {
      PrismaInstance.instance = new PrismaInstance();
    }
    return PrismaInstance.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}

export const prisma: PrismaClient = PrismaInstance.getInstance().getPrismaClient();

export async function withTransaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn as any) as Promise<T>;
}
