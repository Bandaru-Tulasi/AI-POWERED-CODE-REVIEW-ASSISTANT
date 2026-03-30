import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Textarea = forwardRef(({ 
  label, 
  error, 
  helperText, 
  rows = 4,
  fullWidth = true,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm
          focus:border-primary-500 focus:ring-primary-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          resize-y
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
          text-sm
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
}

Textarea.displayName = 'Textarea'

export default Textarea