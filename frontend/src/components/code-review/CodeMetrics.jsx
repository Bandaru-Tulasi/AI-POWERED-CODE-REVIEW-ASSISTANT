import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'

const CodeMetrics = ({ metrics = {} }) => {
  const defaultMetrics = {
    complexity: 0,
    maintainability: 0,
    testCoverage: 0,
    duplication: 0,
    securityScore: 0,
    codeSmells: 0,
    technicalDebt: 0,
    linesOfCode: 0,
    ...metrics,
  }
  
  const getScoreColor = (score, reverse = false) => {
    if (reverse) {
      if (score >= 80) return 'text-red-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-green-600'
    }
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getScoreBarColor = (score, reverse = false) => {
    if (reverse) {
      if (score >= 80) return 'bg-red-500'
      if (score >= 60) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getScoreText = (score, reverse = false) => {
    if (reverse) {
      if (score >= 80) return 'High Risk'
      if (score >= 60) return 'Medium Risk'
      return 'Low Risk'
    }
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Improvement'
  }
  
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Code Metrics</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Security Score</span>
            <span className={`font-bold ${getScoreColor(defaultMetrics.securityScore)}`}>
              {defaultMetrics.securityScore}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getScoreBarColor(defaultMetrics.securityScore)} transition-all duration-500`}
              style={{ width: `${defaultMetrics.securityScore}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {getScoreText(defaultMetrics.securityScore)}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Maintainability Index</span>
            <span className={`font-bold ${getScoreColor(defaultMetrics.maintainability)}`}>
              {defaultMetrics.maintainability}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getScoreBarColor(defaultMetrics.maintainability)} transition-all duration-500`}
              style={{ width: `${defaultMetrics.maintainability}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {getScoreText(defaultMetrics.maintainability)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{defaultMetrics.complexity}</div>
            <div className="text-sm text-gray-600">Cyclomatic Complexity</div>
            <div className={`text-xs mt-1 ${getScoreColor(defaultMetrics.complexity, true)}`}>
              {defaultMetrics.complexity <= 10 ? 'Low' : defaultMetrics.complexity <= 20 ? 'Medium' : 'High'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{defaultMetrics.duplication}%</div>
            <div className="text-sm text-gray-600">Code Duplication</div>
            <div className={`text-xs mt-1 ${getScoreColor(defaultMetrics.duplication, true)}`}>
              {defaultMetrics.duplication <= 5 ? 'Low' : defaultMetrics.duplication <= 10 ? 'Medium' : 'High'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{defaultMetrics.testCoverage}%</div>
            <div className="text-sm text-gray-600">Test Coverage</div>
            <div className={`text-xs mt-1 ${getScoreColor(defaultMetrics.testCoverage)}`}>
              {defaultMetrics.testCoverage >= 80 ? 'Good' : defaultMetrics.testCoverage >= 60 ? 'Fair' : 'Poor'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{defaultMetrics.codeSmells}</div>
            <div className="text-sm text-gray-600">Code Smells</div>
            <div className={`text-xs mt-1 ${getScoreColor(defaultMetrics.codeSmells, true)}`}>
              {defaultMetrics.codeSmells <= 5 ? 'Few' : defaultMetrics.codeSmells <= 15 ? 'Some' : 'Many'}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Additional Metrics</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{defaultMetrics.linesOfCode}</div>
              <div className="text-xs text-gray-600">Lines of Code</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{defaultMetrics.functions || 0}</div>
              <div className="text-xs text-gray-600">Functions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{defaultMetrics.classes || 0}</div>
              <div className="text-xs text-gray-600">Classes</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

CodeMetrics.propTypes = {
  metrics: PropTypes.object,
}

export default CodeMetrics