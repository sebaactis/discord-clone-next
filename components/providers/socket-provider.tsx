"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io as ClientIO } from "socket.io-client"

// El siguiente provider es para crear la conexion principal del socket y envolver nuestra aplicacion dentro de el.

// Vamos a crear un tipo para el socket y para el isConnected

type SocketContextType = {
    socket: any | null
    isConnected: boolean
}

// Vamos a crear un context de tipo SocketContextType, para tener el socket en toda la app.

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
})

// Creamos un mini hook que retorne el uso del contexto directamente.

export const useSocket = () => {
    return useContext(SocketContext)
}

// Creamos el provider que envolvera la aplicacion con el socket.

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {


    // Creamos un estado para guardar el socket (la instancia), y uno para setear si esta conectado o no al socket.

    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    // Creamos un efecto para crear la instancia del socket del lado del cliente, y la enviamos hacia la ruta informada.

    // Creamos dos eventos de escucha, cuando nos conectamos ("connect") y cuando nos desconectamos ("disconnect").

    // Y seteamos la instancia del socket en nuestro estado socket.

    // Por ultimo, desconectamos la instancia para no crear instancias de forma masiva.

    useEffect(() => {
        const socketInstance = new (ClientIO as any)(process.env.NEXT_PUBLIC_SITE_URL!, {
            path: "/api/socket/io",
            addTrailingSlash: false
        })

        socketInstance.on("connect", () => {
            setIsConnected(true)
        })

        socketInstance.on("disconnect", () => {
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect();
        }
    }, [])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}