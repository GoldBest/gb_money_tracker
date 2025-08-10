import React from 'react';
import Icon from './Icon';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 border border-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-sm hover:shadow-md',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md',
    outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'bg-transparent text-blue-600 hover:text-blue-800 underline p-0 h-auto'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs rounded-md',
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-xl'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  const iconSize = {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 24
  };
  
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Icon 
        name={icon} 
        size={iconSize[size]} 
        className={loading ? 'animate-spin' : ''}
      />
    );
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Icon name="refresh" size={iconSize[size]} className="animate-spin mr-2" />
          Загрузка...
        </>
      );
    }
    
    if (icon && iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {children && <span className="ml-2">{children}</span>}
        </>
      );
    }
    
    if (icon && iconPosition === 'right') {
      return (
        <>
          {children && <span className="mr-2">{children}</span>}
          {renderIcon()}
        </>
      );
    }
    
    return children;
  };
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
