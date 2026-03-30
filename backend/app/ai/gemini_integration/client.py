import google.generativeai as genai
from typing import Optional, Dict, Any
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiClient:
    """Client for interacting with Gemini AI API"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.model = None
        
        if self.api_key:
            self._initialize_client()
        else:
            logger.warning("Gemini API key not configured")
    
    def _initialize_client(self):
        """Initialize the Gemini client"""
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"Gemini client initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {str(e)}")
            self.model = None
    
    def is_available(self) -> bool:
        """Check if Gemini client is available"""
        return self.model is not None
    
    async def generate_content(self, prompt: str, **kwargs) -> Optional[str]:
        """
        Generate content using Gemini AI
        
        Args:
            prompt: The prompt to send to the model
            **kwargs: Additional parameters for generation
        
        Returns:
            Generated text or None if failed
        """
        if not self.model:
            logger.warning("Gemini model not available")
            return None
        
        try:
            # Configure generation parameters
            generation_config = {
                "temperature": kwargs.get("temperature", 0.7),
                "top_p": kwargs.get("top_p", 0.95),
                "top_k": kwargs.get("top_k", 40),
                "max_output_tokens": kwargs.get("max_output_tokens", 2048),
            }
            
            # Generate content
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Failed to generate content with Gemini: {str(e)}")
            return None
    
    async def analyze_code(self, code: str, language: str, analysis_type: str = "comprehensive") -> Dict[str, Any]:
        """
        Analyze code using Gemini AI
        
        Args:
            code: The code to analyze
            language: Programming language
            analysis_type: Type of analysis (comprehensive, security, performance, etc.)
        
        Returns:
            Analysis results
        """
        from app.ai.gemini_integration.prompts import get_analysis_prompt
        
        prompt = get_analysis_prompt(code, language, analysis_type)
        
        response = await self.generate_content(prompt, temperature=0.3)
        
        if not response:
            return self._get_default_analysis_result()
        
        # Parse the response
        return self._parse_analysis_response(response, code, language)
    
    async def explain_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Get code explanation from Gemini AI
        
        Args:
            code: The code to explain
            language: Programming language
        
        Returns:
            Code explanation
        """
        prompt = f"""Explain the following {language} code in detail:

{code}

Provide:
1. What the code does
2. Key functions/methods and their purposes
3. Any important algorithms or patterns used
4. Potential improvements or optimizations
5. Security considerations

Format the response in a clear, structured way."""

        response = await self.generate_content(prompt, temperature=0.2)
        
        if not response:
            return {"explanation": "Could not generate explanation. Gemini API might not be configured."}
        
        return {
            "explanation": response,
            "language": language,
            "code_length": len(code)
        }
    
    async def suggest_refactoring(self, code: str, language: str) -> Dict[str, Any]:
        """
        Suggest code refactoring improvements
        
        Args:
            code: The code to refactor
            language: Programming language
        
        Returns:
            Refactoring suggestions
        """
        prompt = f"""Analyze this {language} code and suggest refactoring improvements:

{code}

Focus on:
1. Code smells and anti-patterns
2. Improving readability and maintainability
3. Performance optimizations
4. Better error handling
5. Code organization

Provide specific suggestions with code examples where applicable."""

        response = await self.generate_content(prompt, temperature=0.4)
        
        if not response:
            return {"suggestions": ["Configure Gemini API for AI-powered refactoring suggestions"]}
        
        return {
            "suggestions": response.split('\n'),
            "original_code_length": len(code)
        }
    
    def _parse_analysis_response(self, response: str, code: str, language: str) -> Dict[str, Any]:
        """
        Parse Gemini analysis response into structured format
        """
        # Try to extract JSON from response
        import json
        import re
        
        # Look for JSON pattern in response
        json_pattern = r'\{.*\}'
        match = re.search(json_pattern, response, re.DOTALL)
        
        if match:
            try:
                json_str = match.group(0)
                parsed = json.loads(json_str)
                
                # Ensure required fields
                if "issues" not in parsed:
                    parsed["issues"] = []
                if "suggestions" not in parsed:
                    parsed["suggestions"] = []
                if "security_issues" not in parsed:
                    parsed["security_issues"] = []
                
                return parsed
            except json.JSONDecodeError:
                logger.warning("Could not parse JSON from Gemini response")
        
        # Fallback to text parsing
        return self._parse_text_response(response, code, language)
    
    def _parse_text_response(self, response: str, code: str, language: str) -> Dict[str, Any]:
        """
        Parse text response into structured format
        """
        lines = code.split('\n')
        
        return {
            "summary": self._extract_summary(response),
            "issues": self._extract_issues(response, lines),
            "suggestions": self._extract_suggestions(response),
            "security_issues": self._extract_security_issues(response, lines),
            "quality_score": self._estimate_quality_score(response),
            "complexity_rating": self._estimate_complexity(response),
            "analysis_text": response[:1000]  # Limit length
        }
    
    def _extract_summary(self, text: str) -> str:
        """Extract summary from analysis text"""
        sentences = text.split('.')
        if len(sentences) >= 3:
            return '.'.join(sentences[:3]) + '.'
        return text[:200] + '...' if len(text) > 200 else text
    
    def _extract_issues(self, text: str, code_lines: list) -> list:
        """Extract issues from analysis text"""
        issues = []
        
        # Look for issue patterns
        import re
        
        # Pattern for line-specific issues
        line_patterns = [
            r'line\s+(\d+).*?(error|warning|issue|problem)',
            r'at\s+line\s+(\d+).*?(error|warning)',
            r'line\s+(\d+):.*?',
        ]
        
        for pattern in line_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                line_num = int(match.group(1))
                if 1 <= line_num <= len(code_lines):
                    issues.append({
                        "line": line_num,
                        "message": match.group(0)[:100],
                        "severity": "warning" if "warning" in match.group(0).lower() else "error"
                    })
        
        return issues[:10]  # Limit to 10 issues
    
    def _extract_suggestions(self, text: str) -> list:
        """Extract suggestions from analysis text"""
        suggestions = []
        
        # Split by common suggestion indicators
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith(('-', '*', '•', '→', '✓', '▶')) or re.match(r'^\d+[\.\)]', line):
                suggestion = line.lstrip('-*•→✓▶ ').lstrip('0123456789.) ')
                if suggestion and len(suggestion) > 10:
                    suggestions.append(suggestion)
        
        # Fallback: split by sentences
        if not suggestions:
            sentences = re.split(r'[.!?]+', text)
            suggestions = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def _extract_security_issues(self, text: str, code_lines: list) -> list:
        """Extract security issues from analysis text"""
        security_issues = []
        
        security_keywords = [
            'security', 'vulnerability', 'injection', 'xss', 'csrf', 'sqli',
            'authentication', 'authorization', 'encryption', 'hashing',
            'secure', 'insecure', 'risk', 'threat', 'exploit'
        ]
        
        lines = text.split('\n')
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in security_keywords):
                security_issues.append({
                    "line": i + 1,
                    "message": line[:150],
                    "severity": "high" if any(word in line_lower for word in ['critical', 'high risk', 'severe']) else "medium"
                })
        
        return security_issues[:5]  # Limit to 5 security issues
    
    def _estimate_quality_score(self, text: str) -> float:
        """Estimate quality score from analysis text"""
        positive_words = ['good', 'excellent', 'well', 'proper', 'correct', 'clean', 'efficient']
        negative_words = ['bad', 'poor', 'issue', 'problem', 'error', 'warning', 'fix', 'improve']
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total = positive_count + negative_count
        if total == 0:
            return 75.0
        
        score = (positive_count / total) * 100
        return round(score, 1)
    
    def _estimate_complexity(self, text: str) -> str:
        """Estimate complexity from analysis text"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['very complex', 'highly complex', 'extremely complex', 'too complex']):
            return "high"
        elif any(word in text_lower for word in ['complex', 'complicated', 'difficult']):
            return "medium"
        elif any(word in text_lower for word in ['simple', 'straightforward', 'easy']):
            return "low"
        else:
            return "medium"
    
    def _get_default_analysis_result(self) -> Dict[str, Any]:
        """Get default analysis result when Gemini is unavailable"""
        return {
            "summary": "Basic code analysis completed. Configure Gemini API for AI-powered analysis.",
            "issues": [],
            "suggestions": [
                "Add comments to explain complex logic",
                "Consider breaking down large functions",
                "Add error handling for edge cases"
            ],
            "security_issues": [],
            "quality_score": 75.0,
            "complexity_rating": "medium",
            "analysis_text": "Gemini API not configured. Using basic analysis."
        }