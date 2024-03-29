import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

// Este URL de API es para editar o borrar un mensaje de una conversacion
export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {

    // Si el metodo no es DELETE o PATCH, no avanza la request.
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {

        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfilePages(req)

        // Recuperamos el directMessageId y el conversationId de la query de la URL.
        const { directMessageId, conversationId } = req.query

        // Recuperamos el content del body de la request.
        const { content } = req.body

        // Si no existe el perfil o el conversationId, no avanza la request.
        if (!profile) return res.status(401).json({ error: "Unauthorized" })
        if (!conversationId) return res.status(400).json({ error: "Conversation ID Missing" })

        // Buscamos la conversation con el conversationID y si incluye al miembro uno o al miembro dos.
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

        // Si no existe la converastion, no avanza la request.
        if (!conversation) return res.status(404).json({ error: "Conversation Not Found" })

        // Buscamos el miembro actual, si es igual al memberOne de la conversation, es ese, sino es el dos.
        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo

        // Si no existe el miembro, no avanza la request.
        if (!member) return res.status(404).json({ error: "Member Not Found" })

        // Buscamos el mensaje con el directMessageId y el conversationId
        let directMessage = await db.directMessage.findFirst({
            where: {
                id: directMessageId as string,
                conversationId: conversationId as string
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        // Si no existe o fue borrado el mensaje, no avanza la request.
        if (!directMessage || directMessage.deleted) return res.status(404).json({ error: "Message Not Found" })

        // Creamos unas constantes para ver si somos el owner del mensaje (isMessageOwner), si el usuario es admin (isAdmin) o si es moderador (isModerator)
        const isMessageOwner = directMessage.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN
        const isModerator = member.role === MemberRole.MODERATOR

        // Creamos una condicion para modificar solo si se cumple alguna de las constantes anteriores.
        const canModify = isMessageOwner || isAdmin || isModerator

        // Si no puede modificar, arroja un error de no autorizado.
        if (!canModify) return res.status(401).json({ error: "Unauthorized" })

        // Si el metodo es DELETE, pasamos el estado del mensaje a deleted con el directMessageId.
        if (req.method === "DELETE") {
            directMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted.",
                    deleted: true
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        // Si el metodo es PATCH, editamos el mensaje con el content recuperado (si no somos el owner del mensaje, no podemos hacerlo).
        if (req.method === "PATCH") {

            if (!isMessageOwner) {
                return res.status(401).json({ error: "Unauthorized" })
            }

            directMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string
                },
                data: {
                    content
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        // Por ultimo, creamos un updateKey para emitir el mensaje en el socket.
        const updateKey = `chat:${conversationId}:messages:update`

        // Enviamos el mensaje a traves de nuestra updateKey, y como contenido pasamos el mensaje a traves del objeto res.socket.server.io
        res?.socket?.server?.io?.emit(updateKey, directMessage)

        return res.status(200).json(directMessage)

    } catch (error) {
        console.log("[MESSAGE_ID]", error)
        return res.status(500).json({ error: "Internal Error" })
    }
}