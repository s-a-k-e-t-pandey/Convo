

export default function Know(){
    return <div className="flex flex-row flex-1 bg-green-800">
        <div className="flex flex-col flex-1 bg-slate-200 h-screen">
            <div className="flex flex-row h-[720px] border-y border-slate-800">
                <div className="flex flex-col flex-1"> hjjsd00</div>
                {/* <div className="w-[1px] flex-col border-slate-800 border-l"> hjdsfdgkhs</div>
                <div className="flex flex-col w-[250px] overflow-hidden">monkey</div> */}
            </div>
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
        <div className="flex flex-col flex-1 bg-slate-200 border-l border-slate-800">
        <div className="flex flex-row h-[620px] border-y border-slate-800">
                <div className="flex flex-col flex-1"> hjjsd00</div>
                {/* <div className="w-[1px] flex-col border-slate-800 border-l"> hjdsfdgkhs</div>
                <div className="flex flex-col w-[250px] overflow-hidden">monkey</div> */}
            </div>
            monkey
        </div>
    </div>
}