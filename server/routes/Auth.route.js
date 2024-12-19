import express from "express";
import {
  login,
  signup,
  getUserInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logout,
} from "../controllers/Auth.controller.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user-info", verifyToken, getUserInfo);
router.post("/update-profile", verifyToken, updateProfile);
router.post("/add-profile-image", verifyToken, addProfileImage);

router.delete("/remove-profile-image", verifyToken, removeProfileImage);
router.post("/logout", logout);

export default router;
