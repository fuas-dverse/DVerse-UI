"use client"
import MessageBubble from "@/components/Message/MessageBubble";
import {HistoryBar} from "@/components/Sidebar/HistoryBar";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/Icons/icons";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useSocket} from "@/hooks/useSocket";
import {addMessageToChat, createChat, deleteChat, getAllChats, MessageTable} from "@/app/chat/[chatId]/actions";

export default function Page({params}: { params: { chatId: string } }) {
    const [currentChat, setCurrentChat] = useState<string>("New Chat");
    const [messages, setMessages] = useState<MessageTable[]>([]);
    const [chatsList, setChatsList] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('');

    const handleSocketMessage = useCallback((data: { text: string, sender: "bot" | "user", chatId: string }): void => {
        console.log("Message received:", data);
    }, []);

    const handleSocketResponse = useCallback((data: any): void => {
        console.log("Response received:", data);
    }, []);

    const socketEventHandlers = useMemo(() => ({
        handleSocketMessage,
        handleSocketResponse,
    }), [handleSocketMessage, handleSocketResponse]);

    const socket = useSocket(socketEventHandlers);

    function sendMessage() {
        if (!newMessage) {
            alert("Message is required")
            return
        }
        const message = {
            "@context": "https://www.w3.org/ns/activitystreams",
            "@type": "Note",
            "actor": "user",
            "content": {
                "type": "text",
                "value": newMessage,
            },
            "chatid": params.chatId,
        }


        socket?.emit("message", message)
    }

    async function handleDeleteMessage(chatId: string) {
        await deleteChat(chatId)
        socket?.emit("deleteChat", chatId)
    }

    return (
        <main
            className="flex relative flex-col bg-background overflow-hidden sm:container p-4">
            {/*Chat section*/}
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

            {/*Bottom bar for sending data*/}
            <div
                className="fixed bottom-0 z-10 p-4 bg-background container left-1/2 transform -translate-x-1/2">
                <div className={"flex justify-between gap-4"}>
                    <HistoryBar chats={chatsList.slice().reverse()} onDeleted={handleDeleteMessage}/>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className=""
                        type={"text"}
                    />
                    <Button className={"bg-primary text-primary-foreground px-2"} onClick={sendMessage}>
                        <div className={"hidden sm:block"}>
                            Send
                        </div>
                        <div className={"block sm:hidden"}>
                            <Icons.send/>
                        </div>
                    </Button>
                </div>
            </div>
        </main>
    )
}