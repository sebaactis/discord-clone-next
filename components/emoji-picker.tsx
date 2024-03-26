"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { Smile } from "lucide-react"
import { useTheme } from "next-themes"

// Renderizamos el emoji picker para poder agregar emojis a un mensaje.

// Vamos a tipear una funcion onchange que va a recibir un string como parametro.
interface EmojiPickerProps {
    onChange: (value: string) => void
}

export const EmojiPicker = ({
    onChange
}: EmojiPickerProps) => {

    // Vamos a usar el resolvedTheme de useTheme de next-themes. Esto va a servir para que el emoji picker vaya conjunto con el theme.

    const { resolvedTheme } = useTheme();

    // Renderizamos un popover, que es el estilo de ventana que emerge cuando damos click en el picker. Dentro de el usaremos el Picker instalado de emoji-mart para tener la funcionalidad de emojis.

    return (
        <Popover>
            <PopoverTrigger>
                <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
            </PopoverTrigger>
            <PopoverContent side="right" sideOffset={40} className="bg-transparent border-none shadow-none drop-shadow-none mb-16">
                <Picker data={data} onEmojiSelect={(emoji: any) => onChange(emoji.native)} theme={resolvedTheme} />
            </PopoverContent>
        </Popover>
    )
}