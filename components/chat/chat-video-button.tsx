"use client"

import qs from "query-string"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Video, VideoOff } from "lucide-react"

import ActionToolTip from "@/components/action-tooltip"

// Este componente renderiza un boton para abrir la videollamada en una conversacion privada.

export const ChatVideoButton = () => {

    // Recuperamos la parte de la ruta posterior a la raiz con pathname.

    const pathname = usePathname()
    const router = useRouter()

    // Usamos el hook useSearchParams de navigation para poder manipular los params de la ruta
    // Si el boton se clickea, se agrega un param video=true en la ruta, y asignamos esto a la constante isVideo para verificar si esta activado el video o no.

    const searchParams = useSearchParams()
    const isVideo = searchParams?.get("video")

    // Creamos una constante que renderiza un icono de videoOff si isVideo es true, y sino el icono de Video normal. Hacemos lo mismo para el texto del tooltip.
    const Icon = isVideo ? VideoOff : Video;
    const tooltipLabel = isVideo ? "End video call" : "Start video call"

    // Creamos una funcion onClick para enviar a la ruta que activa la llamada de video. Esto es para cambiar la ruta una vez que damos click en el boton.

    const onClick = () => {
        const url = qs.stringifyUrl({
            url: pathname || "",
            query: {
                video: isVideo ? undefined : true
            }
        }, { skipNull: true })

        router.push(url)
    }

    // Renderizamos el tooltip con el boton en cuestion.

    return (
        <ActionToolTip side="bottom" label={tooltipLabel}>
            <button className="hover:opacity-75 transition mr-4" onClick={onClick}>
                <Icon className="h-6 w-6 text-zinc-400 dark:text-zinc-400" />
            </button>
        </ActionToolTip>
    )
}