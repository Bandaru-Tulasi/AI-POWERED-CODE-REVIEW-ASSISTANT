import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

const Select = forwardRef(({ 
  label, 
  error, 
  helperText, 
  options = [],
  placeholder = 'Select an option',
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
      <select
        ref={ref}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm
          focus:border-primary-500 focus:ring-primary-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
          text-sm
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
}

Select.displayName = 'Select'

export default Select