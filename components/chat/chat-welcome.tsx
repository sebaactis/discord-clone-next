import { Hash } from "lucide-react"

// Componente para renderizar el mensaje de bienvenida de un chat.

interface ChatWelcomeProps {
    name: string
    type: "channel" | "conversation"
}

// Recibe por pros el nombre del canal y el tipo

export const ChatWelcome = ({
    name,
    type
}: ChatWelcomeProps) => {


    // Retorna un Hash si es un canal
    // Retorna un mensaje segun si es channel o conversation

    return (
        <div className="space-y-2 px-4 mb-4">
            {type === "channel" && (
                <div className="h-[60px] w-[60px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center">
                    <Hash className="h-10 w-10 text-white" />
                </div>
            )}
            <p className="text-xl md:text-3xl font-bold">
                {type === "channel" ? "Welcome to #" : ""}{name}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {type === "channel" ? `This is the start of the #${name} channel` : `This is the start of your conversation with ${name}`}
            </p>
        </div>
    )
}