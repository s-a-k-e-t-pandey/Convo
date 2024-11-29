import Topbar from "../components/Topbar"
import { Link } from "react-router-dom";
import { IoIosVideocam } from "react-icons/io";


export function Dashboard({children}: {children : React.ReactNode}){

    return <div className="fixed top-0 left-0 w-full bg-gradient-to-b via-cyan-400 via-teal-400 from-blue-900 to-blue-800 z-10 h-full ">
        <header >
        <Topbar/>
        </header>
        <main>
        <div>
            <div>
                {children}
            </div>
        </div>
        <section className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-b via-cyan-400 via-teal-400 from-blue-900 to-blue-800 z-10">
            <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">ConnectLive</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Real-time Chat and Video Application.
                </p>
              </div>
            </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-10 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gradient-to-b via-cyan-400 via-teal-400 from-green-900 to-green-800 z-10 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>
                <div className="text-green-700 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>
                
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gradient-to-b via-cyan-400 via-teal-400 from-red-900 to-red-800 z-10 w-24 h-24 flex items-center justify-center text-4xl">        <IoIosVideocam />
                </div>
                <div className="text-red-800 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>

              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gradient-to-b via-cyan-400 via-teal-400 from-yellow-900 to-yellow-800 z-10 w-24 h-24 flex items-center justify-center text-4xl">        <IoIosVideocam />
                </div>
                <div className="text-yellow-700 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>
              </div>
            </div>
              <div className="flex flex-col items-center justify-center space-y-4"> 
                <Link to={"/room"}>
                <a className="relative inline-flex items-center justify-center p-4 px-5 py-3 overflow-hidden font-medium text-indigo-600 rounded-lg shadow-2xl group"
                >
                   <span className="absolute w-48 h-48 -mt-16 -ml-16 animate-rotate-slow bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-70"></span>
                  <span
                    className="absolute top-0 left-0 w-40 h-40 -mt-10 -ml-3 animate-spin-slow bg-gradient-to-b via-cyan-400 via-teal-400 from-blue-900 to-blue-800 rounded-full "
                  ></span>
                  
                  <span
                    className="absolute inset-0 w-full h-full transition duration-700 group-hover:rotate-180 ease"
                  >
                    <span className="absolute bottom-0 left-0 w-24 h-24 -ml-10 bg-purple-500 rounded-full blur-md group-hover:opacity-100 opacity-0"></span>
                    <span className="absolute bottom-0 right-0 w-24 h-24 -mr-10 bg-pink-500 rounded-full blur-md group-hover:opacity-100 opacity-0"></span>
                  </span>
                  <span className="relative text-white">Let's Connect</span>
                </a>
                </Link>
              </div>
        </section>
    </main>
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#161b22] bg-teal-1000">
        <p className="text-xs text-muted-foreground">&copy; 2024 Tune In. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to={""} className="text-xs hover:underline underline-offset-4 text-[#00b894]">
            Terms of Service
          </Link>
          <Link to={""} className="text-xs hover:underline underline-offset-4 text-[#00b894]">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
}   


