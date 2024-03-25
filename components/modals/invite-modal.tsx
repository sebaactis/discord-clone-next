"use client"

import axios from "axios"
import { useState } from "react"
import { Check, Copy, RefreshCw } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useOrigin from "@/hooks/use-origin"

// Este modal servira para generar el link de invite para un servidor.

export default function InviteModal() {

    // Utilizamos las funciones onOpen y onClose del useModal, y el estado isOpen, type y data.

    const { onOpen, isOpen, onClose, type, data } = useModal()

    // Utilizamos el hook useOrigin para recuperar la url actual en la que estamos.

    const origin = useOrigin();

    // Creamos dos estados, uno para controlar si copiamos o no el invite code, y el otro para verificar si esta cargando nuestro formulario.

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // isModalOpen va a ser true cuando el isOpen === true y el type sea "invite"

    const isModalOpen = isOpen && type === "invite"

    // Recuperamos el server del objeto data
    
    const { server } = data;

    // Creamos el inviteUrl con el origin (url actual), invite y el invite code del servidor.   

    const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

    // Creamos una funcion onCopy para manejar el copiado de la url.

    const onCopy = () => {

        // Esta linea copia el texto que le pasamos por parametro en el portapapeles. Navigator es un objeto global del navegador.
        navigator.clipboard.writeText(inviteUrl)
        setCopied(true);

        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }

    // Creamos una funcion onNew para generar un invite code nuevo. 

    const onNew = async () => {
        try {
            setIsLoading(true)
            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`)

            onOpen("invite", { server: response.data })

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    // El modal tiene un content que encierra todo. Un header donde estara el titulo. Y despues el form que utilizamos la misma metologia de siempre con el useForm.

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Invite Friends
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server invite link
                    </Label>
                    <div className="flex items-center mt-2 gap-x-2">
                        <Input
                            className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                            value={inviteUrl}
                            disabled={isLoading}
                        />
                        <Button disabled={isLoading} size="icon" onClick={onCopy}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>   
                    </div>
                    <Button
                        onClick={onNew}
                        disabled={isLoading}
                        variant="link"
                        size="sm"
                        className="text-xs text-zinc-500 mt-4">
                        Generate a new link
                        <RefreshCw className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}