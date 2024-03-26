"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import ActionToolTip from "@/components/action-tooltip"

// Renderizamos cada item del navigation que tengamos dentro de los servers.

interface NavigationItemsProps {
    id: string
    imageUrl: string
    name: string
}

// Vamos a recibir por props el id del server, el imageUrl del server, y el name del server

export default function NavigationItem({
    id,
    imageUrl,
    name
}: NavigationItemsProps) {

    // Utilizaremos useParams para manejar los params de la url y router para manejar el ruteo de la aplicacion.

    const params = useParams();
    const router = useRouter();

    // Creamos una funcion onClick para ir hacia el servidor que demos click en la barra de navegacion.

    const onClick = () => {
        router.push(`/servers/${id}`)
    }

    // Vamos a renderizar un toolTip que tendra el nombre del servidor al hacer :hover
    // El boton va a corresponder a cada server en la lista. Tendra unos estilos para marcar sobre cual estamos en el momento.


    return (
        <ActionToolTip
            side="right"
            align="center"
            label={name}
        >
            <button
                onClick={onClick}
                className="group relative flex items-center"
            >
                <div className={cn(
                    "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                    params?.serverId !== id && "group-hover:h-[20px]",
                    params?.serverId === id ? "h-[36px]" : "h-[8px]"
                )}
                />
                <div className={cn(
                    "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
                )}>
                    <Image fill src={imageUrl}
                        alt="channel" />
                </div>
            </button>
        </ActionToolTip>
    )
}
