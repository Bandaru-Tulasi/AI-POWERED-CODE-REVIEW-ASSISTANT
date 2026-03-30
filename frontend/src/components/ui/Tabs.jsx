import React, { useState } from 'react'
import PropTypes from 'prop-types'

const Tabs = ({ tabs, defaultTab = 0, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const handleTabClick = (index) => {
    setActiveTab(index)
    if (onChange) onChange(index)
  }
  
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === index 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap
              `}
            >
              {tab.label}
              {tab.badge && (
                <span className={`
                  ml-2 py-0.5 px-2 text-xs rounded-full
                  ${activeTab === index 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  defaultTab: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
}

export default Tabs