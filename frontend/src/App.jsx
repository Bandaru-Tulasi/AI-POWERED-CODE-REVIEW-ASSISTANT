import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:8000/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus('connected')
        setApiStatus(data)
      })
      .catch(error => {
        console.error('Backend connection failed:', error)
        setBackendStatus('disconnected')
      })
  }, [])

  const handleQuickStart = () => {
    navigate('/login')
  }

  const handleLearnMore = () => {
    navigate('/register')
  }

  return (
    <div className="app">
      {/* Modern Navigation */}
      <nav className="modern-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="brand-text">CodeReview AI</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="nav-btn-primary" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="badge">AI-Powered</div>
            <h1 className="hero-title">
              Transform Your Code Reviews with
              <span className="gradient-text"> Artificial Intelligence</span>
            </h1>
            <p className="hero-description">
              Automate code analysis, detect security vulnerabilities, and improve code quality 
              with our intelligent AI assistant. Save up to 35% of review time while enhancing accuracy.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-lg" onClick={handleQuickStart}>
                Start Free Trial
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-preview">
              <div className="code-header">
                <div className="code-dots">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
                <span className="code-filename">example.py - AI Review</span>
              </div>
              <div className="code-content">
                <pre><code>{`def calculate_total(items):
    """AI detected: Missing input validation"""
    total = 0
    for item in items:
        # Security: Direct access without validation
        total += item.get('price', 0) * item.get('quantity', 0)
    return total

# AI Suggestion: Add validation
def calculate_total_safe(items):
    if not isinstance(items, list):
        raise TypeError("items must be a list")
    return sum(item.get('price', 0) * item.get('quantity', 0) 
               for item in items if isinstance(item, dict))`}</code></pre>
              </div>
              <div className="ai-suggestion">
                <div className="ai-icon">🤖</div>
                <div className="suggestion-text">
                  <strong>AI Suggestion:</strong> Add input validation and use list comprehension for better performance
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose CodeReview AI?</h2>
          <p className="section-subtitle">Powerful features designed for modern development teams</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="feature-title">Security First</h3>
            <p className="feature-description">
              Detect security vulnerabilities, injection risks, and data leaks before they reach production
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Review code in seconds, not hours. Get instant feedback on every commit and pull request
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="feature-title">Team Collaboration</h3>
            <p className="feature-description">
              Share reviews, comment on suggestions, and maintain consistency across your entire team
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="feature-title">Advanced Analytics</h3>
            <p className="feature-description">
              Track code quality trends, team performance, and improvement metrics over time
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">35%</div>
            <div className="stat-label">Faster Reviews</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99%</div>
            <div className="stat-label">Issue Detection</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">AI Availability</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Languages</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Code Reviews?</h2>
          <p className="cta-description">
            Join thousands of developers who trust AI to improve their code quality
          </p>
          <button className="btn-primary-xl" onClick={() => navigate('/register')}>
            Start Free Trial
            <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-icon">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="brand-text">CodeReview AI</span>
            <p className="footer-tagline">Intelligent code analysis for modern teams</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#" onClick={() => navigate('/features')}>Features</a>
              <a href="#" onClick={() => navigate('/pricing')}>Pricing</a>
              <a href="#" onClick={() => navigate('/api')}>API</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#" onClick={() => navigate('/about')}>About</a>
              <a href="#" onClick={() => navigate('/blog')}>Blog</a>
              <a href="#" onClick={() => navigate('/careers')}>Careers</a>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="#" onClick={() => navigate('/help')}>Help Center</a>
              <a href="#" onClick={() => navigate('/contact')}>Contact</a>
              <a href="#" onClick={() => navigate('/status')}>Status</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 CodeReview AI. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#" onClick={() => navigate('/privacy')}>Privacy Policy</a>
            <a href="#" onClick={() => navigate('/terms')}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App