import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args)
        } catch (error) {
          // Veritabanı hatası logu
          logger.databaseError(error as Error, 'prisma_operation', {
            operation,
            model,
            args
          })
          throw error
        }
      },
    },
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 