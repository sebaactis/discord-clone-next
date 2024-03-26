import { db } from "@/lib/db";

// La siguiente utilidad nos servira para recuperar la conversacion actual entre dos miembros, y caso contrario de que no exista, crearla.

export async function getOrCreateConversation(memberOneId: string, memberTwoId: string) {

    // Esta funcion se encarga primero de buscar la conversacion con las dos opciones de combinacion entre dos miembros.

    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId)

    // Si no la encuentra, se encarga de crearla.

    if (!conversation) {
        conversation = await createNewConversation(memberOneId, memberTwoId)
    }

    return conversation
}

export async function findConversation(memberOneId: string, memberTwoId: string) {

    // Esta funcion se encarga de buscar la conversacion con los dos miembros, y devolverla con los datos del perfil de ambos.

    try {
        return await db.conversation.findFirst({
            where: {
                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId }
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
    } catch {
        return null
    }
}

export async function createNewConversation(memberOneId: string, memberTwoId: string) {

    // Esta funcion se encarga de crear una conversacion con los dos miembros, y devuelve los perfiles de ambos.

    try {

        return await db.conversation.create({
            data: {
                memberOneId,
                memberTwoId
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

    } catch {
        return null
    }
}