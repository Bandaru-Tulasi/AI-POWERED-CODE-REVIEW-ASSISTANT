import React from 'react'
import PropTypes from 'prop-types'

const Card = ({ children, className = '', hover = false, padding = 'medium', ...props }) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  }
  
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : ''
  
  return (
    <div
      className={`bg-white rounded-xl shadow-md ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
}

export default Card