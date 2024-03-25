import { Channel, ChannelType, Server } from "@prisma/client";
import { create } from "zustand"

// Hook para abrir un modal segun el tipo que necesitamos

// Seteamos los modalType que estaran disponibles

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer" | "deleteServer" | "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage";

// Creamos una interface para los datos que necesitaremos para los distintos modales

interface ModalData {
    server?: Server
    channel?: Channel;
    channelType?: ChannelType
    apiUrl?: string
    query?: Record<string, any>
}

// Creamos una interface para el estado que usara zustand para nuestro estado global del hook

interface ModalStore {
    type: ModalType | null
    data: ModalData
    isOpen: boolean
    onOpen: (type: ModalType, data?: ModalData) => void
    onClose: () => void
}

// Creamos el estado global con zustand a partir del ModalStore

// Va a tener el type del modal, la data que podra recibir eventualmente (ModalData), si esta abierto o no (isOpen), la funcion onOpen que va a disparar la apertura del modal (esta cambia el isOpen a true, y setea el type y el data que le enviamos), y la funcion onClose, que setea el type en null y el isOpen en false para cerrar el modal. 

export const useModal = create<ModalStore>((set) => ({
    type: null,
    data: {},
    isOpen: false,
    onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
    onClose: () => set({ type: null, isOpen: false })
}))