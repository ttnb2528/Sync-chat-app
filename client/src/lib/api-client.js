import axios from "axios";
import { HOST } from "@/utils/constants.js";

export const apiClient = axios.create({
  baseURL: import.meta.env.NODE_ENV === "development" ? HOST : "https://sync-chat-app.onrender.com/",
  withCredentials: true,
});
