import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// El siguiente hook tiene como utilidad utilizar el socket con sus distintas salas de mensajes y conversaciones para enviar los mensajes a sus respectivos sockets

// Vamos a tener un type ChatSocketProps que tenga el addKey - updateKey y queryKey como string.

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
}

// Tipamos el message con la info de los miembros y sus perfiles.

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}



export const useChatSocket = ({
    addKey,
    updateKey,
    queryKey
}: ChatSocketProps) => {

    // El hook va a consumos el contexto del socket con useSocket();
    // Y vamos a usar el query client provisto por react-query.

    const { socket } = useSocket();
    const queryClient = useQueryClient();

    // Creamos un efecto para manejar los mensajes y su intervencion en cada socket.

    useEffect(() => {

        // Si no tenemos socket, vamos a retornan sin nada.

        if (!socket) return

        // Primero vamos a setear un evento de escuchar el evento que venga con la key de "updateKey".

        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            // Vamos a usar el query client para setear la informacion a traves de nuestra queryKey recibida. Esto nos va a permitir tener sincronizado los datos para mostrarlas en la interfaz lo antes posible.

            queryClient.setQueryData([queryKey], (oldData: any) => {

                // Lo que hace el setQueryData, es recuperar el ultimo estado (oldData) de la queryKey informada.

                // Establece los datos de la consulta identificada por queryKey. Si no hay datos para esa clave de consulta, simplemente devuelve oldData.

                // Verifica si oldData es nulo o si oldData.pages es nulo o si oldData.pages.length es igual a cero. Si alguna de estas condiciones es verdadera, significa que no hay datos para actualizar y, por lo tanto, simplemente devuelve oldData


                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return oldData
                }

                // Si tenemos informacion que actualizar pasamos a crear un newData.
                // Este va a a recorrer todas las paginas de la oldData, y va a returnar cada pagina, ademas de su propiedad items. Dentro de items, vamos a recorrer cada uno de ellos (estos son los mensajes del chat), y si el item.id que tiene el mensaje es igual al id del mensaje que recibimos en la escucha del socket, entonces devolvemos ese mensaje, sino devolvemos el item original.

                const newData = oldData.pages.map((page: any) => {
                    return {
                        ...page,
                        items: page.items.map((item: MessageWithMemberWithProfile) => {
                            if (item.id === message.id) {
                                return message
                            }
                            return item;
                        })
                    }
                })

                // Retornamos toda la informacion que ya teniamos, y a pages le asignamos la nueva data que seteamos.

                return {
                    ...oldData,
                    pages: newData
                }

            })
        })

        // Vamos a setear otro evento de escucha para la creacion de mensajes con el addKey.

        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData([queryKey], (oldData: any) => {

                // La función de devolución de llamada comienza verificando si oldData es nulo o si oldData.pages es nulo o si oldData.pages.length es igual a cero. Si alguna de estas condiciones es verdadera, significa que no hay datos para actualizar, por lo que devuelve un nuevo objeto de datos con una sola página que contiene el nuevo message proporcionado.

                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return {
                        pages: [{
                            items: [message]
                        }]
                    }

                }

                // Si hay datos disponibles, se hace una copia de oldData.pages en newData usando el operador de propagación (...)

                const newData = [...oldData.pages]

                console.log(newData);

                // Se actualiza el primer elemento de newData, es decir, newData[0], con la información del nuevo message. Se agrega el nuevo message al principio de la lista de items, manteniendo los elementos antiguos intactos. El newData[0] es donde vamos a tener items y nextCursor. Recuperamos la informacion completa de esto, y reemplazamos items con los datos que ya tenia + el mensaje nuevo.

                newData[0] = {
                    ...newData[0],
                    items: [
                        message,
                        ...newData[0].items
                    ]
                }

                // Retornamos lo que ya teniamos en oldData (toda la info antigua) y el pages con el nuevo data que creamos.


                return {
                    ...oldData,
                    pages: newData
                }

            })
        })

        // Por ultimo damos de baja los eventos para no tener mas de un evento escuchado.

        return () => {
            socket.off(addKey)
            socket.off(updateKey)
        }

    }, [queryClient, addKey, queryKey, updateKey, socket])
}