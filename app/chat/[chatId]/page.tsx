"use client";
import MessageBubble from "@/components/Message/MessageBubble";
import { HistoryBar } from "@/components/Sidebar/HistoryBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import {
    addMessageToChat,
    createChat,
    deleteChat,
    getAllChats,
    getChat,
    getMessagesFromChat,
    getUserEmail
} from "@/app/chat/[chatId]/actions";
import { IMessage } from "@/types/Message";
import { useRouter } from "next/navigation";
import { generateRandomID } from "@/lib/generateRandomID";

export default function Page({ params }: { params: { chatId: string } }) {
    const [currentChat, setCurrentChat] = useState<string | null>("New Chat");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [chatsList, setChatsList] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [userEmail, setUserEmail] = useState<string>();
    const router = useRouter();
    const chatId = params.chatId;
    const handleSocketMessage = useCallback((data: { text: string, sender: "bot" | "user", chatId: string }): void => {
        console.log("Message received:", data);
    }, []);

    const handleSocketResponse = useCallback((data: any): void => {
        console.log(data)
        if (data.actor === "agent") {
            if (Array.isArray(data.content)) {
                data.content.forEach(async (contentItem: any) => {
                    const message = { ...data, content: contentItem };
                    await addMessageToChat(message);
                    setMessages((prev) => [...prev, message]);
                });
            } else {
                addMessageToChat(data);
                setMessages((prev) => [...prev, data]);
            }
        }
    }, []);

    const socketEventHandlers = useMemo(() => ({
        handleSocketMessage,
        handleSocketResponse,
    }), [handleSocketMessage, handleSocketResponse]);

    const socket = useSocket(socketEventHandlers, chatId);

    const sendMessage = async () => {
        if (!newMessage) {
            alert("Message is required");
            return;
        }

        const message = {
            "@context": "https://www.w3.org/ns/activitystreams",
            "@type": "Note",
            "actor": "user",
            "content": {
                "type": "text",
                "value": newMessage,
            },
            "chatId": chatId,
        };

        if (messages.length === 0) {
            await handleFirstMessage(message);
            return;
        }

        socket?.emit("message", message);

        // Add the message to the chat and update state
        await addMessageToChat(message);
        setMessages((prev) => [...prev, message]);

        setNewMessage("");
    };

    const handleFirstMessage = async (message: IMessage) => {
        socket?.emit("message", message);

        await createChat(chatId, userEmail!, message);
        setMessages((prev) => [...prev, message]);

        const chatName = await getCurrentChat();
        setCurrentChat(chatName!);

        const chats = await getAllChats(userEmail!);
        setChatsList(chats);

        setNewMessage("");
    };

    const handleDeleteMessage = async (chatId: string) => {
        await deleteChat(chatId);
        setChatsList((prev) => prev.filter((chat) => chat.chat_id != chatId));
        setMessages((prev) => prev.filter((message) => message.chatId != chatId));

        if (chatId === chatId) {
            router.push("/chat/" + generateRandomID());
        }
    };

    const getCurrentChat = useCallback(async () => {
        try {
            const response = await getChat(chatId, userEmail!);
            if (Array.isArray(response) && response.length > 0 && response[0].chat_name) {
                return response[0].chat_name;
            } else {
                return "New Chat";
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
            return "New Chat";
        }
    }, [chatId, userEmail]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const email = await getUserEmail();
                if (email) {
                    setUserEmail(email);
                    const chatName = await getCurrentChat();
                    setCurrentChat(chatName!);
                    const initialMessages = await getMessagesFromChat(chatId);
                    setMessages(initialMessages);
                    const chats = await getAllChats(email);
                    setChatsList(chats);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, [chatId, getCurrentChat]);

    return (
        <main className="flex relative flex-col bg-background overflow-hidden sm:container p-4">
            <h2 className="text-2xl font-bold">{currentChat}</h2>
            <div className="flex flex-1 flex-col overflow-y-auto mb-12">
                {
                    messages.map((message, index) => {
                        let content = message.content;
                        if (Array.isArray(content)) {
                            console.log(content)
                        }
                        return (
                            <MessageBubble
                                key={index}
                                actor={message.actor}
                                message={message}
                            />
                        );
                    })
                }
            </div>

            <div className="fixed bottom-0 z-10 p-4 bg-background container left-1/2 transform -translate-x-1/2">
                <div className="flex justify-between gap-4">
                    <HistoryBar chats={chatsList.slice().reverse()} onDeleted={handleDeleteMessage} />
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
    );
}
