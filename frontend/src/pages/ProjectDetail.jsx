import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects.js'
import { useRepository } from '../hooks/useRepository.js'
import { useApi } from '../hooks/useApi.js'
import { useAuth } from '../hooks/useAuth.js'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApi()
  const { user } = useAuth()
  const { getProject, updateProject, deleteProject, addRepositoryToProject, removeRepositoryFromProject } = useProjects()
  const { getRepositories } = useRepository()
  
  const [project, setProject] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [availableRepos, setAvailableRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showAddRepoModal, setShowAddRepoModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_language: 'python',
    is_private: false,
    code_quality_threshold: 80,
    security_threshold: 90,
    tags: []
  })

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch project details
      const projectData = await getProject(id)
      console.log('Project data loaded:', projectData)
      
      if (!projectData) {
        throw new Error('Project not found')
      }
      
      setProject(projectData)
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        default_language: projectData.default_language || 'python',
        is_private: projectData.is_private || false,
        code_quality_threshold: projectData.code_quality_threshold || 80,
        security_threshold: projectData.security_threshold || 90,
        tags: projectData.tags || []
      })
      
      // Get repositories in this project from the project data
      const projectRepos = projectData.repositories || []
      console.log('Project repositories:', projectRepos)
      setRepositories(projectRepos)
      
      // Load user's all repositories
      const allRepos = await getRepositories()
      console.log('All repositories loaded:', allRepos)
      
      // Ensure allRepos is an array
      const reposList = Array.isArray(allRepos) ? allRepos : []
      console.log('Repos list:', reposList)
      
      // Get project repo IDs
      const projectRepoIds = new Set(projectRepos.map(r => r.id))
      console.log('Project repo IDs:', [...projectRepoIds])
      
      // Filter available repos (not in project)
      const available = reposList
        .filter(r => !projectRepoIds.has(r.id))
        .map(repo => ({
          id: repo.id,
          name: repo.name,
          language: repo.language || 'Unknown',
          url: repo.url,
          source: repo.source || 'github'
        }))
      
      console.log('Available repositories:', available)
      setAvailableRepos(available)
      
      // Log stats from project data
      console.log('Project stats:', {
        reviewCount: projectData.review_count,
        avgQuality: projectData.average_quality_score,
        avgSecurity: projectData.average_security_score,
        totalIssues: projectData.total_issues
      })
      
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async () => {
    try {
      await updateProject(id, formData)
      setEditing(false)
      await loadData()
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
        navigate('/projects')
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const handleAddRepository = async (repoId) => {
    try {
      await addRepositoryToProject(id, repoId)
      setShowAddRepoModal(false)
      await loadData() // Reload to show the new repository
    } catch (error) {
      console.error('Failed to add repository:', error)
    }
  }

  const handleRemoveRepository = async (repoId) => {
    if (window.confirm('Remove this repository from the project?')) {
      try {
        await removeRepositoryFromProject(id, repoId)
        await loadData() // Reload to update the list
      } catch (error) {
        console.error('Failed to remove repository:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editing ? 'Cancel' : 'Edit Project'}
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  value={formData.default_language}
                  onChange={(e) => setFormData({...formData, default_language: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Threshold
                </label>
                <input
                  type="number"
                  value={formData.code_quality_threshold}
                  onChange={(e) => setFormData({...formData, code_quality_threshold: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Threshold
                </label>
                <input
                  type="number"
                  value={formData.security_threshold}
                  onChange={(e) => setFormData({...formData, security_threshold: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => setFormData({...formData, is_private: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private project</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600">Repositories</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{repositories.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600">Reviews</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{project.review_count || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600">Avg Quality</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {project.average_quality_score ? Math.round(project.average_quality_score) : 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600">Avg Security</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {project.average_security_score ? Math.round(project.average_security_score) : 0}%
            </p>
          </div>
        </div>

        {/* Issues Summary Card (Optional) */}
        {project.total_issues > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Total Issues Found</h3>
                <p className="text-3xl font-bold">{project.total_issues}</p>
              </div>
              <div className="text-5xl">⚠️</div>
            </div>
          </div>
        )}

        {/* Repositories Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Repositories</h2>
            {availableRepos.length > 0 && (
              <button
                onClick={() => setShowAddRepoModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              >
                Add Repository
              </button>
            )}
          </div>

          {repositories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 mb-4">No repositories in this project yet</p>
              {availableRepos.length > 0 ? (
                <button
                  onClick={() => setShowAddRepoModal(true)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add your first repository
                </button>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-3">
                    You don't have any repositories to add.
                  </p>
                  <button
                    onClick={() => navigate('/repositories')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Connect a Repository
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {repositories.map(repo => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{repo.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {repo.language || 'Unknown'}
                      </span>
                      {repo.url && (
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          View on {repo.source || 'GitHub'}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveRepository(repo.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {availableRepos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddRepoModal(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add another repository
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Repository Modal */}
        {showAddRepoModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddRepoModal(false)}></div>
              <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Repository to Project</h3>
                
                {availableRepos.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">No repositories available to add</p>
                    <button
                      onClick={() => {
                        setShowAddRepoModal(false)
                        navigate('/repositories')
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Connect a repository first
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {availableRepos.map(repo => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer"
                        onClick={() => handleAddRepository(repo.id)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{repo.name}</p>
                          <p className="text-sm text-gray-600">{repo.language || 'Unknown language'}</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowAddRepoModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail