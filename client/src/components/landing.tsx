import { useEffect, useRef, useState } from "react"
import {Room} from "../components/Room";
import { VideoChat } from "./newRoom";

export const Landing = () => {
    const [name, setName] = useState("");
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [joined, setJoined] = useState(false);

    const getCam = async () => {
        try {
          const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
      
          const audioTrack = stream.getAudioTracks()[0];
          const videoTrack = stream.getVideoTracks()[0];
          setLocalAudioTrack(audioTrack);
          setlocalVideoTrack(videoTrack);
      
          if (videoRef.current) {
            const videoStream = new MediaStream([videoTrack]);
            videoRef.current.srcObject = videoStream;
      
            // Wait for the metadata to load before playing
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(error => {
                console.error("Error playing video:", error);
              });
            };
          }
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      };
      
      useEffect(() => {
        if (videoRef && videoRef.current) {
          getCam();
        }
      }, [videoRef]);
      

    if (!joined) {
            
    return <div>
            <div className="flex flex-row flex-1 relative group w-full">
                <div className="flex flex-col justify-center border-2 border-black rounded-lg p-1 ">
                <video className="w-500 h-500" autoPlay ref={videoRef}></video>
                <button className="absolute bottom-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => {
                        setJoined(true);
                }}>Join</button>
                </div>
                {/* <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 ">
                <video className="w-500 h-500" autoPlay ref={videoRef}></video>
                </div> */}
            </div>
            <div className="flex flex-col flex-1">
                <div className="flex flex-row flex-1">
                <input type="text" onChange={(e) => {
                        setName(e.target.value);
                    }}>
                </input>
                </div>
                <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 m-1">
                    Messages
                </div>
            </div>
        </div>
    }

    // return <VideoChat name={name} localVideoTrack={localVideoTrack} localAudioTrack={localAudioTrack} />
        return   <Room name={name} localVideoTrack={localVideoTrack} localAudioTrack={localAudioTrack} /> 
}