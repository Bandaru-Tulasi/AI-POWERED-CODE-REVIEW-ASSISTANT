import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

const RecentReviews = ({ reviews = [], onViewReview, onCreateReview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'primary'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }
  
  const getLanguageIcon = (language) => {
    const icons = {
      javascript: 'JS',
      typescript: 'TS',
      python: 'PY',
      java: 'JV',
      cpp: 'C++',
      go: 'GO',
      ruby: 'RB',
      php: 'PHP',
    }
    return icons[language] || language?.slice(0, 2).toUpperCase() || '??'
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }
  
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
        <Button size="small" onClick={onCreateReview}>
          New Review
        </Button>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No recent reviews</div>
          <p className="text-sm text-gray-600">Start your first code review to see them here</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={onCreateReview}
          >
            Start Review
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => onViewReview && onViewReview(review.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-mono font-bold text-gray-700">
                      {getLanguageIcon(review.language)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{review.repository}</h4>
                    <p className="text-sm text-gray-600">{review.file}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(review.status)}>
                  {review.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(review.createdAt)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    {review.issues} issues
                  </div>
                </div>
                
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

RecentReviews.propTypes = {
  reviews: PropTypes.array,
  onViewReview: PropTypes.func,
  onCreateReview: PropTypes.func,
}

export default RecentReviews