"use client"

import axios from "axios"
import { useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Este modal es para salir de un servidor.

export default function LeaveServerModal() {

    // Consumimos el hook useModal. Utilizaremos las funciones isOpen y onClose, y el estado de type (tipo de modal) y data (objeto con la data).

    const { isOpen, onClose, type, data } = useModal()
    const router = useRouter()

    // Seteamos un estado para controlar el envio de un evento.

    const [isLoading, setIsLoading] = useState(false);

    // isModalOpen va a ser true cuando el isOpen === true y el type sea "leaveServer"

    const isModalOpen = isOpen && type === "leaveServer"

    // Recuperamos el server del objeto data

    const { server } = data;

    // Creamos la funcion onClick para salir del server

    const onClick = async () => {
        try {
            setIsLoading(true)

            await axios.patch(`/api/servers/${server?.id}/leave`)

            onClose
            router.refresh()
            router.push("/")
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    // El modal tiene un content que encierra todo. Un header donde estara el titulo y el description. Y despues el form que utilizamos la misma metologia de siempre con el useForm.

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Leave Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to leave <span className="font-semibold text-indigo-500">{server?.name
                        }</span>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button disabled={isLoading}
                            onClick={onClose}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button disabled={isLoading}
                            variant="primary"
                            onClick={onClick}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}