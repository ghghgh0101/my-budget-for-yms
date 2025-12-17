// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ['query'], // 개발 중 쿼리 로그를 확인하기 위해
	})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma