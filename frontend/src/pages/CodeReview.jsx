import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useCodeReview } from '../hooks/useCodeReview.js'
import { useAuth } from '../hooks/useAuth.js'
import { repositoryService } from '../services/repository.js'
import CodeEditor from '../components/code-review/CodeEditor.jsx'
import IssueList from '../components/code-review/IssueList.jsx'
import SuggestionPanel from '../components/code-review/SuggestionPanel.jsx'
import SecurityIssues from '../components/code-review/SecurityIssues.jsx'
import CodeMetrics from '../components/code-review/CodeMetrics.jsx'
import CommentsSection from '../components/review/CommentsSection.jsx'

const CodeReview = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { analyzeCode, saveReview, getReview, loading: apiLoading } = useCodeReview()
  
  const repoId = searchParams.get('repo')
  const fileId = searchParams.get('file')
  const prNumber = searchParams.get('pr')
  
  const [code, setCode] = useState(``)
  const [language, setLanguage] = useState('python')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')
  const [error, setError] = useState(null)
  const [reviewSaved, setReviewSaved] = useState(false)
  const [filePath, setFilePath] = useState('')
  const [applySuccess, setApplySuccess] = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)

  // If a file is specified, load its content
  useEffect(() => {
    if (repoId && fileId) {
      loadFileContent()
    } else if (!id) {
      // No existing review and no file selected, use default sample
      setCode(`def calculate_total(items):
    total = 0
    for item in items:
        total += item.get('price', 0) * item.get('quantity', 0)
    return total

def process_data(data):
    result = []
    for d in data:
        if d and len(d) > 0:
            result.append(d.upper())
    return result

def connect_to_database(user_id):
    cursor = db.execute("SELECT * FROM users WHERE id = " + user_id)
    return cursor.fetchall()`)
    }
  }, [repoId, fileId, id])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (applySuccess) {
      const timer = setTimeout(() => {
        setApplySuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [applySuccess])

  const loadFileContent = async () => {
    try {
      setLoading(true)
      const path = decodeURIComponent(fileId)
      console.log('Loading file from path:', path)
      const response = await repositoryService.getFileContent(repoId, path)
      setCode(response.content)
      // Guess language from file extension
      const ext = path.split('.').pop()
      const langMap = {
        'py': 'python',
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'h': 'c',
        'hpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rb': 'ruby',
        'php': 'php',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'yml': 'yaml',
        'yaml': 'yaml',
        'md': 'markdown',
        'txt': 'text',
      }
      setLanguage(langMap[ext] || 'text')
      setFilePath(path)
    } catch (err) {
      console.error('Failed to load file content:', err)
      setError('Failed to load file content. Using default code.')
      // Fallback to default sample code
      setCode(`def calculate_total(items):
    total = 0
    for item in items:
        total += item.get('price', 0) * item.get('quantity', 0)
    return total

def process_data(data):
    result = []
    for d in data:
        if d and len(d) > 0:
            result.append(d.upper())
    return result

def connect_to_database(user_id):
    cursor = db.execute("SELECT * FROM users WHERE id = " + user_id)
    return cursor.fetchall()`)
    } finally {
      setLoading(false)
    }
  }

  // If editing an existing review, load it
  useEffect(() => {
    if (id) {
      loadExistingReview(id)
    }
  }, [id])

  const loadExistingReview = async (reviewId) => {
    try {
      setLoading(true)
      const response = await getReview(reviewId)
      const reviewData = response.data || response
      
      setCode(reviewData.code || reviewData.content || '')
      setLanguage(reviewData.language || 'python')
      
      if (reviewData.analysis_result) {
        setAnalysisResult(reviewData.analysis_result)
        setActiveTab('analysis')
      }
    } catch (err) {
      console.error('Failed to load review:', err)
      setError('Failed to load review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!code || code.trim().length === 0) {
      setError('Please enter some code to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setApplySuccess(null)
    
    try {
      console.log(`Analyzing ${language} code with AI...`)
      
      const response = await analyzeCode(code, language, {
        analysis_type: 'comprehensive'
      })
      
      console.log('Analysis complete:', response)
      
      const result = response.data?.result || response.result || response
      
      const structuredResult = {
        overall_score: result.overall_score || 75,
        summary: result.summary || 'Code analysis complete',
        security: result.security || {
          issues_found: 0,
          issues: []
        },
        quality: result.quality || {
          issues_found: 0,
          issues: []
        },
        complexity: result.complexity || {
          rating: 'Medium',
          score: 50
        },
        suggestions: result.suggestions || {
          suggestions_provided: 0,
          items: []
        }
      }
      
      setAnalysisResult(structuredResult)
      setActiveTab('analysis')
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err.message || 'Failed to analyze code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReview = async () => {
    if (!user) {
      setError('Please log in to save reviews')
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      
      const reviewData = {
        title: `Code Review - ${new Date().toLocaleString()}`,
        description: `AI-powered review of ${language} code`,
        code: code,
        language: language,
        analysis_result: analysisResult,
        user_id: user.id,
        status: analysisResult ? 'analyzed' : 'draft'
      }
      
      const response = await saveReview(reviewData)
      console.log('Review saved:', response)
      
      setReviewSaved(true)
      
      // No alert - just visual feedback
      setTimeout(() => setReviewSaved(false), 3000)
      
      if (response.data?.id || response.id) {
       navigate(`/code-review/${response.data?.id || response.id}`) 
      }
    } catch (err) {
      console.error('Failed to save review:', err)
      setError('Failed to save review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Smart code replacement - finds and replaces only the relevant section
   * @param {string} fullCode - The complete code
   * @param {string} beforeCode - The code to replace
   * @param {string} afterCode - The replacement code
   * @returns {string} - Updated code with only the relevant part replaced
   */
  const applySmartReplacement = (fullCode, beforeCode, afterCode) => {
    if (!beforeCode || !afterCode) return fullCode
    
    // Clean up the code snippets
    const cleanBefore = beforeCode.trim()
    const cleanAfter = afterCode.trim()
    
    // Try exact match first
    if (fullCode.includes(cleanBefore)) {
      return fullCode.replace(cleanBefore, cleanAfter)
    }
    
    // Try to find by function/class name
    const functionMatch = cleanBefore.match(/def\s+(\w+)\s*\(/)
    if (functionMatch) {
      const functionName = functionMatch[1]
      const functionRegex = new RegExp(`def\\s+${functionName}\\s*\\([^)]*\\)\\s*:[^\\n]*\\n(?:[^\\n]*\\n)*?(?=\\n\\S|$)`, 'g')
      if (functionRegex.test(fullCode)) {
        return fullCode.replace(functionRegex, cleanAfter + '\n')
      }
    }
    
    // Try to find by signature line
    const firstLine = cleanBefore.split('\n')[0].trim()
    if (firstLine && fullCode.includes(firstLine)) {
      const lines = fullCode.split('\n')
      let startLine = -1
      let endLine = -1
      
      // Find the line containing the signature
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(firstLine)) {
          startLine = i
          break
        }
      }
      
      if (startLine !== -1) {
        // Find the end of the function/block
        let indentLevel = null
        for (let i = startLine; i < lines.length; i++) {
          const line = lines[i]
          if (i === startLine) {
            // Get indentation of the first line
            const match = line.match(/^(\s*)/)
            indentLevel = match ? match[1].length : 0
          } else {
            // Check if we've reached a line with less indentation
            const currentIndent = line.match(/^(\s*)/)
            const currentIndentLevel = currentIndent ? currentIndent[1].length : 0
            if (currentIndentLevel <= indentLevel && line.trim() !== '') {
              endLine = i
              break
            }
          }
        }
        
        if (endLine === -1) {
          endLine = lines.length
        }
        
        // Replace the lines
        const beforeLines = lines.slice(startLine, endLine).join('\n')
        if (beforeLines.includes(cleanBefore) || cleanBefore.includes(beforeLines.trim())) {
          const newLines = [
            ...lines.slice(0, startLine),
            cleanAfter,
            ...lines.slice(endLine)
          ]
          return newLines.join('\n')
        }
      }
    }
    
    // If all else fails, append the fix as a comment
    return fullCode + '\n\n# Suggested fix:\n' + cleanAfter
  }

  const handleApplySuggestion = (suggestion) => {
    let newCode = code
    
    if (suggestion.suggestedCode && suggestion.currentCode) {
      newCode = applySmartReplacement(code, suggestion.currentCode, suggestion.suggestedCode)
    } else if (suggestion.code && suggestion.currentCode) {
      newCode = applySmartReplacement(code, suggestion.currentCode, suggestion.code)
    } else if (suggestion.suggestedCode) {
      // If we don't have before code, try to find a good place to insert
      const functions = code.match(/def\s+\w+\s*\([^)]*\):/g)
      if (functions && functions.length > 0) {
        const lastFunction = functions[functions.length - 1]
        const lastIndex = code.lastIndexOf(lastFunction)
        if (lastIndex !== -1) {
          newCode = code.substring(0, lastIndex) + 
                   '\n\n' + suggestion.suggestedCode + '\n\n' + 
                   code.substring(lastIndex)
        } else {
          newCode = code + '\n\n' + suggestion.suggestedCode
        }
      } else {
        newCode = code + '\n\n' + suggestion.suggestedCode
      }
    }
    
    if (newCode !== code) {
      setCode(newCode)
      setApplySuccess({
        message: 'Suggestion applied successfully!',
        type: 'success'
      })
    } else {
      setApplySuccess({
        message: 'Could not automatically apply this suggestion. The suggested code has been added as a comment.',
        type: 'info'
      })
    }
  }

  const handleApplyFix = (issue) => {
    let newCode = code
    let fixApplied = false
    
    if (issue.fix?.after && issue.fix?.before) {
      newCode = applySmartReplacement(code, issue.fix.before, issue.fix.after)
      fixApplied = newCode !== code
    } else if (issue.fix?.code && issue.fix?.before) {
      newCode = applySmartReplacement(code, issue.fix.before, issue.fix.code)
      fixApplied = newCode !== code
    } else if (issue.suggestion && issue.suggestion.includes('```')) {
      // Try to extract code from suggestion
      const codeMatch = issue.suggestion.match(/```(?:\w+)?\s*([\s\S]+?)```/)
      if (codeMatch) {
        const extractedCode = codeMatch[1].trim()
        // Try to find the vulnerable pattern
        if (issue.description) {
          const lines = issue.description.match(/lines?\s*(\d+)/i)
          if (lines) {
            const lineNum = parseInt(lines[1])
            const codeLines = code.split('\n')
            if (lineNum && lineNum <= codeLines.length) {
              codeLines[lineNum - 1] = extractedCode
              newCode = codeLines.join('\n')
              fixApplied = true
            }
          }
        }
        
        if (!fixApplied) {
          // Append as comment if we can't find the exact location
          newCode = code + '\n\n# Fixed version:\n' + extractedCode
          fixApplied = true
        }
      }
    } else if (issue.fix?.code) {
      newCode = code + '\n\n# Suggested fix:\n' + issue.fix.code
      fixApplied = true
    }
    
    if (fixApplied) {
      setCode(newCode)
      setApplySuccess({
        message: '✅ Fix applied successfully! The code has been updated.',
        type: 'success'
      })
    } else {
      setApplySuccess({
        message: 'This fix cannot be automatically applied. Please review the suggestion manually.',
        type: 'info'
      })
    }
  }

  const handleExportReport = () => {
    if (!analysisResult) return
    
    const reportData = {
      review_date: new Date().toISOString(),
      language: language,
      code_length: code.length,
      analysis: analysisResult,
      code_snippet: code.substring(0, 500) + (code.length > 500 ? '...' : '')
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code-review-${new Date().getTime()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatIssues = () => {
    if (!analysisResult) return []
    
    const issues = []
    
    // Process security issues
    if (analysisResult.security?.issues && Array.isArray(analysisResult.security.issues)) {
      analysisResult.security.issues.forEach((issue, i) => {
        if (typeof issue === 'string') {
          // Try to extract structured information from text
          const lines = issue.match(/lines?\s*(\d+)(?:-(\d+))?/i)
          const lineNum = lines ? parseInt(lines[1]) : null
          
          // Extract fix/suggestion if present
          let fixSuggestion = null
          let fixCode = null
          let fixExplanation = null
          
          // Look for code blocks with fixes
          const codeBlockMatch = issue.match(/```(?:\w+)?\s*([\s\S]+?)```/g)
          if (codeBlockMatch) {
            // Get the last code block as the fix
            const lastCodeBlock = codeBlockMatch[codeBlockMatch.length - 1]
            const codeContent = lastCodeBlock.replace(/```(?:\w+)?/g, '').replace(/```/g, '').trim()
            fixCode = codeContent
          }
          
          // Look for "Fix:" or "Suggestion:" patterns
          const fixMatch = issue.match(/fix:?\s*([^\n]+)/i)
          if (fixMatch) {
            fixSuggestion = fixMatch[1].trim()
          }
          
          // Look for explanation
          const explanationMatch = issue.match(/why:?\s*([^\n]+)/i) || 
                                   issue.match(/explanation:?\s*([^\n]+)/i) ||
                                   issue.match(/this (?:fix|prevents|addresses) ([^\n]+)/i)
          if (explanationMatch) {
            fixExplanation = explanationMatch[1].trim()
          }
          
          // Determine issue type from content
          let title = 'Security Vulnerability'
          
          if (issue.toLowerCase().includes('sql')) {
            title = 'SQL Injection Vulnerability'
            if (!fixCode) {
              fixCode = `cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`
            }
            if (!fixExplanation) {
              fixExplanation = 'Using parameterized queries prevents SQL injection by separating SQL code from data.'
            }
          } else if (issue.toLowerCase().includes('pickle')) {
            title = 'Insecure Deserialization'
            if (!fixCode) {
              fixCode = `import json
data = json.loads(user_input)`
            }
            if (!fixExplanation) {
              fixExplanation = 'Pickle is unsafe for untrusted data. Use JSON which is safe and standard.'
            }
          } else if (issue.toLowerCase().includes('command') || issue.toLowerCase().includes('os.system')) {
            title = 'Command Injection Vulnerability'
            if (!fixCode) {
              fixCode = `import subprocess
subprocess.run([command, arg1, arg2], shell=False)`
            }
            if (!fixExplanation) {
              fixExplanation = 'Using subprocess with shell=False prevents shell injection attacks.'
            }
          } else if (issue.toLowerCase().includes('xss')) {
            title = 'Cross-Site Scripting (XSS) Vulnerability'
            if (!fixCode) {
              fixCode = `element.textContent = userInput`
            }
            if (!fixExplanation) {
              fixExplanation = 'Using textContent or sanitizing input prevents XSS attacks.'
            }
          } else if (issue.toLowerCase().includes('hardcoded') || issue.toLowerCase().includes('password') || issue.toLowerCase().includes('secret')) {
            title = 'Hardcoded Secret Detected'
            if (!fixCode) {
              fixCode = `import os
password = os.environ.get('DB_PASSWORD')`
            }
            if (!fixExplanation) {
              fixExplanation = 'Storing secrets in environment variables keeps them out of your codebase.'
            }
          }
          
          // Create before code based on description
          let beforeCode = `# Vulnerable code`
          if (issue.toLowerCase().includes('sql')) {
            beforeCode = `cursor.execute("SELECT * FROM users WHERE id = " + user_id)`
          } else if (issue.toLowerCase().includes('pickle')) {
            beforeCode = `data = pickle.loads(user_input)`
          } else if (issue.toLowerCase().includes('os.system')) {
            beforeCode = `os.system("ping " + host)`
          }
          
          issues.push({
            id: `sec-${i}`,
            type: 'security',
            severity: 'high',
            title: title,
            description: issue,
            line: lineNum,
            suggestion: fixSuggestion || 'Review and fix this security issue.',
            fix: {
              before: beforeCode,
              after: fixCode || '// Implement proper security measures',
              explanation: fixExplanation || 'This fix addresses the security vulnerability by implementing secure coding practices.',
              code: fixCode
            }
          })
        } else if (typeof issue === 'object') {
          // Enhanced issue object with fix information
          const hasFix = issue.fix || issue.suggested_code || issue.fixed_code
          issues.push({
            id: `sec-${i}`,
            type: 'security',
            severity: issue.severity || 'medium',
            title: issue.title || 'Security issue',
            description: issue.description || issue.message || 'Potential security vulnerability',
            line: issue.line_number,
            suggestion: issue.mitigation || issue.suggestion,
            ...(hasFix && {
              fix: {
                before: issue.current_code || issue.fix?.before || '// Current vulnerable code',
                after: issue.suggested_code || issue.fixed_code || issue.fix?.after,
                explanation: issue.explanation || issue.fix?.explanation || 'This fix addresses the security issue.',
                code: issue.suggested_code || issue.fixed_code || issue.fix?.after
              }
            })
          })
        }
      })
    }
    
    // Process quality issues
    if (analysisResult.quality?.issues && Array.isArray(analysisResult.quality.issues)) {
      analysisResult.quality.issues.forEach((issue, i) => {
        if (typeof issue === 'string') {
          // Check for duplicate code issue
          if (issue.toLowerCase().includes('duplicate')) {
            const lines = issue.match(/lines?\s*(\d+)(?:-(\d+))?/i)
            const lineNum = lines ? parseInt(lines[1]) : null
            
            issues.push({
              id: `qual-${i}`,
              type: 'quality',
              severity: 'medium',
              title: 'Duplicate Code Detected',
              description: issue,
              line: lineNum,
              suggestion: 'Extract duplicate logic into a shared function',
              fix: {
                before: `def calculate_tax(amount, rate):
    # Complex tax calculation logic
    # ... 15 lines of code ...

def calculate_discount(amount, rate):
    # Exactly the same complex logic
    # ... 15 lines of code ...`,
                after: `def calculate_percentage(amount, rate):
    """Shared calculation logic"""
    # Complex calculation logic once
    # ... 15 lines of code ...

def calculate_tax(amount, rate):
    return calculate_percentage(amount, rate)

def calculate_discount(amount, rate):
    return calculate_percentage(amount, rate)`,
                explanation: 'Extracting duplicate code into a shared function follows the DRY principle.'
              }
            })
          } else {
            issues.push({
              id: `qual-${i}`,
              type: 'quality',
              severity: 'medium',
              title: 'Code Quality Issue',
              description: issue,
              suggestion: 'Consider refactoring for better quality.'
            })
          }
        } else if (typeof issue === 'object') {
          const hasFix = issue.fix || issue.suggested_code
          issues.push({
            id: `qual-${i}`,
            type: 'quality',
            severity: issue.severity || 'medium',
            title: issue.title || 'Quality issue',
            description: issue.description || issue.message,
            line: issue.line,
            suggestion: issue.suggestion,
            ...(hasFix && {
              fix: {
                before: issue.current_code || issue.fix?.before,
                after: issue.suggested_code || issue.fix?.after,
                explanation: issue.explanation || issue.fix?.explanation || 'This refactoring improves code quality.',
                code: issue.suggested_code || issue.fix?.after
              }
            })
          })
        }
      })
    }
    
    return issues
  }

  const formatSuggestions = () => {
    if (!analysisResult) return []
    
    const suggestions = []
    
    if (analysisResult.suggestions?.items && Array.isArray(analysisResult.suggestions.items)) {
      analysisResult.suggestions.items.forEach((s, i) => {
        // Handle different suggestion formats
        let suggestionText = ''
        let suggestionType = 'improvement'
        let suggestionTitle = ''
        let beforeCode = ''
        let afterCode = ''
        let reasoning = ''
        
        if (typeof s === 'string') {
          suggestionText = s
          suggestionTitle = `Suggestion ${i+1}`
        } else {
          suggestionText = s.description || s.explanation || s.title || `Suggestion ${i+1}`
          suggestionTitle = s.title || `Suggestion ${i+1}`
          suggestionType = s.type || 'improvement'
          beforeCode = s.current_code || s.before || ''
          afterCode = s.suggested_code || s.after || ''
          reasoning = s.reasoning || s.explanation || ''
        }
        
        // Try to extract code blocks from text
        const codeBlockMatch = suggestionText.match(/```(?:\w+)?\s*([\s\S]+?)```/g)
        if (codeBlockMatch && !afterCode) {
          if (codeBlockMatch.length >= 2) {
            // Multiple code blocks - assume first is before, second is after
            const beforeMatch = codeBlockMatch[0].match(/```(?:\w+)?\s*([\s\S]+?)```/)
            const afterMatch = codeBlockMatch[1].match(/```(?:\w+)?\s*([\s\S]+?)```/)
            if (beforeMatch) beforeCode = beforeMatch[1].trim()
            if (afterMatch) afterCode = afterMatch[1].trim()
          } else if (codeBlockMatch.length === 1) {
            // Single code block - assume it's the suggested code
            const codeMatch = codeBlockMatch[0].match(/```(?:\w+)?\s*([\s\S]+?)```/)
            if (codeMatch) afterCode = codeMatch[1].trim()
          }
        }
        
        // Generate fixes for common suggestion patterns if no code provided
        if (!afterCode) {
          const lowerText = suggestionText.toLowerCase()
          
          if (lowerText.includes('input validation')) {
            beforeCode = beforeCode || `def process_data(data):
    return data.upper()`
            
            afterCode = `def process_data(data):
    if not data:
        return None
    if not isinstance(data, str):
        raise TypeError("Data must be a string")
    return data.upper()`
            
            reasoning = reasoning || 'Adding input validation prevents errors from unexpected data types.'
          }
          else if (lowerText.includes('naming convention') || lowerText.includes('pep 8')) {
            beforeCode = beforeCode || `def CalculateTotal(Items):
    total = 0
    for item in Items:
        total += item.get('price',0)
    return total`
            
            afterCode = `def calculate_total(items):
    total = 0
    for item in items:
        total += item.get('price', 0)
    return total`
            
            reasoning = reasoning || 'Following consistent naming conventions makes code more readable.'
          }
          else if (lowerText.includes('error handling') || lowerText.includes('try-except')) {
            beforeCode = beforeCode || `def read_file(filename):
    file = open(filename, 'r')
    content = file.read()
    file.close()
    return content`
            
            afterCode = `def read_file(filename):
    try:
        with open(filename, 'r') as file:
            return file.read()
    except FileNotFoundError:
        print(f"File {filename} not found")
        return None`
            
            reasoning = reasoning || 'Adding proper error handling prevents crashes.'
          }
          else if (lowerText.includes('list comprehension')) {
            beforeCode = beforeCode || `def square_numbers(numbers):
    result = []
    for num in numbers:
        result.append(num * num)
    return result`
            
            afterCode = `def square_numbers(numbers):
    return [num * num for num in numbers]`
            
            reasoning = reasoning || 'List comprehensions are more concise and efficient.'
          }
        }
        
        suggestions.push({
          id: `sug-${i}`,
          type: suggestionType,
          title: suggestionTitle,
          description: suggestionText,
          currentCode: beforeCode,
          suggestedCode: afterCode,
          reasoning: reasoning,
          impact: s.impact || 'medium'
        })
      })
    }
    
    return suggestions
  }

  const extractMetrics = () => {
    if (!analysisResult) return {}
    
    return {
      complexity: analysisResult.complexity?.score || 50,
      maintainability: 100 - (analysisResult.complexity?.score || 50),
      securityScore: analysisResult.security?.score || 70,
      codeSmells: formatIssues().length,
      linesOfCode: code.split('\n').length,
      functions: (code.match(/def\s+\w+\s*\(/g) || []).length +
                (code.match(/function\s+\w+\s*\(/g) || []).length +
                (code.match(/const\s+\w+\s*=\s*\(/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length
    }
  }

  const issues = formatIssues()
  const suggestions = formatSuggestions()
  const metrics = extractMetrics()

  const handleLineClick = (lineNumber) => {
    setSelectedLine(lineNumber)
    setActiveTab('comments')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="modern-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/dashboard')}>
            <div className="brand-icon">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="brand-text">CodeReview AI</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate('/analytics')}>
              Analytics
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                {user?.full_name?.[0] || user?.email?.[0] || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {id ? 'Edit Code Review' : 'AI Code Review'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {id 
                    ? 'Continue reviewing your code with AI assistance' 
                    : 'Get intelligent feedback on your code quality and security using AI'}
                </p>
                {analysisResult && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      ✓ Powered by AI
                    </span>
                    {reviewSaved && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        ✓ Saved
                      </span>
                    )}
                  </div>
                )}
                {filePath && (
                  <div className="mt-2 text-sm text-gray-500">
                    File: {filePath}
                  </div>
                )}
                {applySuccess && (
                  <div className={`mt-2 p-2 rounded-lg text-sm ${
                    applySuccess.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {applySuccess.message}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
                  disabled={loading}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                </select>
                <button
                  onClick={handleSaveReview}
                  disabled={loading || !code}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !code}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-800 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing with Gemini...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-white border border-gray-200 border-b-0 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                disabled={!analysisResult}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  !analysisResult
                    ? 'text-gray-300 cursor-not-allowed'
                    : activeTab === 'analysis'
                      ? 'bg-white border border-gray-200 border-b-0 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Analysis Results
                {analysisResult && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                    {issues.length} issues
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                disabled={!analysisResult}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  !analysisResult
                    ? 'text-gray-300 cursor-not-allowed'
                    : activeTab === 'suggestions'
                      ? 'bg-white border border-gray-200 border-b-0 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                AI Suggestions
                {suggestions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                    {suggestions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                disabled={!id && !repoId}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  (!id && !repoId)
                    ? 'text-gray-300 cursor-not-allowed'
                    : activeTab === 'comments'
                      ? 'bg-white border border-gray-200 border-b-0 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Comments
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  💬
                </span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'editor' && (
                <CodeEditor
                  code={code}
                  language={language}
                  onChange={setCode}
                  readOnly={loading}
                  onLineClick={handleLineClick}
                  className="min-h-[600px]"
                />
              )}

              {activeTab === 'analysis' && analysisResult && (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-gray-900">
                          {analysisResult.overall_score || metrics.securityScore}
                        </div>
                        <div className="text-sm text-gray-500">/100</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600 mb-1">Issues Found</div>
                        <div className="text-2xl font-bold text-gray-900">{issues.length}</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-600 mb-1">Security Issues</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {issues.filter(i => i.type === 'security').length}
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">Suggestions</div>
                        <div className="text-2xl font-bold text-gray-900">{suggestions.length}</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-600 mb-1">Complexity</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {analysisResult.complexity?.rating || 'Medium'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <IssueList 
                    issues={issues} 
                    onSelectIssue={(issue) => console.log('Selected issue:', issue)}
                    onApplyFix={handleApplyFix}
                  />
                  
                  {issues.filter(i => i.type === 'security').length > 0 && (
                    <SecurityIssues 
                      issues={issues.filter(i => i.type === 'security')} 
                      onViewDetails={(issue) => console.log('View details:', issue)}
                      onApplyFix={handleApplyFix}
                    />
                  )}
                </div>
              )}

              {activeTab === 'suggestions' && suggestions.length > 0 && (
                <SuggestionPanel
                  suggestions={suggestions}
                  onApplySuggestion={handleApplySuggestion}
                  onGenerateMore={handleAnalyze}
                />
              )}

              {activeTab === 'suggestions' && suggestions.length === 0 && analysisResult && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No suggestions yet</h3>
                  <p className="text-gray-600 mb-4">Run the analysis to get AI-powered suggestions for improving your code.</p>
                  <button
                    onClick={handleAnalyze}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Analyze Now
                  </button>
                </div>
              )}

              {activeTab === 'comments' && (id || repoId) && (
                <CommentsSection
                  reviewId={id || 'pending'}
                  filePath={filePath}
                  lineNumber={selectedLine}
                />
              )}
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Code Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Lines of Code</span>
                    <span className="font-medium text-gray-900">{code.split('\n').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Characters</span>
                    <span className="font-medium text-gray-900">{code.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Functions</span>
                    <span className="font-medium text-gray-900">{metrics.functions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Classes</span>
                    <span className="font-medium text-gray-900">{metrics.classes}</span>
                  </div>
                </div>
              </div>

              {analysisResult && (
                <CodeMetrics metrics={metrics} />
              )}

              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">CODE REVIEW</h3>
                    <p className="text-sm opacity-90">Powered by AI</p>
                  </div>
                </div>
                <p className="text-sm opacity-90 mb-4">
                  This review is powered by AI model, providing intelligent code analysis, security vulnerability detection, and improvement suggestions.
                </p>
                <div className="text-xs opacity-75">
                 
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleExportReport}
                    disabled={!analysisResult}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Report
                  </button>
                  <button className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Share with Team
                  </button>
                  <button className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Schedule Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CodeReview