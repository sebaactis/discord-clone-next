import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextApiRequest } from "next";

// Este utilidad es la misma que el current-profile, pero esta adaptado para usar con pages de next 12 (esto es para el socket)

export async function currentProfilePages(req: NextApiRequest) {
    const { userId } = getAuth(req);

    if (!userId) return null;

    const profile = await db.profile.findUnique({
        where: {
            userId
        }
    })

    return profile
}