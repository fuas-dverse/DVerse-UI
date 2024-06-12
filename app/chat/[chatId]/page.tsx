import MessagePage from "@/components/Message/MessagePage";
import MessageBar from "@/components/Message/MessageBar";
import {auth} from "@/auth";

export default async function Page({ params }: { params: { chatId: string } }){
    const session = await auth()

    return (
        <main
            className="flex relative flex-col bg-background overflow-hidden sm:container p-4">
            {/*Chat section*/}
            <MessagePage user_email={session?.user?.email}/>

            {/*Bottom bar for sending data*/}
            <MessageBar user_email={session?.user?.email} />
        </main>
    )
}