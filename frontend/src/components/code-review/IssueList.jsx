import React, { useState } from 'react'
import PropTypes from 'prop-types'
import FixModal from './FixModal.jsx'

const IssueList = ({ issues = [], onSelectIssue, selectedIssueId, onApplyFix }) => {
  const [selectedFix, setSelectedFix] = useState(null)
  
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        )
      case 'high':
        return (
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
        )
      case 'medium':
        return (
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        )
      case 'low':
        return (
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        )
      default:
        return (
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        )
    }
  }
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-700'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'security':
        return '🛡️'
      case 'performance':
        return '⚡'
      case 'quality':
        return '✨'
      case 'bug':
        return '🐛'
      case 'suggestion':
        return '💡'
      default:
        return '📝'
    }
  }
  
  const handleViewFix = (issue) => {
    setSelectedFix(issue)
  }
  
  const handleApplyFix = (issue) => {
    if (onApplyFix) {
      onApplyFix(issue)
    }
    setSelectedFix(null)
  }
  
  const groupedByType = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = []
    acc[issue.type].push(issue)
    return acc
  }, {})
  
  const totalIssues = issues.length
  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length
  
  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detected Issues</h3>
              <p className="text-sm text-gray-600 mt-1">{totalIssues} issues found</p>
            </div>
            {(criticalCount > 0 || highCount > 0) && (
              <div className="flex items-center space-x-2">
                {criticalCount > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    {criticalCount} critical
                  </div>
                )}
                {highCount > 0 && (
                  <div className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    {highCount} high
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {Object.keys(groupedByType).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No issues found!</h4>
              <p className="text-gray-600">Your code looks clean and well-written.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByType).map(([type, typeIssues]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(type)}</span>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <span className="text-sm text-gray-500">({typeIssues.length})</span>
                  </div>
                  
                  <div className="space-y-2">
                    {typeIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedIssueId === issue.id 
                            ? 'border-primary-300 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => onSelectIssue && onSelectIssue(issue)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            {getSeverityIcon(issue.severity)}
                            <div>
                              <h5 className="font-medium text-gray-900">{issue.title}</h5>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {issue.description}
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-gray-500">
                            {issue.line && (
                              <span className="flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                Line {issue.line}
                              </span>
                            )}
                            {issue.file && (
                              <span className="flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                {issue.file}
                              </span>
                            )}
                          </div>
                          
                          {issue.fix && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewFix(issue)
                              }}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                            >
                              View Fix
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <FixModal
        issue={selectedFix}
        isOpen={!!selectedFix}
        onClose={() => setSelectedFix(null)}
        onApply={handleApplyFix}
      />
    </>
  )
}

IssueList.propTypes = {
  issues: PropTypes.array,
  onSelectIssue: PropTypes.func,
  selectedIssueId: PropTypes.string,
  onApplyFix: PropTypes.func,
}

export default IssueList