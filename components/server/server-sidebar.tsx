import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { redirect } from "next/navigation";

import ServerHeader from "./server-header";
import ServerSearch from "./server-search";
import ServerSection from "./server-section";
import ServerChannel from "./server-channel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ServerMember from "./server-member";


// El serverId viene de las props que le pasamos al usar el componente.
// El serverId lo sacamos de params del componente padre. 
interface ServerSidebarProps {
    serverId: string
}

// Generamos un objeto para renderizar un icono segun el tipo de canal.

const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
}

// Generamos un objeto para renderizar un icono segun el tipo de canal.

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
}



export default async function ServerSidebar({
    serverId
}: ServerSidebarProps) {

    // Recuperamos el perfil de clerk

    const profile = await currentProfile();
    if (!profile) return redirect("/")

    // Buscamos el servidor con el serverId

    const server = await db.server.findUnique({
        where: {
            id: serverId
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc"
                }
            },
            members: {
                include: {
                    profile: true
                },
                orderBy: {
                    role: "asc"
                }
            }
        }
    })

    // Creamos variables para recuperar desde el server recuperado, los canales por tipo, y los miembros que sean distintos al perfil actual que recuperamos de clerk

    const textChannels = server?.channels.filter(channel => channel.type === ChannelType.TEXT)
    const audioChannels = server?.channels.filter(channel => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.channels.filter(channel => channel.type === ChannelType.VIDEO)
    const members = server?.members.filter(member => member.profileId !== profile.id)

    // Si no tenemos servidor, volvemos a la ruta inicial.

    if (!server) return redirect("/")

    // Recuperamos el rol del perfil actual recuperado de clerk

    const role = server.members.find(member => member.profileId === profile.id)?.role

    // Renderizamos el header del server y le pasamos server y role como props
    // Renderizamos un Scroll Area donde vamos a tener el ServerSearch(para buscar servidores, miembros, canales), y renderizamos un ServerSection para cada caso (cada tipo de canal, y los miembros)

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader
                server={server}
                role={role}
            />
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch data={[
                        {
                            label: "Text Channels",
                            type: "channel",
                            data: textChannels?.map((channel) => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type]
                            }))
                        },
                        {
                            label: "Voice Channels",
                            type: "channel",
                            data: audioChannels?.map((channel) => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type]
                            }))
                        },
                        {
                            label: "Video Channels",
                            type: "channel",
                            data: videoChannels?.map((channel) => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type]
                            }))
                        },
                        {
                            label: "Members",
                            type: "member",
                            data: members?.map((member) => ({
                                id: member.id,
                                name: member.profile.name,
                                icon: roleIconMap[member.role]
                            }))
                        }
                    ]} />
                </div>
                <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

                {/* Verificamos que textChannels.length no sea false (!!), es decir, que sea distinto de 0. Si es true, renderizamos los serverSection y dentro de cada uno de ellos, los canales que lo contengan.  */}

                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.TEXT}
                            role={role}
                            label="Text Channels"
                        />
                        <div className="space-y-[2px]">
                            {textChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.AUDIO}
                            role={role}
                            label="Voice Channels"
                        />
                        <div className="space-y-[2px]">
                            {audioChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )
                }
                {
                    !!videoChannels?.length && (
                        <div className="mb-2">
                            <ServerSection
                                sectionType="channels"
                                channelType={ChannelType.VIDEO}
                                role={role}
                                label="Video Channels"
                            />
                            <div className="space-y-[2px]">
                                {videoChannels.map((channel) => (
                                    <ServerChannel
                                        key={channel.id}
                                        channel={channel}
                                        role={role}
                                        server={server}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Verificamos que members.length no sea false (!!), es decir, que sea distinto de 0. Si es true, renderizamos el serverSection y dentro de el, el ServerMember para traer todos los miembros correspondientes el servidor.  */}

                {
                    !!members?.length && (
                        <div className="mb-2">
                            <ServerSection
                                sectionType="members"
                                role={role}
                                label="Members"
                                server={server}
                            />
                            <div className="space-y-[2px]">
                                {members.map((member) => (
                                    <ServerMember
                                        key={member.id}
                                        member={member}
                                        server={server}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }
            </ScrollArea >
        </div >
    )
}