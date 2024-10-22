import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Signup } from "./Pages/Signup"
import { Signin } from "./Pages/Signin"
import { LandingPage } from "./Pages/LandingPage"
import Room from "./Pages/Room"
import { Dashboard } from "./Pages/Dashboard"
import Know from "./Pages/Know"
import { Landing } from "./Pages/landing"


export default function App(){


    return <div>
        <BrowserRouter>
            <Routes>
                <Route path="/signup" element={<Signup/>}></Route>
                <Route path="/signin" element={<Signin/>}></Route>
                <Route path="/" element={<LandingPage children={undefined}/>}/>
                <Route path="/room" element={<Landing/>}/>
                <Route path="/know" element={<Know/>}/>
                <Route path="/dashboard" element={<Dashboard children={undefined}/>}/>
            </Routes>
        </BrowserRouter>
    </div>
}
