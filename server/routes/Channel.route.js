import express from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
} from "../controllers/Channel.controller.js";

const router = express.Router();

router.post("/create-channel", verifyToken, createChannel);
router.get("/get-user-channels", verifyToken, getUserChannels);
router.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);

export default router;
