import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'

const CommitHistory = ({ commits = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    }
  }
  
  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return ''
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }
  
  const getCommitType = (message) => {
    if (!message) return 'other'
    const msg = message.toLowerCase()
    if (msg.startsWith('fix') || msg.includes('bug') || msg.includes('issue')) return 'fix'
    if (msg.startsWith('feat') || msg.includes('add') || msg.includes('feature')) return 'feature'
    if (msg.startsWith('refactor') || msg.includes('clean')) return 'refactor'
    if (msg.startsWith('docs') || msg.includes('doc')) return 'docs'
    return 'other'
  }
  
  const getCommitColor = (type) => {
    switch(type) {
      case 'feature': return 'text-green-600'
      case 'fix': return 'text-red-600'
      case 'refactor': return 'text-blue-600'
      case 'docs': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }
  
  const getCommitDot = (type) => {
    switch(type) {
      case 'feature': return 'bg-green-500'
      case 'fix': return 'bg-red-500'
      case 'refactor': return 'bg-blue-500'
      case 'docs': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Commits</h3>
        <Badge variant="primary">{commits.length} commits</Badge>
      </div>
      
      {commits.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No commits found</div>
          <p className="text-sm text-gray-600">Commit history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {commits.map((commit) => {
            const commitType = getCommitType(commit.message)
            return (
              <div key={commit.sha || Math.random()} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getCommitDot(commitType)}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${getCommitColor(commitType)} truncate`} title={commit.message}>
                      {truncateMessage(commit.message, 60)}
                    </h4>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(commit.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {commit.sha}
                    </span>
                    <span className="truncate">{commit.author?.name || commit.author}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Commit Activity</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-gray-600">Features</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-xs text-gray-600">Fixes</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-xs text-gray-600">Refactors</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

CommitHistory.propTypes = {
  commits: PropTypes.array,
}

export default CommitHistory