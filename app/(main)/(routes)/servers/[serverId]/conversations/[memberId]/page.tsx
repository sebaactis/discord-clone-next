import ChatHeader from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";

import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Ruta para renderizar la conversacion con un miembro puntual

interface MemberIdPageProps {
    params: {
        memberId: string
        serverId: string
    },
    searchParams: {
        video?: boolean
    }
}

// Recibimos memberId y serverId desde la URL con el params de Next.
// Desde el searchParams, recibimos el parametro video, para verificar si estamos en una conversacion de texto o de llamada. 

export default async function MemberIdPage({ params, searchParams }: MemberIdPageProps) {

    // Recuperamos el perfil con clerk.

    const profile = await currentProfile();
    if (!profile) return redirectToSignIn();

    // Buscamos el miembro actual logueado con el profile.id recuperado y el params.serverId


    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        },
        include: {
            profile: true
        }
    })

    // Si no existe el miembro actual, redireccionamos hacia la ruta inicial

    if (!currentMember) return redirect("/")

    // Utilizamos la funcion getOrCreateConversation para crear o recuperar una conversacion, debemos pasarle los params currentMember.id (seria el miembro actual) y params.memberId (seria el memberId de la URL, el segundo miembro)

    const conversation = await getOrCreateConversation(currentMember.id, params.memberId)

    // Si no existe conversacion para este caso, volvemos a la ruta del servidor actual

    if (!conversation) return redirect(`/servers/${params.serverId}`)

    // Desestructuramos al miembro 1 y 2 de la conversacion recuperada

    const { memberOne, memberTwo } = conversation;

    // Verificamos cual es el creador de la conversacion. Si el miembro uno recuperado coincide con el actual logueado, entonces el otro miembro es el miembro 2, sino, es el miembro 1.

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

    // Renderizamos un ChatHeader para esta conversacion privada, y la MediaRoom en caso de que searchParams.video sea true. Caso contrario, renderizamos el ChatMessages de esta conversacion, con el ChatInput para poder crear nuevas entradas o mensajes. 

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                serverId={params.serverId}
                type="conversation"
            />

            {searchParams.video && (
                <MediaRoom
                    chatId={conversation.id}
                    video={true}
                    audio={true}
                />
            )}
            
            {!searchParams.video && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.profile.name}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/direct-messages"
                        paramKey="conversationId"
                        paramValue={conversation.id}
                        socketUrl="/api/socket/direct-messages"
                        socketQuery={{
                            conversationId: conversation.id
                        }}
                    />
                    <ChatInput
                        name={otherMember.profile.name}
                        type="conversation"
                        apiUrl="/api/socket/direct-messages"
                        query={{
                            conversationId: conversation.id
                        }}
                    />
                </>
            )}

        </div>
    )
}