"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Renderizamos el actiontooltip que utilizaremos con frecuencia.

interface ActionToolTipProps {
    label: string
    children: React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
    align?: "start" | "center" | "end"
}

// Va a recibir el label que va a usar, el children que es lo que tendra dentro, el side y el align.


export default function ActionToolTip({
    label, children, side, align
}: ActionToolTipProps) {

    // Renderizamos un ToolTipProvider, el trigger que es lo primero que veremos, aqui debemos recibir el contenido. Y el content que sera donde este el label.

    return (
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p className="font-semibold text-sm capitalize">
                        {label.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}