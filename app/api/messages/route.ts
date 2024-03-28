import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server"

// La siguiente url de API, es para recuperar los mensajes con la paginacion incluida.

// Primero, seteamos esta constante para definir cuantos mensajes tendremos por pagina.
const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
    try {

        // Vamos a recuperar el perfil actual que este conectado
        const profile = await currentProfile();

        // Recuperamos los searchParams de la URL entrante.
        const { searchParams } = new URL(req.url)

        // Recuperamos de los searchParams, el cursor (para la paginacion) y el channelId.
        const cursor = searchParams.get("cursor")
        const channelId = searchParams.get("channelId");

        // Si no tenemos perfil, o no tenemos channelId, no avanzamos con la recuperacion de mensajes.

        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!channelId) return new NextResponse("Channel ID Missing", { status: 400 })

        // Definimos un array de mensajes para manejar los mismos.
        let messages: Message[] = []

        // Si tenemos un cursor, significa que tenemos una pagina siguiente para buscar, entonces, vamos a buscar los mensajes con MESSAGES_BATCH (10 mensajes), salteando el primero (ya que vamos a usar el cursor como indice, y este ya se encuentra cargado en la interfaz), le pasamos el cursor como parte de la condicion de la busqueda, buscamos los mensajes en base al channelId correpsondiente, incluimos los miembros y sus perfiles en la respuesta, y ordenamos de forma descendente por las fecha de los mensajes.


        if (cursor) {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor,

                },
                where: {
                    channelId
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

            // Si no tenemos cursor, vamos a buscar los 10 mensajes que tengamos primero sin ninguna condicion mas que la que pertenezcan al channelId correspondiente.
        } else {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId
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

        // Creamos una variable nextCursor que estara dentro de la respuesta a la API, para determinar si tenemos una pagina nueva para cargar.
        let nextCursor = null

        // Si la longitud de los mensajes es igual a la cantidad maxima de mensajes que vamos a cargar, entonces significa que podria haber mas mensajes para cargar, entonces, seteamos como referencia para continuar cargando el resto de mensajes con el ultimo mensaje recuperado (ponemos -1 por los indices de los array).
        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id
        }

        // Y retornamos los items que contendran los mensajes, y el siguiente cursor.

        return NextResponse.json({
            items: messages,
            nextCursor
        })


    } catch (error) {
        console.log("[MESSAGES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}