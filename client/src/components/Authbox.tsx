import axios from "axios";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom"
import { SigninInput, signupInput } from "../zod";
import { BACKEND_URL } from "../config";
import { Link } from "react-router-dom";
import { LandingPage } from "../Pages/LandingPage";

export const Authbox = ({type} : {type: 'signin' | "signup"})=>{
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<signupInput>({
        username: "",
        email: "",
        password: ""
    });

    async function SendRequest(){
        try{
            const response  = await axios.post(`${BACKEND_URL}/api/v1/user/${type === 'signin' ? 'signin' : 'signup'}`, postInputs);
            const success = await response.data;
            if(success){
                navigate("/dashboard");
            }
        }catch(e){
            alert("error while fetching Credentials");
        }
    }

    return <div>
        <LandingPage children={
            <div className="h-screen flex justify-center ">
            <div className="flex-col p-10 m-16 ">
                <div className="flex-col align-middle p-10 rounded-xl bg-slate-400">
                    <div className="text-3xl font-extrabold flex justify-center">
                        {type === "signin" ? "Login" : "Create an Account"}
                    </div>
                    <div className="flex justify-center py-2">
                        {type === "signin" ? "Don't have an account?" : "Already have an account?" }
                        <Link className="pl-2 underline text-blue-500" to={type === "signin" ? "/signup" : "/signin"}>
                            {type === "signin" ? "Sign up": "Sign in"}
                        </Link>
                    </div>
                    <div className="pt-2">
                        <LabelledInput label="Username" placeholder="saketpandey" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                username: e.target.value
                            })
                        }} />
                        <LabelledInput label="Email" placeholder="saketpandey@gmail.com" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                email: e.target.value
                            })
                        }} />
                        <LabelledInput label="Password" type={"password"} placeholder="123456" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                password: e.target.value
                            })
                        }} />
                        <button onClick={SendRequest} type="button" className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign up" : "Sign in"}</button>
                    </div>
                </div>
            </div>
        </div>
        }>
        </LandingPage>
    </div>
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return <div>
        <label className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
        <input onChange={onChange} type={type || "text"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
    </div>
}