import { Response,Request,NextFunction } from "express"
export const asyncHandler = (fn:(req: Request, res: Response, next: NextFunction)=> Promise<any> | void)=>
async(req:Request,res:Response,next:NextFunction)=>{
    try {
        await fn(req,res,next)
    } catch (error:any) {
        res.status(error.statuscode||500).json({
            success:false,
            message : error.message
        })
    }
}