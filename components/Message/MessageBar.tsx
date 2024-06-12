"use client"
import {HistoryBar} from "@/components/Sidebar/HistoryBar";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/Icons/icons";
import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import {useParams} from "next/navigation";
import {createChat, deleteChat, getAllChats} from "@/app/chat/[chatId]/actions";

let socket: WebSocket;

interface MessageBarProps {
    user_email: string | null | undefined
}

export default function MessageBar({user_email}: MessageBarProps) {
    const [socket, setSocket] = useState<any>(undefined)
    const [newMessage, setNewMessage] = useState('');
    const {chatId} = useParams()
    const [chatsList, setChatsList] = useState<any[]>([])

    async function handleSendMessage() {
        if (!newMessage) {
            return new Response("Message is required", {status: 400})
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
        }

        const newChat = {
            chat_id: chatId,
            user_email: user_email!,
            chat_name: newMessage,
        }

        socket.emit("createChat", newChat)

        socket.emit("message", message)

        setNewMessage("")
    }

    async function sendMessage() {
        handleSendMessage().then(async (response) => {
            if (user_email === null) {
                alert("User email is required in order to create new Chats")
            }
            console.log("Creating chat")
            await createChat(chatId.toString(), user_email!, newMessage)
        })
    }

    async function refreshChatList() {
        setChatsList(await getAllChats(user_email!))
    }

    async function handleDeleteMessage(chatId: string) {
        await deleteChat(chatId)

        socket.emit("deleteChat", chatId)
    }

    useEffect(() => {

        const socket = io("http://localhost:5001");

        // socket.on(`response-${chatId}`, (message) => {
        socket.on(`refreshChats`, (message) => {
            refreshChatList()
        });

    },[])

    useEffect(() => {
        // Code gives error in the terminal, but does work in if connected to the right websocket server
        // !! Is tested with a custom server
        const socket = io("http://localhost:5001/")
        setSocket(socket)
    }, [])

    useEffect(() => {
        getAllChats(user_email!).then((response) => {
            setChatsList(response!)
        })
    }, [])

    return (
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
                    {/*<Button className={"bg-primary text-primary-foreground px-2"} onClick={handleSendMessage}>*/}
                    <div className={"hidden sm:block"}>
                        Send
                    </div>
                    <div className={"block sm:hidden"}>
                        <Icons.send/>
                    </div>
                </Button>
            </div>
        </div>
    )
}