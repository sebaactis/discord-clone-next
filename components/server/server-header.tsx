"use client"

import { ServerWithMembersWithProfiles } from "@/types"
import { MemberRole } from "@prisma/client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOutIcon, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react"
import { useModal } from "@/hooks/use-modal-store"

interface ServerHeaderProps {
    server: ServerWithMembersWithProfiles
    role?: MemberRole
}

// El server y el role viene de las props cuando renderizamos el componente. 

export default function ServerHeader({
    server, role
}: ServerHeaderProps) {

    // Recuperamos la funcion del useModal para abrir el modal

    const { onOpen } = useModal();

    // Creamos variables para saber el usuario actual es ADMIN o MODERATOR

    const isAdmin = role === MemberRole.ADMIN
    const isModerator = isAdmin || role === MemberRole.MODERATOR

    // Creamos un DropDownMenu, para tener las diferentes gestiones del servidor en una lista desplegable.

    return (
        <DropdownMenu>

            {/* El trigger es lo que se ve inicialmente, el inicial */}

            <DropdownMenuTrigger className="focus:outline-none" asChild>
                <button className="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                    {server.name}
                    <ChevronDown className="h-5 w-5 ml-auto" />
                </button>
            </DropdownMenuTrigger>

            {/* El contenido es lo que se vera cuando abramos el desplegable */}
            {/* Veremos opciones en base de si somos moderadores o admin, o si no somos nada. */}
            {/* Usaremos en cada item, la funcion para abrir el modal, al que le pasamos el tipo de modal que vamos a abrir, y un objeto con la data importante para ese modal */}

            <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen("invite", { server })}
                        className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer">
                        Invite People
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {isAdmin && (
                    <DropdownMenuItem onClick={() => onOpen("editServer", { server })} className="px-3 py-2 text-sm cursor-pointer">
                        Server Settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {isAdmin && (
                    <DropdownMenuItem onClick={() => onOpen("members", { server })} className="px-3 py-2 text-sm cursor-pointer">
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {isModerator && (
                    <DropdownMenuItem onClick={() => onOpen("createChannel")} className="px-3 py-2 text-sm cursor-pointer">
                        Create Channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {isModerator && (
                    <DropdownMenuSeparator />
                )}

                {isAdmin && (
                    <DropdownMenuItem onClick={() => onOpen("deleteServer", { server })} className="text-rose-500 px-3 py-2 text-sm cursor-pointer">
                        Delete Server
                        <Trash className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {!isAdmin && (
                    <DropdownMenuItem onClick={() => onOpen("leaveServer", { server })} className="text-rose-500 px-3 py-2 text-sm cursor-pointer">
                        Leave Server
                        <LogOutIcon className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}