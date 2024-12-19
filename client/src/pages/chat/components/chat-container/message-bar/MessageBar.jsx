import { useSocket } from "@/context/SocketContext.jsx";
// import { apiClient } from "@/lib/api-client.js";
import { useAppStore } from "@/store/index.js";
import axios from "axios";
// import { UPLOAD_FILE_ROUTE } from "@/utils/constants.js";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setFileUploading,
    setFileUploadProgress,
  } = useAppStore();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    console.log(userInfo);

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_MESSAGE_PRESET);

        setFileUploading(true);
        if (file.type.startsWith("image/")) {
          const res = await axios.post(
            import.meta.env.VITE_CLOUDINARY_IMAGE_URL,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (100 * progressEvent.loaded) / progressEvent.total
                );
                setFileUploadProgress(percent);
                // console.log(`Image Upload Progress: ${percent}%`);
              },
            }
          );

          if (res.status === 200) {
            const data = await res.data;

            setFileUploading(false);

            const fileUrl = data.secure_url;
            console.log("File uploaded successfully:", fileUrl);

            if (selectedChatType === "contact") {
              socket.emit("sendMessage", {
                sender: userInfo.id,
                content: undefined,
                recipient: selectedChatData._id,
                messageType: "file",
                // fileUrl: res.data.filePath,
                fileUrl: fileUrl,
              });
            } else if (selectedChatType === "channel") {
              socket.emit("send-channel-message", {
                sender: userInfo.id,
                content: undefined,
                messageType: "file",
                // fileUrl: res.data.filePath,
                fileUrl: fileUrl,
                channelId: selectedChatData._id,
              });
            }
          }
        } else {
          // Nếu là file không phải ảnh, tải lên với URL của Cloudinary cho file
          const res = await axios.post(
            import.meta.env.VITE_CLOUDINARY_FILE_URL,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (100 * progressEvent.loaded) / progressEvent.total
                );
                setFileUploadProgress(percent);
                console.log(`File Upload Progress: ${percent}%`);
              },
            }
          );

          if (res.status === 200) {
            const data = await res.data;

            setFileUploading(false);

            const fileUrl = data.secure_url;
            console.log("File uploaded successfully:", fileUrl);

            if (selectedChatType === "contact") {
              socket.emit("sendMessage", {
                sender: userInfo.id,
                content: undefined,
                recipient: selectedChatData._id,
                messageType: "file",
                // fileUrl: res.data.filePath,
                fileUrl: fileUrl,
              });
            } else if (selectedChatType === "channel") {
              socket.emit("send-channel-message", {
                sender: userInfo.id,
                content: undefined,
                messageType: "file",
                // fileUrl: res.data.filePath,
                fileUrl: fileUrl,
                channelId: selectedChatData._id,
              });
            }
          }
        }
      }
      // console.log({ file });
    } catch (error) {
      setFileUploading(false);
      console.log(error);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={() => setEmojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
