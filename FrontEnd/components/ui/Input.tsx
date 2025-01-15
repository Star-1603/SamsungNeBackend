'use client';
// Input.tsx
import React, { useState } from 'react';

interface InputProps {
  onSubmit: (query: string) => void; 
}

export const Input: React.FC<InputProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState(''); 

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit(inputValue); 
      setInputValue(''); 
    }
  };

  return (
    <div className='p-4 bg-black fixed bottom-0 h-24 left-64 right-0'>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your query and press Enter"
        className='bg-neutral-700 h-16 rounded-3xl px-4 border border-neutral-600 absolute left-4 right-4'
      />
    </div>
  );
}