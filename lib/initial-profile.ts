import { currentUser, redirectToSignIn } from "@clerk/nextjs"
import { db } from "@/lib/db"

// La siguiente utilidad servira para setear el perfil inicial.

export async function initialProfile() {

    // Vamos a recuperar el current user que tenemos en clerk.

    const user = await currentUser();

    // Si no existe, redireccionamos para loguearnos.

    if (!user) {
        return redirectToSignIn();
    }

    // Buscamos en nuestra base que tengamos un perfil que coincida con el user que tiene clerk.

    const profile = await db.profile.findUnique({
        where: {
            userId: user.id
        }
    })

    // Si hay perfil, lo retornamos.

    if (profile) {
        return profile
    }

    // Si no tenemos perfil, debemos crearlo en la base de datos nuestra, y lo retornamos una vez creado.

    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    })

    return newProfile
} 