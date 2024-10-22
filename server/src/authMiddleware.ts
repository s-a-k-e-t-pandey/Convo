

export const isAuthenticated = (req: any, res: any, next: any)=>{
    try{
        if (req.session.user) {
            return next()
        } else {
            res.status(401).json({ 
                isAuthenticated: false ,
                msg: "Unauthorized Access."
            })
        }
    }catch(e){
        console.error("Error checking session: ",e);
    }
}