"use client"

import * as z from "zod"
import axios from "axios"
import qs from "query-string"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Member, MemberRole, Profile } from "@prisma/client"
import UserAvatar from "@/components/user-avatar"
import ActionToolTip from "@/components/action-tooltip"
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"

// Este componente renderiza el mensaje en particular de un chat

// Va a recibir por props: el id del mensaje, el contenido del mensaje, el miembro de ese mensaje, el timestamp (horario y fecha), el fileUrl por si es un archivo, el deleted para ver si esta borrado, el currentMember logueado, el isUpdated para ver si fue editado, el socketUrl y el socketQuery.
interface ChatItemProps {
    id: string
    content: string
    member: Member & {
        profile: Profile
    }
    timestamp: string
    fileUrl: string | null
    deleted: boolean
    currentMember: Member
    isUpdated: boolean
    socketUrl: string
    socketQuery: Record<string, string>
}

// Creamos un objeto roleIconMap para usar un icono segun el tipo de usuario.

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="w-4 h-4 ml-4 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="w-4 h-4 ml-4 text-rose-500" />
}

// Creamos un schema de zod para validar el mensaje cuando vayamos a editarlo.

const formSchema = z.object({
    content: z.string().min(1)
})

export const ChatItem = ({ id, content, member, timestamp, fileUrl, deleted, currentMember, isUpdated, socketQuery, socketUrl }: ChatItemProps) => {

    const params = useParams();
    const router = useRouter();

    // Creamos un estado para ver si estamos editando un mensaje
    // Usamos la funcion onOpen del useModal()

    const [isEditing, setIsEditing] = useState(false)
    const { onOpen } = useModal();

    // Creamos una funcion para dar click al miembro con el que estamos hablando para ir a una conversacion privada, salvo que el miembro del mensaje sea el mismo del miembro actual logueado.

    const onMemberClick = () => {
        if (member.id === currentMember.id) return;

        router.push(`/servers/${params?.serverId}/conversations/${member.id}`)

    }

    // Creamos un efecto para poder salir de la edicion del mensaje con el boton de escape.

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === "Escape" || event.KeyCode === 27) {
                setIsEditing(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Creamos un formulario con useForm para manejar la edicion del mensaje.

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    // Creamos un loading para ver cuando se esta subiendo el formulario.

    const isLoading = form.formState.isSubmitting

    // Creamos una funcion onSubmit para enviar la edicion del mensaje a la base de datos.

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {

            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery
            })

            await axios.patch(url, values)

            form.reset();
            setIsEditing(false)

        } catch (error) {
            console.log(error)
        }
    }



    useEffect(() => {
        form.reset({
            content: content
        })
    }, [content, form])

    // Creamos diferente variables para tener validaciones:

    // Verificamos segun la extension del archivo que tipo de file es.
    const fileType = fileUrl?.split(".").pop();

    // Verificamos a partir de los roles si es admin o moderador.
    const isAdmin = currentMember.role === MemberRole.ADMIN
    const isModerator = currentMember.role === MemberRole.MODERATOR

    // Verificamos si es el owner del mensaje
    const isOwner = currentMember.id === member.id

    // Verificamos si puede borrar o editar el mensaje segun si el mensaje no esta borrado, y si es admin, moderador o owner (solo para editar el owner)
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner && !fileUrl

    // Verificamos segun el resultado del fileType con la extension si es PDF o IMG
    const isPDF = fileType === "pdf" && fileUrl
    const isImage = !isPDF && fileUrl

    // Renderizamos el userAvatar, el nombre del que puso el mensaje, el icono segun el role y el horario del mensaje

    // Si es imagen, renderizamos la imagen con la url para ir hacia la misma.
    // Si es pdf, renderizamos un icono pdf con la url para ir hacia el archivo.

    // Si no es un archivo, y no esta siendo editado, renderizamos el mensaje (content)

    // Si esta siendo actualizado y no fue borrado, le agregamos un (edited)

    // Si no es un fileUrl, y esta siendo editado, abrimos el formulario de edicion.

    // Si podemos borrar el mensaje, le agregamos un tooltip con el boton para borrar
    // Si podemos editar el mensaje, le agregamos un tooltip con el boton para editar

    return (
        <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">

            <div className="group flex gap-x-2 items-start w-full">
                <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar src={member.profile.imageUrl} />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p onClick={onMemberClick} className="font-semibold text-sm hover:underline cursor-pointer">
                                {member.profile.name}
                            </p>
                            <ActionToolTip label={member.role}>
                                {roleIconMap[member.role]}
                            </ActionToolTip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {timestamp}
                        </span>
                    </div>
                    {isImage && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48">
                            <Image src={fileUrl} alt={content} fill className="object-cover" />
                        </a>
                    )}
                    {isPDF && (
                        <div>
                            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline">
                                    PDF File
                                </a>
                            </div>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn(
                            "text-sm text-zinc-600 dark:text-zinc-300",
                            deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                        )}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center w-full gap-x-2 pt-2">
                                <FormField control={form.control} name="content" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <div className="relative w-full">
                                                <Input disabled={isLoading} className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200" placeholder="Edited message" {...field} />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <Button disabled={isLoading} size="sm" variant="primary">
                                    Save
                                </Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400">
                                Press escape to cancel, enter to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>

            {canDeleteMessage && (
                <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
                    {canEditMessage && (
                        <ActionToolTip label="Edit">
                            <Edit onClick={() => setIsEditing(true)} className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                        </ActionToolTip>
                    )}
                    <ActionToolTip label="Delete">
                        <Trash
                            onClick={() => onOpen("deleteMessage", {
                                apiUrl: `${socketUrl}/${id}`,
                                query: socketQuery
                            })}
                            className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                    </ActionToolTip>
                </div>
            )}

        </div>
    )
}