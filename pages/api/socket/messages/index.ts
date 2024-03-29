import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

// La siguiente URL de API, es para crear los mensajes de un chat y emitir el evento socket para que todos puedan verlo en tiempo real.

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    // Si el metodo no es POST, no avanza la request.
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {

        // Recuperamos el perfil de clerk.
        const profile = await currentProfilePages(req)

        // Recuperamos el content y el fileUrl del body de la request.
        const { content, fileUrl } = req.body;

        // Recuperamos el serverId y el channelId de la query de la URL.
        const { serverId, channelId } = req.query

        // Si no tenemos perfil, serverId, channelId o contenido, no avanza la request.
        if (!profile) return res.status(401).json({ message: "Unautorized" })
        if (!serverId) return res.status(400).json({ message: "Server ID missing" })
        if (!channelId) return res.status(400).json({ message: "Channel ID missing" })
        if (!content) return res.status(400).json({ message: "Content missing" })

        // Buscamos el server con el serverId, y que dentro de los miembros este nuestro perfil actual.
        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        })

        // Si no existe el server, no avanza la request.
        if (!server) return res.status(404).json({ message: "Server Not Found" })

        // Buscamos el canal con el channelId y el serverId
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string
            }
        })

        // Si no existe el canal, no avanza la request.
        if (!channel) return res.status(404).json({ message: "Channel Not Found" })

        // Buscamos el miembro actual logueado.
        const member = server.members.find((member) => member.profileId === profile.id)

        // Si no existe el miembro, no avanza la request.
        if (!member) return res.status(404).json({ message: "Member Not Found" })

        // Creamos el mensaje con los datos de content, fileUrl, channelId y el memberId.
        const message = await db.message.create({
            data: {
                content,
                fileUrl,
                channelId: channelId as string,
                memberId: member.id
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        // Creamos una key con el channelId para emitir el mensaje socket.
        const channelKey = `chat:${channelId}:messages`

        // Emitimos el mensaje socket con la key channelKey creada, y como contenido enviamos el mensaje, y lo metemos en el objeto res.socket.server.io.
        res?.socket?.server?.io?.emit(channelKey, message)

        return res.status(200).json(message)

    } catch (error) {
        console.log("[MESSAGES_POST]", error)
        return res.status(500).json({ message: "Internal Error" })
    }
}