import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Spinner from '../ui/Spinner.jsx'

const ReviewPanel = ({ 
  issues = [], 
  suggestions = [], 
  metrics = {},
  onResolveIssue,
  onApplySuggestion,
  loading = false,
  onGenerateReview 
}) => {
  const [activeTab, setActiveTab] = useState('issues')
  
  const severityColors = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'info',
    info: 'default',
  }
  
  const typeColors = {
    security: 'error',
    performance: 'warning',
    quality: 'info',
    style: 'default',
    bug: 'error',
    suggestion: 'primary',
  }
  
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Review</h3>
        <div className="flex items-center space-x-2">
          {loading && <Spinner size="small" />}
          <Button 
            size="small" 
            onClick={onGenerateReview}
            disabled={loading}
          >
            Generate Review
          </Button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issues' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Issues
            {issues.length > 0 && (
              <Badge variant="error" size="small" className="ml-2">
                {issues.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suggestions' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suggestions
            {suggestions.length > 0 && (
              <Badge variant="primary" size="small" className="ml-2">
                {suggestions.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Metrics
          </button>
        </nav>
      </div>
      
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {activeTab === 'issues' && (
          <>
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No issues found</div>
                <p className="text-sm text-gray-500">The code looks clean!</p>
              </div>
            ) : (
              issues.map((issue, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={severityColors[issue.severity]}>
                        {issue.severity}
                      </Badge>
                      <Badge variant={typeColors[issue.type]}>
                        {issue.type}
                      </Badge>
                      {issue.line && (
                        <span className="text-sm text-gray-600">Line {issue.line}</span>
                      )}
                    </div>
                    <Button 
                      size="small" 
                      variant="outline"
                      onClick={() => onResolveIssue && onResolveIssue(issue.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{issue.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                  {issue.suggestion && (
                    <div className="bg-blue-50 border border-blue-100 rounded p-3">
                      <div className="flex items-center text-blue-800 font-medium text-sm mb-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Suggestion
                      </div>
                      <code className="text-sm text-blue-700">{issue.suggestion}</code>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
        
        {activeTab === 'suggestions' && (
          <>
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No suggestions available</div>
                <p className="text-sm text-gray-500">Run a review to get suggestions</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="primary">Improvement</Badge>
                      {suggestion.line && (
                        <span className="text-sm text-gray-600">Line {suggestion.line}</span>
                      )}
                    </div>
                    <Button 
                      size="small" 
                      variant="primary"
                      onClick={() => onApplySuggestion && onApplySuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-blue-700 mb-3">{suggestion.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Current code:</div>
                    <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                      {suggestion.currentCode}
                    </pre>
                    <div className="text-xs text-gray-500">Suggested code:</div>
                    <pre className="text-xs bg-green-900 text-green-100 p-3 rounded overflow-x-auto">
                      {suggestion.suggestedCode}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </>
        )}
        
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Code Quality</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{metrics.complexity || 0}</div>
                  <div className="text-sm text-gray-600">Complexity</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{metrics.duplication || '0%'}</div>
                  <div className="text-sm text-gray-600">Duplication</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{metrics.maintainability || 0}</div>
                  <div className="text-sm text-gray-600">Maintainability</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{metrics.testCoverage || '0%'}</div>
                  <div className="text-sm text-gray-600">Test Coverage</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Security Score</h4>
              <div className="bg-gray-100 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.securityScore || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0%</span>
                <span>{metrics.securityScore || 0}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

ReviewPanel.propTypes = {
  issues: PropTypes.array,
  suggestions: PropTypes.array,
  metrics: PropTypes.object,
  onResolveIssue: PropTypes.func,
  onApplySuggestion: PropTypes.func,
  loading: PropTypes.bool,
  onGenerateReview: PropTypes.func,
}

export default ReviewPanel