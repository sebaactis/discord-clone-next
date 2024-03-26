import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import NavigationSideBar from "@/components/navigation/navigation-sidebar";
import ServerSidebar from "@/components/server/server-sidebar";

// Renderizamos un mobile-toggle, que va a estar disponible cuando estemos en tamaño mobile.

export default function MobileToogle({
    serverId
}: { serverId: string }) {

    // Vamos a renderizar el SheetTrigger que va a ser el boton visible que vamos a tener, y dentro de el renderizaremos un boton con el icono Menu dentro

    // El contenido de esto va a ser nuestro navigation sidebar y el serversidebar. Esto es que cuando abramos el sheet, se muestren.

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0">
                <div className="w-[72px]">
                    <NavigationSideBar />
                </div>
                <ServerSidebar
                    serverId={serverId}
                />
            </SheetContent>
        </Sheet>
    )
}