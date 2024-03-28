import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server"

// La siguiente url de API, es para crear un canal dentro de un servidor.

export async function POST(req: Request) {
    try {

        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfile();

        // Recuperamos los valores name y type que se enviaron en la request.
        const { name, type } = await req.json();

        // Recuperamos los searchParams de la URL entrante.
        const { searchParams } = new URL(req.url)

        // De los searchParams, extraemos el serverId.
        const serverId = searchParams.get("serverId")

        // Si no tenemos perfil, serverId, o si el nombre del canal es general, no avanzamos en la request.
        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!serverId) return new NextResponse("Server ID missing", { status: 400 })
        if (name === "general") return new NextResponse("Name cannot be general", { status: 400 })

        // Si tenemos todos los datos, vamos a hacer un update del server con el serverId, con la condicion de que dentro de los miembros, se encuentre el profile.id logueado, y que este sea ADMIN o MODERATOR del servidor.
        // Le pasamos la data que va a updatear de la db, y en la seccion de channels, creamos el nuevo canal, con el profile.id como owner, y el nombre y tipo del canal.
        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                },

            },
            data: {
                channels: {
                    create: {
                        profileId: profile.id,
                        name,
                        type
                    }
                }
            }

        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[CHANNEL_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}