import React from 'react';

interface ResponceProps {
  message: string;
}

export const Responce: React.FC<ResponceProps> = ({ message }) => {

    

  return (
    <div className='bg-neutral-900 text-white p-4 rounded-3xl text-xl mr-20 mt-4'>{message}</div> 
  );
}
