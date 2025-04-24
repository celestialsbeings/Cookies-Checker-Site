import React from 'react';

interface CookieLogoProps {
  className?: string;
}

export const CookieLogo: React.FC<CookieLogoProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="#F4A460"
        stroke="#8B4513"
        strokeWidth="4"
      />
      {/* Cookie chips */}
      <circle cx="30" cy="35" r="6" fill="#8B4513" />
      <circle cx="60" cy="30" r="6" fill="#8B4513" />
      <circle cx="45" cy="60" r="6" fill="#8B4513" />
      <circle cx="70" cy="55" r="6" fill="#8B4513" />
      <circle cx="25" cy="70" r="6" fill="#8B4513" />
    </svg>
  );
};