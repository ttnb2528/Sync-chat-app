import axios from "axios";
import { HOST } from "@/utils/constants.js";

export const apiClient = axios.create({
  baseURL: HOST,
  // baseURL: "https://sync-chat-app.onrender.com/",
  withCredentials: true,
});
