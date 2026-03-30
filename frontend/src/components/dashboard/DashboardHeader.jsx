import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Button from '../ui/Button.jsx'

const DashboardHeader = ({ 
  user,
  onNewReview, 
  onConnectRepository,
  repositoriesCount = 0,
  reviewsCount = 0 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Repositories', path: '/repositories' },
    { label: 'Settings', path: '/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand - positioned to the left with ml-0 */}
          <div className="flex items-center ml-4">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <svg
                className="h-8 w-8 text-primary-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                CodeReview AI
              </span>
            </div>

            {/* Desktop Navigation Links - with appropriate left margin */}
            <div className="hidden md:flex md:ml-10 md:space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side actions and user menu */}
          <div className="flex items-center space-x-4">
            {/* Quick actions (only on dashboard) */}
            {location.pathname === '/dashboard' && (
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="small"
                  className="border-gray-300 hover:bg-gray-50"
                  onClick={onConnectRepository}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Connect Repo
                </Button>
                <Button 
                  variant="primary"
                  size="small"
                  onClick={onNewReview}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  New Review
                </Button>
              </div>
            )}

            {/* Stats badges (optional) */}
            {location.pathname === '/dashboard' && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">{repositoriesCount}</span>
                  <span className="text-gray-500">repos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">{reviewsCount}</span>
                  <span className="text-gray-500">reviews</span>
                </div>
              </div>
            )}

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium text-sm">
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.full_name || user?.email?.split('@')[0] || 'User'}
                </span>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setIsProfileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation (scrollable) */}
        <div className="md:hidden flex space-x-2 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile quick actions for dashboard */}
        {location.pathname === '/dashboard' && (
          <div className="md:hidden flex space-x-2 pb-3 pt-1">
            <Button 
              variant="outline" 
              size="small"
              className="flex-1 border-gray-300"
              onClick={onConnectRepository}
            >
              Connect Repo
            </Button>
            <Button 
              variant="primary"
              size="small"
              className="flex-1"
              onClick={onNewReview}
            >
              New Review
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

DashboardHeader.propTypes = {
  user: PropTypes.object,
  onNewReview: PropTypes.func,
  onConnectRepository: PropTypes.func,
  repositoriesCount: PropTypes.number,
  reviewsCount: PropTypes.number,
}

export default DashboardHeader