'use client';
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Ban, SquareTerminal, ScrollText, Play, Pause, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";

type DataType = {
    container_id: string;
    container_image: string;
    container_name: string;
    container_status: string;
};

export default function ContainerPage() {
    const [data, setData] = useState<DataType[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleSocketMessage = useCallback((data: any): void => {
        if (data && data.data) {
            Object.entries(data.data).forEach(([key, value]): void => {
                if (Array.isArray(value)) {
                    const message = value;
                    console.log(message);
                }
            });
        }
    }, []);

    const socket = useSocket(handleSocketMessage);//Don't add client/chatID causes infinite loop

    const fetchContainerData = useCallback(async (page: number): Promise<DataType[]> => {
        return new Promise<DataType[]>((resolve, reject) => {
            let dataContainers: DataType[] = [];
            socket?.emit("getContainer");
            socket?.once("response_command", (data) => {
                try {
                    const bracketfree_data = data.replace(/\[|\]/g, '');
                    const containerArray = bracketfree_data.split(`}",`);
                    parseToDataType(containerArray, dataContainers);
                    resolve(dataContainers);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error);
                }
            });
        });
    }, [socket]);

    const fetchData = useCallback(async () => {
        try {            
            const newData = await fetchContainerData(page);
            setData(oldData => [...oldData, ...newData]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchContainerData, page, loading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
        setPage(oldPage => oldPage + 1);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const sendToSocket = useCallback((topic: string, input: {}) => {
        socket?.emit("command", topic, input);
        console.log("Topic: ", topic);
        console.log("Input: ", input);
    }, [socket]);

    const handlePrompt = (msg: string, standardInput: string): string => {
        let output = prompt(msg, standardInput);
        return output ?? "";
    };

    const handleAlert = (msg: string) => {
        alert(msg);
    };

    const fetchResponseData = useCallback(async () => {
        socket?.emit("getResponse");
        socket?.once("response_DiD", (data) => {
            console.log("response");
            console.log(data);
            handleAlert(data);
        });
    }, [socket]);

    const DeleteContainer = useCallback((row: string): void => {
        const outputUser = handlePrompt("Are you sure? type yes or no", "no");
        if (outputUser.toLowerCase() === "yes") {
            const msgToSend = { "Action": "Delete", "Container": row };
            sendToSocket("DiD_remove", msgToSend);
            setData(prevData => prevData.filter(item => item.container_id !== row));
            fetchResponseData();
        }
    }, [sendToSocket, fetchResponseData]);

    const ContainerCmd = useCallback((row: string): void => {
        const outputUser = handlePrompt("What command do you want to execute", "ll");
        const msgToSend = { "Action": "Command", "Container": row, "Command": outputUser };
        sendToSocket("DiD_command", msgToSend);
        fetchResponseData();
    }, [sendToSocket, fetchResponseData]);

    const GetLogFile = useCallback((row: string): void => {
        const outputUser = handlePrompt('Are you sure that you want the log file of ' + row + ', this can take a long time?', "no");
        if (outputUser.toLowerCase() === "yes") {
            const msgToSend = { "Action": "Log", "Container": row };
            sendToSocket("DiD_logger", msgToSend);
            fetchResponseData();
        }
    }, [sendToSocket, fetchResponseData]);

    const StartContainer = useCallback((row: string): void => {
        const msgToSend = { "Action": "Start", "Container": row };
        sendToSocket("DiD_running", msgToSend);
        fetchResponseData();
    }, [sendToSocket, fetchResponseData]);

    const PauseContainer = useCallback((row: string): void => {
        const msgToSend = { "Action": "Pause", "Container": row };
        sendToSocket("DiD_running", msgToSend);
        fetchResponseData();
    }, [sendToSocket, fetchResponseData]);

    const StopContainer = useCallback((row: string): void => {
        const msgToSend = { "Action": "Stop", "Container": row };
        sendToSocket("DiD_running", msgToSend);
        fetchResponseData();
    }, [sendToSocket, fetchResponseData]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Table>
                <thead style={{ top: 0, backgroundColor: '#fff' }}>
                <tr>
                    <th>Container</th>
                    <th>Action</th>
                    <th>Control</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        <td style={{ maxWidth: '30%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.container_name}
                        </td>
                        <td style={{ minWidth: '40%', display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={() => DeleteContainer(row["container_id"])}><Trash2 /></Button>
                            <Button onClick={() => ContainerCmd(row["container_id"])}><SquareTerminal /></Button>
                            <Button onClick={() => GetLogFile(row["container_id"])}><ScrollText /></Button>
                        </td>
                        <td style={{ minWidth: '1em', justifyContent: 'center' }}>
                            <Button onClick={() => StartContainer(row["container_id"])}><Play /></Button>
                            <Button onClick={() => PauseContainer(row["container_id"])}><Pause /></Button>
                            <Button onClick={() => StopContainer(row["container_id"])}><Ban /></Button>
                        </td>
                    </tr>
                ))}
                {data.length <= 12 && (
                    <tr>
                        <td style={{ textAlign: 'center' }}>
                            <Button onClick={() => fetchData()}>Load Data</Button>
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </div>
    );
}

function parseToDataType(containerArray: any, dataContainers: DataType[]) {
    containerArray.forEach((item: string) => {        
        item = item.replace(/'/g, "");

        const trimmedItem = item.trim();
        let json_item = JSON.parse(trimmedItem);

        const dataType_item: DataType = {
            container_id: json_item["container_id"],
            container_image: json_item["container_image"],
            container_name: json_item["container_name"].slice(0, 50),
            container_status: json_item["container_status"]
        };
        console.log("Type: ", dataType_item);
        dataContainers.push(dataType_item);
    });
}
