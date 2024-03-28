import qs from "query-string"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useSocket } from "@/components/providers/socket-provider"

// El siguiente componente se va a encargar de manejar los mensajes y las peticiones a la base de datos de estos.

// Vamos a recibir por props la queryKey que va a identificar la query de react-query, la apiUrl a la que vamos a enviar los mensajes, el paramKey que se utilizara como nombre de un parametro de consulta para la url, y el valor del parametro de esa key en la url.
interface ChatQueryProps {
    queryKey: string
    apiUrl: string
    paramKey: "channelId" | "conversationId"
    paramValue: string
}

export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue
}: ChatQueryProps) => {

    // Consumimos el estado del useSocket isConnected para verificar si estamos conectados en el socket.

    const { isConnected } = useSocket();

    // Creamos la funcion que recuperara los mensajes del chat.
    // Tenemos una propiedad opcional pageParam, que va a enviar la pagina para realizar la paginacion en el cursor como una query en la url, y el paramKey con su paramValue en la misma url.
    // Ej: localhost:8080/api/messages?cursor="..."&paramKey=paramsValue



    const fetchMessages = async ({ pageParam = undefined }) => {
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam,
                [paramKey]: paramValue
            }
        }, { skipNull: true })

        const res = await fetch(url)

        return res.json();
    }

    // Utilizamos el hook de react-query useInfiniteQuery para poder realizar la consulta de los mensajes y lograr una paginacion infinita.

    // Para configurar el hook, le pasamos los siguientes datos: queryKey para la llave de la consulta, queryFn sera la funcion que se ejecutara, getNextPageParam es una funcion que recupera de la ultima pagina, la propiedad nextCursor (nos va a servir para saber cuando vamos a cambiar de pagina) y un refetchInterval, que si estamos conectados al socket, no se ejecuta, sino, lo hace cada 1000 milisegundos.

    // De la funcion extraemos la data (la informacion que tendra los mensajes), el fetchNextPage (la funcion para cargar la siguiente pagina), el hasNextPage (indica si tenemos otra pagina para cargar), el isFetchingNextPage (indica si esta cargando una nueva pagina) y el status, que nos indica el estado del hook.

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        //@ts-ignore
    } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: isConnected ? false : 1000,
    });

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    }
}