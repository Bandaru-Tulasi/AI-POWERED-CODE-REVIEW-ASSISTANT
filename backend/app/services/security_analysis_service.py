import re
from typing import Dict, List, Any
import ast
import logging

logger = logging.getLogger(__name__)

class SecurityAnalysisService:
    def __init__(self):
        self.security_rules = self._load_security_rules()
    
    def _load_security_rules(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Load security analysis rules for different languages
        """
        return {
            "python": [
                {
                    "id": "PY-SQLI-001",
                    "pattern": r"execute\(.*%.*\)|executemany\(.*%.*\)",
                    "description": "Potential SQL injection vulnerability",
                    "severity": "high",
                    "mitigation": "Use parameterized queries or prepared statements"
                },
                {
                    "id": "PY-COMMAND-001",
                    "pattern": r"os\.system\(|subprocess\.call\(|subprocess\.Popen\(",
                    "description": "Potential command injection vulnerability",
                    "severity": "high",
                    "mitigation": "Validate and sanitize user input before passing to shell commands"
                },
                {
                    "id": "PY-EVAL-001",
                    "pattern": r"eval\(|exec\(",
                    "description": "Use of eval/exec with user input",
                    "severity": "critical",
                    "mitigation": "Avoid eval/exec with user input, use safer alternatives"
                },
                {
                    "id": "PY-PICKLE-001",
                    "pattern": r"pickle\.loads\(|pickle\.load\(",
                    "description": "Unsafe deserialization with pickle",
                    "severity": "high",
                    "mitigation": "Avoid pickle for untrusted data, use JSON or other safe formats"
                },
                {
                    "id": "PY-SSFR-001",
                    "pattern": r"flask\.render_template_string\(|django\.template\.Template\(",
                    "description": "Potential Server-Side Template Injection",
                    "severity": "high",
                    "mitigation": "Avoid rendering templates with user input"
                },
                {
                    "id": "PY-HARDCODED-001",
                    "pattern": r"password\s*=\s*['\"].*?['\"]|secret\s*=\s*['\"].*?['\"]|api_key\s*=\s*['\"].*?['\"]",
                    "description": "Hardcoded secrets in code",
                    "severity": "critical",
                    "mitigation": "Use environment variables or secret management systems"
                }
            ],
            "javascript": [
                {
                    "id": "JS-XSS-001",
                    "pattern": r"innerHTML\s*=|outerHTML\s*=|document\.write\(",
                    "description": "Potential XSS vulnerability",
                    "severity": "high",
                    "mitigation": "Use textContent or proper DOM manipulation methods"
                },
                {
                    "id": "JS-EVAL-001",
                    "pattern": r"eval\(|Function\(",
                    "description": "Use of eval with user input",
                    "severity": "critical",
                    "mitigation": "Avoid eval, use JSON.parse with validation"
                },
                {
                    "id": "JS-SQLI-001",
                    "pattern": r"\$\{.*?\}\s*\+\s*['\"].*?SELECT|INSERT|UPDATE|DELETE",
                    "description": "Potential SQL injection in template literals",
                    "severity": "high",
                    "mitigation": "Use parameterized queries or prepared statements"
                },
                {
                    "id": "JS-HARDCODED-001",
                    "pattern": r"const\s+(?:API_KEY|SECRET|PASSWORD)\s*=\s*['\"].*?['\"]",
                    "description": "Hardcoded secrets in code",
                    "severity": "critical",
                    "mitigation": "Use environment variables or secure configuration"
                }
            ],
            "java": [
                {
                    "id": "JAVA-SQLI-001",
                    "pattern": r"Statement\.executeQuery\(.*\+\s*\w+|PreparedStatement\.executeQuery\(.*%.*\)",
                    "description": "Potential SQL injection vulnerability",
                    "severity": "high",
                    "mitigation": "Use PreparedStatement with parameterized queries"
                },
                {
                    "id": "JAVA-XXE-001",
                    "pattern": r"DocumentBuilderFactory\.newInstance\(\)",
                    "description": "Potential XXE vulnerability",
                    "severity": "high",
                    "mitigation": "Disable external entity processing in XML parsers"
                },
                {
                    "id": "JAVA-DESERIAL-001",
                    "pattern": r"ObjectInputStream\.readObject\(|XMLDecoder\.readObject\(",
                    "description": "Unsafe deserialization",
                    "severity": "critical",
                    "mitigation": "Validate serialized objects or use safe deserialization libraries"
                },
                {
                    "id": "JAVA-COMMAND-001",
                    "pattern": r"Runtime\.getRuntime\(\)\.exec\(|ProcessBuilder\(",
                    "description": "Potential command injection",
                    "severity": "high",
                    "mitigation": "Validate and sanitize user input"
                }
            ]
        }
    
    def analyze_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze code for security vulnerabilities
        """
        vulnerabilities = []
        security_score = 100  # Start with perfect score
        
        # Get rules for the language
        language_rules = self.security_rules.get(language.lower(), [])
        
        if not language_rules:
            logger.warning(f"No security rules defined for language: {language}")
            return {
                "vulnerabilities": [],
                "security_score": security_score,
                "security_issues_found": 0
            }
        
        # Check each line against security rules
        lines = code.split('\n')
        for line_num, line in enumerate(lines, 1):
            for rule in language_rules:
                if re.search(rule["pattern"], line, re.IGNORECASE):
                    vulnerabilities.append({
                        "rule_id": rule["id"],
                        "description": rule["description"],
                        "severity": rule["severity"],
                        "line_number": line_num,
                        "code_snippet": line.strip(),
                        "mitigation": rule["mitigation"]
                    })
                    
                    # Deduct points based on severity
                    if rule["severity"] == "critical":
                        security_score -= 20
                    elif rule["severity"] == "high":
                        security_score -= 15
                    elif rule["severity"] == "medium":
                        security_score -= 10
                    else:
                        security_score -= 5
        
        # Ensure score doesn't go below 0
        security_score = max(0, security_score)
        
        # Additional language-specific checks
        if language.lower() == "python":
            vulnerabilities.extend(self._check_python_specific(code))
        elif language.lower() == "javascript":
            vulnerabilities.extend(self._check_javascript_specific(code))
        
        return {
            "vulnerabilities": vulnerabilities,
            "security_score": round(security_score, 1),
            "security_issues_found": len(vulnerabilities)
        }
    
    def _check_python_specific(self, code: str) -> List[Dict[str, Any]]:
        """
        Python-specific security checks using AST
        """
        vulnerabilities = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                # Check for insecure hash algorithms
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                    if node.func.attr in ["md5", "sha1"]:
                        vulnerabilities.append({
                            "rule_id": "PY-HASH-001",
                            "description": "Insecure hash algorithm used",
                            "severity": "medium",
                            "line_number": node.lineno,
                            "code_snippet": self._get_line(code, node.lineno),
                            "mitigation": "Use SHA-256 or SHA-3 for cryptographic hashing"
                        })
                
                # Check for insecure randomness
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                    if node.func.attr == "random" and isinstance(node.func.value, ast.Name):
                        if node.func.value.id == "random":
                            vulnerabilities.append({
                                "rule_id": "PY-RANDOM-001",
                                "description": "Insecure random number generation",
                                "severity": "medium",
                                "line_number": node.lineno,
                                "code_snippet": self._get_line(code, node.lineno),
                                "mitigation": "Use secrets module for cryptographic randomness"
                            })
        
        except SyntaxError:
            # If code has syntax errors, skip AST analysis
            pass
        
        return vulnerabilities
    
    def _check_javascript_specific(self, code: str) -> List[Dict[str, Any]]:
        """
        JavaScript-specific security checks
        """
        vulnerabilities = []
        
        # Check for localStorage with sensitive data
        localStorage_pattern = r"localStorage\.(setItem|getItem)\([^)]*(password|token|secret|key)[^)]*\)"
        matches = re.finditer(localStorage_pattern, code, re.IGNORECASE)
        for match in matches:
            line_num = code[:match.start()].count('\n') + 1
            vulnerabilities.append({
                "rule_id": "JS-STORAGE-001",
                "description": "Sensitive data stored in localStorage",
                "severity": "high",
                "line_number": line_num,
                "code_snippet": self._get_line(code, line_num),
                "mitigation": "Use secure HTTP-only cookies or backend session storage for sensitive data"
            })
        
        # Check for inline event handlers (potential XSS)
        inline_event_pattern = r"on\w+\s*=\s*['\"].*?['\"]"
        matches = re.finditer(inline_event_pattern, code, re.IGNORECASE)
        for match in matches:
            line_num = code[:match.start()].count('\n') + 1
            vulnerabilities.append({
                "rule_id": "JS-XSS-002",
                "description": "Inline event handler (potential XSS)",
                "severity": "medium",
                "line_number": line_num,
                "code_snippet": self._get_line(code, line_num),
                "mitigation": "Use addEventListener instead of inline event handlers"
            })
        
        return vulnerabilities
    
    def _get_line(self, code: str, line_num: int) -> str:
        """
        Get specific line from code
        """
        lines = code.split('\n')
        if 1 <= line_num <= len(lines):
            return lines[line_num - 1].strip()
        return ""
    
    def get_security_report(self, code: str, language: str) -> Dict[str, Any]:
        """
        Generate comprehensive security report
        """
        analysis_result = self.analyze_code(code, language)
        
        # Calculate risk level
        critical_count = sum(1 for v in analysis_result["vulnerabilities"] if v["severity"] == "critical")
        high_count = sum(1 for v in analysis_result["vulnerabilities"] if v["severity"] == "high")
        
        if critical_count > 0:
            risk_level = "CRITICAL"
        elif high_count > 0:
            risk_level = "HIGH"
        elif analysis_result["security_issues_found"] > 0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # Group vulnerabilities by severity
        vulnerabilities_by_severity = {
            "critical": [],
            "high": [],
            "medium": [],
            "low": []
        }
        
        for vuln in analysis_result["vulnerabilities"]:
            vulnerabilities_by_severity[vuln["severity"]].append(vuln)
        
        return {
            "risk_level": risk_level,
            "security_score": analysis_result["security_score"],
            "total_issues": analysis_result["security_issues_found"],
            "vulnerabilities_by_severity": vulnerabilities_by_severity,
            "summary": self._generate_security_summary(analysis_result, risk_level)
        }
    
    def _generate_security_summary(self, analysis_result: Dict[str, Any], risk_level: str) -> str:
        """
        Generate security summary
        """
        total_issues = analysis_result["security_issues_found"]
        security_score = analysis_result["security_score"]
        
        if total_issues == 0:
            return "No security vulnerabilities detected. Code appears secure."
        elif risk_level == "CRITICAL":
            return f"CRITICAL RISK: {total_issues} security vulnerabilities found. Immediate action required."
        elif risk_level == "HIGH":
            return f"HIGH RISK: {total_issues} security vulnerabilities found. Review and fix promptly."
        elif risk_level == "MEDIUM":
            return f"MEDIUM RISK: {total_issues} security vulnerabilities found. Consider fixing important issues."
        else:
            return f"LOW RISK: {total_issues} minor security issues found. Review when possible."