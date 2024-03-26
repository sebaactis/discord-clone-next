import { PrismaClient } from "@prisma/client"

// Aca tendremos la instancia de db de prims que utilizaremos en toda la app
// Lo importante de entender aca es que vamos a setearlo de esta manera para no crear instancias innecesarias del PrismaClient, y cuando estamos en entornos de desarrollo crear solo una.

declare global {
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;