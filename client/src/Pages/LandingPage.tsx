import Topbar from "../components/Topbar"



export function LandingPage({children}: {children : React.ReactNode}){

    return <div className="default-background h-screen bg-blue-300 ">
        <Topbar/>
        <div>
            <div>
                {children}
            </div>
        </div>
    </div>
}