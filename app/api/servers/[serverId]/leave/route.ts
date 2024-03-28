import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

// Esta URL de API, es para irse de un servidor.
export async function PATCH(req: Request,
    { params }: { params: { serverId: string } }) {
    // Recuperamos el serverId de los params de Next.
    try {
        // Recuperamos el perfil de clerk
        const profile = await currentProfile();

        // Si no tenemos perfil o no tenemos serverId, no avanza la request.
        if (!profile) return new NextResponse("Unauthorized", { status: 401 });
        if (!params.serverId) return new NextResponse("Server ID missing", { status: 400 });

        // Hacemos un update del server, con el serverId, y que el profileId no sea el actual (seria el admin). Buscamos en los miembros el perfil del profileId, y lo eliminamos del server.
        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: {
                    not: profile.id
                },
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}