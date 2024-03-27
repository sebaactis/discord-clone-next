"use client"

import axios from "axios"
import qs from "query-string"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useModal } from "@/hooks/use-modal-store"
import { EmojiPicker } from "@/components/emoji-picker"
import { useRouter } from "next/navigation"

// Este componente renderiza el input para poder enviar mensajes en un chat

// Recibe por props la apiUrl, la query para la url de la api, el nombre, y el tipo de chat.
interface ChatInputProps {
    apiUrl: string
    query: Record<string, any>
    name: string
    type: "conversation" | "channel"
}

// Utilizamos un schema de zod para validar el input


const formSchema = z.object({
    content: z.string().min(1)
})

export const ChatInput = ({
    apiUrl,
    query,
    name,
    type
}: ChatInputProps) => {

    // Usamos la funcion onOpen de useModal();

    const { onOpen } = useModal();
    const router = useRouter();

    // Creamos un formulario con useForm.

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: ""
        }
    })

    // Creamos isLoading para ver cuando el formulario se esta subiendo.

    const isLoading = form.formState.isSubmitting;

    // Creamos la funcion onSubmit para crear el mensaje en la base de datos.

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl,
                query
            })

            await axios.post(url, values)

            form.reset();
            router.refresh();
        } catch (error) {
            console.log(error)
        }
    }

    // Creamos el formulario con el metodo de useForm para crear un input donde escribiremos el mensaje. Le sumamos el emojipicker para agregarle el emoji.

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className="relative p-4 pb-6">
                                <button type="button" onClick={() => onOpen("messageFile", { apiUrl, query })} className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center">
                                    <Plus className="text-white dark:text-[#313338]" />
                                </button>
                                <Input placeholder={`Message ${type === "conversation" ? name : "#" + name}`} disabled={isLoading} className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200" {...field} />
                                <div className="absolute top-7 right-8">
                                    <EmojiPicker onChange={(emoji: string) => field.onChange(`${field.value} ${emoji}`)} />
                                </div>
                            </div>
                        </FormControl>
                    </FormItem>
                )} />
            </form>
        </Form>
    )
}