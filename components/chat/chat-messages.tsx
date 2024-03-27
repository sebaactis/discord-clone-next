"use client"

import { format } from "date-fns"
import { useChatQuery } from "@/hooks/use-chat-query"
import { ChatWelcome } from "./chat-welcome"
import { Member, Message, Profile } from "@prisma/client"
import { Loader2, ServerCrash } from "lucide-react"
import { Fragment, useRef, ElementRef } from "react"
import { ChatItem } from "./chat-item"
import { useChatSocket } from "@/hooks/use-chat-socket"
import { useChatScroll } from "@/hooks/use-chat-scroll"

// Este componente renderiza los mensajes de un chat.


// Creamos una variablep ara definir un formato de fecha
const DATE_FORMAT = "d MMM yyyy, HH:mm"

// Creamos un type para los mensanes y que incluyan los perfiles del miembro de cada mensaje
type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

// Recibimos por props: el miembro actual, el nombre del canal o usuario, el id del chat (sera el channelId o conversationId), la apiUrl, el socketUrl, el socketQuery, el paramKey, el paramValue y el tipo de chats

interface ChatMessagesProps {
    name: string
    member: Member
    chatId: string
    apiUrl: string
    socketUrl: string
    socketQuery: Record<string, string>
    paramKey: "channelId" | "conversationId"
    paramValue: string
    type: "channel" | "conversation"
}

export const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type
}: ChatMessagesProps) => {

    // Creamos variables utiles
    // queryKey: id de query para el socket
    // addKey: id para el socket cuando agregamos un mensaje
    // updateKey: id para el socket cuando editamos un mensaje
    // chatRef: referencia de la parte de arriba del chat
    // bottomRef: referencia de la parte de abajo del chat

    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`
    const updateKey = `chat:${chatId}:messages:update`
    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

    // Utilizamos la info de useChatQuery para recuperar la informacion de los mensajes y la paginacion.

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue
    });

    // Utilizamos useChatSocket para mandar los eventos socket.on de agregar o editar mensajes.

    useChatSocket({ queryKey, addKey, updateKey });

    // Utilizamos el useChatScroll para crear la paginacion infinita de mensajes.

    useChatScroll({
        chatRef,
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
        count: data?.pages?.[0].items?.length ?? 0
    })

    // Si el status (useChatQuery) es pendiente, entonces mostramos un mensaje que estamos cargando mas mensajes.

    if (status === "pending") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading Messages
                </p>
            </div>
        )
    }

    // Si el status (useChatQuery) es error, entonces mostramos un mensaje que estamos hubo un error al cargar los mensajes.

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong
                </p>
            </div>
        )
    }

    // Vamos a renderizar de la siguiente forma:
    // Si no tenemos una pagina siguiente, entonces creamos un div suelto.

    // Si no tenemos una pagina siguiente, renderizamos el chatWelcome (significa que estamos arriba de todo del chat)

    // Si tenemos pagina siguiente, entonces vamos a renderizar un div, que si la funcion isFetchingNextPage (significa que esta cargando una pagina siguiente) es true, mostremos un icono de loader. Caso contrario, mostramos un botomn para cargar mas mensajes.

    // Por último, recorremos cada pagina que devuelve el useInfiniteQuery de useChatQuery, y dentro de ella recorremos de cada pagina su propiedad items (la que tiene los mensajes), para mostrar un ChatItem por cada mensaje dentro de el.

    // En el primer div y en el ultimo div agregamos las referencias para poder identificar cuando estamos al principio o final del contenedor.

    return (
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            {!hasNextPage && <div className="flex-1" />}

            {!hasNextPage && <ChatWelcome
                type={type}
                name={name} />}
            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ? (
                        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
                    ) : (
                        <button onClick={() => fetchNextPage()} className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my4 dark:hover:text-zinc-300 transition">
                            Load previous messages
                        </button>
                    )
                    }
                </div>

            )}
            <div className="flex flex-col-reverse mt-auto">
                {data?.pages?.map((group, i) => (

                    <Fragment key={i}>
                        {group?.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem
                                key={message.id}
                                id={message.id}
                                currentMember={member}
                                member={message.member}
                                content={message.content}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                isUpdated={message.updatedAt !== message.createdAt}
                                socketUrl={socketUrl}
                                socketQuery={socketQuery}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef} />
        </div>
    )
}