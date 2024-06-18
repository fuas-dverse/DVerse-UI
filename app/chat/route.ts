import {generateRandomID} from "@/lib/generateRandomID";
import {redirect} from "next/navigation";

export async function GET(req: any) {
    const url = req.nextUrl.pathname;

    if (url === '/chat') {
        const uuid = generateRandomID();

        return redirect(`/chat/${uuid}`);
    }
}
