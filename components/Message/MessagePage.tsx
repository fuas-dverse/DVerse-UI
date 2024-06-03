"use client"
import {useEffect, useState} from "react";

export default function MessagePage() {
    const [messages, setMessages] = useState<string[]>([]);
    useEffect(() => {
        const eventSource = new EventSource('/api/kafka/consume/messages');

        eventSource.onmessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        // Cleanup function to close the event source when component unmounts or before page reload
        const cleanUpEventSource = () => {
            if (eventSource.readyState !== EventSource.CLOSED) {
                eventSource.close();
            }
        };

        window.addEventListener('beforeunload', cleanUpEventSource);
        return () => {
            window.removeEventListener('beforeunload', cleanUpEventSource);
            cleanUpEventSource();
        };
    }, []);


    return (
        <div className="flex flex-1 flex-col overflow-y-auto mb-12">
            {messages?.map((message, index) => (
                <div key={index} className="message">
                    {message}
                </div>
            ))}
        </div>
    );
}