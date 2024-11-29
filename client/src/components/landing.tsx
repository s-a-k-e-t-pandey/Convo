import { useEffect, useRef, useState } from "react"
import {Room} from "../components/Room";
import { IoPersonAdd } from "react-icons/io5";


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
                <div className="flex flex-row flex-1 relative group w-full">
                  <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 ">
                    <video autoPlay width={800} height={800} ref={videoRef as React.LegacyRef<HTMLVideoElement>}/>
                        <button className="absolute bottom-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => {
                                setJoined(true);
                        }}>Join</button>
                </div>
                <div className="flex flex-col flex-1 border-2 border-black rounded-lg p-1 bg-slate-200">
                  <IoPersonAdd  className="flex justify-center text-blue-600 text-8xl mt-64 ml-80 font-bold w-fit px-6"/>
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-1">
                <div className="flex flex-col w-full border-2 border-black rounded-lg p-1 m-1">
                  <div className="border-b-4 m-1">
                    <div>
                    <button className="text-white bg-green-600 hover:bg-greeen-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm font-semibold px-5 py-2.5 text-center cursor-wait">
                        Start
                    </button>
                    <button className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg mt-1 mx-1 text-sm font-semibold px-5 py-2.5 text-center cursor-wait">
                        Stop
                    </button>
                    <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg mt-1 mx-1 text-sm font-semibold px-5 py-2.5 text-center cursor-wait">
                        Next
                    </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full border-2 border-black rounded-lg p-1 m-1">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-2 text-gray-700 w-full bg-white border rounded-l-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex flex-col border-2 rounded-lg p-1 m-1 ">
                <button
                    className="relative inline-flex items-center px-5 py-5 font-medium text-white bg-indigo-600 rounded-r-lg shadow-2xl group focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <span className="relative">Send</span>
                  </button>
                </div>
            </div>
        </div>
    }

        return   <Room name={name} localVideoTrack={localVideoTrack} localAudioTrack={localAudioTrack} /> 
}