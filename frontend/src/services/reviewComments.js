import { api } from './api.js'

export const reviewCommentsService = {
  async createComment(commentData) {
    return api.post('/review-comments', commentData)
  },

  async getReviewComments(reviewId, filePath = null, lineNumber = null, includeResolved = false) {
    let url = `/review-comments/review/${reviewId}`
    const params = new URLSearchParams()
    if (filePath) params.append('file_path', filePath)
    if (lineNumber) params.append('line_number', lineNumber)
    if (includeResolved) params.append('include_resolved', 'true')
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    return api.get(url)
  },

  async updateComment(commentId, updates) {
    return api.put(`/review-comments/${commentId}`, updates)
  },

  async deleteComment(commentId) {
    return api.delete(`/review-comments/${commentId}`)
  },

  async resolveComment(commentId) {
    return api.post(`/review-comments/${commentId}/resolve`)
  },

  async getCommentsByLine(reviewId, filePath, lineNumber) {
    return api.get(`/review-comments/review/${reviewId}/line?file_path=${encodeURIComponent(filePath)}&line_number=${lineNumber}`)
  },

  async getCommentStatistics(reviewId) {
    return api.get(`/review-comments/review/${reviewId}/statistics`)
  }
}