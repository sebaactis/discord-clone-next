"use client"

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

import { Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ServerSearchProps {
    data: {
        label: string
        type: "channel" | "member"
        data: {
            icon: React.ReactNode
            name: string
            id: string
        }[] | undefined
    }[]
}

// Recibimos por props el label, el type y un objeto data con el icon, name y string

export default function ServerSearch({
    data
}: ServerSearchProps) {

    // Creamos un estado para controlar si el cuadro de busqueda esta abierto o cerrado

    const [open, setOpen] = useState(false)
    const router = useRouter();
    const params = useParams();

    // Creamos un efecto para poder cerrar el modal de busqueda, con la tecla de escape. Agregamos el evento keydown para escuchar el evento y lo removemos para no acumularlo. 

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Creamos un evento onClick que recibe dos parametros, el id y el tipo
    // Cerramos el modal cuando damos click en la opcion que buscamos.
    // Y dependiendo si es miembro y canal, redireccionamos hacia la url correspondiente del canal o miembro al que queremos ingresar

    const onClick = ({ id, type }: { id: string, type: "channel" | "member" }) => {
        setOpen(false);

        if (type === "member") return router.push(`/servers/${params?.serverId}/conversations/${id}`)
        if (type === "channel") return router.push(`/servers/${params?.serverId}/channels/${id}`)

    }



    return (
        <>
            <button onClick={() => setOpen(true)} className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group:hover:text-zinc-600 dark:group:hover:text-zinc-300 transition">
                    Search
                </p>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foregroud ml-auto">
                    <span className="text-xs">CTRL</span>K
                </kbd>
            </button>

            {/* Cuando open es true, abrimos el comando de dialogo */}
            {/* Renderizamos el input para buscar, y el Empty para cuando no tenemos resultados */}


            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search all channels and members" />
                <CommandList>
                    <CommandEmpty>
                        No result found
                    </CommandEmpty>
                    {/* Primero renderizamos cada seccion que tenemos  */}
                    {data.map(({ label, type, data }) => {
                        if (!data?.length) return null
                        {/* Y luego renderizamos cada item que corresponda a cada seccion */ }
                        return (
                            <CommandGroup key={label} heading={label}>
                                {data?.map(({ id, icon, name }) => {
                                    return (
                                        <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                                            {icon}
                                            <span>{name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )
                    })}
                </CommandList>
            </CommandDialog>
        </>
    )
}