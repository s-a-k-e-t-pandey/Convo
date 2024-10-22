import { Spinner } from "./Spinner"
import { useState, useEffect } from "react";



export default function Videocomp(){
    const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    setWs(ws);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        document.getElementById('local-video').srcObject = stream;
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });

    ws.onmessage = (event) => {
      if (event.data.type === 'offer') {
        // Handle the offer
        const peerConnection = new RTCPeerConnection();
        setRemoteStream(new MediaStream());
        document.getElementById('remote-video').srcObject = remoteStream;

        peerConnection.onaddstream = (event) => {
          remoteStream.addStream(event.stream);
        };

        peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: event.data.sdp }));
        peerConnection.createAnswer()
          .then((answer) => {
            return peerConnection.setLocalDescription(new RTCSessionDescription({ type: 'answer', sdp: answer.sdp }));
          })
          .then(() => {
            ws.send({ type: 'answer', sdp: peerConnection.localDescription.sdp });
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
          });
      } else if (event.data.type === 'answer') {
        // Handle the answer
        const peerConnection = new RTCPeerConnection();
        peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: event.data.sdp }));
      } else if (event.data.type === 'candidate') {
        // Handle the ICE candidate
        const peerConnection = new RTCPeerConnection();
        peerConnection.addIceCandidate(new RTCIceCandidate({ candidate: event.data.candidate }));
      }
    };

    ws.onerror = (event) => {
      console.log(`Error: ${event}`);
    };

    ws.onclose = () => {
      console.log('Disconnected from the server');
    };

    return () => {
      ws.close();
    };
  }, []);
    return <div className="h-full rounded-lg grid grid-rows-1 lg:grid-rows-2">
            <div className="border-4 m-1 flex justify-center flex-col">
                {/* <div className="flex justify-center">
                    <div>
                        <Spinner></Spinner>
                        Receiver
                    </div>
                </div> */}
            <video autoPlay width={400} height={400} ></video>            
            <video id="local-video" width={800} height={400} autoPlay muted className="" />
            </div>
            <div className="border-4 m-1 flex justify-center w-max-content stretch ">
            <video id="local-video" width={800} height={400} autoPlay muted className="" />
            </div>
            <div className="border-4 m-1">
                <div>
                <button className="text-white bg-green-600 hover:bg-greeen-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm font-semibold px-5 py-2.5 text-center ">
                    Start
                </button>
                <button className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg mt-1 mx-1 text-sm font-semibold px-5 py-2.5 text-center ">
                    Stop
                </button>
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg mt-1 mx-1 text-sm font-semibold px-5 py-2.5 text-center ">
                    Next
                </button>
                </div>
            </div>
        </div>
}