import { memo } from "react";

export interface MessageBubbleProps {
    actor: string;
    chatId: string | string[];
    content: {
        type: string;
        value: string;
    }
}

export default function MessageBubble({ actor, content, chatId }: MessageBubbleProps) {
    console.log("Rendering MessageBubble");
    console.log(actor)

    return (
        <div className={`flex ${actor === 'agent' ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-2 mb-2 rounded-lg ${actor === 'agent' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                {content.value}
            </div>
        </div>
    );
}

