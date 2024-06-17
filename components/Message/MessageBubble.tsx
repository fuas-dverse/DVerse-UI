import {memo} from "react";

export interface MessageBubbleProps {
    actor: string;
    chatId: string | string[];
    content: {
        type: string;
        value: string;
    }
}

export default function MessageBubble({actor, content, chatId}: MessageBubbleProps) {
    return (
        <div className={`flex flex-col ${actor === 'agent' ? 'items-start' : 'items-end'}`}>
            <div
                className={`p-2 mb-2 rounded-lg ${actor === 'agent' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'} ${actor !== 'agent' && 'text-right'}`}>
                <span className="font-bold mb-1">{actor === 'agent' ? "Agent" : "You"}</span>
                <br/>
                {content.value}
            </div>
        </div>
    );
}

