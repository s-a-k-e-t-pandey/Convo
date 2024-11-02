// import React, { useEffect, useRef } from "react";
// import Inputbox from "./Inputbox"


// interface Message{
//     type: 'message';
//     content: string;
//     sender: string
// }


// export const Messagecomp: React.FC = () => {
//     const [messages, setMessages] = React.useState<Message[]>([]);
//     const [inputMessage, setInputMessage] = React.useState('');
//     const [roomId, setRoomId] = React.useState('');
//     const [username, setUsername] = React.useState('');
//     const ws = useRef<WebSocket | null>(null);
    
//     useEffect(() => {
//         const ws = new WebSocket('ws://localhost:8001/api/v1/room');
//         ws.onopen = () => {
//             console.log('Connected to websocket');
//             ws.send(JSON.stringify({type: 'join_room', roomId, username}));
//         };
//         ws.onmessage = (event) => {
//             const message = JSON.parse(event.data);
//             if(message.type === 'joined_room'){
//                 setRoomId(message.roomId);
//                 ws.send(JSON.stringify({type: 'start_call', roomId, username}));
//             }
//             if(message.type === 'call_started'){
//                 setMessages([...messages, {type: 'message', content: 'Call Started', sender: username}]);
//                 ws.send(JSON.stringify({type: 'send_message', roomId, content: 'Call Started', senderId: username, receiverId: message.to[0]}));
//             }
//             if(message.type === 'receive_message'){
//                 setMessages([...messages, {type: 'message', content: message.content, sender: message.senderId}]);
//             }
//             if(message.type === 'webrtc_signal'){
//                 ws.send(JSON.stringify({type: 'webrtc_signal', signal: message.signal, to: message.from}));
//             }
//         };
//         ws.onclose = () => {
//             console.log('Disconnected from websocket');
//         };
//         return () => {
//             ws.close();
//         };
//     }, []);

//     return <div className="h-full rounded-lg grid gird-rows-10">
//         <div className="border-2 m-1 flex justify-center h-full row-span-10">
//             <div>Messages</div>
//         </div>
//         <div className="border-2 flex-col ">
//             <div className="flex flex-row">
//                 <div className="flex justify-center pt-4 pl-2">
//                     <button type="button" className="text-white bg-slate-500 rounded-lg text-lg font-bold w-fit px-6">Send</button>
//                 </div>
//                 <div className="flex justify-center flex-col w-full pr-1">
//                     <Inputbox>
//                         <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
//                     </Inputbox>
//                 </div>
//             </div> 
//         </div>
//     </div>
// }

// export default Messagecomp;