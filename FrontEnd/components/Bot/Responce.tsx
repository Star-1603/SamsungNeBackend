"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Bot } from "lucide-react";

interface ResponceProps {
  message: string;
}

export const Responce: React.FC<ResponceProps> = ({ message }) => {
  return (
    <div className="mt-14 flex gap-4">
      <Bot className="ml-4 bg-neutral-800 p-2 h-12 w-12 rounded-full"/>
      <div className=" text-white rounded-3xl text-xl w-11/12 ">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
    </div>
  );
};
