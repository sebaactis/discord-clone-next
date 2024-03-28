import { v4 as uuidv4 } from "uuid"
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

// Esta URL de API es para actualizar el invite code del servidor.
export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {

    // Recuperamos el serverId de los params de Next.
    try {

        // Recuperamos el perfil de clerk.
        const profile = await currentProfile();

        // Si no existe el perfil o no esta el serverId, no avanza la request
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        if (!params.serverId) {
            return new NextResponse("Server ID Missing", { status: 400 })
        }

        // Hacemos un update del server con el serverId y el profile.id, y actualizamos la data del inviteCode generando un nuevo code con el uuidv4.
        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
            data: {
                inviteCode: uuidv4()
            }
        })

        return NextResponse.json(server)

    } catch (error) {

        console.log("[SERVER_ID]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}