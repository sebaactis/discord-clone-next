"use client"

import axios from "axios"
import { useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Este modal se utilizara para eliminar un server.

export default function DeleteServerModal() {

    // Utilizaremos las funciones isOpen y onClose del useModal, y los estados type y data.

    const { isOpen, onClose, type, data } = useModal()
    const router = useRouter()

    // Seteamos un estado para controlar si esta cargando o no al eliminar el canal.

    const [isLoading, setIsLoading] = useState(false);

    // El isModalOpen sera true cuando isOpen sea true, y el type sea "deleteServer"

    const isModalOpen = isOpen && type === "deleteServer"

    // Recuperamos el server del objeto data.

    const { server } = data;

    // Creamos una funcion onClick para eliminar el server.

    const onClick = async () => {
        try {
            setIsLoading(true)

            await axios.delete(`/api/servers/${server?.id}`)

            onClose
            router.refresh()
            router.push("/")
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    // El modal tiene un content que encierra todo. Un header donde estara el titulo y la descripcion. Y despues el form que utilizamos la misma metologia de siempre con el useForm.

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Delete Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to do this? <br />
                        <span className="font-semibold text-indigo-500">{server?.name}</span> will be permanently deleted
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