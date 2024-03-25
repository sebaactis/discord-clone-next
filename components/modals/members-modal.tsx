"use client"
import { useState } from "react"
import { ServerWithMembersWithProfiles } from "@/types"
import { MemberRole } from "@prisma/client"
import qs from "query-string"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import UserAvatar from "@/components/user-avatar"
import { Check, Gavel, Loader2, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuTrigger, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"

// Este modal se utilizara para ver los miembros actuales del servidor.

// Creamos un objeto roleIconMap, para asignar diferentes iconos segun el tipo de rol de cada usuario.

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500 " />,
    "ADMIN": <ShieldAlert className="h-4 w-4 text-rose-500" />
}


export default function MembersModal() {

    const router = useRouter()

    // Consumimos el hook useModal. Utilizaremos las funciones isOpen y onClose, y el estado de type (tipo de modal), data (objeto con la data) y isOpen.

    const { onOpen, isOpen, onClose, type, data } = useModal()

    // Seteamos un estado loadingId. Esto va a ser para utilizarlo para controlar las cargas de cada usuario puntual.

    const [loadingId, setLoadingId] = useState("")

    // isModalOpen va a ser true cuando el isOpen === true y el type sea "members"

    const isModalOpen = isOpen && type === "members"

    // Recuperamos el server del objeto data, y le decimos que server va a ser de tipo ServerWithMembersWithProfiles

    const { server } = data as { server: ServerWithMembersWithProfiles };

    // Creamos una funcion onKick para poder kickear a un usuario del servidor.

    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId)
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server?.id
                }
            })

            const response = await axios.delete(url)
            router.refresh();
            onOpen("members", { server: response.data })

        } catch (error) {
            console.log(error)
        } finally {
            setLoadingId("")
        }
    }

    // Creamos una funcion onRoleChange para cambiarle el rol a un usuario.

    const onRoleChange = async (memberId: string, role: MemberRole) => {
        try {
            setLoadingId(memberId)
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server?.id
                }
            })

            const response = await axios.patch(url, { role })

            router.refresh();
            onOpen("members", { server: response.data })

        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId("")
        }
    }

    // El modal tiene un content que encierra todo. Un header donde estara el titulo y el description. Y despues el form que utilizamos la misma metologia de siempre con el useForm.

    // Tendremos un ScrollArea donde renderizaremos cada usuario que tengamos en server.members.
    // Ademas le vamos a asignar un boton a cada uno (salvo que seamos el administrador), para poder cambiarle el rol o kickearlo del servidor.

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Manage Members
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        {server?.members?.length} Members
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {server?.members?.map((member) => (
                        <div key={member.id} className="flex items-center gap-x-2 mb-6">
                            <UserAvatar src={member.profile.imageUrl} />
                            <div className="flex flex-col gap-y-1">
                                <div className="text-xs font-semibold flex items-center gap-x-1">
                                    {member.profile.name}
                                    {roleIconMap[member.role]}
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {member.profile.email}
                                </p>
                            </div>
                            {server.profileId !== member.profileId && loadingId !== member.id && (
                                <div className="ml-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="h-4 w-4 text-zinc-500 border-none" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="left">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="flex items-center">
                                                    <ShieldQuestion className="w-4 h-4 mr-2" />
                                                    <span> Role</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "GUEST")}>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Guest
                                                            {member.role === "GUEST" && (
                                                                <Check className="h-4 w-4 ml-auto" />
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "MODERATOR")}>
                                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                                            Moderator
                                                            {member.role === "MODERATOR" && (
                                                                <Check className="h-4 w-4 ml-auto" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onKick(member.id)}>
                                                <Gavel className="h-4 w-4 mr-2" />
                                                Kick
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            {loadingId === member.id && (
                                <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog >
    )
}