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
    console.log("Received WebSocket message", data);

    switch (data.type) {
        case "send-offer":
            console.log("Sending offer");
            setLobby(false);

            if (!sendingPc.current || sendingPc.current.signalingState === 'closed') {
                sendingPc.current = new RTCPeerConnection();
            }

            const pc = sendingPc.current;

            if (localVideoTrack) {
                pc.addTrack(localVideoTrack);
            }
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack);
            }

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    iceCandidatesQueue.push(e.candidate);
                } else if (ws.current && iceCandidatesQueue.length > 0) {
                    ws.current.send(JSON.stringify({
                        type: "add-ice-candidates",
                        candidates: iceCandidatesQueue,
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
            console.log("Received offer:", data.sdp);
            setLobby(false);

            if (!receivingPc.current || receivingPc.current.signalingState === 'closed') {
                receivingPc.current = new RTCPeerConnection();
                receivingPc.current.onicecandidate = (e) => {
                    if (e.candidate && ws.current) {
                        ws.current.send(JSON.stringify({
                            type: "add-ice-candidate",
                            candidate: e.candidate,
                            role: "receiver",
                            roomId: data.roomId
                        }));
                    }
                };

                const stream = new MediaStream();
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                }

                receivingPc.current.ontrack = (e) => {
                    stream.addTrack(e.track);
                };
            }

            const receivepc = receivingPc.current;

            // Check signaling state before setting remote description
            if (receivepc.signalingState !== "have-remote-offer" && receivepc.signalingState !== "have-local-offer") {
                await receivepc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await receivepc.createAnswer();
                await receivepc.setLocalDescription(answer);

                ws.current?.send(JSON.stringify({
                    type: "answer",
                    sdp: answer,
                    roomId: data.roomId
                }));
            } else {
                console.warn("PeerConnection is in an unexpected state:", receivepc.signalingState);
            }
            break;

        case "answer":
            console.log("Received answer:", data.sdp);

            if (sendingPc.current && sendingPc.current.signalingState === "have-local-offer") {
                await sendingPc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

                // Add queued ICE candidates if they exist
                while (iceCandidatesQueue.length > 0) {
                    const candidate = iceCandidatesQueue.shift();
                    await sendingPc.current.addIceCandidate(candidate);
                }
            } else {
                console.warn("Cannot set answer in current state:", sendingPc.current?.signalingState);
            }
            break;

        case "add-ice-candidate":
            const candidate = new RTCIceCandidate(data.candidate);
            const targetPc = data.type === "sender" ? receivingPc.current : sendingPc.current;

            if (targetPc) {
                if (targetPc.remoteDescription) {
                    await targetPc.addIceCandidate(candidate);
                } else {
                    iceCandidatesQueue.push(candidate);
                }
            } else {
                console.error("No valid PeerConnection to add ICE candidate.");
            }
            break;

        default:
            console.warn("Unknown message type received:", data.type);
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
            <video autoPlay width={800} height={800} ref={localVideoRef as React.LegacyRef<HTMLVideoElement>}/>
          </div>
          <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 ">
            <video autoPlay width={800} height={800} ref={remoteVideoRef as React.LegacyRef<HTMLVideoElement>}/>
          </div>
        </div>
      </div>
    );
};
