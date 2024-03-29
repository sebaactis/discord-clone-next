import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

// La siguiente URL de API, es para crear y emitir los mensajes de una conversacion directa.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    // Si el metodo no es POST, no avanza la request.
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {

        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfilePages(req)

        // Recuperamos el content y el fileUrl del body de la request.
        const { content, fileUrl } = req.body;

        // Recuperamos el conversationID de la query de la URL.
        const { conversationId } = req.query

        // Si no existe el perfil, el conversationId o el contenido, no avanza la request.
        if (!profile) return res.status(401).json({ message: "Unautorized" })
        if (!conversationId) return res.status(400).json({ message: "Conversation ID missing" })
        if (!content) return res.status(400).json({ message: "Content missing" })

        // Buscamos la conversacion en la base de datos, por el conversationId, y si incluye al miembro uno o al miembro dos.
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        // Si no existe la conversation no avanza la request.
        if (!conversation) return res.status(404).json({ message: "Conversation Not Found" })

        // Buscamos el miembro actual. Si el miembro actual coincide con el memberOne de la conversation, sera este, sino sera el miembro dos.
        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo

        // Si no existe miembro, no avanza la request.
        if (!member) return res.status(404).json({ message: "Member Not Found" })

        // Creamos el mensaje con el content, el fileUrl, el conversationId y el miembro actual.
        const message = await db.directMessage.create({
            data: {
                content,
                fileUrl,
                conversationId: conversationId as string,
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

        // Creamos el channelKey para emitir el mensaje a traves del socket.
        const channelKey = `chat:${conversationId}:messages`

        // Emitimos el mensaje por el channelKey, y como contenido mandamos el mensaje a traves del objeto res.socket.server.io
        res?.socket?.server?.io?.emit(channelKey, message)

        return res.status(200).json(message)

    } catch (error) {
        console.log("[DIRECT_MESSAGES_POST]", error)
        return res.status(500).json({ message: "Internal Error" })
    }
}