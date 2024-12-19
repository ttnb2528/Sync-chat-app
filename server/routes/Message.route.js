import express from "express";
import { getMessages } from "../controllers/Message.controller.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
// import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "uploads/files" });

router.post("/get-messages", verifyToken, getMessages);
// router.post("/upload-file", verifyToken, upload.single("file"), uploadFile);

export default router;
