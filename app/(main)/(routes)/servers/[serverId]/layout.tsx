import ServerSidebar from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Layout comun a todos las paginas de servidores

export default async function ServerIdLayout({ children, params }: {
    children: React.ReactNode,
    params: { serverId: string }

}) {

    // Recuperamos el perfil actual de clerk

    const profile = await currentProfile();
    if (!profile) return redirectToSignIn()

    // Buscamos el servidor con el serverId de params.

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })


    // Si no existe, volvemos a la ruta inicial (iremos al InitialModal)

    if (!server) return redirect("/")

    // Renderizamos el Sidebar del servidor, que es comun a todos los servidores, y el children es el resto de servidor

    return (
        <div className="h-full">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={params.serverId} />
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    )
}
