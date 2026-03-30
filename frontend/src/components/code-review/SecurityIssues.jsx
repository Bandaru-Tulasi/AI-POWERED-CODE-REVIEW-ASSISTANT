import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import FixModal from './FixModal.jsx'

const SecurityIssues = ({ issues = [], onViewDetails, onApplyFix }) => {
  const [selectedFix, setSelectedFix] = useState(null)
  
  const severityLevels = {
    critical: { color: 'error', icon: '🔴' },
    high: { color: 'error', icon: '🟠' },
    medium: { color: 'warning', icon: '🟡' },
    low: { color: 'info', icon: '🔵' },
    info: { color: 'default', icon: '⚪' },
  }
  
  const vulnerabilityTypes = {
    injection: 'SQL Injection',
    xss: 'Cross-Site Scripting',
    csrf: 'CSRF',
    auth: 'Authentication',
    crypto: 'Cryptography',
    config: 'Configuration',
    data: 'Data Exposure',
    access: 'Access Control',
  }
  
  const getCVSSScoreColor = (score) => {
    if (score >= 9.0) return 'bg-red-100 text-red-800'
    if (score >= 7.0) return 'bg-orange-100 text-orange-800'
    if (score >= 4.0) return 'bg-yellow-100 text-yellow-800'
    if (score >= 0.1) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }
  
  const getCVSSLevel = (score) => {
    if (score >= 9.0) return 'Critical'
    if (score >= 7.0) return 'High'
    if (score >= 4.0) return 'Medium'
    if (score >= 0.1) return 'Low'
    return 'None'
  }
  
  const handleViewFix = (issue) => {
    setSelectedFix(issue)
    if (onViewDetails) {
      onViewDetails(issue)
    }
  }
  
  const handleApplyFix = (issue) => {
    if (onApplyFix) {
      onApplyFix(issue)
    }
    setSelectedFix(null)
  }
  
  const groupedIssues = issues.reduce((acc, issue) => {
    const type = issue.type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(issue)
    return acc
  }, {})
  
  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security Vulnerabilities</h3>
            <p className="text-sm text-gray-600">{issues.length} vulnerabilities found</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="error">Critical: {issues.filter(i => i.severity === 'critical').length}</Badge>
            <Badge variant="warning">High: {issues.filter(i => i.severity === 'high').length}</Badge>
          </div>
        </div>
        
        {Object.keys(groupedIssues).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">✅</div>
            <div className="text-gray-900 font-medium mb-1">No security issues found</div>
            <p className="text-sm text-gray-600">Your code appears to be secure</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedIssues).map(([type, typeIssues]) => (
              <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {vulnerabilityTypes[type] || type}
                      </span>
                      <Badge variant="error" className="ml-2">
                        {typeIssues.length}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600">
                      {typeIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length} critical/high
                    </span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {typeIssues.map((issue, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-lg">{severityLevels[issue.severity]?.icon || '⚪'}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{issue.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          </div>
                        </div>
                        {issue.cvssScore && (
                          <div className={`px-2 py-1 rounded text-xs font-bold ${getCVSSScoreColor(issue.cvssScore)}`}>
                            CVSS: {issue.cvssScore} ({getCVSSLevel(issue.cvssScore)})
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            Line {issue.line || 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {issue.file || 'Unknown file'}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleViewFix(issue)}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                        >
                          View Details
                          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {issue.remediation && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded">
                          <div className="text-xs font-medium text-green-800 mb-1">Remediation:</div>
                          <p className="text-sm text-green-700">{issue.remediation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Security Best Practices</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Always validate and sanitize user input</li>
                <li>• Use parameterized queries to prevent SQL injection</li>
                <li>• Implement proper authentication and authorization</li>
                <li>• Keep dependencies updated to avoid known vulnerabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      <FixModal
        issue={selectedFix}
        isOpen={!!selectedFix}
        onClose={() => setSelectedFix(null)}
        onApply={handleApplyFix}
      />
    </>
  )
}

SecurityIssues.propTypes = {
  issues: PropTypes.array,
  onViewDetails: PropTypes.func,
  onApplyFix: PropTypes.func,
}

export default SecurityIssues