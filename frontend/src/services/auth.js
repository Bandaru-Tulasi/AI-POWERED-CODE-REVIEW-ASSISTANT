// Auth service using real API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const authService = {
  async login(email, password) {
    console.log('Attempting login with:', { email })
    
    const response = await fetch(`${API_BASE_URL}/login`, {  // Changed from /auth/login to /login
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    
    console.log('Login response status:', response.status)
    
    if (!response.ok) {
      let errorMessage = 'Login failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
        console.log('Login error details:', errorData)
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    console.log('Login successful, response:', data)
    return data
  },

  async register(userData) {
    console.log('Attempting registration with:', { 
      email: userData.email,
      username: userData.email.split('@')[0],
      full_name: userData.name
    })
    
    const response = await fetch(`${API_BASE_URL}/register`, {  // Changed from /auth/register to /register
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        username: userData.email.split('@')[0],
        full_name: userData.name,
        password: userData.password
      })
    })
    
    console.log('Register response status:', response.status)
    
    if (!response.ok) {
      let errorMessage = 'Registration failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
        console.log('Registration error details:', errorData)
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    console.log('Registration successful, response:', data)
    return data
  },

  async getCurrentUser() {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.log('No access token found in localStorage')
      throw new Error('No authentication token found')
    }
    
    console.log('Getting current user with token:', token.substring(0, 20) + '...')
    
    const response = await fetch(`${API_BASE_URL}/me`, {  // Changed from /auth/me to /me
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Get current user response status:', response.status)
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('Token expired, clearing localStorage')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
      let errorMessage = 'Failed to get user'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    console.log('Current user data:', data)
    return data
  },

  logout() {
    console.log('Logging out, clearing localStorage')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }
}