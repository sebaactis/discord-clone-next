
import { auth } from "@clerk/nextjs"
import { createUploadthing, type FileRouter } from "uploadthing/next";

// Componente que realiza la carga del archivo

const f = createUploadthing();

// Manejamos que la carga la este realizando solo un usuario autorizado.
const handleAuth = () => {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized")
    return { userId: userId }
}

// Configuramos las dos opciones de carga

export const ourFileRouter = {
    serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),

    messageFile: f(["image", "pdf"])
        .middleware(() => handleAuth())
        .onUploadComplete(() => { })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;