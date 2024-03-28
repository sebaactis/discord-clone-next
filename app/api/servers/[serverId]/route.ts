import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

// Esta URL de la API, es para editar o eliminar un servidor.

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    // Recuperamos el serverId de los params de Next
    try {
        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfile();

        // Recuperamos el name y el imageUrl del body del json.
        const { name, imageUrl } = await req.json();

        // Si no existe el perfil no avanza la request
        if (!profile) return new NextResponse("Unauthorized", { status: 401 });

        // Hacemos un update con el serverId y el profile.id, y le mandamos el nombre y el imageUrl nuevos.
        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name,
                imageUrl
            }
        })

        return NextResponse.json(server)


    } catch (error) {
        console.log("[SERVER_ID_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    // Recuperamos el serverId de los params de Next
    try {
        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfile();

        // Si no existe el perfil, no avanza la request
        if (!profile) return new NextResponse("Unauthorized", { status: 401 });

        // Borramos el server con el serverId y el profile.id
        const server = await db.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id
            }
        })

        return NextResponse.json(server)


    } catch (error) {
        console.log("[DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}