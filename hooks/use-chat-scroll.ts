import { useEffect, useState } from "react"

// Este hook es para setear y realizar la carga de mensajes al scrollear.

// Creamos un type que recibe el chatRef y el bottomRef (tope arriba y abajo), un shouldLoadMore (a ver si podemos cargar mas mensajes), la funcion loadMore para poder cargar mas mensajes y el count.

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>
    bottomRef: React.RefObject<HTMLDivElement>
    shouldLoadMore: boolean
    loadMore: () => void
    count: number
}

export const useChatScroll = ({
    chatRef,
    bottomRef,
    shouldLoadMore,
    loadMore,
    count
}: ChatScrollProps) => {

    // Creamos un estado para ver si esta inicializado o no, esto es para no repetir el efecto apenas se renderiza el componente, ya que lo usaremos para el scroll automatico.
    const [hasInitialized, setHasInitialized] = useState(false)

    useEffect(() => {

        // Seteamos topDiv con el valor de chatRef.current (el tope de arriba)
        const topDiv = chatRef?.current;

        // Creamos una funcion 
        const handleScroll = () => {

            // Recuperamos el scrollTop de nuestro topDiv (cuanto se desplazo verticalmente el elemento)
            const scrollTop = topDiv?.scrollTop;

            // Si scrolltop = 0, es decir, que el usuario esta arriba del todo del contenedor, y podemos cargar mas mensajes, realizamos la carga.
            if (scrollTop === 0 && shouldLoadMore) {
                loadMore();
            }
        }

        // Escuchamo el evento scroll para que funcione activamente

        topDiv?.addEventListener("scroll", handleScroll)

        // Lo removemos para no crear event listeners repetidos

        return () => {
            topDiv?.removeEventListener("scroll", handleScroll)
        }
    }, [shouldLoadMore, loadMore, chatRef])

    useEffect(() => {

        // Seteamos el bottomDiv y el topDiv con los valor de bottomRef y chatRef current respectivamente.

        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;
        const shouldAutoScroll = () => {

            // Creamos esta funcion y verificamos si hasinitialized es false, y si existe bottomDiv. En ese caso paso el hasinitialized a true.
            if (!hasInitialized && bottomDiv) {
                setHasInitialized(true)
                return true
            }

            // Si no existe topDiv retornamos el false.

            if (!topDiv) return false;

            // Calculamos la distancia desde abajo con scrollHeight (distancia total que ocupa el contenido), scrollTop (la cantidad de desplazamiento vertical que ocurrio en el div) y clientHeigth (representa la altura visible)
            // Esto calcula la distancia desde la parte inferior del contenido visible en topDiv hasta la parte inferior de la ventana de visualización actual.

            const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight

            // Retornamos cuando esa cuenta sea menor a 100
            return distanceFromBottom <= 100;
        }

        // Si es menor a 100, nos va a dar true la funcion, y ejecutamos el scroll automatico, usando scrollIntWiew (es una funcion que hace que el elemento se muestre en pantalla de forma completa)
        if (shouldAutoScroll()) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth"
                })
            }, 100)
        }

    }, [bottomRef, chatRef, count, hasInitialized])

}