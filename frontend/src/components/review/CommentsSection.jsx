import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useReviewComments } from '../../hooks/useReviewComments.js'
import { useAuth } from '../../hooks/useAuth.js'
import CommentModal from './CommentModal.jsx'

const CommentsSection = ({ reviewId, filePath, lineNumber }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedComment, setSelectedComment] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [showResolved, setShowResolved] = useState(false)
  
  const { user } = useAuth()
  const { getReviewComments, createComment, updateComment, deleteComment, resolveComment } = useReviewComments()

  useEffect(() => {
    if (reviewId && reviewId !== 'pending') {
      loadComments()
    }
  }, [reviewId, filePath, lineNumber, showResolved])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await getReviewComments(reviewId, filePath, lineNumber, showResolved)
      setComments(data || [])
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = () => {
    setSelectedComment(null)
    setReplyTo(null)
    setShowCommentModal(true)
  }

  const handleReply = (comment) => {
    setSelectedComment(null)
    setReplyTo(comment)
    setShowCommentModal(true)
  }

  const handleEditComment = (comment) => {
    setSelectedComment(comment)
    setReplyTo(null)
    setShowCommentModal(true)
  }

  // ✅ Updated to accept parentId parameter
  const handleSaveComment = async (content, commentType, severity, parentId) => {
    try {
      if (selectedComment) {
        // Update existing comment
        await updateComment(selectedComment.id, { content })
      } else {
        // Create new comment (with optional parent_id for replies)
        const commentData = {
          review_id: reviewId,
          content,
          file_path: filePath,
          line_number: lineNumber,
          comment_type: commentType,
          severity,
        }
        
        // ✅ Add parent_id only if it exists (for replies)
        if (parentId) {
          commentData.parent_id = parentId
        }
        
        await createComment(commentData)
      }
      await loadComments()
      setShowCommentModal(false)
    } catch (error) {
      console.error('Failed to save comment:', error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId)
        await loadComments()
      } catch (error) {
        console.error('Failed to delete comment:', error)
      }
    }
  }

  const handleResolveComment = async (commentId) => {
    try {
      await resolveComment(commentId)
      await loadComments()
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return '🐛'
      case 'suggestion': return '💡'
      case 'question': return '❓'
      case 'security': return '🔒'
      default: return '💬'
    }
  }

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mt-4'} border rounded-lg p-4 ${comment.resolved ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-xl">{getTypeIcon(comment.comment_type)}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.author_name}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
              {comment.line_number && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Line {comment.line_number}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(comment.severity)}`}>
                {comment.severity}
              </span>
              {comment.resolved && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ Resolved
                </span>
              )}
            </div>
            <p className="text-gray-700 mt-2">{comment.content}</p>
            {comment.context && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                <code>{comment.context}</code>
              </pre>
            )}
          </div>
        </div>
        
        {comment.author_id === user?.id && (
          <div className="flex space-x-2">
            {!comment.resolved && (
              <>
                <button
                  onClick={() => handleEditComment(comment)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            {!comment.resolved && (
              <button
                onClick={() => handleResolveComment(comment.id)}
                className="text-gray-400 hover:text-green-600"
                title="Resolve"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      {!isReply && !comment.resolved && (
        <div className="mt-3">
          <button
            onClick={() => handleReply(comment)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Reply
          </button>
        </div>
      )}
      
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  )

  // Don't render if reviewId is pending or invalid
  if (!reviewId || reviewId === 'pending') {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-600">Save the review first to enable comments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          {filePath && (
            <p className="text-sm text-gray-600 mt-1">
              File: {filePath} {lineNumber && `• Line ${lineNumber}`}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Show resolved</span>
          </label>
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            Add Comment
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-600">No comments yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to add a comment</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onSave={handleSaveComment}
        comment={selectedComment}
        replyTo={replyTo}
      />
    </div>
  )
}

CommentsSection.propTypes = {
  reviewId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  filePath: PropTypes.string,
  lineNumber: PropTypes.number
}

export default CommentsSection