"use client"

import { cn } from "@/lib/utils"
import { Member, MemberRole, Profile, Server } from "@prisma/client"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import UserAvatar from "@/components/user-avatar"

interface ServerMemberProps {
    member: Member & { profile: Profile }
    server: Server
}

// Recibimos por prop el miembro y el servidor

// Creamos un objeto para renderizar un icono segun el role del miembro

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
}

export default function ServerMember({
    member,
    server
}: ServerMemberProps) {

    const params = useParams();
    const router = useRouter();

    // Creamos un objeto dinamico para tomar el icono segun la llave del objeto

    const icon = roleIconMap[member.role]

    // Creamos una funcion onClick para ir hacia una conversacion privada con el miembro

    const onClick = () => {
        router.push(`/servers/${params?.serverId}/conversations/${member.id}`)
    }

    // Renderizamos un button donde veamos el avatar del usuario, y el nombre del miembro. El boton es para ir a la conversacion privada

    return (
        <button onClick={onClick} className={cn(
            "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
            params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}>
            <UserAvatar src={member.profile.imageUrl}
                className="h-8 w-8 md:h-8 md:w-8"
            />
            <p className={cn(
                "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                params?.memberId === member.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
            )}>
                {member.profile.name}
            </p>
            {icon}
        </button>
    )
}