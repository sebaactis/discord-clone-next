import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Ruta para poder desde un inviteCode, ingresar a un servidor.

interface InviteCodePageProps {
    params: {
        inviteCode: string
    }
}

// Recibimos por params de Next el inviteCode

export default async function InviteCodePage({
    params
}: InviteCodePageProps) {

    // Recuperamos el perfil logueado con clerk

    const profile = await currentProfile();

    // Si no existe el perfil, redirecciamos para el login. Si no existe el invite code, redireccionamos a la ruta inicial.

    if (!profile) return redirectToSignIn();
    if (!params.inviteCode) return redirect("/")

    // Buscamos el servidor que corresponda con el inviteCode, para verificar si el usuario ya es parte del servidor.

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    // Si existe el servidor, vamos a redireccionar al usuario a la ruta del servidor recuperado, lo que significa que el usuario ya pertenecia al servidor.

    if (existingServer) return redirect(`/servers/${existingServer.id}`);

    // Si el existingServer es false (lo que significa que el usuario no es parte del servidor) agregamos el perfil actual que esta usando el invite code, al servidor que le corresponda dicho invite. Para agregarlo al servidor de forma definitiva.

    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id,
                    }
                ]
            }
        }
    })

    // Si existe el servidor para actualizarlo, redireccionamos directamente al usuario a dicho server.

    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    return null
}