import { useState, useCallback } from 'react'
import { useApi } from './useApi.js'  // ✅ Fix: import from hooks, not services

export const useCodeReview = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = useApi()
  
  const analyzeCode = useCallback(async (code, language, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/code-reviews/analyze', {  // ✅ Fix: correct endpoint
        code,
        language,
        analysis_type: options.analysis_type || 'comprehensive',
        ...options,
      })
      
      return response
    } catch (err) {
      setError(err.message || 'Failed to analyze code')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const saveReview = useCallback(async (reviewData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/code-reviews', reviewData)  // ✅ Fix: correct endpoint
      return response
    } catch (err) {
      setError(err.message || 'Failed to save review')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const getReview = useCallback(async (reviewId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/code-reviews/${reviewId}`)  // ✅ Fix: correct endpoint
      return response
    } catch (err) {
      setError(err.message || 'Failed to fetch review')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const getReviews = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams(filters).toString()
      const response = await api.get(`/code-reviews?${params}`)  // ✅ Fix: correct endpoint
      return response
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  return {
    loading,
    error,
    analyzeCode,
    saveReview,
    getReview,
    getReviews,
  }
}