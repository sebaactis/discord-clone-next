import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { UserButton } from "@clerk/nextjs"

import NavigationAction from "./navigation-action"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import NavigationItem from "./navigation-item"
import { ModeToggle } from "@/components/mode-toggle"

// Renderizamos el sidebar comun a todas las paginas.

export default async function NavigationSideBar() {

    // Recuperamos el perfil actual de clerk.

    const profile = await currentProfile()
    if (!profile) return redirect("/")

    // Con el perfil que recuperamos, buscamos los servidores que tenga en sus miembros a dicho perfil.

    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    // Vamos a renderizar varios items en el sidebar:
    // 1) Componente NavigationAction: nos va a dar la posibilidad de agregar un servidor
    // 2) Separator: una linea divisora.
    // 3) ScrollArea: dentro de el, vamos a renderizar los servers recuperados anteriormente para ponerlos en una lista scrolleable. Por cada server renderizamos un NavigationItem.
    // 4) ModeToggle: es un toggle para cambiar de modo claro a obscuro.
    // 5) UserButton: viene de clerk, es para gestionar la sesion del usuario (cerrar sesion por ejemplo)

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
            <NavigationAction />
            <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
            <ScrollArea className="flex-1 w-full">
                {
                    servers.map((server) => {
                        return (
                            <div key={server.id} className="mb-4">
                                <NavigationItem
                                    id={server.id}
                                    name={server.name}
                                    imageUrl={server.imageUrl}
                                />
                            </div>
                        )
                    })
                }
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle />
                <UserButton afterSignOutUrl="/" appearance={{
                    elements: {
                        avatarBox: "h-[48px] w-[48px]"
                    }
                }} />
            </div>
        </div>
    )
}
