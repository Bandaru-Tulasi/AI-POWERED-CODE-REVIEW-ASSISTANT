import { api } from './api.js'

export const codeReviewService = {
  async analyzeCode(code, language, options = {}) {
    return api.post('/code-reviews/analyze', {  // ✅ Fixed endpoint
      code,
      language,
      ...options
    })
  },
  
  async saveReview(reviewData) {
    return api.post('/code-reviews', reviewData)  // ✅ Fixed endpoint
  },
  
  async getReview(reviewId) {
    return api.get(`/code-reviews/${reviewId}`)  // ✅ Fixed endpoint
  },
  
  async getReviews(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return api.get(`/code-reviews?${params}`)  // ✅ Fixed endpoint
  },
  
  async updateReview(reviewId, updates) {
    return api.put(`/code-reviews/${reviewId}`, updates)  // ✅ Fixed endpoint
  },
  
  async deleteReview(reviewId) {
    return api.delete(`/code-reviews/${reviewId}`)  // ✅ Fixed endpoint
  },
  
  async getReviewMetrics(reviewId) {
    return api.get(`/code-reviews/${reviewId}/metrics`)  // ✅ Fixed endpoint
  },
  
  async applySuggestion(reviewId, suggestionId, accept = true) {
    return api.post(`/code-reviews/${reviewId}/suggestions/${suggestionId}/apply`, { accept })  // ✅ Fixed endpoint
  },
  
  async resolveIssue(reviewId, issueId, resolved = true) {
    return api.post(`/code-reviews/${reviewId}/issues/${issueId}/resolve`, { resolved })  // ✅ Fixed endpoint
  },
  
  async generateMoreSuggestions(reviewId, context) {
    return api.post(`/code-reviews/${reviewId}/suggestions/generate`, { context })  // ✅ Fixed endpoint
  }
}