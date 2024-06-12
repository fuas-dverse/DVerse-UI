"use server";

import {createKysely} from '@vercel/postgres-kysely';

interface ChatTable {
    chat_id: string;
    user_email: string;
    chat_name: string;
}

interface Database {
    chat: ChatTable;
}

const db = createKysely<Database>();

export async function createChat(
    chatId: string,
    user_email: string,
    chatName: string,
) {
    console.log("Creating chat")
    const exists = await checkIfChatExists(chatId);

    if (exists) {
        return "Chat already exists"
    }

    await db
        .insertInto('chat')
        .values({
            chat_id: chatId,
            user_email: user_email,
            chat_name: chatName
        })
        .execute();
}

export async function getAllChats(userEmail: string): Promise<any[]> {
    console.log("Getting all chats")
    return await db
        .selectFrom('chat')
        .selectAll()
        .where('user_email', "=", userEmail)
        .execute();
}

export async function getChat(chatId: string, user_email: string) {
    console.log("Getting chat")
    return await db
        .selectFrom('chat')
        .selectAll()
        .where('chat_id', "=", chatId)
        .where('user_email', "=", user_email)
        .execute();
}

export async function checkIfChatExists(chatId: string){
    console.log("Checking if chat exists")
    const chat = await db
        .selectFrom('chat')
        .where('chat_id', "=", chatId)
        .selectAll()
        .execute();

    return chat.length !== 0; // Returns true if chat exists
}

export async function deleteChat(chatId: string) {
    console.log("Deleting chat")
    await db
        .deleteFrom('chat')
        .where('chat_id', "=", chatId)
        .execute();
}