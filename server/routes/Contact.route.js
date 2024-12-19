import express from "express";
import {
  getAllContacts,
  getContactsForDMList,
  searchContacts,
} from "../controllers/Contact.controller.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/search", verifyToken, searchContacts);
router.get("/get-contacts-for-dm", verifyToken, getContactsForDMList);
router.get("/get-all-contacts", verifyToken, getAllContacts);

export default router;
