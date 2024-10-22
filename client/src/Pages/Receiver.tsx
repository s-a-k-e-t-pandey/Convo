import { useEffect, useRef, useState } from "react"


export const Receiver = () => {
    const videoRef = useRef<HTMLVideoElement>();
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);

    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        document.body.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            console.log(event);
            video.srcObject = new MediaStream([event.track]);
            video.play();
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        const stream = navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        // navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        const videoTrack = stream.getVideoTracks()[0];
        setlocalVideoTrack(videoTrack);    
        if(!videoRef.current){
                return;
            }
            videoRef.current.srcObject = new MediaStream([videoTrack]);
            videoRef.current.play();
            // this is wrong, should propogate via a component
            stream.getTracks().forEach((track) => {
                console.error("track added");
                console.log(track);
                console.log(pc);
                pc?.addTrack(track);
            });
        });
    }

    return <div>
        
    </div>
}