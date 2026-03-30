export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws'

export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
]

export const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  info: 'bg-gray-100 text-gray-800',
}

export const ISSUE_TYPE_COLORS = {
  security: 'bg-red-100 text-red-800',
  performance: 'bg-yellow-100 text-yellow-800',
  quality: 'bg-blue-100 text-blue-800',
  style: 'bg-gray-100 text-gray-800',
  bug: 'bg-red-100 text-red-800',
  best_practice: 'bg-green-100 text-green-800',
}

export const REVIEW_STATUS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
}

export const REVIEW_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}