export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString)
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  
  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return formatDate(dateString)
  }
}

export const formatNumber = (number, options = {}) => {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
  
  return number.toLocaleString('en-US', { ...defaultOptions, ...options })
}

export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

export const truncateText = (text, maxLength, suffix = '...') => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + suffix
}