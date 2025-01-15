"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Plus, LogIn, UserPlus, Upload, Cpu } from "lucide-react";

const models = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "claude-v1", label: "Claude v1" },
];

interface SideBarProps {
  onSelectChat: (chatId: string) => void;
  onCreateChat: (chatId: string) => void;
}

interface Chat {
  id: string;
  updatedAt: string;
}

export function SideBar({ onSelectChat, onCreateChat }: SideBarProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [session]);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      setChats(data.chats || []);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load chats. Please try again.");
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/chats?action=create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create new chat");
      }
      const newChat = await response.json();
      setChats((prev) => [
        ...prev,
        { id: newChat._id, updatedAt: newChat.updatedAt },
      ]);
      onCreateChat(newChat._id);
    } catch (err) {
      console.error("Error creating new chat:", err);
      setError("Failed to create new chat. Please try again.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file.name);
      // TODO: Implement file upload logic
    }
  };

  const handleModelChange = () => {
    const currentIndex = models.findIndex(
      (model) => model.value === selectedModel.value
    );
    const nextIndex = (currentIndex + 1) % models.length;
    setSelectedModel(models[nextIndex]);
    console.log("Model changed to:", models[nextIndex].label);
  };

  return (
    <div className="w-64 left-0 top-0 rounded-tr-3xl rounded-br-3xl bg-gray-900 text-white p-4 fixed flex flex-col h-screen">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={handleNewChat}
        className="flex flex-row items-center justify-center h-14 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      >
        <Plus className="mr-2 h-4 w-4" /> New Chat
      </button>

      <ul className="mb-4 space-y-2 rounded-xl">
        {chats.map((chat) => (
          <li key={chat.id} className="">
            <button
              onClick={() => onSelectChat(chat.id)}
              className="w-full text-left truncate hover:bg-gray-500 p-4 bg-gray-800 rounded-md text-lg border border-gray-600"
            >
              Chat {chat.id.slice(0, 8)}...
            </button>
          </li>
        ))}
      </ul>

      <div className="absolute bottom-4 left-4 right-4 left">
        {!session ? (
          <>
            <button
              onClick={() => (window.location.href = "/api/auth/signin")}
              className="flex flex-row items-center justify-center h-14 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              <LogIn className="mr-2 h-4 w-4" /> Login
            </button>

            <button
              onClick={() => (window.location.href = "/api/auth/signup")}
              className="flex flex-row items-center justify-center h-14 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </button>
          </>
        ) : (
          <button
            onClick={() => signOut()}
            className="flex flex-row items-center justify-center h-14 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            <LogIn className="mr-2 h-4 w-4" /> Logout
          </button>
        )}

        <button
          className="flex flex-row items-center justify-center h-14 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" /> Upload File
        </button>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={handleModelChange}
          className="flex flex-row items-center w-full justify-center h-14 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          <Cpu className="mr-2 h-4 w-4" /> {selectedModel.label}
        </button>
      </div>
    </div>
  );
}
