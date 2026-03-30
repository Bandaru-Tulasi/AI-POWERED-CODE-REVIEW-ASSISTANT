const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    const token = localStorage.getItem('access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const config = {
      ...options,
      headers,
    }
    
    try {
      console.log(`Making ${options.method || 'GET'} request to: ${url}`)
      
      const response = await fetch(url, config)
      
      if (response.status === 401) {
        console.log('Session expired, redirecting to login')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Session expired')
      }
      
      // ✅ Handle 204 No Content responses (successful DELETE)
      if (response.status === 204) {
        console.log('✅ Request successful with 204 No Content')
        return { success: true, status: 204 }
      }
      
      // Check if response has content before parsing JSON
      const contentLength = response.headers.get('content-length')
      const contentType = response.headers.get('content-type')
      
      // If no content or empty response, return success
      if (response.status === 200 && (!contentLength || contentLength === '0')) {
        return { success: true, status: 200 }
      }
      
      // Try to parse response as JSON only if there's content
      let data
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text()
          data = text ? JSON.parse(text) : {}
        } catch (e) {
          console.warn('Response was not valid JSON:', e)
          data = {}
        }
      } else {
        data = await response.text()
      }
      
      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || `Request failed: ${response.status}`
        console.error('API error:', errorMessage)
        throw new Error(errorMessage)
      }
      
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  },
  
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  },
  
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  },
  
  upload(endpoint, formData, options = {}) {
    const headers = {
      ...options.headers,
    }
    delete headers['Content-Type']
    
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    })
  }
}