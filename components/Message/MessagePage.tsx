"use client"
import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import MessageBubble, {MessageBubbleProps} from "@/components/Message/MessageBubble";
import {useParams, usePathname} from "next/navigation";
import {createChat, getChat} from "@/app/chat/[chatId]/actions";

interface MessageBarProps {
    user_email: string | null | undefined
}

export default function MessagePage({user_email}: MessageBarProps) {
    const [messages, setMessages] = useState<MessageBubbleProps[]>([])
    const {chatId} = useParams()
    const [socket, setSocket] = useState<any>(undefined)
    const [currentChat, setCurrentChat] = useState<any>("New Chat")
    const [firstRender, setFirstRender] = useState<boolean>(true)

    useEffect(() => {

        const socket = io("http://localhost:5001");

        // socket.on(`response-${chatId}`, (message) => {
        socket.on(`response-${chatId}`, (message) => {
            console.log(message)
            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    id: currentMessages.length + 1,
                    text: message.content.value,
                    sender: message.actor,
                },
            ]);
        });

        socket.on(`refreshChats`, (message) => {
            console.log("Current Chat Name is: ", currentChat)
            if (currentChat == "New Chat") {
                setCurrentChat(message.chat_name)
            }
        });

        setSocket(socket);

        // Cleanup on component unmount
        return () => {
            socket.disconnect()
        }
    }, [chatId, currentChat]);

    async function getCurrentChat() {
        try {
            const response = await getChat(chatId.toString(), user_email!);

            // Check if response is an array and has at least one element
            if (Array.isArray(response) && response.length > 0 && response[0].chat_name) {
                return response[0].chat_name;
            } else {
                return "New Chat";
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
        }
    }

    useEffect(() => {
        getCurrentChat().then((r => {
            setCurrentChat(r)
        }))
    }, [currentChat]);


    return (
        <>
            <h2 className={"text-2xl font-bold"}>{currentChat}</h2>
            <div className="flex flex-1 flex-col overflow-y-auto mb-12">
                {messages.map((message) => (
                    <MessageBubble key={message.id} id={message.id} sender={message.sender} text={message.text}/>
                ))}
            </div>
        </>
    );
}