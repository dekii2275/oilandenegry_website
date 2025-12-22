import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full px-3 py-2.5 rounded-lg border text-sm
            bg-white
            focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400
            transition-colors
            ${hasError ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

