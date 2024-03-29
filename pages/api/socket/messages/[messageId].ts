import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

// La siguiente URL de API es para editar o eliminar un mensaje.
export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {

    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {

        // Recuperamos el perfil de clerk.
        const profile = await currentProfilePages(req)

        // Recuperamos el messageId, el serverId y el channelId de la URL.
        const { messageId, serverId, channelId } = req.query

        // Y recuperamos el contenido del body.
        const { content } = req.body

        // Si no tenemos perfil, serverId o channelId no avanza la request.
        if (!profile) return res.status(401).json({ error: "Unauthorized" })
        if (!serverId) return res.status(400).json({ error: "Server ID Missing" })
        if (!channelId) return res.status(400).json({ error: "Channel ID Missing" })

        // Buscamos el server con el serverId y el profile.id actual.
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

        // Si no existe server, no avanza la request.
        if (!server) return res.status(404).json({ error: "Server Not Found" })

        // Buscamos el canal con el channelId y el serverId
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string
            }
        })

        // Si no existe el canal no avanza la request.
        if (!channel) return res.status(404).json({ error: "Channel Not Found" })

        // Buscamos el miembro con elw profile.id actual.
        const member = server.members.find((member) => member.profileId === profile.id)

        // Si no existe el miembro no avanza la request.
        if (!member) return res.status(404).json({ error: "Member Not Found" })

        // Buscamos el mensaje con el messageId y el channelId.
        let message = await db.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channelId as string
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        // Si no existe el mensaje, o el fue eliminado, no avanza la request.
        if (!message || message.deleted) return res.status(404).json({ error: "Message Not Found" })

        // Creamos unas constantes para ver si somos el owner del mensaje (isMessageOwner), si el usuario es admin (isAdmin) o si es moderador (isModerator)
        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN
        const isModerator = member.role === MemberRole.MODERATOR

        // Creamos una condicion para modificar solo si se cumple alguna de las constantes anteriores.
        const canModify = isMessageOwner || isAdmin || isModerator

        // Si no puede modificar, arroja un error de no autorizado.
        if (!canModify) return res.status(401).json({ error: "Unauthorized" })

        // Si el metodo es DELETE, pasamos el estado del mensaje a deleted con el messageId.
        if (req.method === "DELETE") {
            message = await db.message.update({
                where: {
                    id: messageId as string
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

            message = await db.message.update({
                where: {
                    id: messageId as string
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
        const updateKey = `chat:${channelId}:messages:update`

        // Enviamos el mensaje a traves de nuestra updateKey, y como contenido pasamos el mensaje a traves del objeto res.socket.server.io
        res?.socket?.server?.io?.emit(updateKey, message)

        return res.status(200).json(message)

    } catch (error) {
        console.log("[MESSAGE_ID]", error)
        return res.status(500).json({ error: "Internal Error" })
    }

}