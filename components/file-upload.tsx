"use client"

import { File, X } from "lucide-react"
import Image from "next/image"
import { UploadDropzone } from "@/lib/uploadthing"
import "@uploadthing/react/styles.css"

interface FileUploadProps {
    onChange: (url?: string) => void
    value: string
    endpoint: "messageFile" | "serverImage"
}

// Componente creado con Upload Thing para manejar la carga de archivos pdf e imagenes en la nube. 

export default function FileUpload({
    onChange,
    value,
    endpoint
}: FileUploadProps) {

    // Verificamos el tipo de archivo buscando su extension (pdf, jpg, etc)
    const fileType = value?.split(".").pop()

    // Si tenemos un valor y no es pdf cargamos un componente de imagen
    if (value && fileType !== "pdf") {
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="rounded-full"
                />
                <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm" type="button">
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    // Si tenemos valor y es pdf cargamos lo siguiente
    if (value && fileType === "pdf") {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <File className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a href={value} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline">
                    {value}
                </a>
                <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm" type="button">
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    // De base, cargamos la zona de carga para un archivo, configurado segun lo que informa Upload Thing
    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url)
            }}
            onUploadError={(error: Error) => {
                console.log(error)
            }}
        />
    )
}