import { SiThunderbird } from "react-icons/si";
import { Link } from "react-router-dom";

export default function Topbar() {

    return <div className="bg-yellow-600 p-4 text-3xl font-extrabold">
        <div className="flex justify-between">
            <div className="flex row">
                Convo <div className="text-4xl"><SiThunderbird /></div>
            </div>
            <div className="flex row">
            <button className="text-white bg-black-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-l-full text-sm font-semibold px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                <Link to={"/signin"}>Login</Link>
            </button>
            <button className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-r-full text-sm font-semibold px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                <Link to={"/signup"}>Signup</Link>
            </button>
            </div>
        </div>
    </div>
}