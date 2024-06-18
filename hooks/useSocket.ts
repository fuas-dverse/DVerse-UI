import { useEffect, useState } from "react";
import { io, Socket as IOSocket } from "socket.io-client";

// Define a type for the socket
type SocketType = IOSocket | undefined;

export function useSocket(
	chatId: string,
	onMessage: {
		handleSocketMessage: (data: { text: string; sender: "bot" | "user"; chatId: string }) => void;
		handleSocketResponse: (data: any) => void
	}): SocketType {
	const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:5001";

	const [socket, setSocket] = useState<SocketType>();

	useEffect(() => {
		const ws = io(SERVER_URL);

		ws.on("connect", (): void => {
			console.log("Connected to server");
		});

		ws.on("disconnect", (): void => {
			console.log("Disconnected from server");
		})

		ws.on('message', onMessage.handleSocketMessage);

		ws.on(`response-${chatId}`, onMessage.handleSocketResponse)

		ws.on('error', (error: any): void => {
			console.error("Socket error:", error);
		});

		setSocket(ws);

		// Cleanup function
		return (): void => {
			ws.disconnect();
		};
	}, [SERVER_URL, onMessage]);

	return socket;
}