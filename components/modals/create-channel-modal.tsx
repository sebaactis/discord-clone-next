"use client"

import qs from "query-string"
import axios from "axios"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useModal } from "@/hooks/use-modal-store"
import { useParams, useRouter } from "next/navigation"
import { ChannelType } from "@prisma/client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

// Modal para crear un canal

// Creamos el schema para la creacion del canal, y validar la informacion. El refine nos va a permitir verificar que el nombre del canal no sea general.

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required"
    }).refine(
        name => name !== "general",
        { message: "Channel name cannot be 'general'" }
    ),
    type: z.nativeEnum(ChannelType)
})

export default function CreateChannelModal() {

    // Consumimos el hook useModal. Utilizaremos las funciones isOpen y onClose, y el estado de type (tipo de modal) y data (objeto con la data).

    const { isOpen, onClose, type, data } = useModal()
    const router = useRouter()
    const params = useParams()

    // isModalOpen va a ser true cuando el isOpen === true y el type sea "createChannel"

    const isModalOpen = isOpen && type === "createChannel"

    // Recuperamos el channelType del objeto data actual.

    const { channelType } = data;

    // Creamos un formulario con el useForm de react-hook-form. El resolver es el que validara el formulario con el formSchema de zod.
    // Resaltamos que como valor por defecto, vamos a usar el channelType que recuperamos de data, o en su defecto, pondremos ChannelType.TEXT

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT
        }
    })

    // La idea de este efecto, es verificar si tenemos un channelType cuando abrimos el modal. En caso de tenerlo (le estaremos pasando el channelType actual), ya lo seteamos como valor por defecto. Esto es para utilizarlo en los botones puntuales de agregar canal en los botones de voice channels o video channels.

    useEffect(() => {
        if (channelType) {
            form.setValue("type", channelType)
        } else {
            form.setValue("type", ChannelType.TEXT)
        }
    }, [channelType, form])

    // Verificamos si el formulario esta cargando con el formState.isSubmitting de useForm.

    const isLoading = form.formState.isSubmitting

    // Creamos la funcion onSubmit para crear el canal.

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: "/api/channels",
                query: {
                    serverId: params?.serverId
                }
            })

            await axios.post(url, values)

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
                        Create channel
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
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}