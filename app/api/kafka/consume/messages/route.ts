// app/api/streamMessages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { startConsumer, stopConsumer, consumeMessages } from '@/lib/kafka/kafkaConsumer';

export const dynamic = 'force-dynamic'


export async function GET(req: NextRequest) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    let streamOpen = true;

    const sendMessage = (message: string) => {
        console.log('Sending message: ', message)
        if (streamOpen) {
            console.log("stream open: ", streamOpen)
            try {
                console.log("writing message: ", message)
                writer.write(encoder.encode(`data: ${message}\n\n`));
            } catch (error) {
                console.error('Failed to write message:', error);
                streamOpen = false;
                writer.close();
            }
        }
    };

    await startConsumer("agents.status");

    consumeMessages(sendMessage).catch((error) => {
        console.error('Error consuming messages:', error);
        streamOpen = false;
        writer.close();
    });

    req.signal.addEventListener('abort', () => {
        console.log('Connection closed by the client');
        streamOpen = false;
        stopConsumer().then(() => writer.close());
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
