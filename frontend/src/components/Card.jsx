import React from 'react';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = true,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white border border-gray-200 rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white border-gray-200',
    elevated: 'bg-white border-gray-200 shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-300',
    filled: 'bg-gray-50 border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200'
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  
  const classes = [
    baseClasses,
    variants[variant],
    paddings[padding],
    shadows[shadow],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

// Card Title Component
Card.Title = ({ children, size = 'lg', className = '', ...props }) => {
  const sizes = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold'
  };
  
  return (
    <h3 className={`${sizes[size]} text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

// Card Subtitle Component
Card.Subtitle = ({ children, className = '', ...props }) => (
  <p className={`text-gray-600 text-sm ${className}`} {...props}>
    {children}
  </p>
);

// Card Content Component
Card.Content = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Card Footer Component
Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 flex justify-between items-center ${className}`} {...props}>
    {children}
  </div>
);

// Card Actions Component
Card.Actions = ({ children, className = '', ...props }) => (
  <div className={`flex gap-2 justify-end ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
