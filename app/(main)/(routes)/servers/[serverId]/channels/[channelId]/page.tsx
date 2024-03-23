import ChatHeader from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

// Ruta para ir hacia un canal puntual

interface ChannelIdPageProps {
    params: {
        serverId: string
        channelId: string
    }
}

// Recibimos de los params (funcionalidad de next) el serverId y el channelId que vienen en la url

export default async function ChannelIdPage({
    params
}: ChannelIdPageProps) {

    // Recuperamos el profile actual con clerk

    const profile = await currentProfile();
    if (!profile) return redirectToSignIn();

    // Usamos el params.channelId para buscar el canal en la base de datos

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId
        }
    })

    // Buscamos el miembro actual que este logueado con el params.serverId y el profile.id

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        }
    })

    // Si no existe canal o miembro, redireccionamos hacia la ruta inicial

    if (!channel || !member) redirect("/")

    // Vamos a renderizar el ChatHeader del channel, y sus mensajes correspondientes con el ChatMessages. Ademas de un ChatInput para poder agregar nuevamos mensajes a dicho canal

    // Ademas, si verificamos que el tipo de canal es audio o video, vamos a renderizar una MediaRoom. 

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={channel.name}
                serverId={channel.serverId}
                type="channel"
            />

            {channel.type === ChannelType.TEXT && (
                <>
                    <ChatMessages
                        member={member}
                        name={channel.name}
                        chatId={channel.id}
                        type="channel"
                        apiUrl="/api/messages"
                        socketUrl="/api/socket/messages"
                        socketQuery={{
                            channelId: channel.id,
                            serverId: channel.serverId
                        }}
                        paramKey="channelId"
                        paramValue={channel.id}
                    />
                    <ChatInput
                        name={channel.name}
                        type="channel"
                        apiUrl="/api/socket/messages"
                        query={{
                            channelId: channel.id,
                            serverId: channel.serverId
                        }}
                    />
                </>
            )}

            {channel.type === ChannelType.AUDIO && (
                <MediaRoom
                    chatId={channel.id}
                    video={false}
                    audio={true}
                />
            )}

            {channel.type === ChannelType.VIDEO && (
                <MediaRoom
                    chatId={channel.id}
                    video={true}
                    audio={false}
                />
            )}
        </div>
    )
}