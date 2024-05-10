'use client'
import DialogDemo from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

import { Ban, FolderDown, Info, Pause, Play, ScrollText, SquareTerminal, Trash2, View } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {useSocket} from "@/hooks/useSocket";

type DataType = { container: string };

export default function ContainerPage(){
    const [data, setData] = useState<DataType[]>([]); 
    const [page, setPage] = useState(1);

    let msgToSend = {};
    let outputUser = "";

    useEffect(() => {
        // Fetch the data from your API or server
        // This is a placeholder and should be replaced with your actual data fetching logic
        const fetchData = async () => {
          const newData = await fetchContainerData(page);
          setData(oldData => [...oldData, ...newData]);
        };

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
    
    const updateData= data.filter((item)=>item.container != containerToRemove);
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

    function sendToSocket(topic:string, input:{}){
        socket?.emit("command",topic,input)
        console.log("Topic: ",topic);
        console.log("Input: ",input);
    } 

  // Pure JavaScript functions
  function handlePrompt(msg:string, standardInput:string):string {
    let output = prompt(msg,standardInput)
    if (output == null)
        return "";
    return output;
  }

   /* All Button onClick event functions */
    function DeleteContainer(row: string): void {
        outputUser = handlePrompt("Are you sure? type yes or no", "no")
        if(outputUser.toLowerCase()==="yes"){
            msgToSend = {"Action":"Delete","Container":row}
            sendToSocket("DiD_remove",msgToSend)
            removeFromList(row)
        }
        
    }

    function DownloadContent(row: string): void {
        outputUser = handlePrompt("What do you want to download: ","ALL");
        msgToSend = {"Action":"Download","Container":row,"DownloadWhat":outputUser}
        sendToSocket("DiD_download",msgToSend);
    }

    function ContainerCmd(row: string): void {
        outputUser = handlePrompt("What command do you want to execute", "ll")
        msgToSend = {"Action":"Command","Container":row,"Command":outputUser}
        sendToSocket("DiD_command",msgToSend);
    }

    function GetLogFile(row: string): void {
        outputUser = handlePrompt('Are you sure that you want the log file of '+row+', this can take a long time?',"no")
        if(outputUser.toLowerCase()==="yes"){
        msgToSend = {"Action":"Log","Container":row}
        sendToSocket("DiD_logger",msgToSend);
        }
    }

    function StartContainer(row: string): void {
        msgToSend = {"Action":"Start","Container":row}
        sendToSocket("DiD_running",msgToSend);
    }

    function PauseContainer(row: string): void {
        msgToSend = {"Action":"Pause","Container":row}
        sendToSocket("DiD_running",msgToSend);
    }

    function StopContainer(row: string): void {
        msgToSend = {"Action":"Stop","Container":row}
        sendToSocket("DiD_running",msgToSend);
    }

    //Initial data setup
    function fetchContainerData(page: number): Promise<DataType[]> { // Make sure to use the type here as well
        let output= socket?.emit("getContainer");

        console.log("Output: ",output)
    
//     socket?.emit("getContainer",(data)=>{
//         console.log('Received getContainer: ',data)
// }
// )
        
        socket?.once("response_command",(data)=>{
            console.log('Received Response: ',data)
        })
    
        return Promise.resolve([
            {container:"smtpDev1"},{container:"smtpDev2"},{container:"smtpDev3"},{container:"smtpDev4"},
            {container:"smtpDev5"},{container:"smtpDev6"},{container:"smtpDev7"},{container:"smtpDev8"},
            {container:"smtpDev9"},{container:"smtpDev10"},{container:"smtpDev11"},{container:"smtpDev12"}]); // This is just a placeholder
    }


    //Page contents
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Table>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                    <tr>
                        <th>Container</th>
                        <th>Action</th>
                        <th>Control</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td>{row.container}</td>
                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button onClick={()=>DeleteContainer(row["container"])}><Trash2 /></Button>
                                <Button onClick={()=>DownloadContent(row["container"])}><FolderDown /></Button>
                                <Button onClick={()=>ContainerCmd(row["container"])}><SquareTerminal /></Button>
                                <Button onClick={()=>GetLogFile(row["container"])}><ScrollText /></Button>
                            </td>
                            <td style={{ justifyContent: 'center' }}>
                                <Button onClick={()=>StartContainer(row["container"])}><Play /></Button>
                                <Button onClick={()=>PauseContainer(row["container"])}><Pause /></Button>
                                <Button onClick={()=>StopContainer(row["container"])}><Ban /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}



