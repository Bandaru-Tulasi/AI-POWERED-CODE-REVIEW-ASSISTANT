import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

const PullRequestList = ({ pullRequests = [], onReviewPR }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'success'
      case 'closed':
        return 'default'
      case 'merged':
        return 'primary'
      case 'draft':
        return 'warning'
      default:
        return 'default'
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'closed':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'merged':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
          </svg>
        )
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pull Requests</h3>
        <Badge variant="primary">{pullRequests.length} total</Badge>
      </div>
      
      {pullRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No pull requests found</div>
          <p className="text-sm text-gray-600">Create a pull request to start reviewing</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pullRequests.map((pr) => (
            <div 
              key={pr.id || pr.number || Math.random()} 
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(pr.state)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{pr.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">#{pr.number} by {pr.user || pr.author}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(pr.state)}>
                    {pr.state}
                  </Badge>
                  <Button 
                    size="small" 
                    variant="outline"
                    onClick={() => onReviewPR && onReviewPR(pr)}
                    disabled={pr.state !== 'open'}
                  >
                    Review
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(pr.created_at)}
                  </div>
                  {pr.comments !== undefined && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                      {pr.comments} comments
                    </div>
                  )}
                  {pr.changedFiles !== undefined && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      {pr.changedFiles} files
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

PullRequestList.propTypes = {
  pullRequests: PropTypes.array,
  onReviewPR: PropTypes.func,
}

export default PullRequestList