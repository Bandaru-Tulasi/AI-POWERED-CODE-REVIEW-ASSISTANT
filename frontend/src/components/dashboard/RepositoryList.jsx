import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'

const RepositoryList = ({ 
  repositories = [], 
  onSelectRepository,
  onConnectRepository,
  onDisconnectRepository 
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [newRepoUrl, setNewRepoUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [hoveredRepo, setHoveredRepo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProvider, setFilterProvider] = useState('all')

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (repo.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = filterProvider === 'all' || repo.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  const handleConnect = async () => {
    if (!newRepoUrl.trim()) return
    
    setIsConnecting(true)
    try {
      await onConnectRepository(newRepoUrl)
      setNewRepoUrl('')
      setShowConnectModal(false)
    } catch (error) {
      console.error('Failed to connect repository:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const getProviderIcon = (provider, className = "w-5 h-5") => {
    const icons = {
      github: (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      gitlab: (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
        </svg>
      ),
      bitbucket: (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873h14.474c.375.005.734-.148.977-.423a1.2 1.2 0 00.32-.979L23.447 2.103a.773.773 0 00-.769-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
        </svg>
      ),
    }
    return icons[provider] || icons.github
  }

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-700',
      typescript: 'bg-blue-100 text-blue-700',
      python: 'bg-green-100 text-green-700',
      java: 'bg-red-100 text-red-700',
      cpp: 'bg-purple-100 text-purple-700',
      go: 'bg-cyan-100 text-cyan-700',
      ruby: 'bg-pink-100 text-pink-700',
      php: 'bg-indigo-100 text-indigo-700',
      rust: 'bg-orange-100 text-orange-700',
    }
    return colors[language?.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  const getProviderColor = (provider) => {
    const colors = {
      github: 'bg-gray-800 text-white',
      gitlab: 'bg-orange-600 text-white',
      bitbucket: 'bg-blue-600 text-white',
    }
    return colors[provider] || 'bg-gray-600 text-white'
  }

  const formatDate = (date) => {
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <Card className="h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Repositories</h3>
            </div>
            <Button size="small" onClick={() => setShowConnectModal(true)}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Connect
            </Button>
          </div>

          {/* Search */}
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 relative">
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 bg-white"
            >
              <option value="all">All</option>
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
              <option value="bitbucket">BitBucket</option>
            </select>
          </div>
        </div>

        {/* Repository List */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {filteredRepositories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No repositories found</p>
              {!searchTerm && filterProvider === 'all' && (
                <Button size="small" className="mt-3" onClick={() => setShowConnectModal(true)}>
                  Connect Repository
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRepositories.map((repo) => (
                <motion.div
                  key={repo.id}
                  onHoverStart={() => setHoveredRepo(repo.id)}
                  onHoverEnd={() => setHoveredRepo(null)}
                  className="group p-3 border border-gray-200 rounded-lg hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onSelectRepository?.(repo.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-md ${getProviderColor(repo.provider)} flex items-center justify-center flex-shrink-0`}>
                        {getProviderIcon(repo.provider, "w-4 h-4")}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm">{repo.name}</h4>
                          {repo.connected && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge size="small" className={`${getLanguageColor(repo.language)} text-xs px-1.5 py-0.5`}>
                            {repo.language || 'Unknown'}
                          </Badge>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{repo.branch}</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDisconnectRepository?.(repo.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Updated {formatDate(new Date(repo.updatedAt))}</span>
                    <span>{repo.pullRequests || 0} PRs</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {repositories.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
            <span className="font-medium text-gray-900">{repositories.length}</span> total • 
            <span className="ml-1 font-medium text-green-600">{repositories.filter(r => r.connected).length}</span> active
          </div>
        )}
      </Card>

      {/* Connect Modal - Compact Version */}
      <Modal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect Repository"
        size="small"
        footer={
          <div className="flex space-x-2 w-full">
            <Button variant="outline" size="small" onClick={() => setShowConnectModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="small"
              onClick={handleConnect}
              disabled={!newRepoUrl.trim() || isConnecting}
              loading={isConnecting}
              className="flex-1"
            >
              Connect
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Repository URL
            </label>
            <div className="relative">
              <Input
                placeholder="https://github.com/username/repo"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
                className="text-sm pr-20"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-gray-50 rounded-md px-1">
                {['github', 'gitlab', 'bitbucket'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setNewRepoUrl(`https://${provider}.com/username/repository`)}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      newRepoUrl.includes(provider) ? 'bg-gray-200' : ''
                    }`}
                    title={`Set ${provider} URL`}
                  >
                    <div className={`w-5 h-5 rounded ${getProviderColor(provider)} flex items-center justify-center`}>
                      {getProviderIcon(provider, "w-3 h-3")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              
            </p>
          </div>

          {/* Provider Quick Select */}
          <div className="grid grid-cols-3 gap-2">
            {['github', 'gitlab', 'bitbucket'].map((provider) => (
              <button
                key={provider}
                onClick={() => setNewRepoUrl(`https://${provider}.com/username/repository`)}
                className={`p-2 border rounded-lg text-center transition-all ${
                  newRepoUrl.includes(provider) 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 mx-auto mb-1 rounded ${getProviderColor(provider)} flex items-center justify-center`}>
                  {getProviderIcon(provider, "w-3 h-3")}
                </div>
                <span className="text-xs font-medium capitalize">{provider}</span>
              </button>
            ))}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              Connect your repository to enable automated AI code reviews on pull requests.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}

RepositoryList.propTypes = {
  repositories: PropTypes.array,
  onSelectRepository: PropTypes.func,
  onConnectRepository: PropTypes.func,
  onDisconnectRepository: PropTypes.func,
}

export default RepositoryList