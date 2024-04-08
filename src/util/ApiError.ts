class ApiError extends Error
{ 
    statusCode: number;
    data: any | null; 
    message: string;
     errors: any[];
     success: boolean;
    
    constructor(
        statusCode:number,
        message = "Something went Wrong",
        errors=[]   
    ){
        super() 

        this.statusCode = statusCode;
        this.data= null;
        this.message = message;
        this.errors = errors,
        this.success= false
    }
}
 export {ApiError}
 