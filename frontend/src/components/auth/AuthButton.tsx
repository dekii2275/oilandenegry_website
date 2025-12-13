'use client'

import React from 'react'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  fullWidth?: boolean
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  isLoading = false,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`
        ${fullWidth ? 'w-full' : ''}
        bg-green-400 hover:bg-green-500 active:bg-green-600
        border-2 border-green-500
        text-white font-semibold text-sm
        px-6 py-2.5 rounded-lg
        transition-all duration-200
        ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  )
}

export default AuthButton

