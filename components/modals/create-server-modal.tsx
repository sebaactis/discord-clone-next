"use client"

import axios from "axios"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/file-upload"
import { useRouter } from "next/navigation"
import { useModal } from "@/hooks/use-modal-store"

// Este modal se usara para la creacion de un servidor.

// Utilizamos zod para crear el schema de validacion. 

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required"
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required"
    })
})



export default function CreateServerModal() {

    // Usamos las funciones isOpen y onClose del usaModal, ademas del estado de type.

    const { isOpen, onClose, type } = useModal()
    const router = useRouter()

    // Seteamos el isModalOpen si isOpen es true, y el type es "createServer"

    const isModalOpen = isOpen && type === "createServer"

    // Creamos un formulario con el useForm de react-hook-form. El resolver es el que validara el formulario con el formSchema de zod.

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: ""
        }
    })

    // Verificamos si el formulario esta cargando con el formState.isSubmitting de useForm.

    const isLoading = form.formState.isSubmitting

    // Creamos la funcion onSubmit para crear el server.

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post("/api/servers", values)

            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error)
        }
    }

    // Creamos la funcion handleClose para cerrar el modal.

    const handleClose = () => {
        form.reset()
        onClose()
    }

    // El modal tiene un content que encierra todo. Un header donde estara el titulo. Y despues el form que utilizamos la misma metologia de siempre con el useForm.

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Create your server!
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image. You can always change it later.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Server name
                                        </FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0" placeholder="Enter server name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}