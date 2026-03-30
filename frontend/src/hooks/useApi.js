import { useCallback } from 'react'
import { useAuth } from './useAuth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/login',
  '/register',
  '/oauth/token',
  '/code-reviews/analyze',
  '/health'
  // '/' removed to avoid matching all endpoints
]

export const useApi = () => {
  const { logout } = useAuth()
  
  const request = useCallback(async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }
    
    // Determine if this endpoint is public
    // Special case for root endpoint (/) which is public
    const isPublic = endpoint === '/' || PUBLIC_ENDPOINTS.some(pe => endpoint.startsWith(pe))
    
    // Only add token for non-public endpoints
    if (!isPublic) {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        console.warn('No token found for protected endpoint, request may fail')
      }
    }
    
    const config = {
      ...options,
      headers,
      mode: 'cors',
    }
    
    try {
      console.log(`Making ${options.method || 'GET'} request to: ${url} (public: ${isPublic})`)
      
      const response = await fetch(url, config)
      
      // For non-public endpoints, if we get a 401, the token is invalid/expired
      if (response.status === 401 && !isPublic) {
        console.log('Session expired on protected endpoint, logging out')
        logout()
        throw new Error('Session expired')
      }
      
      // For public endpoints, we don't logout on 401, but we still might have an error
      if (response.status === 401 && isPublic) {
        console.log('Received 401 on public endpoint, ignoring')
      }
      
      // Try to parse response as JSON
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
      
      if (!response.ok) {
        console.error('API error:', data)
        
        // Handle validation errors (422)
        if (response.status === 422) {
          const errorMessage = Array.isArray(data) 
            ? data.map(err => err.msg || err.message).join(', ')
            : (data.detail || data.message || 'Validation error')
          throw new Error(errorMessage)
        }
        
        const errorMessage = data?.detail || data?.message || `Request failed: ${response.status}`
        throw new Error(errorMessage)
      }
      
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }, [logout])
  
  const get = useCallback((endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'GET' })
  }, [request])
  
  const post = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }, [request])
  
  const put = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }, [request])
  
  const del = useCallback((endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'DELETE' })
  }, [request])
  
  const upload = useCallback((endpoint, formData, options = {}) => {
    const headers = {
      ...options.headers,
    }
    delete headers['Content-Type']
    
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    })
  }, [request])
  
  return {
    get,
    post,
    put,
    delete: del,
    upload,
    API_BASE_URL,
  }
}