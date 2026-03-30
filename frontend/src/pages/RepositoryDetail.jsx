import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import FileTree from '../components/repository/FileTree.jsx'
import PullRequestList from '../components/repository/PullRequestList.jsx'
import CommitHistory from '../components/repository/CommitHistory.jsx'
import { repositoryService } from '../services/repository.js'

const RepositoryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repository, setRepository] = useState(null)
  const [files, setFiles] = useState([])
  const [pullRequests, setPullRequests] = useState([])
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepositoryData()
  }, [id])

  const loadRepositoryData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        repositoryService.getRepository(id),
        repositoryService.getFiles(id).catch(() => ({ files: [] })),
        repositoryService.getPullRequests(id).catch(() => []),
        repositoryService.getCommits(id).catch(() => [])
      ])

      if (results[0].status === 'fulfilled') {
        setRepository(results[0].value)
      } else {
        console.error('Failed to load repository:', results[0].reason)
      }

      if (results[1].status === 'fulfilled') {
        const filesData = results[1].value
        console.log('Files data from API:', filesData.files || filesData)
        setFiles(filesData.files || filesData || [])
      } else {
        console.warn('Files data not available, using empty array')
        setFiles([])
      }

      if (results[2].status === 'fulfilled') {
        const prsData = results[2].value
        setPullRequests(prsData.pull_requests || prsData || [])
      } else {
        console.warn('Pull requests not available, using empty array')
        setPullRequests([])
      }

      if (results[3].status === 'fulfilled') {
        const commitsData = results[3].value
        setCommits(commitsData.commits || commitsData || [])
      } else {
        console.warn('Commits not available, using empty array')
        setCommits([])
      }
    } catch (error) {
      console.error('Unexpected error loading repository data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFile = (file) => {
    console.log('Selected file object:', file)
    // Determine the correct path: if file.path looks like a SHA (40 hex chars), use file.name instead
    const isSha = /^[0-9a-f]{40}$/i.test(file.path)
    const filePath = isSha ? file.name : file.path
    console.log('Using file path for navigation:', filePath)
    navigate(`/code-review/new?file=${encodeURIComponent(filePath)}&repo=${id}`)
  }

  const handleReviewPR = async (pr) => {
    navigate(`/code-review/new?pr=${pr.number}&repo=${id}`)
  }

  const handleRunReview = () => {
    navigate(`/code-review/new?repo=${id}`)
  }

  const handleSetupWebhook = async () => {
    try {
      await repositoryService.setupWebhook(id)
      alert('Webhook configured successfully!')
      loadRepositoryData()
    } catch (error) {
      console.error('Failed to setup webhook:', error)
      alert('Failed to setup webhook')
    }
  }

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect this repository?')) {
      try {
        await repositoryService.disconnectRepository(id)
        alert('Repository disconnected successfully!')
        navigate('/dashboard')
      } catch (error) {
        console.error('Failed to disconnect repository:', error)
        alert('Failed to disconnect repository')
      }
    }
  }

  const tabs = [
    {
      label: 'Files',
      content: (
        <FileTree
          files={files}
          onSelectFile={handleSelectFile}
          selectedFileId={null}
        />
      ),
      badge: files.length,
    },
    {
      label: 'Pull Requests',
      content: (
        <PullRequestList
          pullRequests={pullRequests}
          onReviewPR={handleReviewPR}
        />
      ),
      badge: pullRequests.length,
    },
    {
      label: 'Commits',
      content: (
        <CommitHistory commits={commits} />
      ),
      badge: commits.length,
    },
    {
      label: 'Settings',
      content: (
        <Card>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Repository Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{repository?.provider || 'GitHub'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium">{repository?.branch || 'main'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <Badge>{repository?.language || 'Unknown'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Synced:</span>
                  <span className="font-medium">
                    {repository?.last_synced ? new Date(repository.last_synced).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Webhook Configuration</h4>
              <p className="text-sm text-gray-600 mb-4">
                Automatically review pull requests when they are opened or updated.
              </p>
              <Button variant="primary" onClick={handleSetupWebhook}>
                Configure Webhook
              </Button>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sync Repository</h4>
              <p className="text-sm text-gray-600 mb-4">
                Manually sync repository data with the latest changes.
              </p>
              <Button variant="outline" onClick={loadRepositoryData}>
                Sync Now
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Danger Zone</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-3">
                  Disconnecting will remove all webhooks and stop automatic reviews.
                </p>
                <Button variant="danger" onClick={handleDisconnect}>
                  Disconnect Repository
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repository...</p>
        </div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Repository not found</h3>
            <p className="text-gray-600 mb-6">The repository you're looking for doesn't exist or you don't have access.</p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{repository.name}</h1>
              <p className="text-gray-600 mt-2">{repository.description || 'No description'}</p>
              <div className="flex items-center space-x-3 mt-3">
                <Badge variant="primary">{repository.language || 'Unknown'}</Badge>
                <Badge variant="success">Connected</Badge>
                <span className="text-sm text-gray-500">{repository.branch || 'main'}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back
              </Button>
              <Button variant="primary" onClick={handleRunReview}>
                Run AI Review
              </Button>
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} defaultTab={0} />
      </div>
    </div>
  )
}

export default RepositoryDetail