import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server"

// La siguiente URL de API, sirve para borrar un canal o para editarlo.

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string } }) {

    // Vamos a recuperar el channelId de los params de Next.    
    try {

        // Recuperamos el perfil de clerk.
        const profile = await currentProfile();

        // Recuperamos los searchParams de la URL entrante.
        const { searchParams } = new URL(req.url)

        // Recuperamos el serverId de los searchParams
        const serverId = searchParams.get("serverId");

        // Si no tenemos perfil, serverId, o channelId, no avanza la request.
        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!serverId) return new NextResponse("Server ID Missing", { status: 400 })
        if (!params.channelId) return new NextResponse("Channel ID Missing", { status: 400 })


        // Actualizamos e lserver con el serverId recuperado, y si dentro de los miembros, esta el profile.id conectado, y tiene rol ADMIN o MODERATOR.
        // Y le pasamos la data haciendo un delete con el channelId, y con la condicion que el canal no sea "general".
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
                }
            },
            data: {
                channels: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[CHANNEL_ID_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string } }) {
    // Recuperamos los params desde Next.
    try {

        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfile();

        // Recuperamos el nombre y tipo de canal de la request
        const { name, type } = await req.json();

        // Recuperamos los searchParams de la url entrante.
        const { searchParams } = new URL(req.url)

        // De los searchParams, sacamos el serverId
        const serverId = searchParams.get("serverId");

        // Si no tenemos perfil, serverId o channelId, y si el nombre del canal es general, no avanza la request.
        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!serverId) return new NextResponse("Server ID Missing", { status: 400 })
        if (!params.channelId) return new NextResponse("Channel ID Missing", { status: 400 })
        if (name === "general") return new NextResponse("Name cannot be 'general' ", { status: 400 })

        // Actualizamos el server con el serverId, y si dentro de los miembros esta el perfil actual logueado, y el role es ADMIN o MODERATOR.
        // Y le pasamos la data para hacer un update de los channels, con el channelId, y que no sea el "general". Dentro de esta le pasamos el name y el type.
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
                }
            },
            data: {
                channels: {
                    update: {
                        where: {
                            id: params.channelId,
                            NOT: {
                                name: "general"
                            }
                        },
                        data: {
                            name,
                            type
                        }
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}