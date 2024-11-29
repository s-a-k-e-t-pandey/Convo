import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const URL = 'ws://localhost:3000/ws';

export const VideoChat = ({
  name,
  localAudioTrack,
  localVideoTrack
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lobby, setLobby] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [message, setMessage] = useState('');

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const previousSrcObject = useRef<MediaStream | null>(null);
  const hasStartedPlaying = useRef(false);



  useEffect(() => {
    const ws = new WebSocket(URL);
    setWs(ws);

    ws.onmessage = async (event: any) => {
      const data = JSON.parse(event.data);
      console.log("reached on Cases")
      switch (data.messageType) {
        case 'send-offer':
          console.log('sending offer');
          setLobby(false);
          const pc = createPeerConnection();
          setSendingPc(pc);
          
          if (localVideoTrack) {
            pc.addTrack(localVideoTrack);
          }
          if (localAudioTrack) {
            pc.addTrack(localAudioTrack);
          }

          pc.onicecandidate = async (e) => {
            if (e.candidate) {
              ws.send(
                JSON.stringify({
                  type: 'add-ice-candidate',
                  candidate: e.candidate,
                  role: 'sender',
                  roomId: data.roomId
                })
              );
            }
          };

          pc.onnegotiationneeded = async () => {
            const sdp = await pc.createOffer();
            pc.setLocalDescription(sdp);
            ws.send(
              JSON.stringify({
                type: 'offer',
                sdp,
                roomId: data.roomId
              })
            );
          };
          break;

        case 'offer':
          console.log('received offer');
          setLobby(false);
          const receivingPc = createPeerConnection();
          await receivingPc.setRemoteDescription(data.remoteSdp);

          const answerSdp = await receivingPc.createAnswer();
          receivingPc.setLocalDescription(answerSdp);

          const stream = new MediaStream();
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setRemoteMediaStream(stream);
          setReceivingPc(receivingPc);

          receivingPc.ontrack = (e) => {
            stream.addTrack(e.track);
          };

          ws.send(
            JSON.stringify({
              type: 'answer',
              roomId: data.roomId,
              sdp: answerSdp
            })
          );

          receivingPc.onicecandidate = async (e) => {
            if (e.candidate) {
              ws.send(
                JSON.stringify({
                  type: 'add-ice-candidate',
                  candidate: e.candidate,
                  role: 'receiver',
                  roomId: data.roomId
                })
              );
            }
          };

          break;

        case 'answer':
          console.log("received answer, setting remote description");
          setLobby(false);
          setSendingPc((pc) => {
            pc?.setRemoteDescription(data.remoteSdp);
            return pc;
          });
          console.log('loop closed');
          break;

        case 'add-ice-candidate':
          console.log('add ice candidate from remote');
          if (data.type == 'sender') {
            setReceivingPc((pc) => {
              pc?.addIceCandidate(data.candidate);
              return pc;
            });
          } else {
            setSendingPc((pc) => {
              pc?.addIceCandidate(data.candidate);
              return pc;
            });
          }
          break;

        default:
          console.log('Unknown message type client side');
      }
    };

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (event) => {
      console.log('Error occurred', event);
    };
  }, [URL, localVideoTrack, localAudioTrack]);

  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws?.send(
          JSON.stringify({
            messageType: 'add-ice-candidate',
            candidate: event.candidate
          })
        );
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Create DataChannel for chat
    const channel = pc.createDataChannel('chat');
    channel.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, { text: event.data, sender: 'Peer' }]);
    };
    setDataChannel(channel);

    return pc;
  };

  const sendMessage = () => {
    if (dataChannel && message) {
      dataChannel.send(message);
      setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'Me' }]);
      setMessage('');
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


  return <>
        <div className="flex flex-row relative group w-full">
                <div className="flex flex-col flex-1 justify-center border-2 border-black rounded-lg p-1 ">
                <video autoPlay width={800} height={800} ref={localVideoRef as React.LegacyRef<HTMLVideoElement>}/>
                </div>
                <div className="flex flex-col flex-1 justify-center border-2 border-black rounded-lg p-1 ">
                <video autoPlay width={800} height={800} ref={remoteVideoRef as React.LegacyRef<HTMLVideoElement>}/>
                </div>
        </div>
            {lobby ? "Waiting to connect you to someone" : null}

      <div className='flex flex-col flex-1 pt-2 px-2 mt-4'>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.sender}: </strong>
              {msg.text}
            </div>
          ))}
        </div>

        <div>
        <input className=' flex flex-col flex-1 border-2 border-black rounded-lg p-2 flex justify-center'
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <div className='flex flex-col flex-1 justify-end '>

        <button onClick={sendMessage}>Send</button>
        </div>
        </div>
      </div>
    </>
};
