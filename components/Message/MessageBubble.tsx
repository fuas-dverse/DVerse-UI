export interface MessageBubbleProps {
    id: number
    sender: "bot" | "user"
    text: string
}

export default function MessageBubble(
    {id, text, sender, }: MessageBubbleProps
) {
    return (
        <div
            className={`flex ${sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div
                className={`p-2 mb-2 rounded-lg ${sender === 'bot' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                {text}
            </div>
        </div>
    )
}