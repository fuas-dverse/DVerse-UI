"use client";
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import MessageBubble from "@/components/Message/MessageBubble";
import { useParams } from "next/navigation";
import { getChat, getMessagesFromChat, MessageTable } from "@/app/chat/[chatId]/actions";
import { IMessage } from "@/types/Message";

interface MessageBarProps {
    user_email: string | null | undefined;
}

export default function MessagePage({ user_email }: MessageBarProps) {
    const [messages, setMessages] = useState<MessageTable[]>([]);
    const { chatId } = useParams();
    const [socket, setSocket] = useState<any>(null);
    const [currentChat, setCurrentChat] = useState<string>("New Chat");
    const [firstLoad, setFirstLoad] = useState(true);

    // Helper function to get the current chat name
    const getCurrentChat = useCallback(async () => {
        try {
            const response = await getChat(chatId.toString(), user_email!);
            if (Array.isArray(response) && response.length > 0 && response[0].chat_name) {
                return response[0].chat_name;
            } else {
                return "New Chat";
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
            return "New Chat";
        }
    }, [chatId, user_email]);

    // Fetch the initial chat name and messages on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const chatName = await getCurrentChat();
                setCurrentChat(chatName);
                const initialMessages = await getMessagesFromChat(chatId.toString());
                setMessages(initialMessages);
                setFirstLoad(false);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        if (firstLoad) {
            fetchInitialData();
        }
    }, [chatId, firstLoad, getCurrentChat]);

    // Establish WebSocket connection and set up listeners
    useEffect(() => {
        const socket = io("http://localhost:5001");

        socket.on(`response-${chatId}`, (message) => {
            if (message && message.content && message.actor) {
                setMessages((currentMessages) => [...currentMessages, message]);
            }
        });

        socket.on(`refreshChats`, (message) => {
            if (message && message.chat_name && currentChat === "New Chat") {
                setCurrentChat(message.chat_name);
            }
        });

        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, [chatId, currentChat]);

    return (
        <>
            <h2 className="text-2xl font-bold">{currentChat}</h2>
            <div className="flex flex-1 flex-col overflow-y-auto mb-12">
                {messages.map((message, index) => {
                    return (
                        <MessageBubble
                            key={index}
                            chatId={message.chatid}
                            actor={message.actor}
                            content={message.content}
                        />
                    );
                })}
            </div>
        </>
    );
}
