"use client"
import {HistoryBar} from "@/components/Sidebar/HistoryBar";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/Icons/icons";
import {kafkaProducer} from "@/lib/kafka/kafkaProducer";
import {useState} from "react";

export default function MessageBar(){
    const [newMessage, setNewMessage] = useState<string>("");
    async function handleSendMessage() {
        const url = `api/kafka/produce/message?message=${newMessage}`
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    function alert_box(){
        alert("hello world")
    }

    return (
        <div
            className="fixed bottom-0 z-10 p-4 bg-background container left-1/2 transform -translate-x-1/2">
            <div className={"flex justify-between gap-4"}>
                <HistoryBar/>
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className=""
                    type={"text"}
                />
                <Button className={"bg-primary text-primary-foreground px-2"} onClick={handleSendMessage}>
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