import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/Auth.route.js";
import contactRoutes from "./routes/Contact.route.js";
import messageRoutes from "./routes/Message.route.js";
import channelRoutes from "./routes/Channel.route.js";
import setupSocket from "./socket.js";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN, "https://res.cloudinary.com"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/channel", channelRoutes);

// ------------ Deployment ----------------

const __dirname1 = path.resolve("");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "../", "client", "dist")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}

// ------------ Deployment ----------------

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

setupSocket(server);

await mongoose
  .connect("mongodb://localhost:27017/synchronous-chat-app")
  .then(() => console.log("Connected to the database successfully"))
  .catch((error) => console.error(error.message));

export default server;
