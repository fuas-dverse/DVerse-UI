"use client"
import {usePathname, useRouter} from "next/navigation"

import {cn} from "@/lib/utils"
import {NavItem} from "@/types/nav";
import {Button} from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {Icons} from "@/components/Icons/icons";
import {Trash, Trash2, TrashIcon} from "lucide-react";
import {useEffect, useState} from "react";
import {io} from "socket.io-client";

export interface DocsSidebarNavProps {
    items: NavItem[]
}

interface HistoryBarProps {
    chats: {
        chat_id: number,
        user_email: string,
        chat_name: string,
    }[],
    onDeleted: (chatId: string) => void
}

export function HistoryBar({ chats, onDeleted }: HistoryBarProps) {
    const router = useRouter()

    function goToChat(chat_id: number) {
        router.push(`/chat/${chat_id}`)
    }

    return (
        <Sheet>
            <SheetTrigger className={"hidden sm:block"} asChild>
                <Button >
                    Show history
                </Button>
            </SheetTrigger>
            <SheetTrigger className={"block sm:hidden"} asChild>
                <Button className={"px-2"}>
                    <Icons.history/>
                </Button>
            </SheetTrigger>
            <SheetContent side={"left"}>
                <SheetHeader>
                    <SheetTitle className={"text-2xl font-bold mb-4"}>History</SheetTitle>
                    <div className={"space-y-2 flex flex-col"}>
                        {
                            chats.map((chat, index) => {
                                return <div key={index} className={"flex flex-row space-x-2"}>
                                    <Button onClick={() => {
                                        goToChat(chat.chat_id)
                                    }} className={"text-left bg-secondary text-secondary-foreground inline-block whitespace-nowrap overflow-hidden text-ellipsis w-full"}>
                                        {
                                            chat.chat_name
                                        }
                                    </Button>
                                    <Button variant={"destructive"} className={"m-0 p-3"} onClick={() => {
                                        onDeleted(chat.chat_id.toString())
                                    }}>
                                        <Trash2 size={16}/>
                                    </Button>
                                </div>
                            })
                        }
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}