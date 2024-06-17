"use client"
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
import {IMessage} from "@/types/Message";
import {useRouter} from "next/navigation";
import {generateRandomID} from "@/lib/generateRandomID";

export default function Page({ params }: { params: { chatId: string } }) {
    const [currentChat, setCurrentChat] = useState<string | null>("New Chat");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [chatsList, setChatsList] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatName, setChatName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>();
    const router = useRouter();

    const handleSocketMessage = useCallback((data: { text: string, sender: "bot" | "user", chatId: string }): void => {
        console.log("Message received:", data);
    }, []);

    const handleSocketResponse = useCallback((data: any): void => {
        if (data.actor === "agent") {
            addMessageToChat(data);
        }
        setMessages((prev) => [...prev, data]);
    }, []);

    const socketEventHandlers = useMemo(() => ({
        handleSocketMessage,
        handleSocketResponse,
    }), [handleSocketMessage, handleSocketResponse]);

    const socket = useSocket(params.chatId, socketEventHandlers);

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
            "chatId": params.chatId,
        };

        if (messages.length === 0) {
            await handleFirstMessage(message);
            return;
        }

        socket?.emit("message", message);

        addMessageToChat(message);

        setNewMessage("")
    };

    /**
     * Create a new chat with the first message
     * @param message
     */
    const handleFirstMessage = async (message: IMessage) => {
        await createChat(params.chatId, userEmail!, message);
        setChatName(message.content.value);
        setMessages((prev) => [...prev, message]);

        const chatName = await getCurrentChat();
        setCurrentChat(chatName!);

        const chats = await getAllChats(userEmail!);
        setChatsList(chats);

        setNewMessage("")

    };

    /**
     * Handle deleting a chat
     * @param chatId
     */
    const handleDeleteMessage = async (chatId: string) => {
        await deleteChat(chatId);
        setChatsList((prev) => prev.filter((chat) => chat.chat_id !== chatId));
        setMessages((prev) => prev.filter((message) => message.chatId !== chatId));

        if (chatId === params.chatId) {
            router.push("/chat/" + generateRandomID());
        }
    };

    // Helper function to get the current chat name
    const getCurrentChat = useCallback(async () => {
        try {
            const response = await getChat(params.chatId, userEmail!);
            if (Array.isArray(response) && response.length > 0 && response[0].chat_name) {
                return response[0].chat_name;
            } else {
                return "New Chat";
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
            return "New Chat";
        }
    }, [params.chatId, userEmail]);

    // Fetch the initial chat name and messages on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const email = await getUserEmail();
                if (email) {
                    setUserEmail(email);
                    const chatName = await getCurrentChat();
                    setCurrentChat(chatName!);
                    const initialMessages = await getMessagesFromChat(params.chatId);
                    setMessages(initialMessages);
                    const chats = await getAllChats(email);
                    setChatsList(chats);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, [params.chatId, getCurrentChat]);


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
                            chatId={message.chatId}
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