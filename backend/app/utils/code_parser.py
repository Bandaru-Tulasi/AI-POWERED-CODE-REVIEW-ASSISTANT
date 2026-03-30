"""
Code parsing utilities for different programming languages
"""
import re
import ast
import json
from typing import Dict, List, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class CodeParser:
    """Parser for extracting information from code"""
    
    @staticmethod
    def parse_code_structure(code: str, language: str) -> Dict[str, Any]:
        """
        Parse code structure for analysis
        
        Args:
            code: Source code
            language: Programming language
        
        Returns:
            Parsed structure information
        """
        if language.lower() == "python":
            return CodeParser._parse_python_structure(code)
        elif language.lower() == "javascript":
            return CodeParser._parse_javascript_structure(code)
        elif language.lower() == "java":
            return CodeParser._parse_java_structure(code)
        else:
            return CodeParser._parse_generic_structure(code, language)
    
    @staticmethod
    def _parse_python_structure(code: str) -> Dict[str, Any]:
        """Parse Python code structure using AST"""
        try:
            tree = ast.parse(code)
            
            functions = []
            classes = []
            imports = []
            variables = []
            
            for node in ast.walk(tree):
                # Extract functions
                if isinstance(node, ast.FunctionDef):
                    functions.append({
                        "name": node.name,
                        "line": node.lineno,
                        "args": [arg.arg for arg in node.args.args],
                        "defaults": len(node.args.defaults),
                        "has_decorators": len(node.decorator_list) > 0,
                        "has_docstring": ast.get_docstring(node) is not None
                    })
                
                # Extract classes
                elif isinstance(node, ast.ClassDef):
                    class_methods = []
                    for item in node.body:
                        if isinstance(item, ast.FunctionDef):
                            class_methods.append(item.name)
                    
                    classes.append({
                        "name": node.name,
                        "line": node.lineno,
                        "methods": class_methods,
                        "has_docstring": ast.get_docstring(node) is not None
                    })
                
                # Extract imports
                elif isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append({
                            "module": alias.name,
                            "alias": alias.asname,
                            "type": "import"
                        })
                
                elif isinstance(node, ast.ImportFrom):
                    for alias in node.names:
                        imports.append({
                            "module": node.module or "",
                            "name": alias.name,
                            "alias": alias.asname,
                            "type": "from_import"
                        })
                
                # Extract variable assignments
                elif isinstance(node, ast.Assign):
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            variables.append({
                                "name": target.id,
                                "line": node.lineno
                            })
            
            return {
                "language": "python",
                "functions": functions,
                "classes": classes,
                "imports": imports,
                "variables": variables,
                "success": True
            }
            
        except SyntaxError as e:
            logger.error(f"Python parsing failed: {str(e)}")
            return {
                "language": "python",
                "error": str(e),
                "success": False
            }
    
    @staticmethod
    def _parse_javascript_structure(code: str) -> Dict[str, Any]:
        """Parse JavaScript code structure using regex"""
        functions = []
        classes = []
        imports = []
        variables = []
        
        lines = code.split('\n')
        
        # Find function definitions
        function_patterns = [
            r'function\s+(\w+)\s*\(([^)]*)\)',
            r'const\s+(\w+)\s*=\s*function\s*\(([^)]*)\)',
            r'let\s+(\w+)\s*=\s*function\s*\(([^)]*)\)',
            r'var\s+(\w+)\s*=\s*function\s*\(([^)]*)\)',
            r'(\w+)\s*=\s*function\s*\(([^)]*)\)',
            r'const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>',
            r'let\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>',
            r'var\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>',
            r'(\w+)\s*=\s*\(([^)]*)\)\s*=>'
        ]
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Check for functions
            for pattern in function_patterns:
                match = re.match(pattern, line_stripped)
                if match:
                    func_name = match.group(1)
                    args = match.group(2).split(',') if match.group(2) else []
                    functions.append({
                        "name": func_name,
                        "line": i + 1,
                        "args": [arg.strip() for arg in args],
                        "type": "function" if "function" in line else "arrow"
                    })
                    break
            
            # Check for classes
            class_match = re.match(r'class\s+(\w+)', line_stripped)
            if class_match:
                classes.append({
                    "name": class_match.group(1),
                    "line": i + 1
                })
            
            # Check for imports
            import_match = re.match(r'import\s+(.*?)\s+from\s+[\'"](.*?)[\'"]', line_stripped)
            if import_match:
                imports.append({
                    "imports": import_match.group(1),
                    "from": import_match.group(2),
                    "line": i + 1
                })
            
            # Check for variable declarations (simplified)
            var_match = re.match(r'(?:const|let|var)\s+(\w+)', line_stripped)
            if var_match:
                variables.append({
                    "name": var_match.group(1),
                    "line": i + 1,
                    "type": "declaration"
                })
        
        return {
            "language": "javascript",
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "variables": variables,
            "success": True
        }
    
    @staticmethod
    def _parse_java_structure(code: str) -> Dict[str, Any]:
        """Parse Java code structure using regex"""
        methods = []
        classes = []
        imports = []
        variables = []
        
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Check for class definitions
            class_match = re.match(r'(?:public|private|protected)?\s*(?:abstract\s+)?(?:final\s+)?class\s+(\w+)', line_stripped)
            if class_match:
                classes.append({
                    "name": class_match.group(1),
                    "line": i + 1
                })
            
            # Check for method definitions
            method_match = re.match(r'(?:public|private|protected)\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(([^)]*)\)', line_stripped)
            if method_match and ';' not in line_stripped:  # Not a declaration
                method_name = method_match.group(1)
                args = method_match.group(2).split(',') if method_match.group(2) else []
                methods.append({
                    "name": method_name,
                    "line": i + 1,
                    "args": [arg.strip() for arg in args],
                    "is_constructor": method_name in [c["name"] for c in classes]
                })
            
            # Check for imports
            import_match = re.match(r'import\s+(.*?);', line_stripped)
            if import_match:
                imports.append({
                    "import": import_match.group(1),
                    "line": i + 1
                })
            
            # Check for variable declarations (simplified)
            var_match = re.match(r'(?:private|public|protected)\s+\w+\s+(\w+)\s*[=;]', line_stripped)
            if var_match:
                variables.append({
                    "name": var_match.group(1),
                    "line": i + 1,
                    "type": "field"
                })
        
        return {
            "language": "java",
            "methods": methods,
            "classes": classes,
            "imports": imports,
            "variables": variables,
            "success": True
        }
    
    @staticmethod
    def _parse_generic_structure(code: str, language: str) -> Dict[str, Any]:
        """Generic parsing for other languages"""
        lines = code.split('\n')
        
        # Count lines and comments
        total_lines = len(lines)
        code_lines = 0
        comment_lines = 0
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
            
            if line_stripped.startswith(('//', '#', '/*', '*/', '*')):
                comment_lines += 1
            else:
                code_lines += 1
        
        return {
            "language": language,
            "lines": {
                "total": total_lines,
                "code": code_lines,
                "comments": comment_lines,
                "blank": total_lines - code_lines - comment_lines
            },
            "success": True,
            "note": "Basic structure analysis only"
        }
    
    @staticmethod
    def extract_functions(code: str, language: str) -> List[Dict[str, Any]]:
        """
        Extract function/method definitions from code
        
        Args:
            code: Source code
            language: Programming language
        
        Returns:
            List of function information
        """
        structure = CodeParser.parse_code_structure(code, language)
        
        if language.lower() == "python":
            return structure.get("functions", [])
        elif language.lower() == "javascript":
            return structure.get("functions", [])
        elif language.lower() == "java":
            return structure.get("methods", [])
        else:
            return []
    
    @staticmethod
    def extract_imports(code: str, language: str) -> List[Dict[str, Any]]:
        """
        Extract import statements from code
        
        Args:
            code: Source code
            language: Programming language
        
        Returns:
            List of import information
        """
        structure = CodeParser.parse_code_structure(code, language)
        return structure.get("imports", [])
    
    @staticmethod
    def calculate_metrics(code: str, language: str) -> Dict[str, Any]:
        """
        Calculate basic code metrics
        
        Args:
            code: Source code
            language: Programming language
        
        Returns:
            Code metrics
        """
        lines = code.split('\n')
        total_lines = len(lines)
        
        # Count different types of lines
        blank_lines = 0
        comment_lines = 0
        code_lines = 0
        
        in_block_comment = False
        
        for line in lines:
            line_stripped = line.strip()
            
            if not line_stripped:
                blank_lines += 1
                continue
            
            # Handle block comments
            if in_block_comment:
                comment_lines += 1
                if '*/' in line_stripped:
                    in_block_comment = False
                continue
            
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
                code_lines += 1
            else:
                code_lines += 1
        
        # Count characters
        total_chars = len(code)
        non_whitespace_chars = len(code.replace(' ', '').replace('\t', '').replace('\n', ''))
        
        # Count words (simplified)
        words = re.findall(r'\b\w+\b', code)
        unique_words = set(words)
        
        # Calculate ratios
        comment_ratio = comment_lines / total_lines if total_lines > 0 else 0
        blank_ratio = blank_lines / total_lines if total_lines > 0 else 0
        code_ratio = code_lines / total_lines if total_lines > 0 else 0
        
        return {
            "lines": {
                "total": total_lines,
                "code": code_lines,
                "comments": comment_lines,
                "blank": blank_lines
            },
            "characters": {
                "total": total_chars,
                "non_whitespace": non_whitespace_chars
            },
            "words": {
                "total": len(words),
                "unique": len(unique_words)
            },
            "ratios": {
                "comment": round(comment_ratio, 3),
                "blank": round(blank_ratio, 3),
                "code": round(code_ratio, 3)
            },
            "language": language
        }
    
    @staticmethod
    def detect_language(code: str, filename: str = "") -> str:
        """
        Detect programming language from code or filename
        
        Args:
            code: Source code
            filename: Optional filename
        
        Returns:
            Detected language
        """
        # First check filename extension
        if filename:
            extension_map = {
                '.py': 'python',
                '.js': 'javascript',
                '.jsx': 'javascript',
                '.ts': 'typescript',
                '.tsx': 'typescript',
                '.java': 'java',
                '.cpp': 'cpp',
                '.c': 'c',
                '.cs': 'csharp',
                '.go': 'go',
                '.rs': 'rust',
                '.rb': 'ruby',
                '.php': 'php',
                '.swift': 'swift',
                '.kt': 'kotlin',
                '.scala': 'scala',
                '.html': 'html',
                '.css': 'css',
                '.sql': 'sql',
                '.sh': 'bash',
                '.md': 'markdown',
                '.json': 'json',
                '.yml': 'yaml',
                '.yaml': 'yaml'
            }
            
            for ext, lang in extension_map.items():
                if filename.endswith(ext):
                    return lang
        
        # If no filename or extension not recognized, analyze code
        code_lower = code.lower()
        
        # Check for language-specific patterns
        if 'def ' in code_lower and 'import ' in code_lower:
            return 'python'
        elif 'function ' in code_lower or 'const ' in code_lower or 'let ' in code_lower:
            return 'javascript'
        elif 'public class ' in code_lower or 'private ' in code_lower:
            return 'java'
        elif '<?php' in code_lower or '$' in code and 'echo ' in code_lower:
            return 'php'
        elif '#include ' in code_lower or 'int main(' in code_lower:
            return 'c' if '.cpp' not in filename.lower() else 'cpp'
        elif 'package ' in code_lower and 'func ' in code_lower:
            return 'go'
        elif 'fn ' in code_lower and 'let ' in code_lower:
            return 'rust'
        elif 'def ' in code_lower and 'end' in code_lower:
            return 'ruby'
        
        # Default to text
        return 'text'
    
    @staticmethod
    def format_code(code: str, language: str) -> str:
        """
        Format code for display (basic indentation)
        
        Args:
            code: Source code
            language: Programming language
        
        Returns:
            Formatted code
        """
        lines = code.split('\n')
        formatted_lines = []
        indent_level = 0
        
        for line in lines:
            line_stripped = line.strip()
            
            if not line_stripped:
                formatted_lines.append('')
                continue
            
            # Decrease indent for closing braces/brackets
            if line_stripped.startswith(('}', ')', ']')):
                indent_level = max(0, indent_level - 1)
            
            # Add indentation
            indent = '    ' * indent_level
            formatted_lines.append(indent + line_stripped)
            
            # Increase indent for opening braces/brackets
            if line_stripped.endswith(('{', '(', '[')):
                indent_level += 1
        
        return '\n'.join(formatted_lines)
    
    @staticmethod
    def validate_syntax(code: str, language: str) -> Dict[str, Any]:
        """
        Validate code syntax
        
        Args:
            code: Source code
            language: Programming language
        
        Returns:
            Syntax validation results
        """
        if language.lower() == "python":
            return CodeParser._validate_python_syntax(code)
        elif language.lower() == "javascript":
            return CodeParser._validate_javascript_syntax(code)
        else:
            return {
                "valid": True,
                "language": language,
                "message": "Syntax validation not available for this language"
            }
    
    @staticmethod
    def _validate_python_syntax(code: str) -> Dict[str, Any]:
        """Validate Python syntax using AST"""
        try:
            ast.parse(code)
            return {
                "valid": True,
                "language": "python",
                "message": "Syntax is valid"
            }
        except SyntaxError as e:
            return {
                "valid": False,
                "language": "python",
                "error": str(e),
                "line": e.lineno,
                "column": e.offset,
                "message": f"Syntax error at line {e.lineno}, column {e.offset}: {e.msg}"
            }
    
    @staticmethod
    def _validate_javascript_syntax(code: str) -> Dict[str, Any]:
        """Basic JavaScript syntax validation"""
        # Check for unmatched braces/brackets/parentheses
        stack = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            for j, char in enumerate(line):
                if char in '({[':
                    stack.append((char, i + 1, j + 1))
                elif char in ')}]':
                    if not stack:
                        return {
                            "valid": False,
                            "language": "javascript",
                            "error": f"Unmatched {char}",
                            "line": i + 1,
                            "column": j + 1,
                            "message": f"Unmatched {char} at line {i + 1}, column {j + 1}"
                        }
                    
                    opening, line_num, col_num = stack.pop()
                    if (opening == '(' and char != ')') or \
                       (opening == '{' and char != '}') or \
                       (opening == '[' and char != ']'):
                        return {
                            "valid": False,
                            "language": "javascript",
                            "error": f"Mismatched {opening} and {char}",
                            "line": i + 1,
                            "column": j + 1,
                            "message": f"Mismatched {opening} at line {line_num}, column {col_num} with {char} at line {i + 1}, column {j + 1}"
                        }
        
        if stack:
            opening, line_num, col_num = stack.pop()
            return {
                "valid": False,
                "language": "javascript",
                "error": f"Unmatched {opening}",
                "line": line_num,
                "column": col_num,
                "message": f"Unmatched {opening} at line {line_num}, column {col_num}"
            }
        
        return {
            "valid": True,
            "language": "javascript",
            "message": "Basic syntax appears valid"
        }