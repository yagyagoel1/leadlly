// Define a custom ApiError class that extends Error
class ApiError extends Error {
    statusCode: number;
    data: any | null;
    message: string;
    errors: any[];
    success: boolean;
  
    constructor(statusCode: number, message = "Something went wrong", errors = []) {
      super();
  
      this.statusCode = statusCode;
      this.data = null;
      this.message = message;
      this.errors = errors;
      this.success = false;
    }
  }
  
  // Export the ApiError class
  export { ApiError };
  