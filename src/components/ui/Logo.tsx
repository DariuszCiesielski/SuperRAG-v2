
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <img
      src="/logo.png"
      alt="AI w BIZNESIE Logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};

export default Logo;
