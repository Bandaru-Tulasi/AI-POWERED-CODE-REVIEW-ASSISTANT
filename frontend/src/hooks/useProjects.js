import { useState, useCallback } from 'react'
import { projectsService } from '../services/projects.js'

export const useProjects = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createProject = useCallback(async (projectData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.createProject(projectData)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.getUserProjects()
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getProject = useCallback(async (projectId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.getProject(projectId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (projectId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.updateProject(projectId, updates)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.deleteProject(projectId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addRepositoryToProject = useCallback(async (projectId, repositoryId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.addRepositoryToProject(projectId, repositoryId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const removeRepositoryFromProject = useCallback(async (projectId, repositoryId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.removeRepositoryFromProject(projectId, repositoryId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getProjectAnalytics = useCallback(async (projectId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await projectsService.getProjectAnalytics(projectId)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createProject,
    getUserProjects,
    getProject,
    updateProject,
    deleteProject,
    addRepositoryToProject,
    removeRepositoryFromProject,
    getProjectAnalytics
  }
}