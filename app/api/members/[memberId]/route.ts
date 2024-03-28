import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server";


// La siguiente URL de API, sirve para eliminar miembros de un servidor, o editarle el rol a estos.
export async function DELETE(req: Request,
    { params }: { params: { memberId: string } }
) {
    // Recuperamos el memberId de los params de Next.
    try {
        // Recuperamos el perfil de clerk.
        const profile = await currentProfile();

        // Recuperamos los searchParams de la URL entrante.
        const { searchParams } = new URL(req.url)

        // De los searchParams, recuperamos el serverId.
        const serverId = searchParams.get("serverId")

        // Si no tenemos perfil, serverId o memberId, no avanza la request.
        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!serverId) return new NextResponse("Server ID missing", { status: 400 })
        if (!params.memberId) return new NextResponse("Member ID missing", { status: 400 })

        // Hacemos un update del servidor con el serverId y el profile.id del perfil logueado, y borramos los miembros que coincidan con el memberId, y que no sean el perfil actual. De la respuesta incluimos los perfiles de los miembros y los ordenamos de forma ascendente por su rol.
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[MEMBER_ID_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    // Recuperamos los params de Next.
    try {

        // Recuperamos el perfil de clerk.
        const profile = await currentProfile();

        // Recuperamos los searchParams de la URL entrante.
        const { searchParams } = new URL(req.url)

        // Recuperamos el rol del body de la request.
        const { role } = await req.json();

        // De los searchParams, recuperamos el serverId
        const serverId = searchParams.get("serverId");

        // Si no tenemos perfil, serverId o memberId, no avanza la request.
        if (!profile) return new NextResponse("Unauthorized", { status: 401 })
        if (!serverId) return new NextResponse("Server ID missing", { status: 400 })
        if (!params.memberId) return new NextResponse("Member ID missing", { status: 400 })

        // Realizamos el update del server con el serverId y el profile.id
        // Hacemos un update donde coincida el memberId en los miembros, y el profileId no sea el perfil actual
        // Seteamos el role con el role nuevo recibido. Incluimos los perfiles de los miembros y los ordenamos de forma ascendente con el role.
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: params.memberId,
                            profileId: {
                                not: profile.id
                            }
                        },
                        data: {
                            role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true,

                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server)


    } catch (error) {
        console.log("[MEMBER_ID_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

