// Flow.tsx
'use client';
import React, { useState } from 'react';
import { Responce } from '../Bot/Responce';
import { Quary } from '../user/Quary';
import { Input } from '../ui/Input';
import { ResponceLoading } from '../Bot/ResponceLoading';

// Define the message type
interface Message {
  type: 'query' | 'response';
  content: string;
}

export const Flow: React.FC = () => {
  const [conversation, setConversation] = useState<Message[]>([
    { type: 'query', content: 'Hi! How can I help you?' },
  ]);
  const [latestQuery, setLatestQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to add messages to the conversation
  const addMessage = (type: 'query' | 'response', content: string) => {
    setConversation((prev) => [...prev, { type, content }]);
  };

  // Handle user input
  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;
    addMessage('query', input); // Add user query
    setLatestQuery(input); // Set the latest query
    setLoading(true);

    // Call the API only for the latest query
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      addMessage('response', data.response || 'No response from server');
    } catch (error) {
      addMessage('response', 'Error fetching response');
    } finally {
        setLoading(false); 
    }
  };

  return (
    <div className='w-full p-8 mb-36'>
      <div className="conversation">
        {conversation.map((msg, index) =>
          msg.type === 'query' ? (
            <Quary key={index} text={msg.content} />
          ) : (
            <Responce key={index} message={msg.content} />
          )
        )}
        {loading && <ResponceLoading />}
      </div>
      <Input onSubmit={handleUserInput} />
    </div>
  );
};