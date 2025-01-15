import React from 'react';
import Link from 'next/link';

interface DottedButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

const DottedButton: React.FC<DottedButtonProps> = ({ children, href, className = '' }) => {
  const buttonContent = (
    <button
      className={`rounded-2xl border-2 border-dashed border-black bg-white px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none ${className}`}
    >
      {children}
    </button>
  );

  // If an href is provided, wrap the button in a Link component
  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  // If no href, just return the button
  return buttonContent;
};

export default DottedButton;