import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import remarkGfm from 'remark-gfm'; // Optional: Support for GitHub Flavored Markdown

interface ResponceProps {
  message: string;
}

export const Responce: React.FC<ResponceProps> = ({ message }) => {
  const [displayedMessage, setDisplayedMessage] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    // Reset the message if a new message is passed
    setDisplayedMessage('');
    setIsFinished(false);

    // Animate the message by adding one character at a time
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedMessage((prev) => prev + message[index]);
      index++;

      if (index >= message.length) {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 50); // Adjust the speed of animation here

    return () => {
      clearInterval(interval); // Clear the interval when the component is unmounted or message changes
    };
  }, [message]);

  return (
    <div className='bg-neutral-900 text-white p-4 rounded-3xl text-xl mr-20 mt-4'>
      {/* Render the displayed message as Markdown */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedMessage}</ReactMarkdown>
      {!isFinished && <span className="dot">.</span>} {/* Optional: Show a loading dot until finished */}
    </div>
  );
};