import Topbar from "../components/Topbar"
import { Link } from "react-router-dom";
import { IoIosVideocam } from "react-icons/io";


export function Dashboard({children}: {children : React.ReactNode}){

    return <div className="fixed top-0 left-0 w-full default-background h-full bg-blue-300	 ">
        <header >
        <Topbar/>
        </header>
        <main>
        <div>
            <div>
                {children}
            </div>
        </div>
        <section className="w-full py-12 md:py-20 lg:py-24 bg-blue-300">
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
                <div className="rounded-full bg-cyan-800 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>
                <div className="text-cyan-700 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>
                
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-red-800 w-24 h-24 flex items-center justify-center text-4xl">        <IoIosVideocam />
                </div>
                <div className="text-red-800 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>

              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gray-700 w-24 h-24 flex items-center justify-center text-4xl">        <IoIosVideocam />
                </div>
                <div className="text-gray-700 w-24 h-24 flex items-center justify-center text-4xl">
                <IoIosVideocam />
                </div>
              </div>
            </div>
              <div className="flex flex-col items-center justify-center space-y-4"> 
                <Link to={"/room"}>
                    <button className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-400 px-8 text-lg font-medium text-[#0d1117] shadow transition-colors hover:bg-[#00b894]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-pink-400 border-2">Let's Connect</button>
                </Link>
              </div>
        </section>
    </main>
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#161b22] bg-slate-800">
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
