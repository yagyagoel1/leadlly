import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize Express app
const app = express();

// Enable CORS with specified origin and credentials
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// Parse incoming JSON requests and limit request body size
app.use(express.json({ limit: "16kb" }));

// Parse incoming URL-encoded data and limit request body size
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

// Parse cookies
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Import routers
import userRouter from "./routes/user.route";
import productRouter from "./routes/product.route";

// Mount routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);

// Export the app
export { app };
