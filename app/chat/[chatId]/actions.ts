"use server";

import { createKysely } from '@vercel/postgres-kysely';
import { IMessage } from "@/types/Message";
import { auth } from "@/auth";

export interface ChatTable {
    chat_id: string;
    user_email: string;
    chat_name: string;
}

export interface MessageTable {
    actor: string;
    chatid: string | string[];
    "@type": string;
    "@context": string;
    content: { type: string; value: string };
}

interface Database {
    chat: ChatTable;
    message: MessageTable;
}

const db = createKysely<Database>();

function transformToDatabaseMessage(message: IMessage): MessageTable {
    return {
        actor: message.actor,
        chatid: message.chatId,
        "@type": message["@type"],
        "@context": message["@context"],
        content: message.content,
    };
}

function transformToIMessage(dbMessage: MessageTable): IMessage {
    return {
        actor: dbMessage.actor,
        chatId: dbMessage.chatid,
        "@type": dbMessage["@type"],
        "@context": dbMessage["@context"],
        content: dbMessage.content,
    };
}

export async function createChat(
    chatId: string,
    user_email: string,
    chatName: IMessage,
) {
    console.log("Creating chat");
    const exists = await checkIfChatExists(chatId);

    if (exists) {
        return "Chat already exists";
    }

    await db
        .insertInto('chat')
        .values({
            chat_id: chatId,
            user_email: user_email,
            chat_name: chatName.content.value,
        })
        .execute();

    await addMessageToChat(chatName);
}

export async function getAllChats(userEmail: string): Promise<any[]> {
    console.log("Getting all chats");
    return await db
        .selectFrom('chat')
        .selectAll()
        .where('user_email', "=", userEmail)
        .execute();
}

export async function getChat(chatId: string, user_email: string) {
    console.log(chatId, user_email);
    console.log("Getting chat");
    return await db
        .selectFrom('chat')
        .selectAll()
        .where('chat_id', "=", chatId)
        .where('user_email', "=", user_email)
        .execute();
}

export async function checkIfChatExists(chatId: string) {
    console.log("Checking if chat exists");
    const chat = await db
        .selectFrom('chat')
        .where('chat_id', "=", chatId)
        .selectAll()
        .execute();

    return chat.length !== 0; // Returns true if chat exists
}

export async function deleteChat(chatId: string) {
    console.log("Deleting chat");
    await db
        .deleteFrom('chat')
        .where('chat_id', "=", chatId)
        .execute();

    await db
        .deleteFrom('message')
        .where('chatid', "=", chatId)
        .execute();
}

export async function getMessagesFromChat(chatId: string): Promise<IMessage[]> {
    console.log("Getting messages from chat");

    try {
        const messages = await db
            .selectFrom('message')
            .selectAll()
            .where('chatid', '=', chatId)
            .execute();

        const transformedMessages: IMessage[] = messages.map(transformToIMessage);

        console.log(`Retrieved ${transformedMessages.length} messages from chat with ID: ${chatId}`);
        return transformedMessages;
    } catch (error) {
        console.error(`Error retrieving messages from chat with ID: ${chatId}`, error);
        throw new Error(`Failed to get messages from chat with ID: ${chatId}`);
    }
}

export async function addMessageToChat(message: IMessage) {
    console.log("Adding message to chat");

    const dbMessage = transformToDatabaseMessage(message);

    try {
        await db
            .insertInto('message')
            .values(dbMessage)
            .execute();

        console.log("Message added successfully");
    } catch (error) {
        console.error("Error adding message to chat", error);
        throw new Error("Failed to add message to chat");
    }
}

export async function getUserEmail(): Promise<string | null> {
    const session = await auth();

    if (!session?.user?.email) {
        return null;
    }

    return session.user?.email;
}

