"""
Code analysis service using Gemini AI
"""
import asyncio
from typing import Dict, List, Any, Optional
import logging

from app.core.config import settings
from app.services.gemini_service import gemini_service
from app.services.security_analysis_service import SecurityAnalysisService

logger = logging.getLogger(__name__)


class CodeAnalysisService:
    """Service for analyzing code using AI"""
    
    def __init__(self):
        self.security_service = SecurityAnalysisService()
        logger.info("CodeAnalysisService initialized")
    
    async def analyze_code_security(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Analyze code for security vulnerabilities using Gemini + static rules
        """
        try:
            logger.info(f"Starting security analysis for {language} code")
            
            # Get Gemini analysis
            gemini_result = await gemini_service.analyze_security(code, language)
            
            # Get static analysis
            static_result = self.security_service.analyze_code(code, language)
            
            # Combine results
            all_issues = []
            all_issues.extend(gemini_result.get("issues", []))
            all_issues.extend(static_result.get("vulnerabilities", []))
            
            # Calculate combined score
            combined_score = (gemini_result.get("score", 70) + static_result.get("security_score", 70)) / 2
            
            # Structured result for security_issues JSON field
            security_issues = {
                "issues_found": len(all_issues),
                "issues": all_issues[:20],
                "score": round(combined_score, 1),
                "gemini_analysis": gemini_result,
                "static_analysis": {
                    "issues_found": static_result.get("security_issues_found", 0),
                    "security_score": static_result.get("security_score", 70)
                }
            }
            
            return {
                "analysis_type": "security",
                "issues_found": len(all_issues),
                "issues": all_issues[:20],
                "score": round(combined_score, 1),
                "security_issues_data": security_issues,  # For separate JSON field
                "gemini_analysis": gemini_result,
                "static_analysis": {
                    "issues_found": static_result.get("security_issues_found", 0),
                    "security_score": static_result.get("security_score", 70)
                },
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Security analysis failed: {str(e)}")
            return {
                "analysis_type": "security",
                "issues_found": 0,
                "issues": [],
                "score": 70,
                "error": str(e),
                "success": False
            }
    
    async def analyze_code_quality(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Analyze code quality using Gemini
        """
        try:
            logger.info(f"Starting quality analysis for {language} code")
            
            # Get Gemini analysis
            gemini_result = await gemini_service.analyze_quality(code, language)
            
            # Basic quality metrics
            lines = code.split('\n')
            line_count = len(lines)
            char_count = len(code)
            
            # Estimate function count
            function_patterns = {
                'python': r'def\s+\w+\s*\(',
                'javascript': r'function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(',
                'typescript': r'function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(',
                'java': r'(public|private|protected)?\s*\w+\s+\w+\s*\(',
                'default': r'\w+\s*\([^)]*\)\s*\{'
            }
            
            import re
            pattern = function_patterns.get(language, function_patterns['default'])
            function_count = len(re.findall(pattern, code))
            
            issues = gemini_result.get("issues", [])
            
            # Structured result for quality_metrics JSON field
            quality_metrics = {
                "issues_found": len(issues),
                "issues": issues[:15],
                "score": gemini_result.get("score", 72),
                "metrics": {
                    "lines_of_code": line_count,
                    "characters": char_count,
                    "functions": function_count,
                    "complexity": "medium" if line_count > 50 else "low"
                }
            }
            
            return {
                "analysis_type": "quality",
                "issues_found": len(issues),
                "issues": issues[:15],
                "score": gemini_result.get("score", 72),
                "quality_metrics_data": quality_metrics,  # For separate JSON field
                "metrics": {
                    "lines_of_code": line_count,
                    "characters": char_count,
                    "functions": function_count,
                    "complexity": "medium" if line_count > 50 else "low"
                },
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Quality analysis failed: {str(e)}")
            return {
                "analysis_type": "quality",
                "issues_found": 0,
                "issues": [],
                "score": 70,
                "metrics": {
                    "lines_of_code": len(code.split('\n')),
                    "characters": len(code),
                    "functions": 0
                },
                "error": str(e),
                "success": False
            }
    
    async def analyze_code_complexity(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Analyze code complexity
        """
        try:
            lines = code.split('\n')
            line_count = len(lines)
            
            # Simple complexity estimation
            if line_count < 20:
                complexity_rating = "low"
                complexity_score = 20
            elif line_count < 50:
                complexity_rating = "medium"
                complexity_score = 50
            elif line_count < 100:
                complexity_rating = "high"
                complexity_score = 75
            else:
                complexity_rating = "very high"
                complexity_score = 90
            
            # Count nested structures
            indent_count = 0
            for line in lines:
                if line.strip().startswith(('if ', 'for ', 'while ', 'def ', 'class ')):
                    indent_count += 1
            
            return {
                "analysis_type": "complexity",
                "rating": complexity_rating,
                "score": complexity_score,
                "metrics": {
                    "lines": line_count,
                    "control_structures": indent_count,
                    "estimated_cyclomatic": min(indent_count + 5, 30)
                },
                "suggestions": self._get_complexity_suggestions(complexity_rating),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Complexity analysis failed: {str(e)}")
            return {
                "analysis_type": "complexity",
                "rating": "medium",
                "score": 50,
                "error": str(e),
                "success": False
            }
    
    async def get_code_suggestions(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Get improvement suggestions for code
        """
        try:
            logger.info(f"Getting suggestions for {language} code")
            
            # Get suggestions from Gemini
            suggestions = await gemini_service.suggest_improvements(code, language)
            
            # Format suggestions
            formatted_suggestions = []
            for i, suggestion in enumerate(suggestions):
                formatted_suggestions.append({
                    "id": f"sug-{i}",
                    "type": "improvement",
                    "title": f"Suggestion {i+1}",
                    "description": suggestion,
                    "impact": "medium"
                })
            
            # Structured result for suggestions JSON field
            suggestions_data = {
                "suggestions_provided": len(formatted_suggestions),
                "items": formatted_suggestions[:10]
            }
            
            return {
                "analysis_type": "suggestions",
                "suggestions_provided": len(formatted_suggestions),
                "items": formatted_suggestions[:10],
                "suggestions_data": suggestions_data,  # For separate JSON field
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Suggestions failed: {str(e)}")
            fallback_suggestions = {
                "suggestions_provided": 3,
                "items": [
                    {
                        "id": "sug-1",
                        "type": "improvement",
                        "title": "Add Comments",
                        "description": "Add comments to explain complex logic",
                        "impact": "low"
                    },
                    {
                        "id": "sug-2",
                        "type": "improvement",
                        "title": "Error Handling",
                        "description": "Add try-catch blocks for error handling",
                        "impact": "medium"
                    },
                    {
                        "id": "sug-3",
                        "type": "improvement",
                        "title": "Input Validation",
                        "description": "Validate function inputs",
                        "impact": "high"
                    }
                ]
            }
            
            return {
                "analysis_type": "suggestions",
                "suggestions_provided": 3,
                "items": fallback_suggestions["items"],
                "suggestions_data": fallback_suggestions,
                "success": False,
                "error": str(e)
            }
    
    async def comprehensive_analysis(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Perform comprehensive code analysis using all methods
        """
        try:
            logger.info(f"Starting comprehensive analysis for {language} code")
            
            # Run all analyses in parallel
            tasks = [
                self.analyze_code_security(code, language),
                self.analyze_code_quality(code, language),
                self.analyze_code_complexity(code, language),
                self.get_code_suggestions(code, language)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            security_result = results[0] if not isinstance(results[0], Exception) else {"score": 70, "issues": [], "security_issues_data": {}}
            quality_result = results[1] if not isinstance(results[1], Exception) else {"score": 70, "issues": [], "quality_metrics_data": {}}
            complexity_result = results[2] if not isinstance(results[2], Exception) else {"rating": "medium", "score": 50}
            suggestions_result = results[3] if not isinstance(results[3], Exception) else {"items": [], "suggestions_data": {}}
            
            # Calculate overall score
            overall_score = (
                security_result.get("score", 70) * 0.4 +
                quality_result.get("score", 70) * 0.3 +
                (100 - complexity_result.get("score", 50)) * 0.3
            )
            
            # Count total issues
            total_issues = (
                security_result.get("issues_found", 0) +
                quality_result.get("issues_found", 0)
            )
            
            # Generate summary
            if total_issues == 0:
                summary = "Code looks good! No major issues found."
            elif total_issues < 3:
                summary = f"Found {total_issues} minor issues. Consider reviewing them."
            elif total_issues < 7:
                summary = f"Found {total_issues} issues that need attention."
            else:
                summary = f"Found {total_issues} issues. Major refactoring recommended."
            
            return {
                "overall_score": round(overall_score, 1),
                "summary": summary,
                "total_issues": total_issues,
                "security": security_result,
                "quality": quality_result,
                "complexity": complexity_result,
                "suggestions": suggestions_result,
                # Data for separate JSON fields
                "security_issues_data": security_result.get("security_issues_data", {}),
                "quality_metrics_data": quality_result.get("quality_metrics_data", {}),
                "suggestions_data": suggestions_result.get("suggestions_data", {}),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {str(e)}")
            return {
                "overall_score": 70,
                "summary": "Analysis completed with limited results",
                "total_issues": 0,
                "security": {"score": 70, "issues": []},
                "quality": {"score": 70, "issues": []},
                "complexity": {"rating": "medium", "score": 50},
                "suggestions": {"items": []},
                "security_issues_data": {},
                "quality_metrics_data": {},
                "suggestions_data": {},
                "success": False,
                "error": str(e)
            }
    
    def _get_complexity_suggestions(self, rating: str) -> List[str]:
        """Get suggestions based on complexity rating"""
        suggestions = {
            "low": [
                "Code is well-structured and easy to understand",
                "Consider adding comments for key functions"
            ],
            "medium": [
                "Consider breaking down large functions",
                "Use early returns to reduce nesting",
                "Extract repeated logic into helper functions"
            ],
            "high": [
                "Strongly consider refactoring this code",
                "Break into smaller, focused functions",
                "Reduce nested conditionals",
                "Use design patterns to simplify structure"
            ],
            "very high": [
                "URGENT: This code needs significant refactoring",
                "Split into multiple modules",
                "Consider complete rewrite of complex sections",
                "Add extensive documentation"
            ]
        }
        return suggestions.get(rating, suggestions["medium"])


# Singleton instance
code_analysis_service = CodeAnalysisService()