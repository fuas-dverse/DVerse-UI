import {NextRequest} from "next/server";
import {kafkaProducer} from "@/lib/kafka/kafkaProducer";
import {generateRandomID} from "@/lib/generateRandomID";
import {auth} from "@/auth";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const message = req.nextUrl.searchParams.get("message")

    if (!message) {
        return new Response("Message is required", {status: 400})
    }
    const session = await auth()

    if (!session) {
        return new Response("User is required", {status: 400})
    }

    const id = generateRandomID()

    const kafkaMessage = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "@type": "Note",
        "content": message,
        "actor": session.user!.id,
    }

    await kafkaProducer.connect()
    await kafkaProducer.send({
        topic: "agents.status",
        messages: [
            {
                value: JSON.stringify(kafkaMessage),
                headers: {
                    "message-id": id,
                }
            }
        ],
    })

    return new Response("Message sent: " + kafkaMessage, {status: 200})
}
