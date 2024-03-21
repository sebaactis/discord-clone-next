import InitialModal from "@/components/modals/initial-modal"
import { db } from "@/lib/db"
import { initialProfile } from "@/lib/initial-profile"
import { redirect } from "next/navigation"

// Nuestra ruta inicial

export default async function SetupPage() {
    
    // Verificamos el perfil que esta logueado (clerk)
    const profile = await initialProfile()

    // Buscamos el primer servidor que coincida en sus miembros con el perfil logueado
    const server = await db.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    // Si existe redireccionamos al usuario al chat de dicho servidor

    if (server) {
        return redirect(`/servers/${server.id}`)
    }

    // Sino, retornamos el InitialModal para crear un servidor nuevo

    return (
        <InitialModal />
    )
}