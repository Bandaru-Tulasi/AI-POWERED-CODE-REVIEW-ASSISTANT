import re
import ast
import math
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class CodeAnalyzer:
    """
    Analyzes code for quality metrics, complexity, and issues
    """
    
    def __init__(self):
        self.language_rules = self._load_language_rules()
    
    def _load_language_rules(self) -> Dict[str, Dict[str, Any]]:
        """
        Load analysis rules for different programming languages
        """
        return {
            "python": {
                "extensions": [".py"],
                "complexity_weights": {
                    "function": 10,
                    "class": 20,
                    "nested_block": 5,
                    "condition": 3,
                    "loop": 5
                },
                "quality_rules": [
                    {
                        "pattern": r"except\s*:",
                        "description": "Bare except clause",
                        "severity": "warning",
                        "fix": "Use specific exception types"
                    },
                    {
                        "pattern": r"print\(",
                        "description": "Debug print statement in production code",
                        "severity": "info",
                        "fix": "Use logging module instead"
                    },
                    {
                        "pattern": r"eval\(",
                        "description": "Use of eval() function",
                        "severity": "error",
                        "fix": "Avoid eval(), use safer alternatives"
                    },
                    {
                        "pattern": r"assert\s+.*in\s+production",
                        "description": "Assert in production code",
                        "severity": "warning",
                        "fix": "Remove assert or handle properly"
                    }
                ]
            },
            "javascript": {
                "extensions": [".js", ".jsx"],
                "complexity_weights": {
                    "function": 10,
                    "class": 20,
                    "nested_block": 5,
                    "condition": 3,
                    "loop": 5
                },
                "quality_rules": [
                    {
                        "pattern": r"console\.log\(",
                        "description": "Debug console.log in production code",
                        "severity": "info",
                        "fix": "Remove or use proper logging"
                    },
                    {
                        "pattern": r"eval\(",
                        "description": "Use of eval() function",
                        "severity": "error",
                        "fix": "Avoid eval(), use JSON.parse with validation"
                    },
                    {
                        "pattern": r"==\s+null",
                        "description": "Loose equality with null/undefined",
                        "severity": "warning",
                        "fix": "Use === for strict equality"
                    },
                    {
                        "pattern": r"var\s+\w+",
                        "description": "Use of var instead of let/const",
                        "severity": "warning",
                        "fix": "Use let or const instead of var"
                    }
                ]
            },
            "java": {
                "extensions": [".java"],
                "complexity_weights": {
                    "method": 10,
                    "class": 20,
                    "nested_block": 5,
                    "condition": 3,
                    "loop": 5
                },
                "quality_rules": [
                    {
                        "pattern": r"System\.out\.print",
                        "description": "Debug print in production code",
                        "severity": "info",
                        "fix": "Use logging framework"
                    },
                    {
                        "pattern": r"catch\s*\(\s*Exception\s+e\s*\)",
                        "description": "Catching generic Exception",
                        "severity": "warning",
                        "fix": "Catch specific exceptions"
                    },
                    {
                        "pattern": r"==\s+for\s+String",
                        "description": "Using == for String comparison",
                        "severity": "error",
                        "fix": "Use .equals() for String comparison"
                    }
                ]
            }
        }
    
    def analyze(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze code for various quality metrics
        
        Args:
            code: The code to analyze
            language: Programming language
        
        Returns:
            Analysis results
        """
        try:
            lines = code.split('\n')
            lines_of_code = len(lines)
            
            # Basic metrics
            metrics = self._calculate_basic_metrics(code, lines)
            
            # Language-specific analysis
            language_analysis = self._analyze_language_specific(code, language, lines)
            
            # Complexity analysis
            complexity = self._calculate_complexity(code, language)
            
            # Quality issues
            quality_issues = self._detect_quality_issues(code, language, lines)
            
            # Calculate overall quality score
            quality_score = self._calculate_quality_score(
                metrics, language_analysis, complexity, quality_issues
            )
            
            # Calculate maintainability score
            maintainability_score = self._calculate_maintainability_score(
                metrics, complexity, quality_issues
            )
            
            return {
                "quality_score": round(quality_score, 1),
                "maintainability_score": round(maintainability_score, 1),
                "complexity_score": complexity["total"],
                "complexity_rating": complexity["rating"],
                "lines_of_code": lines_of_code,
                "issues": quality_issues,
                "metrics": metrics,
                "technical_debt": self._calculate_technical_debt(quality_issues, complexity),
                "analysis_details": {
                    "language": language,
                    "has_comments": metrics["comment_ratio"] > 0.1,
                    "has_functions": metrics["function_count"] > 0,
                    "has_classes": metrics["class_count"] > 0
                }
            }
            
        except Exception as e:
            logger.error(f"Code analysis failed: {str(e)}")
            return self._get_default_analysis_result(code, language)
    
    def _calculate_basic_metrics(self, code: str, lines: List[str]) -> Dict[str, Any]:
        """
        Calculate basic code metrics
        """
        # Count lines
        total_lines = len(lines)
        blank_lines = sum(1 for line in lines if not line.strip())
        code_lines = total_lines - blank_lines
        
        # Count comments
        comment_lines = 0
        in_block_comment = False
        
        for line in lines:
            line_stripped = line.strip()
            
            # Handle block comments
            if in_block_comment:
                comment_lines += 1
                if '*/' in line_stripped:
                    in_block_comment = False
                continue
            
            # Check for block comment start
            if line_stripped.startswith('/*'):
                comment_lines += 1
                in_block_comment = True
                if '*/' in line_stripped:
                    in_block_comment = False
                continue
            
            # Check for line comments
            if line_stripped.startswith(('//', '#', '--')):
                comment_lines += 1
            elif '//' in line_stripped or '#' in line_stripped:
                # Mixed line with code and comment
                comment_lines += 1
        
        # Count functions/methods
        function_patterns = [
            r'def\s+\w+\s*\(',
            r'function\s+\w+\s*\(',
            r'\w+\s*\(.*\)\s*\{',
            r'public|private|protected\s+\w+\s+\w+\s*\(.*\)'
        ]
        
        function_count = 0
        for pattern in function_patterns:
            function_count += len(re.findall(pattern, code, re.MULTILINE))
        
        # Count classes
        class_patterns = [
            r'class\s+\w+',
            r'interface\s+\w+',
            r'struct\s+\w+'
        ]
        
        class_count = 0
        for pattern in class_patterns:
            class_count += len(re.findall(pattern, code, re.MULTILINE))
        
        # Calculate ratios
        comment_ratio = comment_lines / total_lines if total_lines > 0 else 0
        code_to_comment_ratio = code_lines / comment_lines if comment_lines > 0 else float('inf')
        
        return {
            "total_lines": total_lines,
            "code_lines": code_lines,
            "blank_lines": blank_lines,
            "comment_lines": comment_lines,
            "comment_ratio": round(comment_ratio, 3),
            "code_to_comment_ratio": round(code_to_comment_ratio, 2),
            "function_count": function_count,
            "class_count": class_count
        }
    
    def _analyze_language_specific(self, code: str, language: str, lines: List[str]) -> Dict[str, Any]:
        """
        Perform language-specific analysis
        """
        if language.lower() == "python":
            return self._analyze_python(code, lines)
        elif language.lower() == "javascript":
            return self._analyze_javascript(code, lines)
        elif language.lower() == "java":
            return self._analyze_java(code, lines)
        else:
            return {"language_support": "basic", "warnings": ["Limited language-specific analysis"]}
    
    def _analyze_python(self, code: str, lines: List[str]) -> Dict[str, Any]:
        """
        Python-specific analysis using AST
        """
        try:
            tree = ast.parse(code)
            
            issues = []
            warnings = []
            
            # Analyze imports
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ""
                    for alias in node.names:
                        imports.append(f"{module}.{alias.name}")
            
            # Check for wildcard imports
            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom):
                    for alias in node.names:
                        if alias.name == "*":
                            issues.append({
                                "type": "style",
                                "message": "Wildcard import detected",
                                "severity": "warning",
                                "line": node.lineno
                            })
            
            # Check function definitions
            functions = []
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    functions.append({
                        "name": node.name,
                        "line": node.lineno,
                        "args": len(node.args.args),
                        "has_docstring": ast.get_docstring(node) is not None
                    })
                    
                    # Check for long functions
                    if node.end_lineno and node.lineno:
                        function_length = node.end_lineno - node.lineno
                        if function_length > 50:
                            issues.append({
                                "type": "complexity",
                                "message": f"Function '{node.name}' is too long ({function_length} lines)",
                                "severity": "warning",
                                "line": node.lineno
                            })
            
            # Check class definitions
            classes = []
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    classes.append({
                        "name": node.name,
                        "line": node.lineno,
                        "has_docstring": ast.get_docstring(node) is not None
                    })
            
            return {
                "language": "python",
                "imports": imports,
                "functions": functions,
                "classes": classes,
                "ast_analysis": True,
                "issues": issues,
                "warnings": warnings
            }
            
        except SyntaxError as e:
            return {
                "language": "python",
                "ast_analysis": False,
                "syntax_error": str(e),
                "issues": [{
                    "type": "syntax",
                    "message": f"Syntax error: {str(e)}",
                    "severity": "error",
                    "line": getattr(e, 'lineno', 0)
                }]
            }
    
    def _analyze_javascript(self, code: str, lines: List[str]) -> Dict[str, Any]:
        """
        JavaScript-specific analysis
        """
        issues = []
        warnings = []
        
        # Check for use strict
        if '"use strict"' not in code and "'use strict'" not in code:
            warnings.append("Consider adding 'use strict' directive")
        
        # Check for var usage
        var_matches = re.findall(r'\bvar\s+\w+', code)
        if var_matches:
            issues.append({
                "type": "style",
                "message": f"Found {len(var_matches)} uses of 'var'. Consider using 'let' or 'const'",
                "severity": "warning"
            })
        
        # Count arrow functions
        arrow_functions = len(re.findall(r'=>', code))
        
        # Count promises/async
        async_functions = len(re.findall(r'async\s+function|\basync\s*\(', code))
        
        return {
            "language": "javascript",
            "use_strict": '"use strict"' in code or "'use strict'" in code,
            "arrow_functions": arrow_functions,
            "async_functions": async_functions,
            "var_usage_count": len(var_matches),
            "issues": issues,
            "warnings": warnings
        }
    
    def _analyze_java(self, code: str, lines: List[str]) -> Dict[str, Any]:
        """
        Java-specific analysis
        """
        issues = []
        warnings = []
        
        # Check for proper exception handling
        generic_catches = len(re.findall(r'catch\s*\(\s*Exception\s+\w+\s*\)', code))
        if generic_catches > 0:
            issues.append({
                "type": "style",
                "message": f"Found {generic_catches} generic Exception catches",
                "severity": "warning"
            })
        
        # Check for System.out.println
        system_out = len(re.findall(r'System\.out\.', code))
        if system_out > 0:
            warnings.append(f"Found {system_out} uses of System.out. Consider using a logging framework")
        
        # Count method definitions
        method_pattern = r'(public|private|protected)\s+\w+\s+\w+\s*\([^)]*\)'
        methods = re.findall(method_pattern, code)
        
        return {
            "language": "java",
            "method_count": len(methods),
            "generic_exception_catches": generic_catches,
            "system_out_usage": system_out,
            "issues": issues,
            "warnings": warnings
        }
    
    def _calculate_complexity(self, code: str, language: str) -> Dict[str, Any]:
        """
        Calculate code complexity metrics
        """
        # Count control structures
        patterns = {
            "conditions": [
                r'\bif\s*\(', r'\belse\b', r'\bswitch\s*\(', r'\bcase\b',
                r'\bwhen\b', r'\bcond\b', r'\bmatch\b'
            ],
            "loops": [
                r'\bfor\s*\(', r'\bwhile\s*\(', r'\bdo\s*\{',
                r'\bforeach\b', r'\brepeat\b', r'\bloop\b'
            ],
            "nesting": [
                r'\{[^{}]*\{', r'\([^()]*\(', r'\[[^\[\]]*\['
            ]
        }
        
        counts = {}
        for category, pattern_list in patterns.items():
            count = 0
            for pattern in pattern_list:
                count += len(re.findall(pattern, code, re.MULTILINE))
            counts[category] = count
        
        # Calculate cyclomatic complexity approximation
        # Simplified version: conditions + loops + 1
        cyclomatic = counts.get("conditions", 0) + counts.get("loops", 0) + 1
        
        # Get language-specific weights
        language_rules = self.language_rules.get(language.lower(), {})
        weights = language_rules.get("complexity_weights", {
            "function": 10,
            "class": 20,
            "nested_block": 5,
            "condition": 3,
            "loop": 5
        })
        
        # Calculate weighted complexity
        weighted_complexity = (
            counts.get("conditions", 0) * weights.get("condition", 3) +
            counts.get("loops", 0) * weights.get("loop", 5)
        )
        
        # Determine complexity rating
        if cyclomatic < 10:
            rating = "low"
        elif cyclomatic < 20:
            rating = "medium"
        elif cyclomatic < 50:
            rating = "high"
        else:
            rating = "very high"
        
        return {
            "cyclomatic": cyclomatic,
            "weighted": weighted_complexity,
            "total": cyclomatic + weighted_complexity // 10,
            "rating": rating,
            "condition_count": counts.get("conditions", 0),
            "loop_count": counts.get("loops", 0),
            "nesting_count": counts.get("nesting", 0)
        }
    
    def _detect_quality_issues(self, code: str, language: str, lines: List[str]) -> List[Dict[str, Any]]:
        """
        Detect quality issues in code
        """
        issues = []
        
        # Get language-specific rules
        language_rules = self.language_rules.get(language.lower(), {})
        quality_rules = language_rules.get("quality_rules", [])
        
        # Check each rule
        for rule in quality_rules:
            pattern = rule["pattern"]
            matches = list(re.finditer(pattern, code, re.MULTILINE))
            
            for match in matches:
                # Calculate line number
                line_num = code[:match.start()].count('\n') + 1
                line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                
                issues.append({
                    "type": "quality",
                    "rule_id": rule.get("id", "unknown"),
                    "description": rule["description"],
                    "severity": rule["severity"],
                    "line": line_num,
                    "column": match.start() - code[:match.start()].rfind('\n') if '\n' in code[:match.start()] else match.start(),
                    "code_snippet": line_content.strip()[:100],
                    "suggestion": rule.get("fix", "")
                })
        
        # Detect long lines
        for i, line in enumerate(lines):
            if len(line) > 100:  # Common limit is 80-120 characters
                issues.append({
                    "type": "style",
                    "description": f"Line {i+1} is too long ({len(line)} characters)",
                    "severity": "info",
                    "line": i + 1,
                    "suggestion": "Break the line into multiple lines"
                })
        
        # Detect trailing whitespace
        for i, line in enumerate(lines):
            if line.rstrip() != line:
                issues.append({
                    "type": "style",
                    "description": f"Trailing whitespace on line {i+1}",
                    "severity": "info",
                    "line": i + 1,
                    "suggestion": "Remove trailing whitespace"
                })
        
        return issues
    
    def _calculate_quality_score(self, metrics: Dict[str, Any], language_analysis: Dict[str, Any],
                                complexity: Dict[str, Any], issues: List[Dict[str, Any]]) -> float:
        """
        Calculate overall quality score (0-100)
        """
        score = 100.0
        
        # Deduct for complexity
        complexity_penalty = min(30, complexity["total"] * 0.5)
        score -= complexity_penalty
        
        # Deduct for issues
        issue_penalty = 0
        for issue in issues:
            severity = issue.get("severity", "info")
            if severity == "error":
                issue_penalty += 5
            elif severity == "warning":
                issue_penalty += 2
            elif severity == "info":
                issue_penalty += 0.5
        
        score -= min(30, issue_penalty)
        
        # Adjust for comment ratio
        comment_ratio = metrics.get("comment_ratio", 0)
        if comment_ratio < 0.1:  # Less than 10% comments
            score -= 5
        elif comment_ratio > 0.3:  # More than 30% comments (potentially over-commented)
            score -= 2
        
        # Adjust for function/class count
        function_count = metrics.get("function_count", 0)
        class_count = metrics.get("class_count", 0)
        
        if function_count == 0 and class_count == 0:
            score -= 10  # No structure
        
        # Ensure score is within bounds
        score = max(0, min(100, score))
        
        return round(score, 1)
    
    def _calculate_maintainability_score(self, metrics: Dict[str, Any], complexity: Dict[str, Any],
                                        issues: List[Dict[str, Any]]) -> float:
        """
        Calculate maintainability score (0-100)
        """
        # Start with complexity-based score
        complexity_score = 100 - min(50, complexity["total"])
        
        # Adjust for code structure
        structure_score = 0
        if metrics.get("function_count", 0) > 0:
            structure_score += 20
        if metrics.get("class_count", 0) > 0:
            structure_score += 10
        
        # Adjust for comments
        comment_score = min(20, metrics.get("comment_ratio", 0) * 100)
        
        # Deduct for issues
        issue_deduction = 0
        for issue in issues:
            severity = issue.get("severity", "info")
            if severity == "error":
                issue_deduction += 10
            elif severity == "warning":
                issue_deduction += 5
            elif severity == "info":
                issue_deduction += 1
        
        total_score = (
            complexity_score * 0.4 +
            structure_score * 0.3 +
            comment_score * 0.3 -
            min(30, issue_deduction)
        )
        
        # Ensure score is within bounds
        total_score = max(0, min(100, total_score))
        
        return round(total_score, 1)
    
    def _calculate_technical_debt(self, issues: List[Dict[str, Any]], complexity: Dict[str, Any]) -> float:
        """
        Calculate technical debt score
        """
        debt = 0
        
        # Debt from issues
        for issue in issues:
            severity = issue.get("severity", "info")
            if severity == "error":
                debt += 10
            elif severity == "warning":
                debt += 5
            elif severity == "info":
                debt += 1
        
        # Debt from complexity
        debt += complexity.get("total", 0) * 0.1
        
        return round(debt, 1)
    
    def _get_default_analysis_result(self, code: str, language: str) -> Dict[str, Any]:
        """
        Get default analysis result when analysis fails
        """
        lines = code.split('\n')
        
        return {
            "quality_score": 50.0,
            "maintainability_score": 50.0,
            "complexity_score": 10,
            "complexity_rating": "unknown",
            "lines_of_code": len(lines),
            "issues": [{
                "type": "analysis",
                "description": "Code analysis could not be completed",
                "severity": "warning",
                "suggestion": "Check code syntax and try again"
            }],
            "metrics": {
                "total_lines": len(lines),
                "code_lines": len([l for l in lines if l.strip()]),
                "blank_lines": len([l for l in lines if not l.strip()]),
                "comment_lines": 0,
                "comment_ratio": 0,
                "function_count": 0,
                "class_count": 0
            },
            "technical_debt": 5.0,
            "analysis_details": {
                "language": language,
                "has_comments": False,
                "has_functions": False,
                "has_classes": False
            }
        }