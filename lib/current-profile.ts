import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

// La siguiente utilidad servira para retornar el perfil actual que este logueado.

export async function currentProfile() {

    // Recuperamos el userId desde clerk.

    const { userId } = auth();

    // Si no existe retornamos null

    if (!userId) return null;

    // Si existe, buscamos el perfil en la base de datos y lo retornamos.

    const profile = await db.profile.findUnique({
        where: {
            userId
        }
    })

    return profile
}