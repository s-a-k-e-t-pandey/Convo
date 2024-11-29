import { SiThunderbird } from "react-icons/si";
import { Link } from "react-router-dom";

export default function Topbar() {

    return <div className="bg-gradient-to-b via-cyan-400 via-teal-400 from-blue-900 to-blue-800 z-10 p-4 text-3xl font-extrabold border-solid border-2 border-slate-400 rounded-2xl">
        <div className="flex justify-between text-[#0d1117]">
            <div className="flex row text-[#0d1117] ">
                <Link to={"/"}>
                <button className="inline-flex h-10 items-center justify-center rounded-full bg-cyan-400 px-8 text-3xl font-medium text-[#0d1117] shadow transition-colors  border-red-400 border-2">
                Convo <div className="text-4xl text-[#0d1117]"><SiThunderbird /></div>
                </button>
                </Link>
                
            </div>
            <div className="flex row">
                <Link to={"/signin"}>
                    <button className="inline-flex h-10 items-center justify-center rounded-l-full bg-cyan-400 px-8 text-lg font-medium text-[#0d1117] shadow transition-colors hover:bg-cyan-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-l-red-400 border-2">
                        Login
                    </button>
                </Link>
                <Link to={"/signup"}>
                    <button className="inline-flex h-10 items-center justify-center rounded-r-full bg-cyan-400 px-8 text-lg font-medium text-[#0d1117] shadow transition-colors hover:bg-cyan-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-r-red-400 border-2">
                        Signup
                    </button>
                </Link>
            </div>
        </div>
    </div>
}