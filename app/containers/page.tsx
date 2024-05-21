'use client'
import DialogDemo from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

import { Ban, FolderDown, Info, Pause, Play, ScrollText, SquareTerminal, Trash2, View } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { resolve } from "path";

type DataType = {
    container_id: string;
    container_image: string;
    container_name: string;
    container_status: string;
};

export default function ContainerPage() {
    const [data, setData] = useState<DataType[]>([]);
    const [page, setPage] = useState(1);

    let msgToSend = {};
    let outputUser = "";

    async function fetchData(){
        try {
            console.log("Fetch");
            const newData = await fetchContainerData(page);
            console.log("New: ",newData)
            setData(oldData => [...oldData, ...newData]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        console.log("useEffect");
        // Fetch the data from your server
        fetchData();
    }, [page]);

    const handleScroll = (event) => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
        setPage(oldPage => oldPage + 1);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    //Helper functions
    function removeFromList(containerToRemove: string) {

        const updateData = data.filter((item) => item.container_id != containerToRemove);
        setData(updateData);

    }

    const handleSocketMessage = useCallback((data: any): void => {
        Object.entries(data.data).forEach(([key, value]): void => {
            if (Array.isArray(value)) {
                const message = value;

                console.log(message);
            }
        });
    }, []);

    const socket = useSocket(handleSocketMessage)

    function sendToSocket(topic: string, input: {}) {
        socket?.emit("command", topic, input)
        console.log("Topic: ", topic);
        console.log("Input: ", input);
    }

    // Pure JavaScript functions for getting a prompt window
    function handlePrompt(msg: string, standardInput: string): string {
        let output = prompt(msg, standardInput)
        if (output == null)
            return "";
        return output;
    }

    //Pure JavaScript functions for getting a alert window
    function handleAlert(msg:string){
        alert(msg)
    }

    /* All Button onClick event functions */

    //Deletes the container
    function DeleteContainer(row: string): void {
        outputUser = handlePrompt("Are you sure? type yes or no", "no")
        if (outputUser.toLowerCase() === "yes") {
            msgToSend = { "Action": "Delete", "Container": row }
            sendToSocket("DiD_remove", msgToSend)
            removeFromList(row)
            fetchResponseData();
        }

    }

    //Downloads everything or a particular file
    // function DownloadContent(row: string): void {
    //     outputUser = handlePrompt("What do you want to download: ", "ALL");
    //     msgToSend = { "Action": "Download", "Container": row, "DownloadWhat": outputUser }
    //     sendToSocket("DiD_download", msgToSend);
    //     fetchResponseData();
    // }

    //Do a command in the container
    function ContainerCmd(row: string): void {
        outputUser = handlePrompt("What command do you want to execute", "ll")
        msgToSend = { "Action": "Command", "Container": row, "Command": outputUser }
        sendToSocket("DiD_command", msgToSend);
        fetchResponseData();
    }

    //Get the log file from a container
    function GetLogFile(row: string): void {
        outputUser = handlePrompt('Are you sure that you want the log file of ' + row + ', this can take a long time?', "no")
        if (outputUser.toLowerCase() === "yes") {
            msgToSend = { "Action": "Log", "Container": row }
            sendToSocket("DiD_logger", msgToSend);
            fetchResponseData();
        }
    }

    //Start the container when it was paused or stopped
    function StartContainer(row: string): void {
        msgToSend = { "Action": "Start", "Container": row }
        sendToSocket("DiD_running", msgToSend);
        fetchResponseData();
    }

    //Pauses the container
    function PauseContainer(row: string): void {
        msgToSend = { "Action": "Pause", "Container": row }
        sendToSocket("DiD_running", msgToSend);
        fetchResponseData();
    }

    //Stops the container
    function StopContainer(row: string): void {
        msgToSend = { "Action": "Stop", "Container": row }
        sendToSocket("DiD_running", msgToSend);
        fetchResponseData();
    }

    //Retrieve the information from Kafka DiD_Response
    async function fetchResponseData() {
        //Activate socket event
        socket?.emit("getResponse");
        
        socket?.once("response_DiD", (data)=>{
            console.log("response")
            console.log(data);//Log the data that is
            //Change the data
            
            //Set the final variable as the message
            const msg = data;
            handleAlert(msg);
        })
    }

    //Initial data setup
    async function fetchContainerData(page: number): Promise<DataType[]> { // Make sure to use the type here as well
        return new Promise<DataType[]>((resolve,reject)=>{
            let dataContainers: DataType[] = [];//Collection of Containers

            //Activate socket event
            socket?.emit("getContainer");

            //Activate the listen socket event
            socket?.once("response_command", (data) => {
                try {
                    const bracketfree_data = data.replace(/\[|\]/g, '');
                    const containerArray = bracketfree_data.split(`}",`);    
                    parseToDataType(containerArray, dataContainers);
                    // console.log('Received Response:', dataContainers);//If needed to test if the response is coming through
                    resolve(dataContainers); // Resolve the promise with the data
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error); // Reject the promise if there's an error
                }
            });

        });

        
        //Test data
        // return Promise.resolve([
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        //     {container_id:"68f8de1a451df7a13fb344641e97d0130f3bee1014e3cd9a3192dc9b2bf3a114",container_image:"<Image: 'quay.io/keycloak/keycloak:24.0.1'>",container_name: "prototype3-keycloak-1",container_status:"running"},
        // ]);
    }


    //Page contents
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
                            <td style={{ maxWidth: '30%', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                {row.container_name}
                            </td>
                            <td style={{minWidth:'40%', display: 'flex', justifyContent: 'center' }}>
                                <Button onClick={() => DeleteContainer(row["container_name"])}><Trash2 /></Button>
                                {/* <Button onClick={() => DownloadContent(row["container_name"])}><FolderDown /></Button> */}
                                <Button onClick={() => ContainerCmd(row["container_name"])}><SquareTerminal /></Button>
                                <Button onClick={() => GetLogFile(row["container_name"])}><ScrollText /></Button>
                            </td>
                            <td style={{minWidth:'1em', justifyContent: 'center' }}>
                                <Button onClick={() => StartContainer(row["container_name"])}><Play /></Button>
                                <Button onClick={() => PauseContainer(row["container_name"])}><Pause /></Button>
                                <Button onClick={() => StopContainer(row["container_name"])}><Ban /></Button>
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
    )
}



function parseToDataType(containerArray: any, dataContainers: DataType[]) {
    containerArray.forEach((item: string) => {
        if (!item.endsWith("}\"")) {
            item = item + "}\"";
        }

        console.log("Before: ", item);
        item = item.replace(/'/g, "");

        console.log("Item: ", item);
        const trimmedItem = item.trim();
        console.log(trimmedItem);
        //You need to parse it 2 times to get a JSON object no clear reason why
        let json_item = JSON.parse(trimmedItem);
        json_item = JSON.parse(json_item);

        const dataType_item: DataType = {
            container_id: json_item["container_id"],
            container_image: json_item["container_image"],
            container_name: json_item["container_name"],
            container_status: json_item["container_status"]
        };
        console.log("Type: ", dataType_item);
        dataContainers.push(dataType_item);
    });
}

