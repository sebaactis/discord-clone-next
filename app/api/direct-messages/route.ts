import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server"

// Esta URL de API, nos va a servir para recuperar los mensajes de un chat directo (similar a los mensajes generales)

// Definimos una constante para poner un limite de mensajes por pagina.

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
    try {

        // Recuperamos el perfil actual de clerk.
        const profile = await currentProfile();

        // De la URL, extraemos los searchParams.
        const { searchParams } = new URL(req.url)

        // De los searchParams, recuperamos el cursor (para la paginacion) y la conversationId.
        const cursor = searchParams.get("cursor")
        const conversationId = searchParams.get("conversationId");

        // Si no tenemos perfil o conversationId, no avanza la request
        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!conversationId) return new NextResponse("Conversation ID Missing", { status: 400 })

        // Creamos un array de mensajes para guardar los mismos.
        let messages: DirectMessage[] = []

        // Si tenemos cursor, vamos a recuperar los MESSAGES_BATCH (10) mensajes, skipeamos el primero para no repetir ya que este esta renderizado, y hacemos la busqueda con el cursor actual, donde tengamos la conversationId, y que incluya los perfiles de los miembros. Ordenamos la respuesta de forma descendente segun la fecha de los mensajes.
        if (cursor) {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor,

                },
                where: {
                    conversationId
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })

            // Si no tenemos cursor, recuperamos los 10 mensajes mas recientes, de la conversationId recibida, y que incluya los perfiles de los miembros. Ordenamos los mensajes de forma descendente segun la fecha de estos.
        } else {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                where: {
                    conversationId
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
        }

        // Seteamos el nextCursor para ponerlo en la respuesta

        let nextCursor = null

        // Si la longitud de los mensajes es igual al maximo de mensajes por pagina, podriamos tener mas mensajes que cargar, entonces seteamos el nextCursor con el ultimo mensaje recibido y su id.
        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id
        }

        // Devolvemos los mensajes y el nextCursor en la respuesta.
        return NextResponse.json({
            items: messages,
            nextCursor
        })


    } catch (error) {
        console.log("[DIRECT_MESSAGES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}