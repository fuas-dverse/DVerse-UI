import {IMessage} from "@/types/Message";

export interface MessageBubbleProps {
    actor: string;
    message: IMessage
}

export default function MessageBubble({actor, message}: MessageBubbleProps) {
    const isAgent = actor == 'agent';

    const renderContent = (content: any) => {
        if (typeof content === 'string' || typeof content === 'number') {
            return <p>{content}</p>;
        } else if (Array.isArray(content)) {
            return content.map((item, index) => (
                <div key={index}>
                    {typeof item === 'object' ? renderContent(item) : <p>{item}</p>}
                </div>
            ));
        } else if (typeof content === 'object') {
            return Object.entries(content).map(([key, value]) => (
                <div key={key}>
                    <strong>{`${key}: `}</strong>
                    {renderContent(value)}
                </div>
            ));
        }
    };

    return (
        <div className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
            <div
                className={`p-2 mb-2 rounded-lg ${isAgent ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'} ${!isAgent && 'text-right'}`}>
                <span className="font-bold mb-1">{isAgent ? "Agent" : "You"}</span>
                <br/><br/>
                {
                    Object.entries(message).map(([key, value]) => (
                        <div key={key}>
                            <div>
                                <strong>{`${key}: `}</strong>
                                {renderContent(value)}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}