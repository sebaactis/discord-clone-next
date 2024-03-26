import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Esta util es para usar la funcion cn, que nos permite tener classNames dinamicos segun condiciones.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
