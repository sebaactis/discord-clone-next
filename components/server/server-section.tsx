"use client"

import { ServerWithMembersWithProfiles } from "@/types"
import { ChannelType, MemberRole } from "@prisma/client"
import ActionToolTip from "@/components/action-tooltip"
import { Plus, Settings } from "lucide-react"
import { useModal } from "@/hooks/use-modal-store"

interface ServerSectionProps {
    label: string
    role?: MemberRole
    sectionType: "channels" | "members"
    channelType?: ChannelType
    server?: ServerWithMembersWithProfiles
}

export default function ServerSection({
    label,
    role,
    sectionType,
    channelType,
    server
}: ServerSectionProps) {

    // Recibimos por props label, role, sectionType, channelType y el server
    // Usamos la funcion onOpen del useModal

    const { onOpen } = useModal();  

    return (
        <div className="flex items-center justify-between py-2">
            <p className="text-sm uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                {label}
            </p>

            {/* Si el role es distinto de GUEST, y la seccion es de canales, renderizamos un tooltip que sea para crear un canal nuevo, y abrir el modal con sus datos */}

            {role !== MemberRole.GUEST && sectionType === "channels" && (
                <ActionToolTip label="Create Channel" side="top">
                    <button onClick={() => onOpen("createChannel", { channelType })} className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition">
                        <Plus className="w-4 h-4" />
                    </button>
                </ActionToolTip>
            )}

            {/* Si el role es distinto de GUEST, y la seccion es de miembros, renderizamos un tooltip que sea para gestionar los miembros del canal, y abrir el modal con sus datos */}

            {role === MemberRole.ADMIN && sectionType === "members" && (
                <ActionToolTip label="Manage Members" side="top">
                    <button onClick={() => onOpen("members", { server })} className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition">
                        <Settings className="w-4 h-4" />
                    </button>
                </ActionToolTip>
            )}
        </div>
    )
}