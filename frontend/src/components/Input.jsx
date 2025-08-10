import React, { forwardRef } from 'react';
import Icon from './Icon';

const Input = forwardRef(({
  label,
  error,
  success,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Determine variant based on props
  let currentVariant = variant;
  if (error) currentVariant = 'error';
  if (success) currentVariant = 'success';
  
  const classes = [
    baseClasses,
    variants[currentVariant],
    sizes[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  const iconSize = {
    sm: 18,
    md: 20,
    lg: 22
  };
  
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Icon name={leftIcon} size={iconSize[size]} />
      </div>
    );
  };
  
  const renderRightIcon = () => {
    if (!rightIcon) return null;
    
    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Icon name={rightIcon} size={iconSize[size]} />
      </div>
    );
  };
  
  const renderLoadingIcon = () => {
    if (!loading) return null;
    
    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Icon name="refresh" size={iconSize[size]} className="animate-spin" />
      </div>
    );
  };
  
  const hasLeftIcon = leftIcon ? 'pl-10' : '';
  const hasRightIcon = (rightIcon || loading) ? 'pr-10' : '';
  
  const inputClasses = `${classes} ${hasLeftIcon} ${hasRightIcon}`;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          {...props}
        />
        
        {renderLeftIcon()}
        {renderRightIcon()}
        {renderLoadingIcon()}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <Icon name="error" size={16} className="mr-1" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <Icon name="success" size={16} className="mr-1" />
          {success}
        </p>
      )}
    </div>
  );
});

// TextArea Component
Input.TextArea = forwardRef(({
  label,
  error,
  success,
  disabled = false,
  rows = 4,
  fullWidth = false,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
  
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  let currentVariant = variant;
  if (error) currentVariant = 'error';
  if (success) currentVariant = 'success';
  
  const classes = [
    baseClasses,
    variants[currentVariant],
    sizes[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={classes}
        rows={rows}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <Icon name="error" size={16} className="mr-1" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <Icon name="success" size={16} className="mr-1" />
          {success}
        </p>
      )}
    </div>
  );
});

// Select Component
Input.Select = forwardRef(({
  label,
  error,
  success,
  disabled = false,
  options = [],
  placeholder = 'Выберите опцию',
  fullWidth = false,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white';
  
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  let currentVariant = variant;
  if (error) currentVariant = 'error';
  if (success) currentVariant = 'success';
  
  const classes = [
    baseClasses,
    variants[currentVariant],
    sizes[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={classes}
          disabled={disabled}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Icon name="chevronDown" size={20} className="text-gray-400" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <Icon name="error" size={16} className="mr-1" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <Icon name="success" size={16} className="mr-1" />
          {success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
Input.TextArea.displayName = 'Input.TextArea';
Input.Select.displayName = 'Input.Select';

export default Input;
