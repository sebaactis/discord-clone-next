import { useEffect, useState } from "react"

export default function useOrigin() {

    // Este hook se utiliza para recuperar la url de la ventana actual que estamos en el navegador.

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true)
    }, [])

    // Verificamos si window esta definido (esto para verificar que estemos en un entorno de navegador web), y si window.location.origin es true, si se cumple, seteamos el origin con ese valor, sino devolvemos un string vacio. F

    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : ""

    if (!mounted) return ""

    return origin
}
