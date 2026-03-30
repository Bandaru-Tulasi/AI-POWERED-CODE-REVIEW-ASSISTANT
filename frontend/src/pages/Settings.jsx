import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import { useAuth } from '../hooks/useAuth.js'

const Settings = () => {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
  })

  const [preferences, setPreferences] = useState({
    language: 'english',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      reviewCompleted: true,
      securityIssues: true,
      weeklyReport: false,
    },
  })

  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || user.full_name || '',
        email: user.email || '',
        company: user.company || '',
        role: user.role || '',
      })

      if (user.preferences) {
        try {
          const userPrefs = typeof user.preferences === 'string'
            ? JSON.parse(user.preferences)
            : user.preferences
          setPreferences(userPrefs)
        } catch (e) {
          console.error('Failed to parse user preferences:', e)
        }
      }
    }
  }, [user])

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateProfile({
        ...profile,
        preferences: JSON.stringify(preferences)
      })
      setSaveStatus('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSaveStatus('Failed to update profile')
    } finally {
      setLoading(false)
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      await updateProfile({
        preferences: JSON.stringify(preferences)
      })
      setSaveStatus('Preferences saved successfully!')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setSaveStatus('Failed to save preferences')
    } finally {
      setLoading(false)
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ✅ REMOVED: Integrations tab content
  // ✅ REMOVED: Security tab content
  // ✅ REMOVED: Language and Theme from preferences

  const tabs = [
    {
      label: 'Profile',
      content: (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled
                />
                <Input
                  label="Company"
                  value={profile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                />
                <Input
                  label="Role"
                  value={profile.role}
                  onChange={(e) => handleProfileChange('role', e.target.value)}
                  placeholder="Developer, Team Lead, etc."
                />
              </div>
            </div>

            {/* ✅ REMOVED: Preferences section with Language and Theme */}

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  loading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </div>
              {saveStatus && (
                <div className={`mt-4 p-3 rounded-lg ${
                  saveStatus.includes('successfully') || saveStatus.includes('saved') || saveStatus.includes('!')
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {saveStatus}
                </div>
              )}
            </div>
          </div>
        </Card>
      ),
    },
    {
      label: 'Notifications',
      content: (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose how you want to be notified about code reviews and activities.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Browser or desktop notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Review Completed</h4>
                    <p className="text-sm text-gray-600">When a code review is finished</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.reviewCompleted}
                      onChange={(e) => handleNotificationChange('reviewCompleted', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Security Issues</h4>
                    <p className="text-sm text-gray-600">Critical security vulnerabilities found</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.securityIssues}
                      onChange={(e) => handleNotificationChange('securityIssues', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Weekly summary of code review activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.weeklyReport}
                      onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSavePreferences}
                  loading={loading}
                  disabled={loading}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    // ✅ REMOVED: Integrations tab
    // ✅ REMOVED: Security tab
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        onNewReview={() => navigate('/code-review/new')}
        onConnectRepository={() => navigate('/repositories')}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <Tabs tabs={tabs} defaultTab={0} />
      </div>
    </div>
  )
}

export default Settings