"""
Response formatting utilities for AI analysis
"""
from typing import Dict, List, Any, Optional
import json


def format_analysis_response(
    analysis_type: str,
    raw_response: str,
    confidence_score: Optional[int] = None,
    issues_found: int = 0,
    suggestions_provided: int = 0
) -> Dict[str, Any]:
    """
    Format AI analysis response into a structured format
    
    Args:
        analysis_type: Type of analysis (security, quality, best_practices, etc.)
        raw_response: Raw text response from AI
        confidence_score: Confidence score 0-100
        issues_found: Number of issues found
        suggestions_provided: Number of suggestions provided
    
    Returns:
        Structured response dictionary
    """
    try:
        # Try to parse JSON if the response is JSON
        if raw_response.strip().startswith('{') or raw_response.strip().startswith('['):
            structured = json.loads(raw_response)
            return {
                "analysis_type": analysis_type,
                "structured_response": structured,
                "raw_response": raw_response,
                "confidence_score": confidence_score or _calculate_confidence_score(issues_found),
                "issues_found": issues_found,
                "suggestions_provided": suggestions_provided,
                "success": True
            }
    except json.JSONDecodeError:
        pass
    
    # If not JSON, create a structured format
    return {
        "analysis_type": analysis_type,
        "structured_response": {
            "summary": extract_summary(raw_response),
            "issues": extract_issues(raw_response),
            "suggestions": extract_suggestions(raw_response),
            "code_examples": extract_code_examples(raw_response)
        },
        "raw_response": raw_response,
        "confidence_score": confidence_score or _calculate_confidence_score(issues_found),
        "issues_found": issues_found,
        "suggestions_provided": suggestions_provided,
        "success": True
    }


def extract_summary(text: str, max_length: int = 200) -> str:
    """Extract a summary from the response text"""
    # Simple implementation - take first few sentences
    sentences = text.split('. ')
    if len(sentences) > 0:
        summary = sentences[0]
        if len(summary) > max_length:
            summary = summary[:max_length] + '...'
        return summary
    return text[:max_length] + '...' if len(text) > max_length else text


def extract_issues(text: str) -> List[Dict[str, str]]:
    """Extract issues from response text"""
    issues = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip().lower()
        if any(keyword in line for keyword in ['issue:', 'problem:', 'bug:', 'vulnerability:', 'error:', 'warning:']):
            # Clean up the line
            clean_line = line.replace('issue:', '').replace('problem:', '').replace('bug:', '').replace('vulnerability:', '').replace('error:', '').replace('warning:', '').strip()
            if clean_line and len(clean_line) > 10:  # Filter out very short lines
                severity = _determine_severity(line)
                issues.append({
                    "description": clean_line.capitalize(),
                    "severity": severity,
                    "line_reference": _extract_line_reference(line),
                    "category": _determine_category(line)
                })
    
    return issues[:10]  # Limit to 10 issues


def extract_suggestions(text: str) -> List[Dict[str, str]]:
    """Extract suggestions from response text"""
    suggestions = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip().lower()
        if any(keyword in line for keyword in ['suggestion:', 'recommendation:', 'fix:', 'improvement:', 'consider:', 'tip:']):
            # Clean up the line
            clean_line = line.replace('suggestion:', '').replace('recommendation:', '').replace('fix:', '').replace('improvement:', '').replace('consider:', '').replace('tip:', '').strip()
            if clean_line and len(clean_line) > 10:
                suggestions.append({
                    "description": clean_line.capitalize(),
                    "implementation": _extract_implementation_hint(line),
                    "priority": _determine_priority(line)
                })
    
    return suggestions[:10]  # Limit to 10 suggestions


def extract_code_examples(text: str) -> List[Dict[str, str]]:
    """Extract code examples from response text"""
    code_examples = []
    lines = text.split('\n')
    in_code_block = False
    current_code = []
    current_language = "python"
    
    for line in lines:
        if '```' in line:
            if in_code_block:
                # End of code block
                if current_code:
                    code_examples.append({
                        "language": current_language,
                        "code": '\n'.join(current_code),
                        "description": f"Code example {len(code_examples) + 1}"
                    })
                current_code = []
                in_code_block = False
            else:
                # Start of code block
                in_code_block = True
                # Try to detect language
                language_part = line.replace('```', '').strip()
                if language_part in ['python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'php']:
                    current_language = language_part
        elif in_code_block:
            current_code.append(line)
    
    return code_examples


def _calculate_confidence_score(issues_found: int) -> int:
    """Calculate confidence score based on issues found"""
    if issues_found == 0:
        return 95
    elif issues_found <= 3:
        return 85
    elif issues_found <= 7:
        return 75
    else:
        return 65


def _determine_severity(line: str) -> str:
    """Determine severity from text"""
    line_lower = line.lower()
    if any(word in line_lower for word in ['critical', 'severe', 'high risk', 'dangerous']):
        return "critical"
    elif any(word in line_lower for word in ['high', 'major', 'serious']):
        return "high"
    elif any(word in line_lower for word in ['medium', 'moderate']):
        return "medium"
    elif any(word in line_lower for word in ['low', 'minor', 'cosmetic']):
        return "low"
    else:
        return "info"


def _extract_line_reference(line: str) -> Optional[str]:
    """Extract line reference from text"""
    import re
    patterns = [
        r'line\s+(\d+)',
        r'lines?\s+(\d+-\d+)',
        r'at\s+line\s+(\d+)',
        r':(\d+):'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, line.lower())
        if match:
            return match.group(1)
    
    return None


def _determine_category(line: str) -> str:
    """Determine category from text"""
    line_lower = line.lower()
    categories = {
        'security': ['security', 'vulnerability', 'injection', 'xss', 'csrf', 'sqli', 'auth'],
        'performance': ['performance', 'slow', 'optimization', 'memory', 'cpu'],
        'quality': ['quality', 'readability', 'maintainability', 'complexity'],
        'bug': ['bug', 'error', 'exception', 'crash'],
        'best_practice': ['best practice', 'convention', 'standard', 'style guide']
    }
    
    for category, keywords in categories.items():
        if any(keyword in line_lower for keyword in keywords):
            return category
    
    return "general"


def _extract_implementation_hint(line: str) -> str:
    """Extract implementation hint from suggestion"""
    # Simple implementation - look for code-like patterns
    import re
    patterns = [
        r'use\s+([A-Za-z_][A-Za-z0-9_]*)',
        r'import\s+([A-Za-z_][A-Za-z0-9_]*)',
        r'function\s+([A-Za-z_][A-Za-z0-9_]*)',
        r'class\s+([A-Za-z_][A-Za-z0-9_]*)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, line.lower())
        if match:
            return f"Consider using {match.group(1)}"
    
    return "Review the code and apply the suggestion"


def _determine_priority(line: str) -> str:
    """Determine priority from suggestion"""
    line_lower = line.lower()
    if any(word in line_lower for word in ['high', 'urgent', 'immediately', 'critical']):
        return "high"
    elif any(word in line_lower for word in ['medium', 'soon', 'recommended']):
        return "medium"
    elif any(word in line_lower for word in ['low', 'optional', 'nice to have']):
        return "low"
    else:
        return "medium"