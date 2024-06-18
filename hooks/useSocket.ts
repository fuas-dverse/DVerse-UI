import { useEffect, useState } from "react";
import { io, Socket as IOSocket } from "socket.io-client";
import {useParams} from "next/navigation";

// Define a type for the socket
type SocketType = IOSocket | undefined;

type MessageHandlers = {
	handleSocketMessage?: (data: any) => void;
	handleSocketResponse?: (data: any) => void;
};

export function useSocket(
	handlers: MessageHandlers,
	chatId: string | null
): SocketType {
	const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:5001";

	const [socket, setSocket] = useState<SocketType>();

	useEffect(() => {
		const ws = io(SERVER_URL);

		ws.on("connect", (): void => {
			console.log("Connected to server");
		});

		ws.on("disconnect", (): void => {
			console.log("Disconnected from server");
		});

		if(handlers !=null){

		if (handlers.handleSocketMessage) {
			ws.on('message', handlers.handleSocketMessage);
		}

		if (handlers.handleSocketResponse) {
			ws.on(`response-${chatId}`, handlers.handleSocketResponse);
		}
	}

		ws.on('error', (error: any): void => {
			console.error("Socket error:", error);
		});

		setSocket(ws);

		// Cleanup function
		return (): void => {
			ws.disconnect();
		};
	}, [SERVER_URL, handlers, chatId]);

	return socket;
}
