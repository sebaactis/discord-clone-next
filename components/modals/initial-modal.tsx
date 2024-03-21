"use client"

import axios from "axios"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/file-upload"
import { useRouter } from "next/navigation"

// Modal para crear un servidor nuevo cuando no tenemos ninguno asignado


// Schema de zod para validar el formulario de creacion de servidor
const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required"
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required"
    })
})

export default function InitialModal() {

    // Lo utilizamos para verificar si ya se monto el componente y no tener problemas de ....
    const [isMounted, setIsMounted] = useState(false)

    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])


    // Creamos el formulario con el hook useForm de react-hook-form
    // El resolver es el que valida la integridad de los datos del formulario con el schema de zod.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: ""
        }
    })

    // Verificamos si el formulario esta cargando. formState.isSubmitting es propio de useForm.
    const isLoading = form.formState.isSubmitting

    // Funcion que envia la peticion para crear un servidor en la DB.
    // Reciba los valores del form (tipo de dato inferido del schema de zod) 
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // No agregamos la ruta completa porque en los componentes de cliente de Next, toma la ruta de la web por defecto
            await axios.post("api/servers", values)

            form.reset();
            router.refresh();
            window.location.reload()

        } catch (error) {
            console.log(error)
        }
    }

    // Si el componente no esta montado todavia no renderizamos nada. 
    if (!isMounted) {
        return null
    }

    // Retornamos un componente Dialog de ShadCN. 
    return (
        <Dialog open>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-bold">
                        Create your server!
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image. You can always change it later.
                    </DialogDescription>
                </DialogHeader>

                {/* Le pasamos los datos del formulario de useForm al componente Form */}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                {/* Renderizamos cada campo del formulario con un FormField.

                                Debemos asigarne la prop control. Se utiliza internamente en el componente FormField para interactuar con React Hook Form y obtener los campos del formulario registrados. Cuando se utiliza form.control como valor de la propiedad control, React Hook Form hace que los campos de entrada dentro de FormField estén bajo su control.

                                Le debemos pasar una prop render que recibe el objeto field (referencia al field del formulario correspondiete */}
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {/* Componente para la carga de imagenes */}
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