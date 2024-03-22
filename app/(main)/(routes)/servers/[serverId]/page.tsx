import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation"

// Esta pagina es la del servidor, la renderizamos con el serverId que sale de params. 
interface ServerIdPageProps {
    params: {
        serverId: string
    }
}

// El objeto params es propio de next. Cuando tenemos una ruta dinamica, se pasa el objeto params para desestruturarlo y de ahi podemos recuperar los parametros

async function ServerIdPage({
    params
}: ServerIdPageProps) {

    // Recuperamos el perfil
    const profile = await currentProfile()
    if (!profile) return redirectToSignIn();

    // Buscamos el servidor con el serverId de params.

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    // Buscamos el primer channel que tenga ese servidor

    const initialChannel = server?.channels[0]

    // Si no existe el nombre general (seria el channel principal) retornamos null

    if (initialChannel?.name !== "general") return null

    // Si existe, redireccionamos hacia la ruta.
    // La idea es siempre que ingresamos al servidor, redireccionar al canal general que seria el canal de entrada de todos los servidores. 

    return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}

export default ServerIdPage