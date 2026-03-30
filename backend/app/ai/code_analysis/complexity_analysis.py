"""
Complexity analysis for code
"""
import re
from typing import Dict, List, Any, Tuple
import math

class ComplexityAnalyzer:
    """Analyzer for code complexity metrics"""
    
    @staticmethod
    def calculate_cyclomatic_complexity(code: str, language: str) -> Dict[str, Any]:
        """
        Calculate cyclomatic complexity for code
        
        Returns:
            Complexity metrics including McCabe's cyclomatic complexity
        """
        # Count decision points
        decision_patterns = [
            r'\bif\s*\(',           # if statements
            r'\belse\s+if\s*\(',    # else if
            r'\belse\b',           # else
            r'\bfor\s*\(',         # for loops
            r'\bwhile\s*\(',       # while loops
            r'\bdo\s*\{',          # do-while loops
            r'\bswitch\s*\(',      # switch statements
            r'\bcase\s+\w+:',      # case statements
            r'\bcatch\s*\(',       # catch blocks
            r'\b&&\b',             # logical AND
            r'\b\|\|\b',           # logical OR
            r'\bternary\?',        # ternary operator
        ]
        
        # Language-specific patterns
        language_patterns = {
            "python": [
                r'\belif\s+',      # elif in Python
                r'\band\b',        # and operator
                r'\bor\b',         # or operator
                r'\bexcept\s+',    # except in Python
            ],
            "javascript": [
                r'\bcase\s+',      # case in switch
                r'\bdefault\s*:',  # default in switch
                r'\bcatch\s*\(',   # catch
                r'\b\?\?',         # nullish coalescing
                r'\b\?\.',         # optional chaining
            ],
            "java": [
                r'\bcase\s+',      # case in switch
                r'\bdefault\s*:',  # default in switch
                r'\bcatch\s*\(',   # catch
                r'\bthrows\b',     # throws declaration
            ]
        }
        
        # Combine patterns
        all_patterns = decision_patterns + language_patterns.get(language.lower(), [])
        
        # Count decision points
        decision_count = 0
        for pattern in all_patterns:
            decision_count += len(re.findall(pattern, code, re.MULTILINE))
        
        # Count functions/methods (each adds 1 to complexity)
        function_patterns = {
            "python": r'def\s+\w+\s*\([^)]*\):',
            "javascript": r'function\s+\w+\s*\([^)]*\)\s*\{|\w+\s*=\s*function\s*\([^)]*\)\s*\{|\w+\s*\([^)]*\)\s*=>',
            "java": r'(public|private|protected)\s+\w+\s+\w+\s*\([^)]*\)\s*\{',
            "default": r'def\s+\w+|function\s+\w+|\w+\s+\w+\s*\([^)]*\)\s*\{'
        }
        
        pattern = function_patterns.get(language.lower(), function_patterns["default"])
        function_count = len(re.findall(pattern, code, re.MULTILINE))
        
        # McCabe's cyclomatic complexity: V(G) = E - N + 2P
        # Simplified: V(G) = number of decision points + 1
        # For multiple functions: sum of complexities
        cyclomatic_complexity = decision_count + function_count
        
        # Calculate nested complexity
        nesting_depth = ComplexityAnalyzer._calculate_nesting_depth(code, language)
        
        # Weighted complexity (considering nesting)
        weighted_complexity = cyclomatic_complexity * (1 + nesting_depth * 0.2)
        
        # Determine complexity rating
        if cyclomatic_complexity <= 10:
            rating = "simple"
        elif cyclomatic_complexity <= 20:
            rating = "moderate"
        elif cyclomatic_complexity <= 50:
            rating = "complex"
        else:
            rating = "very complex"
        
        return {
            "cyclomatic_complexity": cyclomatic_complexity,
            "weighted_complexity": round(weighted_complexity, 2),
            "decision_points": decision_count,
            "function_count": function_count,
            "nesting_depth": nesting_depth,
            "rating": rating,
            "risk_level": ComplexityAnalyzer._get_risk_level(cyclomatic_complexity)
        }
    
    @staticmethod
    def _calculate_nesting_depth(code: str, language: str) -> int:
        """Calculate maximum nesting depth in code"""
        lines = code.split('\n')
        max_depth = 0
        current_depth = 0
        
        for line in lines:
            line_stripped = line.strip()
            
            # Skip comments and empty lines
            if not line_stripped or line_stripped.startswith(('#', '//', '/*', '*/')):
                continue
            
            # Count opening braces/brackets/parentheses
            opening = line_stripped.count('{') + line_stripped.count('[') + line_stripped.count('(')
            closing = line_stripped.count('}') + line_stripped.count(']') + line_stripped.count(')')
            
            current_depth += opening - closing
            max_depth = max(max_depth, current_depth)
        
        return max_depth
    
    @staticmethod
    def _get_risk_level(complexity: int) -> str:
        """Get risk level based on complexity"""
        if complexity <= 10:
            return "low"
        elif complexity <= 20:
            return "medium"
        elif complexity <= 30:
            return "high"
        else:
            return "very high"
    
    @staticmethod
    def analyze_cognitive_complexity(code: str, language: str) -> Dict[str, Any]:
        """
        Calculate cognitive complexity (SonarQube style)
        
        Cognitive complexity measures how hard code is to understand
        """
        lines = code.split('\n')
        cognitive_score = 0
        nesting_level = 0
        issues = []
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Skip comments and empty lines
            if not line_stripped or line_stripped.startswith(('#', '//', '/*', '*/')):
                continue
            
            # Check for structures that increase cognitive complexity
            # Increments and nesting increments
            structures = [
                # Control flow structures (add 1 + nesting level)
                (r'\bif\s*\(', "if statement"),
                (r'\belse\s+if\s*\(', "else if statement"),
                (r'\belse\b', "else statement"),
                (r'\bfor\s*\(', "for loop"),
                (r'\bwhile\s*\(', "while loop"),
                (r'\bdo\s*\{', "do-while loop"),
                (r'\bswitch\s*\(', "switch statement"),
                (r'\btry\s*\{', "try block"),
                (r'\bcatch\s*\(', "catch block"),
                (r'\bfinally\s*\{', "finally block"),
                
                # Language-specific
                (r'\belif\s+', "elif statement") if language == "python" else None,
                (r'\bexcept\s+', "except block") if language == "python" else None,
                (r'\bwith\s+', "with statement") if language == "python" else None,
                (r'\basync\s+', "async function") if language in ["python", "javascript"] else None,
                (r'\bawait\s+', "await expression") if language in ["python", "javascript"] else None,
            ]
            
            # Filter out None patterns
            structures = [s for s in structures if s is not None]
            
            for pattern, description in structures:
                if re.search(pattern, line_stripped):
                    increment = 1 + nesting_level
                    cognitive_score += increment
                    
                    issues.append({
                        "line": i + 1,
                        "description": description,
                        "increment": increment,
                        "nesting_level": nesting_level
                    })
            
            # Update nesting level based on braces/brackets
            opening = line_stripped.count('{') + line_stripped.count('[') + line_stripped.count('(')
            closing = line_stripped.count('}') + line_stripped.count(']') + line_stripped.count(')')
            
            # Track nesting for cognitive complexity
            if opening > closing:
                nesting_level += opening - closing
            elif closing > opening:
                nesting_level -= closing - opening
            
            # Check for break/continue/return/goto (adds 1)
            jump_patterns = [r'\bbreak\b', r'\bcontinue\b', r'\breturn\b', r'\bgoto\b']
            for pattern in jump_patterns:
                if re.search(pattern, line_stripped):
                    cognitive_score += 1
                    issues.append({
                        "line": i + 1,
                        "description": f"{pattern.strip('\\b')} statement",
                        "increment": 1,
                        "nesting_level": nesting_level
                    })
            
            # Check for nested ternary/conditional operators
            if '?' in line_stripped and ':' in line_stripped:
                # Count nested ternary operators
                question_marks = line_stripped.count('?')
                colons = line_stripped.count(':')
                if question_marks > 1:  # Nested ternary
                    cognitive_score += (question_marks - 1) * 2
                    issues.append({
                        "line": i + 1,
                        "description": f"Nested ternary operator ({question_marks} levels)",
                        "increment": (question_marks - 1) * 2,
                        "nesting_level": nesting_level
                    })
        
        # Determine cognitive complexity rating
        if cognitive_score <= 15:
            rating = "easy"
        elif cognitive_score <= 30:
            rating = "moderate"
        elif cognitive_score <= 50:
            rating = "difficult"
        else:
            rating = "very difficult"
        
        return {
            "cognitive_score": cognitive_score,
            "rating": rating,
            "issues": issues,
            "max_nesting": max(i["nesting_level"] for i in issues) if issues else 0
        }
    
    @staticmethod
    def calculate_time_complexity(code: str, language: str) -> Dict[str, Any]:
        """
        Estimate time complexity of algorithms in code
        
        Returns:
            Estimated Big O notation and complexity analysis
        """
        lines = code.split('\n')
        complexity_patterns = []
        
        # Common complexity patterns
        patterns = [
            # Constant time O(1)
            (r'return\s+\w+;', "O(1)", "constant time"),
            (r'\w+\s*=\s*\w+;', "O(1)", "constant time assignment"),
            
            # Linear time O(n)
            (r'for\s*\(.*;\s*\w+\s*<\s*\w+;\s*\w+\+\+', "O(n)", "simple for loop"),
            (r'for\s+\w+\s+in\s+range\s*\(', "O(n)", "Python range loop"),
            (r'for\s+\w+\s+in\s+\w+:', "O(n)", "Python for-in loop"),
            (r'while\s*\(.*\)\s*\{', "O(n)", "while loop with linear progression"),
            
            # Quadratic time O(n²)
            (r'for\s*\(.*;\s*\w+\s*<\s*\w+;\s*\w+\+\+\).*\{.*for\s*\(.*;\s*\w+\s*<\s*\w+;\s*\w+\+\+', 
             "O(n²)", "nested for loops"),
            
            # Logarithmic time O(log n)
            (r'while\s*\(.*\)\s*\{.*\w+\s*=\s*\w+\s*/\s*\d+', "O(log n)", "division in while loop"),
            (r'\w+\s*=\s*\w+\s*/\s*\d+;\s*while', "O(log n)", "division before while"),
            
            # Linearithmic time O(n log n)
            (r'Arrays\.sort|Collections\.sort|sorted\s*\(', "O(n log n)", "sorting operation"),
            
            # Exponential time O(2^n)
            (r'fibonacci|recursive.*\w+\s*\(.*\w+\s*-\s*\d+.*\).*\{.*\w+\s*\(.*\w+\s*-\s*\d+.*\)', 
             "O(2^n)", "recursive fibonacci-like function"),
        ]
        
        detected_complexities = []
        
        for pattern, big_o, description in patterns:
            matches = list(re.finditer(pattern, code, re.MULTILINE | re.DOTALL))
            if matches:
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    detected_complexities.append({
                        "pattern": pattern,
                        "big_o": big_o,
                        "description": description,
                        "line": line_num,
                        "code_snippet": lines[line_num - 1][:100] if line_num <= len(lines) else ""
                    })
        
        # Determine overall complexity (worst case)
        complexity_hierarchy = {
            "O(1)": 1,
            "O(log n)": 2,
            "O(n)": 3,
            "O(n log n)": 4,
            "O(n²)": 5,
            "O(2^n)": 6,
            "O(n!)": 7
        }
        
        overall_complexity = "O(1)"  # Default
        max_level = 0
        
        for comp in detected_complexities:
            level = complexity_hierarchy.get(comp["big_o"], 0)
            if level > max_level:
                max_level = level
                overall_complexity = comp["big_o"]
        
        return {
            "overall_complexity": overall_complexity,
            "detected_patterns": detected_complexities,
            "complexity_level": max_level,
            "performance_implications": ComplexityAnalyzer._get_performance_implications(overall_complexity)
        }
    
    @staticmethod
    def _get_performance_implications(complexity: str) -> str:
        """Get performance implications for time complexity"""
        implications = {
            "O(1)": "Constant time - Excellent performance, scales perfectly",
            "O(log n)": "Logarithmic time - Very good performance, scales well",
            "O(n)": "Linear time - Good performance, scales linearly with input",
            "O(n log n)": "Linearithmic time - Acceptable for sorting, scales fairly well",
            "O(n²)": "Quadratic time - Poor performance for large inputs, consider optimization",
            "O(2^n)": "Exponential time - Very poor performance, avoid for non-trivial inputs",
            "O(n!)": "Factorial time - Extremely poor performance, practical only for tiny inputs"
        }
        
        return implications.get(complexity, "Unknown complexity - unable to determine performance implications")
    
    @staticmethod
    def calculate_memory_complexity(code: str, language: str) -> Dict[str, Any]:
        """
        Estimate memory (space) complexity of code
        
        Returns:
            Memory complexity analysis
        """
        # Count data structures that affect memory
        memory_patterns = [
            # Arrays/lists
            (r'new\s+\w+\s*\[\s*\w+\s*\]', "O(n)", "array allocation"),
            (r'List<\w+>', "O(n)", "list declaration"),
            (r'\[\s*\]\s*=', "O(n)", "array/list literal"),
            (r'ArrayList|LinkedList|Vector', "O(n)", "Java collection"),
            
            # Matrices/2D arrays
            (r'new\s+\w+\s*\[\s*\w+\s*\]\s*\[\s*\w+\s*\]', "O(n²)", "2D array"),
            (r'\[\s*\]\[\s*\]', "O(n²)", "2D array literal"),
            
            # Hash maps/dictionaries
            (r'HashMap|HashTable|Dictionary', "O(n)", "hash map"),
            (r'\{\s*\}', "O(n)", "dictionary/object literal"),
            
            # Sets
            (r'HashSet|TreeSet|Set<\w+>', "O(n)", "set"),
            
            # Recursive calls (stack space)
            (r'\w+\s*\(.*\w+\s*-\s*\d+.*\)', "O(n)", "recursive call (depth)"),
            (r'\w+\s*\(.*\w+\s*/\s*\d+.*\)', "O(log n)", "recursive call with division"),
        ]
        
        detected_patterns = []
        total_memory_usage = 0
        
        for pattern, complexity, description in memory_patterns:
            matches = list(re.finditer(pattern, code, re.MULTILINE))
            if matches:
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    detected_patterns.append({
                        "pattern": description,
                        "complexity": complexity,
                        "line": line_num
                    })
                    
                    # Add to total (simplified scoring)
                    if complexity == "O(n)":
                        total_memory_usage += 10
                    elif complexity == "O(n²)":
                        total_memory_usage += 50
                    elif complexity == "O(log n)":
                        total_memory_usage += 5
        
        # Determine overall memory complexity
        if total_memory_usage > 100:
            overall_complexity = "O(n²)"
            rating = "high"
        elif total_memory_usage > 50:
            overall_complexity = "O(n)"
            rating = "medium"
        elif total_memory_usage > 20:
            overall_complexity = "O(log n)"
            rating = "low"
        else:
            overall_complexity = "O(1)"
            rating = "very low"
        
        return {
            "overall_complexity": overall_complexity,
            "memory_usage_score": total_memory_usage,
            "rating": rating,
            "detected_patterns": detected_patterns,
            "recommendations": ComplexityAnalyzer._get_memory_recommendations(total_memory_usage)
        }
    
    @staticmethod
    def _get_memory_recommendations(score: int) -> List[str]:
        """Get memory optimization recommendations"""
        recommendations = []
        
        if score > 100:
            recommendations = [
                "Consider using more memory-efficient data structures",
                "Look for opportunities to use streaming/iterators instead of loading all data into memory",
                "Check for memory leaks in loops or recursive calls",
                "Consider pagination or chunking for large datasets",
                "Use primitive arrays instead of object collections when possible"
            ]
        elif score > 50:
            recommendations = [
                "Monitor memory usage with large inputs",
                "Consider lazy evaluation for expensive operations",
                "Use appropriate collection sizes to avoid resizing",
                "Clear references to unused objects"
            ]
        elif score > 20:
            recommendations = [
                "Memory usage is reasonable",
                "Consider small optimizations if performance is critical"
            ]
        else:
            recommendations = ["Memory usage is excellent"]
        
        return recommendations