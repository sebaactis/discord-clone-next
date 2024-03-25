"use client"

import axios from "axios"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import qs from "query-string"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/file-upload"
import { useRouter } from "next/navigation"
import { useModal } from "@/hooks/use-modal-store"

// Este modal es para subir un archivo a un conversacion o chat.

// Creamos el schema con zod para validar el formulario.

const formSchema = z.object({
    fileUrl: z.string().min(1, {
        message: "Attachment is required"
    })
})


export default function MessageFileModal() {

    // Consumimos el hook useModal. Utilizaremos las funciones isOpen y onClose, y el estado de type (tipo de modal) y data (objeto con la data).


    const { isOpen, onClose, type, data } = useModal();

    // Recuperamos la apiUrl y la query del objeto data.

    const { apiUrl, query } = data;
    const router = useRouter()

    // isModalOpen va a ser true cuando el isOpen === true y el type sea "messageFile"

    const isModalOpen = isOpen && type === "messageFile"

    // Creamos un formulario con el useForm de react-hook-form. El resolver es el que validara el formulario con el formSchema de zod. 

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileUrl: ""
        }
    })

    // Creamos un handleClose para cerrar el modal.

    const handleClose = () => {
        form.reset();
        onClose();
    }

    // Verificamos si el formulario esta cargando con el formState.isSubmitting de useForm.

    const isLoading = form.formState.isSubmitting

    // Creamos una funcion onSubmit para cargar el archivo.

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {

            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query
            })

            await axios.post(url, {
                ...values,
                content: values.fileUrl
            })

            form.reset();
            router.refresh();
            onClose()
        } catch (error) {
            console.log(error)
        }
    }

    // El modal tiene un content que encierra todo. Un header donde estara el titulo y el description. Y despues el form que utilizamos la misma metologia de siempre con el useForm.

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Send a file as a message
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                    control={form.control}
                                    name="fileUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="messageFile"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Send
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}