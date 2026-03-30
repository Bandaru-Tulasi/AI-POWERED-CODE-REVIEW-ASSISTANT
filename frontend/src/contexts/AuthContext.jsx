import React, { createContext, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { authService } from '../services/auth.js'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('AuthProvider: Checking auth status...')
      
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          console.log('AuthProvider: Found stored token and user, verifying...')
          
          // Verify token validity by getting current user
          const userData = await authService.getCurrentUser()
          console.log('AuthProvider: Token valid, user data:', userData)
          
          setUser(userData)
        } catch (error) {
          console.error('AuthProvider: Failed to restore auth state:', error)
          // Clear invalid data
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        console.log('AuthProvider: No stored auth data found')
      }
      
      setLoading(false)
    }
    
    checkAuthStatus()
  }, [])

  const login = useCallback(async (email, password) => {
    console.log('AuthContext.login: Starting login for', email)
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login(email, password)
      const { access_token, user } = response
      
      console.log('AuthContext.login: Success, storing data...')
      
      // Store token and user data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      console.log('AuthContext.login: Login complete, user:', user)
      
      return user
    } catch (error) {
      console.error('AuthContext.login: Error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    console.log('AuthContext.register: Starting registration for', email)
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.register({
        name,
        email,
        password
      })
      
      const { access_token, user } = response
      
      console.log('AuthContext.register: Success, storing data...')
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      console.log('AuthContext.register: Registration complete, user:', user)
      
      return user
    } catch (error) {
      console.error('AuthContext.register: Error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    console.log('AuthContext.logout: Logging out...')
    authService.logout()
    setUser(null)
    setError(null)
  }, [])

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true)
    try {
      // This would call your backend API
      // const response = await api.put('/auth/profile', profileData)
      // const updatedUser = response.data
      
      // For now, update locally
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error) {
      setError(error.message || 'Failed to update profile')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user])

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  console.log('AuthProvider: Rendering with context:', {
    user: user?.email,
    loading,
    isAuthenticated: !!user
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}