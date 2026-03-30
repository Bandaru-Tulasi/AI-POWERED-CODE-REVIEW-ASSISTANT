import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

const RepositoryCard = ({ 
  repository, 
  onSelect, 
  onReview,
  onSettings 
}) => {
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'github':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )
      case 'gitlab':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
          </svg>
        )
      case 'bitbucket':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873h14.474c.375.005.734-.148.977-.423a1.2 1.2 0 00.32-.979L23.447 2.103a.773.773 0 00-.769-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
    }
  }
  
  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      cpp: 'bg-purple-100 text-purple-800',
      go: 'bg-cyan-100 text-cyan-800',
      ruby: 'bg-pink-100 text-pink-800',
      php: 'bg-indigo-100 text-indigo-800',
    }
    return colors[language] || 'bg-gray-100 text-gray-800'
  }
  
  return (
    <Card hover className="cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              {getProviderIcon(repository.provider)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{repository.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge size="small" className={getLanguageColor(repository.language)}>
                {repository.language}
              </Badge>
              <span className="text-xs text-gray-500">{repository.branch}</span>
            </div>
          </div>
        </div>
        <Badge variant={repository.connected ? 'success' : 'warning'}>
          {repository.connected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{repository.pullRequests}</div>
          <div className="text-xs text-gray-600">Pull Requests</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{repository.reviews}</div>
          <div className="text-xs text-gray-600">Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{repository.issues}</div>
          <div className="text-xs text-gray-600">Issues</div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="primary" 
          size="small" 
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onReview && onReview(repository)
          }}
        >
          Review Code
        </Button>
        <Button 
          variant="outline" 
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onSettings && onSettings(repository)
          }}
        >
          Settings
        </Button>
      </div>
    </Card>
  )
}

RepositoryCard.propTypes = {
  repository: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    provider: PropTypes.string,
    language: PropTypes.string,
    branch: PropTypes.string,
    connected: PropTypes.bool,
    pullRequests: PropTypes.number,
    reviews: PropTypes.number,
    issues: PropTypes.number,
  }).isRequired,
  onSelect: PropTypes.func,
  onReview: PropTypes.func,
  onSettings: PropTypes.func,
}

export default RepositoryCard