"use client"

import qs from "query-string"
import axios from "axios"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useModal } from "@/hooks/use-modal-store"
import { useRouter } from "next/navigation"
import { ChannelType } from "@prisma/client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

// Este modal es para editar un canal.

// Creamos con zod el schema para validar el formulario para editar el canal.
// Es muy similar al de create channel

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required"
    }).refine(
        name => name !== "general",
        { message: "Channel name cannot be 'general'" }
    ),
    type: z.nativeEnum(ChannelType)
})

export default function EditChannelModal() {

    // Consumimos el hook useModal. Utilizaremos las funciones isOpen y onClose, y el estado de type (tipo de modal) y data (objeto con la data).

    const { isOpen, onClose, type, data } = useModal()
    const router = useRouter()

    // isModalOpen va a ser true cuando el isOpen === true y el type sea "editChannel"

    const isModalOpen = isOpen && type === "editChannel"

    // Recuperamos el channel y el server del objeto data

    const { channel, server } = data;

    // Creamos un formulario con el useForm de react-hook-form. El resolver es el que validara el formulario con el formSchema de zod.
    // Resaltamos que como valor por defecto, vamos a usar el channelType que recuperamos de data, o en su defecto, pondremos ChannelType.TEXT

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channel?.type || ChannelType.TEXT
        }
    })

    // Creamos un efecto, donde verificamos si existe el channel. En caso de que exista, seteamos por defecto los valores del form con el nombre y el type del canal actual.

    useEffect(() => {
        if (channel) {
            form.setValue("name", channel.name)
            form.setValue("type", channel.type)
        }
    }, [form, channel])

    // Verificamos si el formulario esta cargando con el formState.isSubmitting de useForm.

    const isLoading = form.formState.isSubmitting

    // Creamos la funcion onSubmit para editar el canal.

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })

            await axios.patch(url, values)

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
                        Edit channel
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <div className="space-y-8 px-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Channel name
                                        </FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0" placeholder="Enter channel name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Channel Type</FormLabel>
                                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                                                <SelectValue placeholder="Select a channel type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(ChannelType).map((type) => (
                                                <SelectItem key={type} value={type} className="capitalize">
                                                    {type.toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}