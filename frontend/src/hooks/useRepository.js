import { useState, useCallback } from 'react'
import { useApi } from './useApi.js'

export const useRepository = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = useApi()
  
  const connectRepository = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/repositories/connect', {
        url,
        ...options,
      })
      
      return response
    } catch (err) {
      setError(err.message || 'Failed to connect repository')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const getRepositories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Add trailing slash to match backend
      const response = await api.get('/repositories/')
      console.log('Raw repositories response:', response)
      
      // Handle different response formats
      let repos = []
      
      if (Array.isArray(response)) {
        repos = response
      } else if (response?.data && Array.isArray(response.data)) {
        repos = response.data
      } else if (response?.repositories && Array.isArray(response.repositories)) {
        repos = response.repositories
      } else if (response && typeof response === 'object') {
        // If it's an object with numeric keys (like {0: {...}, 1: {...}})
        const possibleArray = Object.values(response)
        if (possibleArray.length > 0 && possibleArray.every(item => typeof item === 'object')) {
          repos = possibleArray
        } else {
          repos = [response]
        }
      }
      
      console.log('Processed repositories:', repos)
      return repos
    } catch (err) {
      console.error('Error fetching repositories:', err)
      setError(err.message || 'Failed to fetch repositories')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const getRepository = useCallback(async (repositoryId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/repositories/${repositoryId}`)
      return response
    } catch (err) {
      setError(err.message || 'Failed to fetch repository')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const disconnectRepository = useCallback(async (repositoryId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.delete(`/repositories/${repositoryId}`)
      return response
    } catch (err) {
      setError(err.message || 'Failed to disconnect repository')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const getPullRequests = useCallback(async (repositoryId, filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/repositories/${repositoryId}/pull-requests`, { 
        params: filters 
      })
      return response
    } catch (err) {
      setError(err.message || 'Failed to fetch pull requests')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  const reviewPullRequest = useCallback(async (repositoryId, prId, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post(`/repositories/${repositoryId}/pull-requests/${prId}/review`, options)
      return response
    } catch (err) {
      setError(err.message || 'Failed to review pull request')
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])
  
  return {
    loading,
    error,
    connectRepository,
    getRepositories,
    getRepository,
    disconnectRepository,
    getPullRequests,
    reviewPullRequest,
  }
}