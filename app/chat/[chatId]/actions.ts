"use server";

import {createKysely} from '@vercel/postgres-kysely';

interface ChatTable {
    chat_id: string;
    user_email: string;
    chat_name: string;
}

export interface MessageTable {
    actor: string;
    chatid:  string | string[];
    "@type": string;
    "@context": string;
    content: { type: string; value: string }
}

interface Database {
    chat: ChatTable;
    message: MessageTable;
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

export async function checkIfChatExists(chatId: string) {
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

export async function getMessagesFromChat(chatId: string): Promise<MessageTable[]> {
    console.log("Getting messages from chat")

    return await db
        .selectFrom('message')
        .selectAll()
        .where('chatid', "=", chatId)
        .execute();
}

export async function addMessageToChat(message: {
    actor: string;
    chatid: string | string[];
    "@type": string;
    "@context": string;
    content: { type: string; value: string }
}) {
    console.log("Adding message to chat")
    await db
        .insertInto('message')
        .values({
            "@context": message["@context"],
            "@type": message["@type"],
            actor: message.actor,
            chatid: message.chatid,
            content: message.content,
        })
        .execute();
}