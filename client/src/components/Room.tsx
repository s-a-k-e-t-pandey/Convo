import { useEffect, useRef, useState } from "react";

const URL = "ws://localhost:3000/ws";

let socketInstance: WebSocket | null = null;

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    const [lobby, setLobby] = useState(true);
    const ws = useRef<WebSocket | null>(null);
    const sendingPc = useRef<RTCPeerConnection | null>(null);
    const receivingPc = useRef<RTCPeerConnection | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    const previousSrcObject = useRef<MediaStream | null>(null);
    const hasStartedPlaying = useRef(false);
    let candidateQueue: RTCIceCandidate[] = [];
    const iceCandidatesQueue: RTCIceCandidate[] = [];


    useEffect(() => {
        if(!socketInstance){
            ws.current = new WebSocket(URL);

            ws.current.onopen = () => {
                console.log("Connected to WebSocket server");
            };
        
            ws.current.onclose = () => {
                console.log("Disconnected from WebSocket server");
            };
        
            ws.current.onerror = (event) => {
                console.log("Error occurred", event);
            };

            ws.current.onmessage = async (event: any) => {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
                // switch (data.messageType) {
                //     case "send-offer":
                //         console.log("sending offer");
                //         setLobby(false);
                //         const pc = new RTCPeerConnection();
                //         sendingPc.current = pc;
                        
                //         if (localVideoTrack) {
                //             pc.addTrack(localVideoTrack);
                //         }
                //         if (localAudioTrack) {
                //             pc.addTrack(localAudioTrack);
                //         }

                //         pc.onicecandidate = async (e) => {
                //             if (e.candidate && ws.current) {
                //                 ws.current.send(JSON.stringify({
                //                     messageType: "add-ice-candidate",
                //                     candidate: e.candidate,
                //                     type: "sender",
                //                     roomId: data.roomId
                //                 }));
                //             }
                //         };
                        
                //         pc.onnegotiationneeded = async () => {
                //             const sdp = await pc.createOffer();
                //             pc.setLocalDescription(sdp);
                //             ws.current?.send(JSON.stringify({
                //                 messageType: "offer",
                //                 sdp,
                //                 roomId: data.roomId
                //             }));
                //         };
                //         break;

            //         case "offer":
            //             console.log("received offer");
            //             setLobby(false);
            //             const receivePc = new RTCPeerConnection();
            //             await receivePc.setRemoteDescription(data.remoteSdp);
            //             const answerSdp = await receivePc.createAnswer();
            //             receivePc.setLocalDescription(answerSdp);
                        
            //             const stream = new MediaStream();
            //             if (remoteVideoRef.current) {
            //                 remoteVideoRef.current.srcObject = stream;
            //             }

            //             receivingPc.current = receivePc;
                        
            //             receivePc.ontrack = (e) => {
            //                 stream.addTrack(e.track);
            //             };

            //             receivePc.onicecandidate = async (e) => {
            //                 if (e.candidate && ws.current) {
            //                     ws.current.send(JSON.stringify({
            //                         messageType: "add-ice-candidate",
            //                         candidate: e.candidate,
            //                         type: "receiver",
            //                         roomId: data.roomId
            //                     }));
            //                 }
            //             };

            //             ws.current?.send(JSON.stringify({
            //                 messageType: "answer",
            //                 roomId: data.roomId,
            //                 sdp: answerSdp
            //             }));
            //             break;

            //             case "answer":
            //             setLobby(false);
            //             sendingPc.current?.setRemoteDescription(data.remoteSdp);
            //             console.log("loop closed");
            //             break;

            //         case "add-ice-candidate":
            //             console.log("add ice candidate from remote");
            //             if (data.type === "sender") {
            //                 receivingPc.current?.addIceCandidate(data.candidate);
            //             } else {
            //                 sendingPc.current?.addIceCandidate(data.candidate);
            //             }
            //             break;

            //             default:
            //             console.log("Unknown message type");
            //     }
            };

        }else{
            ws.current = socketInstance;
        }
        
        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close(); // Only close if open
            }
            ws.current = null;
            sendingPc.current?.close();
            receivingPc.current?.close();
        };
    }, []);


    const handleWebSocketMessage = async (data: any) => {
        console.log("reached on Cases" ,data);
        switch (data.type) {
            case "send-offer":
                console.log("sending offer");
                setLobby(false);
                const pc = new RTCPeerConnection();
                sendingPc.current = pc;

                if (localVideoTrack) {
                    pc.addTrack(localVideoTrack);
                }
                if (localAudioTrack) {
                    pc.addTrack(localAudioTrack);
                }

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        candidateQueue.push(e.candidate);
                    } else if (ws.current && candidateQueue.length > 0) {
                        ws.current.send(JSON.stringify({
                            type: "ice-candidates",
                            candidates: candidateQueue,
                            role: "sender",
                            roomId: data.roomId,
                        }));
                        candidateQueue = [];
                    }
                };


                pc.onnegotiationneeded = async () => {
                    try {
                        const sdp = await pc.createOffer();
                        await pc.setLocalDescription(sdp);
                        ws.current?.send(JSON.stringify({
                            type: "offer",
                            sdp,
                            roomId: data.roomId
                        }));
                    } catch (error) {
                        console.error("Error creating or sending offer:", error);
                    }
                };
                break;
                
            case "offer":
                console.log("received offer", data.sdp);
                setLobby(false);
                const receivePc = new RTCPeerConnection();
                await receivePc.setRemoteDescription(data.sdp);
                const answerSdp = await receivePc.createAnswer();
                receivePc.setLocalDescription(answerSdp);

                const stream = new MediaStream();
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                }

                receivingPc.current = receivePc;

                receivePc.ontrack = (e) => {
                    stream.addTrack(e.track);
                };

                receivePc.onicecandidate = async (e) => {
                    if (e.candidate && ws.current) {
                        ws.current.send(JSON.stringify({
                            type: "add-ice-candidate",
                            candidate: e.candidate,
                            role: "receiver",
                            roomId: data.roomId
                        }));
                    }
                };

                ws.current?.send(JSON.stringify({
                    type: "answer",
                    roomId: data.roomId,
                    sdp: answerSdp
                }));
                break;

                
                // "answer" case
                case "answer":
                    // const iceCandidatesQueue: RTCIceCandidate[] = [];
                    setLobby(false);
                    console.log("data.remoteSdp:", data.sdp);
                    if (sendingPc.current) {
                        await sendingPc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                        console.log("Remote description set on sender");
                        // Drain the queue of any ICE candidates that arrived early
                        while (iceCandidatesQueue.length > 0) {
                            const candidate = iceCandidatesQueue.shift();
                            if (candidate) {
                                await sendingPc.current.addIceCandidate(candidate);
                            }
                        }
                    }
                    break;
                
                // "add-ice-candidate" case
                case "add-ice-candidate":
                    const candidate = new RTCIceCandidate(data.candidate);
                    if (data.type === "sender") {
                        console.log("Adding ICE candidate for sender");
                        if (receivingPc.current?.remoteDescription) {
                            await receivingPc.current.addIceCandidate(candidate);
                        } else {
                            iceCandidatesQueue.push(candidate);
                        }
                    } else {
                        console.log("Adding ICE candidate for receiver");
                        if (sendingPc.current?.remoteDescription) {
                            await sendingPc.current.addIceCandidate(candidate);
                        } else {
                            iceCandidatesQueue.push(candidate);
                        }
                    }
                    break;
                
            default:
                console.log("Unknown message type from frontend");
        }
    };



    useEffect(() => {
        if (localVideoRef.current && localVideoTrack) {
            const newSrcObject = new MediaStream([localVideoTrack]);

            // Only update if the new stream differs from the current one
            if (newSrcObject !== previousSrcObject.current) {
                localVideoRef.current.srcObject = newSrcObject;
                previousSrcObject.current = newSrcObject;
                hasStartedPlaying.current = false; // Reset the play flag

                localVideoRef.current.onloadeddata = () => {
                    // Ensure video only plays once per source change
                    if (!hasStartedPlaying.current && localVideoRef.current != null) {
                    localVideoRef.current
                        .play()
                        .then(() => {
                        hasStartedPlaying.current = true;
                        })
                        .catch(error => {
                        console.error("Error playing video:", error);
                        });
                    }
                };
            }
        }
        }, [localVideoRef, localVideoTrack]);

    return (
      <div>
        <div className="flex flex-row flex-1 relative group w-full">
          <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 ">
            <video autoPlay width={400} height={400} ref={localVideoRef as React.LegacyRef<HTMLVideoElement>}/>
          </div>
          <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 ">
            <video autoPlay width={400} height={400} ref={remoteVideoRef as React.LegacyRef<HTMLVideoElement>}/>
          </div>
        </div>
      </div>
    );
};
