import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    className?: string
}

// Componente que renderiza el avatar del usuario. Recibe por props el link de la imagen del avatar y los classnames.
// Renderizamos componentes de avatar de shacn

export default function UserAvatar({
    src, className
}: UserAvatarProps) {
    return (
        <Avatar className={cn(
            "h-7 w-7 md:h-10 md:w-10",
            className
        )}>
            <AvatarImage src={src} />
        </Avatar>
    )
}