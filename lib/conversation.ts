import { db } from "@/lib/db";

export async function getOrCreateConversation(memberOneId: string, memberTwoId: string) {

    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId)

    if (!conversation) {
        conversation = await createNewConversation(memberOneId, memberTwoId)
    }

    return conversation
}

export async function findConversation(memberOneId: string, memberTwoId: string) {

    try {
        return await db.conversation.findFirst({
            where: {
                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })
    } catch {
        return null
    }
}

export async function createNewConversation(memberOneId: string, memberTwoId: string) {
    try {

        return await db.conversation.create({
            data: {
                memberOneId,
                memberTwoId
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })

    } catch {
        return null
    }
}