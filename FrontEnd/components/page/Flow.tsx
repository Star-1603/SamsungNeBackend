'use client';

import React, { useState, useEffect } from 'react';
import { Responce } from '../Bot/Responce';
import { Quary } from '../user/Quary';
import { Input } from '../ui/Input';
import { ResponceLoading } from '../Bot/ResponceLoading';
import { SideBar } from '../SideBar/SideBar';

interface Message {
  type: 'query' | 'response';
  content: string;
  timestamp?: string; // Include timestamp for sorting or tracking
}

export const Flow: React.FC = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to fetch existing chat by ID
  const loadChat = async (chatId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats?chatId=${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }

      const data = await response.json();
      setConversation(
        data.history.map((msg: { role: string; message: string }) => ({
          type: msg.role === 'user' ? 'query' : 'response',
          content: msg.message,
        }))
      );
      setCurrentChatId(chatId);
    } catch (error) {
      console.error('Error loading chat:', error);
      setConversation([]);
      setCurrentChatId(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding messages to the conversation
  const addMessage = async (type: 'query' | 'response', content: string) => {
    setConversation((prev) => [...prev, { type, content }]);

    console.log(currentChatId)

    if (type === 'query' && currentChatId) {
      try {
        const response = await fetch(`/api/chats?action=addToChat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: currentChatId,
            role: 'user',
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add message to chat');
        }
      } catch (error) {
        console.error('Error updating chat history:', error);
      }
    }
    else if (type === 'response' && currentChatId) {
      try {
        const response = await fetch(`/api/chats?action=addToChat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: currentChatId,
            role: 'bot',
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add message to chat');
        }
      } catch (error) {
        console.error('Error updating chat history:', error);
      }
    }
  };

  // Handle user input
  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;

    addMessage('query', input); // Add user query to conversation
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from API');
      }

      const data = await response.json();
      addMessage('response', data.response || 'No response from server');
    } catch (error) {
      console.error('Error fetching response:', error);
      addMessage('response', 'Error fetching response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full p-8 mb-36'>
      <SideBar onSelectChat={loadChat} onCreateChat={setCurrentChatId} />
      <div className="pl-64 conversation">
        {conversation.length === 0 ? (
          <div className="text-center w-full h-[80vh] flex justify-center items-center">
            <h1 className="bg-neutral-800 p-40 rounded-3xl text-neutral-200 text-3xl">
              Type something to get started
            </h1>
          </div>
        ) : (
          conversation.map((msg, index) =>
            msg.type === 'query' ? (
              <Quary key={index} text={msg.content} />
            ) : (
              <Responce key={index} message={msg.content} />
            )
          )
        )}
        {loading && <ResponceLoading />}
      </div>
      <Input onSubmit={handleUserInput} />
    </div>
  );
};
