import React from 'react';

interface QuaryProps {
  text: string; 
}

export const Quary: React.FC<QuaryProps> = ({ text }) => {
  return (
    <div className='bg-neutral-700 text-white p-4 rounded-3xl text-xl ml-20 mt-4'>{text}</div> 
  );
}