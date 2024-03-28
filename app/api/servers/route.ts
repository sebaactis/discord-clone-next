import { v4 as uuidv4 } from "uuid"
import { NextResponse } from "next/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client";

// La siguiente URL de API, se encarga de crear un servidor.
export async function POST(req: Request) {
    try {
        // Recupermaos el name y el imageUrl del body de la request.
        const { name, imageUrl } = await req.json();

        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfile();

        // Si no tenemos perfil, no avanza la request
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Creamos el server en la DB, con el profileId, el nombre, el imageUrl, un invite code random generado, creamos el canal general por defecto con el nombre general y el profileId, y los miembros por defecto con el profileId actual como ADMIN.
        const server = await db.server.create({
            data: {
                profileId: profile.id,
                name,
                imageUrl,
                inviteCode: uuidv4(),
                channels: {
                    create: [
                        { name: "general", profileId: profile.id }
                    ]
                },
                members: {
                    create: [
                        { profileId: profile.id, role: MemberRole.ADMIN }
                    ]
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[SERVERS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }

}
