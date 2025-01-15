import React from "react";

interface QuaryProps {
  text: string;
}

export const Quary: React.FC<QuaryProps> = ({ text }) => {
  return (
    <div className="h-fit">
      <div className="bg-neutral-700 text-white py-4 px-4 min-h-12 rounded-xl text-xl w-5/6 mt-4 ml-auto h-fit">
        {text}
      </div>
    </div>
  );
};
