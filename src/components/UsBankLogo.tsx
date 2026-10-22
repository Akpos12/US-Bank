import React from 'react';

interface UsBankLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'white';
  alt?: string;
}

export const UsBankLogo: React.FC<UsBankLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  alt = 'U.S. Bank',
}) => {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
    xl: 'h-12 sm:h-14',
  };

  const imageElement = (
    <img
      src="/assets/usbank_logo_transparent.png"
      alt={alt}
      className={`w-auto object-contain select-none transition-all ${sizeClasses[size] || 'h-8'} ${
        variant === 'dark' ? className : ''
      }`}
      loading="eager"
      decoding="async"
    />
  );

  if (variant === 'light' || variant === 'white') {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white rounded-xl px-2.5 py-1 shadow-xs ${className}`}
      >
        {imageElement}
      </div>
    );
  }

  return imageElement;
};

export const EqualHousingLenderIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-label="Equal Housing Lender"
  >
    <title>Equal Housing Lender</title>
    {/* House roof and frame */}
    <path d="M12 2L2 10.5h3v9.5h14V10.5h3L12 2z" />
    {/* Equal sign cut out from center */}
    <rect x="7.5" y="11" width="9" height="1.8" rx="0.5" fill="white" />
    <rect x="7.5" y="14.5" width="9" height="1.8" rx="0.5" fill="white" />
  </svg>
);
