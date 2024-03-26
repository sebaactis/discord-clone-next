"use client"

import { useSocket } from "@/components/providers/socket-provider"
import { Badge } from "@/components//ui/badge"

// Renderizamos un indicador de si el socket esta conectado o no.

export const SocketIndicator = () => {

    // Recuperamos el estado isConnected de useSocket.

    const { isConnected } = useSocket();

    // Si no esta conectado, renderizamos un mensaje de que esta verificando conexion o mensajes nuevos.

    if (!isConnected) {
        return (
            <Badge variant="outline" className="bg-yellow-600 text-white border-none">
                Fallback: Polling every 1s
            </Badge>
        )
    }

    // Si esta conetado, renderizamos un mensaje de que esta escuchando mensajes en tiempo real.

    return (
        <Badge variant="outline" className="bg-emerald-600 text-white border-none">
            Live: Real-time updates
        </Badge>
    )

} 