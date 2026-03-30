import { useState, useCallback } from 'react'
import { reviewCommentsService } from '../services/reviewComments.js'

export const useReviewComments = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createComment = useCallback(async (commentData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.createComment(commentData)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReviewComments = useCallback(async (reviewId, filePath, lineNumber, includeResolved) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.getReviewComments(
        reviewId, filePath, lineNumber, includeResolved
      )
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateComment = useCallback(async (commentId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.updateComment(commentId, updates)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteComment = useCallback(async (commentId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.deleteComment(commentId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resolveComment = useCallback(async (commentId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.resolveComment(commentId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getCommentsByLine = useCallback(async (reviewId, filePath, lineNumber) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.getCommentsByLine(reviewId, filePath, lineNumber)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getCommentStatistics = useCallback(async (reviewId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewCommentsService.getCommentStatistics(reviewId)
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
    createComment,
    getReviewComments,
    updateComment,
    deleteComment,
    resolveComment,
    getCommentsByLine,
    getCommentStatistics
  }
}