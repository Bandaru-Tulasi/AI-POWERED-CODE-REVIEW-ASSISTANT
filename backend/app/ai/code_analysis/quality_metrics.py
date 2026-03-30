"""
Quality metrics calculation for code analysis
"""
from typing import Dict, List, Any, Tuple
import re

class QualityMetricsCalculator:
    """Calculator for various code quality metrics"""
    
    @staticmethod
    def calculate_code_smells(code: str, language: str) -> List[Dict[str, Any]]:
        """
        Detect code smells in the code
        
        Returns:
            List of code smells with descriptions and severity
        """
        smells = []
        
        # Common code smells across languages
        common_smells = [
            {
                "name": "Long Method",
                "pattern": r'def\s+\w+\s*\(.*\):|function\s+\w+\s*\(.*\)\s*\{|\w+\s+[\w<>]+\s+\w+\s*\([^)]*\)\s*\{',
                "description": "Method/function is too long",
                "severity": "medium",
                "detector": QualityMetricsCalculator._detect_long_method
            },
            {
                "name": "Large Class",
                "pattern": r'class\s+\w+',
                "description": "Class has too many responsibilities",
                "severity": "medium",
                "detector": QualityMetricsCalculator._detect_large_class
            },
            {
                "name": "Duplicate Code",
                "description": "Similar code appears in multiple places",
                "severity": "high",
                "detector": QualityMetricsCalculator._detect_duplicate_code
            },
            {
                "name": "Complex Conditional",
                "pattern": r'if\s*\(.*&&.*|||if\s*\(.*and.*or',
                "description": "Conditional logic is too complex",
                "severity": "medium",
                "detector": lambda c, l: QualityMetricsCalculator._detect_complex_conditionals(c)
            },
            {
                "name": "Magic Numbers",
                "pattern": r'\b\d+\b',
                "description": "Hardcoded numeric values without explanation",
                "severity": "low",
                "detector": QualityMetricsCalculator._detect_magic_numbers
            },
            {
                "name": "Deep Nesting",
                "description": "Code has too many nested levels",
                "severity": "medium",
                "detector": QualityMetricsCalculator._detect_deep_nesting
            },
            {
                "name": "Feature Envy",
                "description": "Method uses more features of another class than its own",
                "severity": "low",
                "detector": lambda c, l: []  # Complex to detect without full context
            },
            {
                "name": "Data Clumps",
                "description": "Groups of data that appear together frequently",
                "severity": "low",
                "detector": lambda c, l: []  # Complex to detect
            },
            {
                "name": "Primitive Obsession",
                "pattern": r'int\s+\w+|String\s+\w+|bool\s+\w+',
                "description": "Overuse of primitive types instead of objects",
                "severity": "low",
                "detector": QualityMetricsCalculator._detect_primitive_obsession
            },
            {
                "name": "Switch Statements",
                "pattern": r'switch\s*\(|case\s+\w+:',
                "description": "Multiple switch/case statements",
                "severity": "medium",
                "detector": QualityMetricsCalculator._detect_switch_statements
            },
            {
                "name": "Speculative Generality",
                "description": "Code is more general than currently needed",
                "severity": "low",
                "detector": lambda c, l: []  # Requires design understanding
            },
            {
                "name": "Message Chains",
                "pattern": r'\w+\.\w+\(\)\.\w+\(\)\.\w+',
                "description": "Long chains of method calls",
                "severity": "medium",
                "detector": QualityMetricsCalculator._detect_message_chains
            },
            {
                "name": "Middle Man",
                "description": "Class delegates all work to another class",
                "severity": "low",
                "detector": lambda c, l: []  # Requires design analysis
            },
            {
                "name": "Inappropriate Intimacy",
                "description": "Classes know too much about each other's internals",
                "severity": "medium",
                "detector": lambda c, l: []  # Requires multiple class analysis
            },
            {
                "name": "Comments",
                "pattern": r'//\s*TODO|//\s*FIXME|#\s*TODO|#\s*FIXME',
                "description": "TODO/FIXME comments indicating incomplete work",
                "severity": "info",
                "detector": QualityMetricsCalculator._detect_todo_comments
            },
            {
                "name": "Lazy Class",
                "description": "Class doesn't do enough to justify its existence",
                "severity": "low",
                "detector": lambda c, l: []  # Requires design analysis
            }
        ]
        
        # Language-specific smells
        language_specific_smells = QualityMetricsCalculator._get_language_specific_smells(language)
        all_smells = common_smells + language_specific_smells
        
        # Detect smells
        for smell in all_smells:
            detector = smell.get("detector")
            if detector:
                detected = detector(code, language)
                smells.extend(detected)
        
        return smells
    
    @staticmethod
    def _get_language_specific_smells(language: str) -> List[Dict[str, Any]]:
        """Get language-specific code smells"""
        if language.lower() == "python":
            return [
                {
                    "name": "Bare Except",
                    "pattern": r'except\s*:',
                    "description": "Catching all exceptions without specifying type",
                    "severity": "high",
                    "detector": QualityMetricsCalculator._detect_bare_except
                },
                {
                    "name": "Mutable Default Argument",
                    "pattern": r'def\s+\w+\s*\(.*=\s*\[\]|def\s+\w+\s*\(.*=\s*\{\}',
                    "description": "Using mutable default arguments",
                    "severity": "high",
                    "detector": QualityMetricsCalculator._detect_mutable_default_args
                },
                {
                    "name": "Wildcard Import",
                    "pattern": r'from\s+\w+\s+import\s*\*',
                    "description": "Importing everything from a module",
                    "severity": "medium",
                    "detector": QualityMetricsCalculator._detect_wildcard_imports
                }
            ]
        elif language.lower() == "javascript":
            return [
                {
                    "name": "Callback Hell",
                    "pattern": r'\)\s*\{.*\}\s*\)\s*\{',
                    "description": "Deeply nested callbacks",
                    "severity": "high",
                    "detector": QualityMetricsCalculator._detect_callback_hell
                },
                {
                    "name": "Eval Usage",
                    "pattern": r'eval\(',
                    "description": "Using eval() function",
                    "severity": "critical",
                    "detector": QualityMetricsCalculator._detect_eval_usage
                },
                {
                    "name": "Implicit Globals",
                    "pattern": r'\w+\s*=',
                    "description": "Assigning to undeclared variables",
                    "severity": "medium",
                    "detector": QualityMetricsCalculator._detect_implicit_globals
                }
            ]
        elif language.lower() == "java":
            return [
                {
                    "name": "Checked Exceptions",
                    "pattern": r'throws\s+\w+Exception',
                    "description": "Overuse of checked exceptions",
                    "severity": "medium",
                    "detector": QualityMetricsCalculator._detect_checked_exceptions
                },
                {
                    "name": "Empty Catch Block",
                    "pattern": r'catch\s*\(.*\)\s*\{\s*\}',
                    "description": "Catching exceptions without handling them",
                    "severity": "high",
                    "detector": QualityMetricsCalculator._detect_empty_catch_blocks
                },
                {
                    "name": "God Class",
                    "pattern": r'class\s+\w+\s*\{',
                    "description": "Class that knows or does too much",
                    "severity": "high",
                    "detector": QualityMetricsCalculator._detect_god_class
                }
            ]
        
        return []
    
    @staticmethod
    def _detect_long_method(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect methods/functions that are too long"""
        issues = []
        lines = code.split('\n')
        
        # Find function/method definitions
        function_patterns = {
            "python": r'def\s+(\w+)\s*\([^)]*\):',
            "javascript": r'function\s+(\w+)\s*\([^)]*\)\s*\{|\w+\s*=\s*function\s*\([^)]*\)\s*\{|(\w+)\s*\([^)]*\)\s*=>',
            "java": r'(public|private|protected)\s+\w+\s+(\w+)\s*\([^)]*\)\s*\{',
            "default": r'def\s+\w+|function\s+\w+|\w+\s+\w+\s*\([^)]*\)\s*\{'
        }
        
        pattern = function_patterns.get(language.lower(), function_patterns["default"])
        
        for match in re.finditer(pattern, code, re.MULTILINE):
            func_start = match.start()
            func_name = match.group(1) or match.group(2) or "unknown"
            
            # Find function end (simplified)
            brace_count = 0
            in_function = False
            func_lines = 0
            
            for i, line in enumerate(lines):
                line_stripped = line.strip()
                
                if i >= func_start // (len(code) // max(len(lines), 1)):
                    if not in_function and (line_stripped.startswith('def ') or line_stripped.startswith('function ') or '{' in line):
                        in_function = True
                    
                    if in_function:
                        func_lines += 1
                        
                        # Count braces for languages that use them
                        if '{' in line:
                            brace_count += line.count('{')
                        if '}' in line:
                            brace_count -= line.count('}')
                        
                        # Check for end of function
                        if brace_count == 0 and i > func_start and (line_stripped.endswith('}') or line_stripped == ''):
                            break
            
            # Check if function is too long
            if func_lines > 30:  # Common threshold
                line_num = code[:func_start].count('\n') + 1
                issues.append({
                    "name": "Long Method",
                    "description": f"Function '{func_name}' is {func_lines} lines long",
                    "severity": "medium",
                    "line": line_num,
                    "suggestion": "Consider breaking it into smaller functions"
                })
        
        return issues
    
    @staticmethod
    def _detect_large_class(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect classes that are too large"""
        issues = []
        
        # Simplified detection - count lines between class definition and next class/end of file
        if language.lower() == "python":
            class_matches = list(re.finditer(r'class\s+(\w+)', code))
            
            for i, match in enumerate(class_matches):
                class_name = match.group(1)
                start_pos = match.start()
                
                # Find end of class (next class definition or end of file)
                end_pos = code.find('\nclass ', start_pos + 1)
                if end_pos == -1:
                    end_pos = len(code)
                
                class_content = code[start_pos:end_pos]
                class_lines = class_content.count('\n') + 1
                
                if class_lines > 200:  # Common threshold for large class
                    line_num = code[:start_pos].count('\n') + 1
                    issues.append({
                        "name": "Large Class",
                        "description": f"Class '{class_name}' is {class_lines} lines long",
                        "severity": "medium",
                        "line": line_num,
                        "suggestion": "Consider splitting responsibilities into multiple classes"
                    })
        
        return issues
    
    @staticmethod
    def _detect_duplicate_code(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect duplicate code segments"""
        issues = []
        lines = code.split('\n')
        
        # Simple detection: find identical consecutive lines (excluding whitespace)
        for i in range(len(lines) - 3):  # Need at least 3 consecutive duplicate lines
            current_block = [line.strip() for line in lines[i:i+3]]
            
            # Check if all lines in block are non-empty and non-comment
            if all(line and not line.startswith(('#', '//', '/*', '*/', '*')) for line in current_block):
                # Look for this block elsewhere
                block_text = '\n'.join(current_block)
                occurrences = []
                
                for j in range(len(lines) - 2):
                    compare_block = [line.strip() for line in lines[j:j+3]]
                    if compare_block == current_block and j != i:
                        occurrences.append(j + 1)
                
                if len(occurrences) >= 1:  # Found at least one duplicate
                    issues.append({
                        "name": "Duplicate Code",
                        "description": f"Duplicate code block found at lines {i+1} and {occurrences[0]+1}",
                        "severity": "high",
                        "line": i + 1,
                        "suggestion": "Extract duplicate code into a function/method"
                    })
        
        return issues
    
    @staticmethod
    def _detect_complex_conditionals(code: str) -> List[Dict[str, Any]]:
        """Detect complex conditional statements"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Check for complex if conditions
            if line_stripped.startswith('if ') or line_stripped.startswith('else if ') or line_stripped.startswith('elif '):
                # Extract condition
                condition_match = re.search(r'if\s*\((.*)\)', line_stripped)
                if condition_match:
                    condition = condition_match.group(1)
                    
                    # Count logical operators as complexity measure
                    and_count = condition.count('&&') + condition.count(' and ')
                    or_count = condition.count('||') + condition.count(' or ')
                    not_count = condition.count('!') + condition.count(' not ')
                    
                    total_complexity = and_count + or_count + not_count
                    
                    if total_complexity >= 3:  # Threshold for complex condition
                        issues.append({
                            "name": "Complex Conditional",
                            "description": f"Complex condition with {total_complexity} logical operators",
                            "severity": "medium",
                            "line": i + 1,
                            "suggestion": "Simplify condition or extract into well-named boolean methods"
                        })
        
        return issues
    
    @staticmethod
    def _detect_magic_numbers(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect magic numbers in code"""
        issues = []
        lines = code.split('\n')
        
        # Common magic number patterns (excluding 0, 1, -1 which are often okay)
        magic_number_pattern = r'\b([2-9]|[1-9]\d+)\b'
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Skip comments
            if line_stripped.startswith(('#', '//', '/*', '*/')):
                continue
            
            # Find magic numbers
            for match in re.finditer(magic_number_pattern, line_stripped):
                number = match.group(1)
                
                # Check if it's likely a magic number (not part of a larger number or identifier)
                start, end = match.span()
                if (start == 0 or not line_stripped[start-1].isalnum()) and \
                   (end == len(line_stripped) or not line_stripped[end].isalnum()):
                    
                    issues.append({
                        "name": "Magic Number",
                        "description": f"Magic number {number} found",
                        "severity": "low",
                        "line": i + 1,
                        "suggestion": "Replace with named constant"
                    })
        
        return issues
    
    @staticmethod
    def _detect_deep_nesting(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect deeply nested code blocks"""
        issues = []
        lines = code.split('\n')
        
        current_nesting = 0
        max_nesting = 0
        max_nesting_line = 0
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Skip empty lines and comments
            if not line_stripped or line_stripped.startswith(('#', '//', '/*', '*/', '*')):
                continue
            
            # Count opening braces/brackets/parentheses for nesting
            opening = line_stripped.count('{') + line_stripped.count('[') + line_stripped.count('(')
            closing = line_stripped.count('}') + line_stripped.count(']') + line_stripped.count(')')
            
            current_nesting += opening - closing
            
            if current_nesting > max_nesting:
                max_nesting = current_nesting
                max_nesting_line = i + 1
        
        if max_nesting >= 4:  # Common threshold for deep nesting
            issues.append({
                "name": "Deep Nesting",
                "description": f"Code is nested {max_nesting} levels deep",
                "severity": "medium",
                "line": max_nesting_line,
                "suggestion": "Flatten nested code by extracting methods or using guard clauses"
            })
        
        return issues
    
    @staticmethod
    def _detect_primitive_obsession(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect overuse of primitive types"""
        issues = []
        
        # Count primitive type declarations
        primitive_patterns = [
            r'\bint\s+\w+',
            r'\bString\s+\w+',
            r'\bbool\s+\w+',
            r'\bfloat\s+\w+',
            r'\bdouble\s+\w+',
            r'\bchar\s+\w+'
        ]
        
        primitive_count = 0
        for pattern in primitive_patterns:
            primitive_count += len(re.findall(pattern, code))
        
        # Count total variable declarations (simplified)
        var_pattern = r'\b\w+\s+\w+\s*='
        var_count = len(re.findall(var_pattern, code))
        
        if var_count > 0:
            primitive_ratio = primitive_count / var_count
            if primitive_ratio > 0.8:  # More than 80% primitives
                issues.append({
                    "name": "Primitive Obsession",
                    "description": f"High use of primitive types ({primitive_ratio:.0%} of declarations)",
                    "severity": "low",
                    "line": 1,
                    "suggestion": "Consider creating value objects for related primitives"
                })
        
        return issues
    
    @staticmethod
    def _detect_switch_statements(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect switch/case statements"""
        issues = []
        
        switch_count = len(re.findall(r'switch\s*\(', code, re.IGNORECASE))
        
        if switch_count > 0:
            issues.append({
                "name": "Switch Statements",
                "description": f"Found {switch_count} switch statement(s)",
                "severity": "medium",
                "line": 1,
                "suggestion": "Consider polymorphism or strategy pattern instead of switch statements"
            })
        
        return issues
    
    @staticmethod
    def _detect_message_chains(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect long chains of method calls"""
        issues = []
        lines = code.split('\n')
        
        chain_pattern = r'\w+(?:\.\w+\([^)]*\)){3,}'  # At least 3 method calls in chain
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            for match in re.finditer(chain_pattern, line_stripped):
                chain = match.group(0)
                issues.append({
                    "name": "Message Chains",
                    "description": f"Long method chain: {chain[:50]}...",
                    "severity": "medium",
                    "line": i + 1,
                    "suggestion": "Break chain or use Law of Demeter"
                })
        
        return issues
    
    @staticmethod
    def _detect_todo_comments(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect TODO/FIXME comments"""
        issues = []
        lines = code.split('\n')
        
        todo_patterns = [
            r'//\s*TODO',
            r'#\s*TODO',
            r'/\*\s*TODO',
            r'//\s*FIXME',
            r'#\s*FIXME',
            r'/\*\s*FIXME'
        ]
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            for pattern in todo_patterns:
                if re.search(pattern, line_stripped, re.IGNORECASE):
                    issues.append({
                        "name": "TODO/FIXME Comment",
                        "description": "TODO or FIXME comment found",
                        "severity": "info",
                        "line": i + 1,
                        "suggestion": "Address the TODO/FIXME comment"
                    })
                    break
        
        return issues
    
    @staticmethod
    def _detect_bare_except(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect bare except clauses in Python"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            if re.match(r'except\s*:', line_stripped):
                issues.append({
                    "name": "Bare Except",
                    "description": "Bare except clause catches all exceptions",
                    "severity": "high",
                    "line": i + 1,
                    "suggestion": "Specify exception types to catch"
                })
        
        return issues
    
    @staticmethod
    def _detect_mutable_default_args(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect mutable default arguments in Python"""
        issues = []
        
        mutable_patterns = [
            r'def\s+\w+\s*\([^)]*=\s*\[\]',
            r'def\s+\w+\s*\([^)]*=\s*\{\}'
        ]
        
        for pattern in mutable_patterns:
            for match in re.finditer(pattern, code):
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "name": "Mutable Default Argument",
                    "description": "Mutable default argument (list or dict)",
                    "severity": "high",
                    "line": line_num,
                    "suggestion": "Use None as default and initialize inside function"
                })
        
        return issues
    
    @staticmethod
    def _detect_wildcard_imports(code: str, language: str) -> List[Dict[str, Any]]:
        """Detect wildcard imports"""
        issues = []
        
        if language.lower() == "python":
            wildcard_pattern = r'from\s+\w+\s+import\s*\*'
            
            for match in re.finditer(wildcard_pattern, code):
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "name": "Wildcard Import",
                    "description": "Wildcard import (*) used",
                    "severity": "medium",
                    "line": line_num,
                    "suggestion": "Import only what you need"
                })
        
        return issues
    
    @staticmethod
    def calculate_maintainability_index(halstead_volume: float, cyclomatic_complexity: float,
                                       lines_of_code: int, comment_percentage: float) -> float:
        """
        Calculate maintainability index
        
        Formula: MI = 171 - 5.2 * ln(Halstead Volume) - 0.23 * Cyclomatic Complexity 
                - 16.2 * ln(Lines of Code) + 50 * sin(sqrt(2.4 * Comment Percentage))
        
        Returns:
            Maintainability index (0-100, higher is better)
        """
        import math
        
        if lines_of_code == 0:
            return 100.0
        
        # Calculate components
        hl = 5.2 * math.log(halstead_volume) if halstead_volume > 0 else 0
        cc = 0.23 * cyclomatic_complexity
        loc = 16.2 * math.log(lines_of_code)
        com = 50 * math.sin(math.sqrt(2.4 * comment_percentage))
        
        # Calculate MI
        mi = 171 - hl - cc - loc + com
        
        # Clamp to 0-100 range
        return max(0, min(100, mi))
    
    @staticmethod
    def calculate_halstead_metrics(code: str, language: str) -> Dict[str, float]:
        """
        Calculate Halstead metrics for code
        
        Returns:
            Dictionary with Halstead metrics
        """
        # Simplified tokenization for Halstead metrics
        operators = set(['+', '-', '*', '/', '=', '==', '!=', '<', '>', '<=', '>=',
                        '&&', '||', '!', '&', '|', '^', '~', '<<', '>>',
                        '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=',
                        '++', '--', '.', '->', '::', 'new', 'delete', 'sizeof',
                        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
                        'return', 'break', 'continue', 'goto', 'throw', 'try', 'catch',
                        'class', 'struct', 'enum', 'union', 'template', 'typename',
                        'public', 'private', 'protected', 'virtual', 'override', 'final',
                        'static', 'const', 'volatile', 'mutable', 'extern', 'register',
                        'auto', 'typedef', 'using', 'namespace', 'import', 'from',
                        'def', 'function', 'var', 'let', 'const'])
        
        # Language-specific adjustments
        if language.lower() == "python":
            operators.update(['and', 'or', 'not', 'is', 'in', 'lambda', 'yield', 'async', 'await'])
        elif language.lower() == "javascript":
            operators.update(['===', '!==', 'typeof', 'instanceof', 'void', 'delete', 'in'])
        
        # Simple tokenization (this is simplified - real implementation would need parser)
        tokens = re.findall(r'[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+(?:\.[0-9]+)?|[+\-*/=<>!&|^~%]+|[:;.,{}()\[\]]', code)
        
        # Count unique operators and operands
        unique_operators = set()
        unique_operands = set()
        operator_count = 0
        operand_count = 0
        
        for token in tokens:
            if token in operators or token in '+-*/=<>!&|^~%{}()[];:.,':
                unique_operators.add(token)
                operator_count += 1
            else:
                # Check if it looks like an operand (not a keyword)
                if re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', token) and token not in operators:
                    unique_operands.add(token)
                operand_count += 1
        
        n1 = len(unique_operators)  # Number of distinct operators
        n2 = len(unique_operands)   # Number of distinct operands
        N1 = operator_count         # Total operators
        N2 = operand_count          # Total operands
        
        # Calculate Halstead metrics
        vocabulary = n1 + n2
        length = N1 + N2
        volume = length * (math.log2(vocabulary) if vocabulary > 0 else 0)
        difficulty = (n1 / 2) * (N2 / n2) if n2 > 0 else 0
        effort = volume * difficulty
        time = effort / 18  # Stroud number (psychological seconds)
        bugs = volume / 3000  # Estimated bugs
        
        return {
            "vocabulary": vocabulary,
            "length": length,
            "volume": volume,
            "difficulty": difficulty,
            "effort": effort,
            "time": time,
            "bugs": bugs,
            "distinct_operators": n1,
            "distinct_operands": n2,
            "total_operators": N1,
            "total_operands": N2
        }