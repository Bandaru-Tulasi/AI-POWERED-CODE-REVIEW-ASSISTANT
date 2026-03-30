import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'

const SuggestionPanel = ({ 
  suggestions = [], 
  onApplySuggestion,
  onGenerateMore 
}) => {
  const [filter, setFilter] = useState('all')
  
  const filteredSuggestions = filter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === filter)
  
  const suggestionTypes = [...new Set(suggestions.map(s => s.type))]
  
  const getTypeColor = (type) => {
    const colors = {
      performance: 'warning',
      readability: 'info',
      security: 'error',
      best_practice: 'success',
      refactoring: 'primary',
    }
    return colors[type] || 'default'
  }
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'performance':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        )
      case 'security':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'best_practice':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }
  
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
        <Button size="small" onClick={onGenerateMore}>
          Generate More
        </Button>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({suggestions.length})
          </button>
          {suggestionTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === type 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.replace('_', ' ')} ({suggestions.filter(s => s.type === type).length})
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No suggestions found</div>
            <p className="text-sm text-gray-500">Try generating suggestions or check back later</p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(suggestion.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <Badge variant={getTypeColor(suggestion.type)} size="small" className="mt-1">
                      {suggestion.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {suggestion.impact && (
                    <Badge variant={suggestion.impact === 'high' ? 'warning' : 'info'} size="small">
                      {suggestion.impact} impact
                    </Badge>
                  )}
                  <Button 
                    size="small" 
                    variant="primary"
                    onClick={() => onApplySuggestion && onApplySuggestion(suggestion)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
              
              {suggestion.before && suggestion.after && (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current:</div>
                    <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                      {suggestion.before}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Suggested:</div>
                    <pre className="text-xs bg-green-900 text-green-100 p-3 rounded overflow-x-auto">
                      {suggestion.after}
                    </pre>
                  </div>
                </div>
              )}
              
              {suggestion.reasoning && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded">
                  <div className="text-xs font-medium text-blue-800 mb-1">Why this helps:</div>
                  <p className="text-sm text-blue-700">{suggestion.reasoning}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

SuggestionPanel.propTypes = {
  suggestions: PropTypes.array,
  onApplySuggestion: PropTypes.func,
  onGenerateMore: PropTypes.func,
}

export default SuggestionPanel