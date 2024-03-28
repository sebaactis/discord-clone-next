import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io"

import { NextApiResponseServerIo } from "@/types"

// Esta URL ed API, es para crear la instancia del socket en el servidor.

// Esta config nos dice que no analizaremos automaticamente el cuerpo de las solicitudes HTTP.
export const config = {
    api: {
        bodyParser: false
    }
}

// Creamos un ioHandler para manejar la instancia de servidor del socket.
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {

    // Verificamos si no existe una instancia creado del socket.
    if (!res.socket.server.io) {

        // Creamos el path donde se creara la instancia.
        const path = "/api/socket/io"

        // Seteamos un httpServer como un res.socket.server
        const httpServer: NetServer = res.socket.server as any

        // Creamos la instancia del socket en el server, le pasamos el httpServer correspondiente y el path hacia donde se creara la instancia.
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false
        })

        // Asignamos la instancia creada al objeto res.socket.server.io;
        res.socket.server.io = io;
    }

    res.end();
}

export default ioHandler;