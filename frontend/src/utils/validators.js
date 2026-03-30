export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidGitUrl = (url) => {
  // Matches common Git URLs (HTTPS, SSH, Git)
  const gitUrlRegex = /^(https?:\/\/|git@|git:\/\/).+\.git$/
  return gitUrlRegex.test(url)
}

export const validateCode = (code, language) => {
  const errors = []
  
  if (!code || code.trim().length === 0) {
    errors.push('Code cannot be empty')
  }
  
  if (code.length > 100000) {
    errors.push('Code is too large (max 100,000 characters)')
  }
  
  // Basic syntax validation could be added here based on language
  
  return errors
}