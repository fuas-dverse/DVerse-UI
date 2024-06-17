import {NextRequest} from "next/server";

export async function GET(req: NextRequest) {
    return new Response("admin@gmail.com");
}