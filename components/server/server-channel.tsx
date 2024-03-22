"use client"

import { cn } from "@/lib/utils"
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client"
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import ActionToolTip from "@/components/action-tooltip"
import { ModalType, useModal } from "@/hooks/use-modal-store"
import React from "react"

interface ServerChannelProps {
    channel: Channel
    server: Server
    role?: MemberRole
}
// Renderizamos cada canal que tengamos en el tipo de canal especificado

// Recibimos por props el canal, el server y el role.

// Creamos un objeto para renderizar un icono segun el tipo de canal que tengamos

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video
}

export default function ServerChannel({
    channel,
    server,
    role
}: ServerChannelProps) {

    // Usamos la funcion onOpen de useModal

    const { onOpen } = useModal();
    const params = useParams();
    const router = useRouter();

    // Creamos un icono dinamico que tome el valor segun el valor del channel type iconMap[llave del objeto]

    const Icon = iconMap[channel.type]

    // Creamos una funcion onLick para ir hacia el channel que recibimos por prop

    const onClick = () => {
        router.push(`/servers/${params?.serverId}/channels/${channel.id}`)
    }

    // Creamos esta funcion para evitar la propagacion de los botones de editar y borrar (revisar esto)

    const onAction = (e: React.MouseEvent, action: ModalType) => {
        e.stopPropagation();
        onOpen(action, { channel, server })
    }

    // Renderizamos el icono, el nombre del canal, y un tooltip para editar y otro para borrar el canal
    // Y si el nombre del canal es general, un icono lock para indicar que no se puede editar ni borrar el canal general
    // Solo podremos editar o borrar un canal si no es el general, y si somos MODERATOR o ADMIN

    return (
        <button onClick={onClick} className={cn(
            "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
            params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}>
            <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <p className={cn(
                "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
            )}>
                {channel.name}
            </p>
            {channel.name !== "general" && role !== MemberRole.GUEST && (
                <div className="ml-auto flex items-center gap-x-2">
                    <ActionToolTip label="Edit">
                        <Edit onClick={(e) => onAction(e, "editChannel")} className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                    </ActionToolTip>
                    <ActionToolTip label="Delete">
                        <Trash onClick={(e) => onAction(e, "deleteChannel")} className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                    </ActionToolTip>
                </div>
            )}
            {channel.name === "general" && (
                <Lock className="w-4 h-4 ml-auto text-zinc-500 dark:text-zinc-400" />
            )}
        </button>
    )
}