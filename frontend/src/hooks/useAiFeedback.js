import { useState, useCallback } from 'react'
import { aiFeedbackService } from '../services/aiFeedback.js'

export const useAiFeedback = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createFeedback = useCallback(async (feedbackData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await aiFeedbackService.createFeedback(feedbackData)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReviewFeedbacks = useCallback(async (reviewId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await aiFeedbackService.getReviewFeedbacks(reviewId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateFeedback = useCallback(async (feedbackId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const response = await aiFeedbackService.updateFeedback(feedbackId, updates)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getFeedbackStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await aiFeedbackService.getFeedbackStats()
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const recordUserFeedback = useCallback(async (reviewId, analysisType, userFeedback, userComment) => {
    setLoading(true)
    setError(null)
    try {
      const response = await aiFeedbackService.recordUserFeedback(
        reviewId, analysisType, userFeedback, userComment
      )
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createFeedback,
    getReviewFeedbacks,
    updateFeedback,
    getFeedbackStats,
    recordUserFeedback
  }
}