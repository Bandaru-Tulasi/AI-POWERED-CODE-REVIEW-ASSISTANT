import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

const FixModal = ({ issue, isOpen, onClose, onApply }) => {
  if (!isOpen || !issue) return null
  
  const handleApply = () => {
    if (onApply) {
      onApply(issue)
    }
  }
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Fix: {issue.title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                    {issue.severity?.toUpperCase()} PRIORITY
                  </span>
                  {issue.type && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {issue.type.toUpperCase()}
                    </span>
                  )}
                  {issue.line && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      LINE {issue.line}
                    </span>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {issue.description}
                    </p>
                  </div>
                  
                  {issue.fix?.explanation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Why This Fix Works</h4>
                      <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {issue.fix.explanation}
                      </p>
                    </div>
                  )}
                  
                  {issue.fix?.before && issue.fix?.after ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Code Changes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-red-600 mb-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0016 0zm-3.707-9.707a1 1 0 011.414 0L10 10.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Current Code
                          </div>
                          <pre className="text-xs bg-gray-900 text-red-300 p-4 rounded-lg overflow-x-auto border border-red-200">
                            <code>{issue.fix.before}</code>
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-green-600 mb-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Fixed Code
                          </div>
                          <pre className="text-xs bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto border border-green-200">
                            <code>{issue.fix.after}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : issue.suggestion && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Suggestion</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <code className="text-sm text-blue-600">{issue.suggestion}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {issue.fix?.after && (
              <button
                type="button"
                onClick={handleApply}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Apply Fix
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

FixModal.propTypes = {
  issue: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func,
}

export default FixModal