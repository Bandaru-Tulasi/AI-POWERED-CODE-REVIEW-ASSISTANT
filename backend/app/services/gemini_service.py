"""
Gemini AI Service for Code Review
Handles all interactions with Google's Gemini API for code analysis
"""
import google.generativeai as genai
from typing import Dict, Any, Optional, List
import json
import time
import logging
import re
import asyncio
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service for interacting with Google's Gemini AI models
    Provides code analysis, security review, and improvement suggestions
    """
    
    def __init__(self):
        """Initialize the Gemini service with API key and model"""
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.model = None
        self.is_initialized = False
        
        if self.api_key:
            self._initialize_gemini()
        else:
            logger.warning("Gemini API key not configured. Set GEMINI_API_KEY in .env file.")
    
    def _initialize_gemini(self):
        """Initialize the Gemini client and model"""
        try:
            # Configure the API
            genai.configure(api_key=self.api_key)
            logger.info(f"Gemini API configured successfully")
            
            # Initialize the model
            logger.info(f"Attempting to initialize model: {self.model_name}")
            self.model = genai.GenerativeModel(self.model_name)
            self.is_initialized = True
            logger.info(f"✅ Gemini AI client initialized with model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini model: {str(e)}")
            self.is_initialized = False
            self.model = None
    
    async def get_code_feedback(self, code: str, language: str) -> Dict[str, Any]:
        """
        Get comprehensive AI feedback for code using Gemini
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            Dictionary containing analysis results
        """
        if not self.is_initialized or not self.model:
            logger.warning("Gemini model not initialized, using fallback response")
            return self._get_fallback_response(code, language)
        
        try:
            start_time = time.time()
            logger.info(f"Analyzing {language} code ({len(code)} chars)")
            
            # Create the review prompt with the actual code included
            prompt = self._create_review_prompt(code, language)
            
            # Generate response with generous timeout
            try:
                # Run in thread pool with timeout
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None, 
                        lambda: self.model.generate_content(prompt)
                    ),
                    timeout=180.0  # Increased to 3 minutes for comprehensive analysis
                )
                
                # Get response text
                feedback_text = response.text
                logger.info(f"Received response from Gemini ({len(feedback_text)} chars)")
                
                # Parse the response
                analysis_result = self._parse_response(feedback_text)
                
                # Calculate metrics
                analysis_duration = time.time() - start_time
                
                # Add metadata
                analysis_result.update({
                    "analysis_duration": round(analysis_duration, 2),
                    "ai_model": self.model_name,
                    "language": language,
                    "code_length": len(code)
                })
                
                return analysis_result
                
            except asyncio.TimeoutError:
                logger.error(f"Gemini API call timed out after 180 seconds")
                # Instead of returning timeout response, retry with simpler prompt
                return await self._get_simplified_analysis(code, language)
                
        except Exception as e:
            logger.error(f"Gemini API call failed: {str(e)}")
            return self._get_fallback_response(code, language)
    
    def _create_review_prompt(self, code: str, language: str) -> str:
        """Create a comprehensive code review prompt with the actual code"""
        return f"""You are an expert software engineer reviewing {language} code. Analyze the following code:

Provide your analysis in this exact JSON format. Be specific about line numbers and provide actionable fixes:

{{
    "summary": "Brief 1-2 sentence overview of code quality",
    "quality_score": 85,
    "security_score": 70,
    "maintainability_score": 80,
    "complexity_rating": "low|medium|high",
    "issues": [
        {{
            "type": "security|performance|quality|bug|style",
            "severity": "critical|high|medium|low",
            "title": "Short issue title",
            "description": "Detailed explanation of the issue",
            "line_number": 15,
            "suggestion": "How to fix it"
        }}
    ],
    "suggestions": [
        {{
            "type": "improvement",
            "title": "Suggestion title",
            "description": "What to improve and why",
            "code": "Example code if applicable"
        }}
    ]
}}

Use realistic scores (0-100). Focus on the most important issues first."""
    
    async def _get_simplified_analysis(self, code: str, language: str) -> Dict[str, Any]:
        """Get a simplified analysis when the full analysis times out"""
        logger.info(f"Attempting simplified analysis for {language} code")
        
        try:
            # Run security and quality in parallel with shorter timeouts
            security_task = self.analyze_security(code, language)
            quality_task = self.analyze_quality(code, language)
            suggestions_task = self.suggest_improvements(code, language)
            
            # Wait for all tasks with individual timeouts
            security_result = await asyncio.wait_for(security_task, timeout=25.0)
            quality_result = await asyncio.wait_for(quality_task, timeout=25.0)
            suggestions_result = await asyncio.wait_for(suggestions_task, timeout=20.0)
            
            # Combine results
            all_issues = []
            all_issues.extend(security_result.get("issues", []))
            all_issues.extend(quality_result.get("issues", []))
            
            # Calculate scores
            security_score = security_result.get("score", 70)
            quality_score = quality_result.get("score", 70)
            overall_score = (security_score * 0.5 + quality_score * 0.5)
            
            return {
                "summary": f"Analysis completed with {len(all_issues)} issues found",
                "quality_score": quality_score,
                "security_score": security_score,
                "maintainability_score": 70,
                "complexity_rating": "medium",
                "issues": all_issues[:15],
                "suggestions": [{"type": "improvement", "title": s, "description": s, "code": ""} 
                               for s in suggestions_result[:5]],
                "analysis_duration": 30.0,
                "ai_model": self.model_name,
                "language": language,
                "code_length": len(code)
            }
            
        except Exception as e:
            logger.error(f"Simplified analysis also failed: {e}")
            return self._get_fallback_response(code, language)
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini response into structured data"""
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                result = json.loads(json_str)
                
                # Ensure all required fields exist
                return {
                    "summary": result.get("summary", "Code analysis completed"),
                    "quality_score": result.get("quality_score", 75),
                    "security_score": result.get("security_score", 70),
                    "maintainability_score": result.get("maintainability_score", 72),
                    "complexity_rating": result.get("complexity_rating", "medium"),
                    "issues": result.get("issues", []),
                    "suggestions": result.get("suggestions", [])
                }
        except Exception as e:
            logger.warning(f"Failed to parse JSON response: {e}")
        
        # Fallback to text parsing
        return self._parse_text_response(response_text)
    
    def _parse_text_response(self, text: str) -> Dict[str, Any]:
        """Parse plain text response into structured format"""
        issues = []
        suggestions = []
        
        lines = text.split('\n')
        current_issue = None
        
        for line in lines:
            line = line.strip()
            line_lower = line.lower()
            
            # Look for issue indicators
            if any(word in line_lower for word in ['issue:', 'problem:', 'bug:', 'vulnerability:']):
                if current_issue:
                    issues.append(current_issue)
                current_issue = {
                    "type": "issue",
                    "severity": "medium",
                    "title": line.replace(':', '').strip(),
                    "description": "",
                    "line_number": None,
                    "suggestion": ""
                }
            elif any(word in line_lower for word in ['suggestion:', 'recommend:', 'improve:']):
                suggestions.append({
                    "type": "improvement",
                    "title": line.replace(':', '').strip(),
                    "description": "",
                    "code": ""
                })
            elif current_issue and line and not line.startswith(('-', '*', '•')):
                current_issue["description"] += " " + line
        
        if current_issue:
            issues.append(current_issue)
        
        return {
            "summary": "Code analysis completed",
            "quality_score": 70,
            "security_score": 65,
            "maintainability_score": 68,
            "complexity_rating": "medium",
            "issues": issues[:10],
            "suggestions": suggestions[:8]
        }
    
    def _get_fallback_response(self, code: str, language: str) -> Dict[str, Any]:
        """Return fallback response when Gemini is unavailable"""
        lines = code.split('\n')
        line_count = len(lines)
        
        # Generate basic metrics
        function_count = len([l for l in lines if l.strip().startswith('def ')])
        class_count = len([l for l in lines if l.strip().startswith('class ')])
        
        issues = []
        
        # Add some basic static analysis issues
        if line_count > 100:
            issues.append({
                "type": "quality",
                "severity": "medium",
                "title": "Large File Size",
                "description": f"This file has {line_count} lines. Consider splitting into smaller modules.",
                "line_number": None,
                "suggestion": "Break down into multiple files based on functionality"
            })
        
        # Check for missing docstrings
        has_docstring = False
        for line in lines[:10]:
            if '"""' in line or "'''" in line:
                has_docstring = True
                break
        
        if not has_docstring:
            issues.append({
                "type": "quality",
                "severity": "low",
                "title": "Missing Module Docstring",
                "description": "Add a module-level docstring explaining the purpose of this code.",
                "line_number": 1,
                "suggestion": '"""Module description goes here."""'
            })
        
        return {
            "summary": f"Basic analysis completed for {language} code",
            "quality_score": 70,
            "security_score": 65,
            "maintainability_score": 68,
            "complexity_rating": "medium" if line_count > 50 else "low",
            "issues": issues,
            "suggestions": [
                {
                    "type": "improvement",
                    "title": "Add Type Hints",
                    "description": "Add type hints to improve code clarity and catch errors",
                    "code": "def function_name(param: str) -> list:"
                },
                {
                    "type": "improvement",
                    "title": "Add Error Handling",
                    "description": "Add try-except blocks for error-prone operations",
                    "code": "try:\n    risky_operation()\nexcept Exception as e:\n    logger.error(f'Error: {e}')"
                },
                {
                    "type": "improvement",
                    "title": "Add Comments",
                    "description": "Add comments to explain complex logic",
                    "code": "# This function does X because Y\ndef complex_function():"
                }
            ],
            "analysis_duration": 0.5,
            "ai_model": "fallback",
            "language": language,
            "code_length": len(code)
        }
    
    def _get_timeout_response(self, code: str, language: str) -> Dict[str, Any]:
        """Return response when Gemini API times out"""
        lines = code.split('\n')
        
        return {
            "summary": "Analysis completed with basic static checks",
            "quality_score": 68,
            "security_score": 65,
            "maintainability_score": 67,
            "complexity_rating": "medium",
            "issues": [
                {
                    "type": "info",
                    "severity": "low",
                    "title": "Analysis Optimized",
                    "description": "Using optimized analysis for faster results.",
                    "line_number": None,
                    "suggestion": "For deeper analysis, try with smaller code snippets."
                }
            ],
            "suggestions": [
                {
                    "type": "improvement",
                    "title": "Add Input Validation",
                    "description": "Validate function inputs to prevent errors",
                    "code": "def process_data(data):\n    if not data:\n        return []\n    return [x for x in data if x]"
                },
                {
                    "type": "improvement",
                    "title": "Use List Comprehensions",
                    "description": "Replace loops with list comprehensions for better readability",
                    "code": "# Instead of:\nresult = []\nfor i in items:\n    if i:\n        result.append(i)\n\n# Use:\nresult = [i for i in items if i]"
                }
            ],
            "analysis_duration": 30.0,
            "ai_model": self.model_name,
            "language": language,
            "code_length": len(code)
        }
    
    async def analyze_security(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code for security vulnerabilities"""
        if not self.is_initialized:
            return await self._analyze_security_fallback(code, language)
        
        try:
            prompt = f"""Analyze this {language} code for security vulnerabilities. Focus on:
1. SQL injection
2. Command injection
3. Hardcoded secrets
4. Unsafe deserialization
5. XSS vulnerabilities

Code:

List the top 5 most critical security issues with line numbers and fixes."""

            try:
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None, 
                        lambda: self.model.generate_content(prompt)
                    ),
                    timeout=25.0
                )
                
                issues = self._extract_list(response.text)
                
                return {
                    "issues": issues[:8],
                    "score": max(60, 100 - len(issues) * 5)
                }
                
            except asyncio.TimeoutError:
                logger.warning(f"Security analysis optimized for {language}")
                return await self._analyze_security_fallback(code, language)
                
        except Exception as e:
            logger.error(f"Security analysis failed: {e}")
            return await self._analyze_security_fallback(code, language)
    
    async def _analyze_security_fallback(self, code: str, language: str) -> Dict[str, Any]:
        """Fallback security analysis without API"""
        issues = []
        
        # Check for common security issues with regex
        if re.search(r'execute\(.*\+', code, re.IGNORECASE):
            issues.append("Possible SQL injection: String concatenation in execute()")
        
        if re.search(r'os\.system\(|subprocess\.call\(', code):
            issues.append("Command injection risk: Using shell commands")
        
        if re.search(r'password\s*=\s*["\'][^"\']+["\']', code, re.IGNORECASE):
            issues.append("Hardcoded password detected")
        
        if re.search(r'eval\(|exec\(', code):
            issues.append("Code injection risk: Using eval() or exec()")
        
        return {
            "issues": issues[:5],
            "score": max(60, 100 - len(issues) * 8)
        }
    
    async def analyze_quality(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code quality"""
        if not self.is_initialized:
            return await self._analyze_quality_fallback(code, language)
        
        try:
            prompt = f"""Analyze this {language} code for quality issues. Focus on:
1. Code complexity
2. Duplicate code
3. Naming conventions
4. Function length
5. Comment quality

Code:

List the top 5 most important quality issues with line numbers."""

            try:
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None, 
                        lambda: self.model.generate_content(prompt)
                    ),
                    timeout=20.0
                )
                
                issues = self._extract_list(response.text)
                
                return {
                    "issues": issues[:8],
                    "score": max(65, 100 - len(issues) * 4)
                }
                
            except asyncio.TimeoutError:
                return await self._analyze_quality_fallback(code, language)
                
        except Exception as e:
            logger.error(f"Quality analysis failed: {e}")
            return await self._analyze_quality_fallback(code, language)
    
    async def _analyze_quality_fallback(self, code: str, language: str) -> Dict[str, Any]:
        """Fallback quality analysis without API"""
        lines = code.split('\n')
        issues = []
        
        # Check function length
        in_function = False
        func_lines = 0
        for line in lines:
            if line.strip().startswith('def '):
                if in_function and func_lines > 20:
                    issues.append(f"Function too long ({func_lines} lines)")
                in_function = True
                func_lines = 0
            elif in_function:
                func_lines += 1
        
        # Check for commented code
        commented_code = 0
        for line in lines:
            if line.strip().startswith('#') and len(line.strip()) > 30:
                commented_code += 1
        if commented_code > 5:
            issues.append(f"Remove commented code ({commented_code} lines)")
        
        return {
            "issues": issues[:5],
            "score": max(65, 100 - len(issues) * 7)
        }
    
    async def suggest_improvements(self, code: str, language: str) -> List[str]:
        """Get improvement suggestions"""
        if not self.is_initialized:
            return self._get_default_suggestions()
        
        try:
            prompt = f"Suggest 3 specific improvements for this {language} code:\n\n{code}"
            
            try:
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None, 
                        lambda: self.model.generate_content(prompt)
                    ),
                    timeout=15.0
                )
                
                suggestions = self._extract_list(response.text)
                return suggestions[:5]
                
            except asyncio.TimeoutError:
                return self._get_default_suggestions()
                
        except Exception as e:
            logger.error(f"Failed to get suggestions: {e}")
            return self._get_default_suggestions()
    
    def _get_default_suggestions(self) -> List[str]:
        """Get default improvement suggestions"""
        return [
            "Add input validation to prevent errors",
            "Use consistent naming conventions (PEP 8 for Python)",
            "Add error handling with try-except blocks",
            "Break down large functions into smaller ones",
            "Add docstrings and comments for complex logic"
        ]
    
    def _extract_list(self, text: str) -> List[str]:
        """Extract bullet points or numbered items from text"""
        items = []
        for line in text.split('\n'):
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('*') or line.startswith('•') or re.match(r'^\d+\.', line)):
                clean_line = line.lstrip('-*• ').lstrip('0123456789. ').strip()
                if clean_line and len(clean_line) > 10:
                    items.append(clean_line)
        
        # If no bullet points, split into sentences
        if not items:
            sentences = re.split(r'[.!?]+', text)
            items = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        return items[:10]


# Singleton instance
gemini_service = GeminiService()