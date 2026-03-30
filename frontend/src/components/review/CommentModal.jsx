import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

const CommentModal = ({ isOpen, onClose, onSave, comment, replyTo }) => {
  const [content, setContent] = useState('')
  const [commentType, setCommentType] = useState('general')
  const [severity, setSeverity] = useState('info')

  useEffect(() => {
    if (comment) {
      setContent(comment.content)
      setCommentType(comment.comment_type || 'general')
      setSeverity(comment.severity || 'info')
    } else if (replyTo) {
      setContent(`@${replyTo.author_name} `)
      setCommentType('general')
      setSeverity('info')
    } else {
      setContent('')
      setCommentType('general')
      setSeverity('info')
    }
  }, [comment, replyTo, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      // ✅ Pass parent_id (replyTo?.id) to the onSave function
      onSave(content.trim(), commentType, severity, replyTo?.id)
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {comment ? 'Edit Comment' : replyTo ? 'Reply to Comment' : 'Add Comment'}
                  </h3>
                  
                  {replyTo && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">{replyTo.author_name}</span>
                        <span>·</span>
                        <span>{new Date(replyTo.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{replyTo.content}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment Type
                      </label>
                      <select
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="general">💬 General</option>
                        <option value="bug">🐛 Bug Report</option>
                        <option value="suggestion">💡 Suggestion</option>
                        <option value="question">❓ Question</option>
                        <option value="security">🔒 Security</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="info">ℹ️ Info</option>
                        <option value="warning">⚠️ Warning</option>
                        <option value="error">❌ Error</option>
                        <option value="critical">🔥 Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Write your comment here..."
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={!content.trim()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {comment ? 'Update' : 'Post'} Comment
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

CommentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  comment: PropTypes.object,
  replyTo: PropTypes.object
}

export default CommentModal