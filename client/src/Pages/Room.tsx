import { useState, useEffect, useRef } from "react";
import { set } from "zod";




export const Room = ({
  name,
  localVideoTrack
}: {
  name: string,
  localVideoTrack: MediaStreamTrack | null,
})=>{
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>();
  const localVideoRef = useRef<HTMLVideoElement>();
  const [lobby, setLobby] = useState(true);



  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    setSocket(socket);
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: 'sender'
        }));
    }

    const initiateConn = async () =>{
        if(!socket){
          alert("Socket not found");
          return;
        }

        setLobby(false);

        const pc = new RTCPeerConnection();
        setSendingPc(pc);

        if(localVideoTrack){
          pc.addTrack(localVideoTrack )
        }

        pc.onicecandidate = async (event) =>{
          if (event.candidate) {
            socket?.send(JSON.stringify({
                type: 'iceCandidate',
                candidate: event.candidate
            }));
          }
        }

        pc.onnegotiationneeded = async () =>{
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket?.send(JSON.stringify({
            type: 'offer',
            sdp: pc.localDescription
          }))   
        }
    }


    socket.onmessage = async (event) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      if (event.data.type === 'offer') {
        const {roomId, sdp: remoteSdp} = JSON.parse(event.data);
        
        pc.setRemoteDescription(remoteSdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }

        setRemoteMediaStream(stream);
        
        setReceivingPc(pc);
        pc.ontrack = (e) =>{
          alert("ontrack");
        }

        pc.onicecandidate = async (event) => {
          if(!event.candidate){
            return;
          }
          if(event.candidate){
            socket?.send(JSON.stringify({
              type: 'iceCandidate',
              candidate: event.candidate,
              roomId
            }))
          }
        }

        socket.send(JSON.stringify({
          type: 'answer',
          roomId,
          sdp: answer.sdp
        }));

        setTimeout(() => {
          const track1 = pc.getTransceivers()[0].receiver.track
          const track2 = pc.getTransceivers()[1].receiver.track
          console.log(track1);
          if (track1.kind === "video") {
              setRemoteVideoTrack(track1)
          } else {
              setRemoteVideoTrack(track2)
          }
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track1)
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track2)
          // @ts-ignore
          remoteVideoRef.current.play();

          }, 5000);
  
      } else if (event.data.type === 'answer') {
        const {sdp: remoteSdp} = JSON.parse(event.data);
        setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
      } else if (event.data.type === 'candidate') {
        const data = JSON.parse(event.data);
        handleAddIceCandidate(data);
      } else if (event.data.type === 'lobby'){
        setLobby(true);
      }
    };

    socket.onerror = (event) => {
      console.log(`Error: ${event}`);
    };

    socket.onclose = () => {
      console.log('Disconnected from the server');
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleAddIceCandidate = ({ candidate, type }: { candidate: RTCIceCandidate; type: string }) => {
    console.log('Add ICE candidate from remote');
    console.log({ candidate, type });
    if (type === 'sender') {
      setReceivingPc(pc => {
        if (!pc) {
          console.error('Receiving PC not found');
        } else {
          console.error(pc.ontrack);
        }
        pc?.addIceCandidate(new RTCIceCandidate(candidate));
        return pc;
      });
    } else {
      setSendingPc(pc => {
        if (!pc) {
          console.error('Sending PC not found');
        } else {
          // console.error(pc.ontrack);
        }
        pc?.addIceCandidate(new RTCIceCandidate(candidate));
        return pc;
      });
    }
  };

    useEffect(() => {
      if (localVideoRef.current) {
          if (localVideoTrack) {
              localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
              localVideoRef.current.play();
          }
      }
  }, [localVideoRef])

    return <div className="bg-red-200">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-screen border-4 m-1 hue-rotate-180 saturate-100">
            {/* <video id="local-video" width={500} height={800} autoPlay muted className="saturate-200 hue-rotate-180 hover:scale-150 " />
            <video id="local-video" width={500} height={800} autoPlay muted className="saturate-200 hue-rotate-180 hover:scale-150 " /> */}
            <video autoPlay width={400} height={400} ref={localVideoRef} />
              
            </div>
            {lobby ? "Waiting to connect you to someone" : null}

            <div className="h-screen bg-emerald-200 border-4 m-1">
            {/* <video id="remote-video" autoPlay className="w-full max-w-md h-96 rounded" /> */}
            <video autoPlay width={400} height={400} ref={remoteVideoRef} />
            </div>
        </div>
    </div>

}

export default Room;



// const Room = () => {
//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const [messages, setMessages] = useState<string[]>([]);
//   const [message, setMessage] = useState('');
//   const [callStarted, setCallStarted] = useState(false);
  
//   const localVideoRef =  useRef<HTMLVideoElement>(null);
//   const remoteVideoRef =  useRef<HTMLVideoElement>(null);
//   const localPeerConnection = useRef<RTCPeerConnection | null>(null);
//   const remotePeerConnection = useRef<RTCPeerConnection | null>(null);

//   useEffect(() => {
//     // Establish WebSocket connection when component mounts
//     const websocket = new WebSocket('ws://localhost:5000');
//     setWs(websocket);

//     websocket.onopen = () => {
//       console.log('WebSocket connection established');
//     };

//     websocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       switch (data.type) {
//         case 'send_message':
//           setMessages((prevMessages) => [...prevMessages, data.message]);
//           break;

//         case 'webrtc_offer':
//           handleWebRTCOffer(data.offer);
//           break;

//         case 'webrtc_answer':
//           handleWebRTCAnswer(data.answer);
//           break;

//         case 'webrtc_ice_candidate':
//           handleICECandidate(data.candidate);
//           break;

//         default:
//           console.log('Unknown message type:', data.type);
//       }
//     };

//     websocket.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     websocket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     return () => {
//       websocket.close();
//     };
//   }, []);

//   // Handle sending chat message
//   const handleSendMessage = () => {
//     if (ws) {
//       ws.send(JSON.stringify({ type: 'send_message', message }));
//       setMessage('');
//     }
//   };

//   // Handle starting a video call
//   const startCall = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     localPeerConnection.current = new RTCPeerConnection();
//     stream.getTracks().forEach(track => localPeerConnection.current.addTrack(track, stream));

//     localPeerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         ws.send(JSON.stringify({ type: 'webrtc_ice_candidate', candidate: event.candidate }));
//       }
//     };

//     localPeerConnection.current.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     const offer = await localPeerConnection.current.createOffer();
//     await localPeerConnection.current.setLocalDescription(offer);
//     ws.send(JSON.stringify({ type: 'webrtc_offer', offer }));

//     setCallStarted(true);
//   };

//   // Handle receiving WebRTC offer
//   const handleWebRTCOffer = async (offer) => {
//     remotePeerConnection.current = new RTCPeerConnection();
//     remotePeerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         ws.send(JSON.stringify({ type: 'webrtc_ice_candidate', candidate: event.candidate }));
//       }
//     };

//     remotePeerConnection.current.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     await remotePeerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     stream.getTracks().forEach(track => remotePeerConnection.current.addTrack(track, stream));

//     const answer = await remotePeerConnection.current.createAnswer();
//     await remotePeerConnection.current.setLocalDescription(answer);

//     ws.send(JSON.stringify({ type: 'webrtc_answer', answer }));
//   };

//   // Handle receiving WebRTC answer
//   const handleWebRTCAnswer = async (answer) => {
//     await localPeerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//   };

//   // Handle receiving ICE Candidate
//   const handleICECandidate = (candidate) => {
//     const newCandidate = new RTCIceCandidate(candidate);
//     localPeerConnection.current.addIceCandidate(newCandidate);
//     remotePeerConnection.current.addIceCandidate(newCandidate);
//   };

//   return (
//     <div>
//       <h1>WebSocket and WebRTC Chat & Video Call</h1>

//       {/* Chat Section */}
//       <div>
//         <h2>Chat</h2>
//         <div style={{ height: '200px', border: '1px solid black', overflowY: 'scroll' }}>
//           {messages.map((msg, index) => (
//             <div key={index}>{msg}</div>
//           ))}
//         </div>
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button onClick={handleSendMessage}>Send Message</button>
//       </div>

//       {/* Video Section */}
//       <div>
//         <h2>Video Call</h2>
//         <video ref={localVideoRef} autoPlay playsInline style={{ width: '300px' }} />
//         <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px' }} />
//         {!callStarted && <button onClick={startCall}>Start Call</button>}
//       </div>
//     </div>
//   );
// };

// export default Room;