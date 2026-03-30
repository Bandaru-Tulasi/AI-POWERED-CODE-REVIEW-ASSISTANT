import { api } from './api.js'

export const aiFeedbackService = {
  async createFeedback(feedbackData) {
    return api.post('/ai-feedback', feedbackData)
  },

  async getReviewFeedbacks(reviewId) {
    return api.get(`/ai-feedback/review/${reviewId}`)
  },

  async updateFeedback(feedbackId, updates) {
    return api.put(`/ai-feedback/${feedbackId}`, updates)
  },

  async getFeedbackStats() {
    return api.get('/ai-feedback/stats')
  },

  async recordUserFeedback(reviewId, analysisType, userFeedback, userComment = null) {
    return api.post('/ai-feedback/record', {
      review_id: reviewId,
      analysis_type: analysisType,
      user_feedback: userFeedback,
      user_comment: userComment
    })
  }
}