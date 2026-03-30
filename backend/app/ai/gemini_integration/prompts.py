"""
Prompt templates for Gemini AI integration in Code Review Assistant
"""

CODE_REVIEW_PROMPTS = {
    "code_review_template": """
    You are an expert code reviewer analyzing {language} code. 
    Please provide a detailed code review with the following structure:

    CODE REVIEW ANALYSIS
    --------------------
    
    OVERALL ASSESSMENT:
    [Provide a brief overall assessment of the code quality]

    QUALITY SCORE: [Score from 0-100]
    SECURITY SCORE: [Score from 0-100]
    MAINTAINABILITY SCORE: [Score from 0-100]
    COMPLEXITY RATING: [low/medium/high]

    DETAILED ANALYSIS:
    
    1. CODE STRUCTURE & ORGANIZATION:
    [Analyze file structure, module organization, imports, etc.]

    2. CODE QUALITY ISSUES:
    [List specific quality issues found with line numbers if applicable]

    3. SECURITY CONCERNS:
    [Identify potential security vulnerabilities]

    4. PERFORMANCE CONSIDERATIONS:
    [Suggest performance improvements]

    5. BEST PRACTICES VIOLATIONS:
    [Point out deviations from language/framework best practices]

    6. READABILITY & DOCUMENTATION:
    [Comment on code readability and documentation quality]

    SPECIFIC SUGGESTIONS:
    [Provide actionable, specific suggestions for improvement]
    - Suggestion 1
    - Suggestion 2
    - Suggestion 3
    [Add more as needed]

    CODE:
    ```
    {code}
    ```

    Please respond with a structured analysis in the following JSON format:
    {{
        "quality_score": 85,
        "security_score": 90,
        "maintainability_score": 80,
        "complexity_rating": "medium",
        "summary": "Brief summary here",
        "detailed_analysis": {{
            "structure_assessment": "Assessment here",
            "quality_issues": ["Issue 1", "Issue 2"],
            "security_concerns": ["Concern 1", "Concern 2"],
            "performance_issues": ["Performance issue 1"],
            "best_practice_violations": ["Violation 1"],
            "readability_assessment": "Assessment here"
        }},
        "specific_suggestions": [
            "Suggestion 1 with details",
            "Suggestion 2 with details",
            "Suggestion 3 with details"
        ],
        "improved_code_snippet": "Optional: Provide improved code snippet if applicable"
    }}
    """,

    "security_analysis_template": """
    You are a security expert analyzing {language} code for vulnerabilities.
    
    CODE TO ANALYZE:
    ```
    {code}
    ```

    Perform a comprehensive security analysis focusing on:
    1. Input validation and sanitization
    2. Authentication and authorization issues
    3. Data protection and encryption
    4. API security
    5. Dependency vulnerabilities
    6. Common OWASP Top 10 vulnerabilities
    
    Provide findings in this JSON format:
    {{
        "security_score": 85,
        "risk_level": "low/medium/high/critical",
        "vulnerabilities_found": [
            {{
                "type": "SQL Injection",
                "severity": "high",
                "location": "line 42",
                "description": "Detailed description",
                "recommendation": "Fix recommendation",
                "cwe_id": "CWE-89"
            }}
        ],
        "security_recommendations": [
            "Recommendation 1",
            "Recommendation 2"
        ],
        "compliance_check": {{
            "owasp_compliance": "Percentage",
            "pci_dss_compliance": "Percentage",
            "hipaa_compliance": "Percentage"
        }}
    }}
    """,

    "performance_analysis_template": """
    Analyze the performance characteristics of this {language} code:

    CODE:
    ```
    {code}
    ```

    Focus on:
    1. Time complexity analysis
    2. Space complexity analysis
    3. Memory usage patterns
    4. Potential bottlenecks
    5. Parallelization opportunities
    6. Caching strategies
    
    Provide analysis in JSON format:
    {{
        "time_complexity": "O(n)",
        "space_complexity": "O(1)",
        "performance_score": 85,
        "bottlenecks": [
            {{
                "location": "line 23",
                "type": "nested_loop",
                "impact": "high",
                "suggestion": "Optimization suggestion"
            }}
        ],
        "optimization_suggestions": [
            "Suggestion 1",
            "Suggestion 2"
        ],
        "memory_usage_analysis": "Analysis text",
        "parallelization_opportunities": "Opportunities text"
    }}
    """,

    "architecture_review_template": """
    Review the architectural patterns and design of this {language} code:

    CODE:
    ```
    {code}
    ```

    Analyze:
    1. Design patterns used
    2. Architectural principles adherence (SOLID, DRY, KISS, YAGNI)
    3. Modularity and separation of concerns
    4. Scalability considerations
    5. Testability
    6. Dependency management
    
    Provide analysis in JSON format:
    {{
        "architecture_score": 85,
        "design_patterns_identified": ["Pattern 1", "Pattern 2"],
        "solid_principles_compliance": {{
            "single_responsibility": true,
            "open_closed": true,
            "liskov_substitution": true,
            "interface_segregation": true,
            "dependency_inversion": true
        }},
        "modularity_assessment": "Assessment text",
        "scalability_considerations": "Considerations text",
        "testability_assessment": "Assessment text",
        "architecture_recommendations": [
            "Recommendation 1",
            "Recommendation 2"
        ]
    }}
    """,

    "explain_code_template": """
    Explain this {language} code in detail:

    CODE:
    ```
    {code}
    ```

    Provide explanation covering:
    1. What the code does
    2. Key algorithms and data structures
    3. Important functions and their purposes
    4. Control flow
    5. Error handling
    6. Input/output expectations
    
    Format response as:
    {{
        "overview": "Brief overview",
        "detailed_explanation": "Detailed explanation",
        "key_algorithms": ["Algorithm 1", "Algorithm 2"],
        "important_functions": [
            {{
                "name": "function_name",
                "purpose": "What it does",
                "parameters": ["param1", "param2"],
                "returns": "Return value"
            }}
        ],
        "control_flow": "Control flow description",
        "error_handling": "Error handling analysis",
        "complexity_analysis": "Complexity analysis"
    }}
    """,

    "generate_test_template": """
    Generate test cases for this {language} code:

    CODE:
    ```
    {code}
    ```

    Generate comprehensive test cases including:
    1. Unit tests
    2. Integration tests
    3. Edge cases
    4. Error scenarios
    5. Performance tests
    
    Provide in JSON format:
    {{
        "unit_tests": [
            {{
                "name": "test_function_name_normal_case",
                "description": "Test normal operation",
                "input": {{"param1": "value1"}},
                "expected_output": "expected value",
                "assertion": "assertion statement"
            }}
        ],
        "integration_tests": [
            {{
                "name": "test_integration_scenario",
                "description": "Integration test description",
                "setup": "Setup steps",
                "steps": ["Step 1", "Step 2"],
                "expected_result": "Expected result"
            }}
        ],
        "edge_cases": [
            {{
                "scenario": "Edge case description",
                "test_input": "Input for edge case",
                "expected_behavior": "Expected behavior"
            }}
        ],
        "error_scenarios": [
            {{
                "scenario": "Error scenario description",
                "test_input": "Input causing error",
                "expected_error": "Expected error type/message"
            }}
        ],
        "test_coverage_estimate": "85%"
    }}
    """,

    "refactor_suggestion_template": """
    Suggest refactoring improvements for this {language} code:

    CODE:
    ```
    {code}
    ```

    Focus on:
    1. Code smell identification
    2. Simplification opportunities
    3. Performance improvements
    4. Readability enhancements
    5. Maintainability improvements
    
    Provide suggestions in JSON format:
    {{
        "refactoring_score": 85,
        "code_smells_identified": [
            {{
                "type": "long_method",
                "location": "lines 10-50",
                "description": "Method is too long",
                "suggestion": "Break into smaller methods"
            }}
        ],
        "refactoring_opportunities": [
            {{
                "type": "extract_method",
                "location": "lines 15-25",
                "current_code": "Current code snippet",
                "suggested_refactoring": "Suggested refactored code",
                "benefit": "Improved readability"
            }}
        ],
        "performance_refactorings": [
            {{
                "optimization": "Optimization description",
                "current_approach": "Current approach",
                "suggested_approach": "Suggested approach",
                "expected_improvement": "Expected improvement percentage"
            }}
        ],
        "readability_improvements": [
            "Improvement 1",
            "Improvement 2"
        ],
        "before_after_examples": [
            {{
                "before": "Code before refactoring",
                "after": "Code after refactoring",
                "improvement": "What improved"
            }}
        ]
    }}
    """,

    "documentation_template": """
    Generate documentation for this {language} code:

    CODE:
    ```
    {code}
    ```

    Generate comprehensive documentation including:
    1. Function documentation (docstrings)
    2. Module/package documentation
    3. Usage examples
    4. API documentation if applicable
    5. Installation and setup instructions
    
    Provide in JSON format:
    {{
        "function_documentation": [
            {{
                "function_name": "function_name",
                "parameters": [
                    {{
                        "name": "param1",
                        "type": "string",
                        "description": "Parameter description",
                        "default": "default_value"
                    }}
                ],
                "returns": {{
                    "type": "return_type",
                    "description": "Return value description"
                }},
                "raises": [
                    {{
                        "exception": "ExceptionType",
                        "when": "When it's raised"
                    }}
                ],
                "examples": [
                    "Example usage code"
                ],
                "docstring": "Generated docstring"
            }}
        ],
        "module_documentation": {{
            "overview": "Module overview",
            "features": ["Feature 1", "Feature 2"],
            "installation": "Installation instructions",
            "quick_start": "Quick start guide",
            "dependencies": ["Dependency 1", "Dependency 2"]
        }},
        "api_documentation": {{
            "endpoints": [
                {{
                    "method": "GET",
                    "path": "/api/endpoint",
                    "description": "Endpoint description",
                    "parameters": [
                        {{
                            "name": "param",
                            "in": "query",
                            "type": "string",
                            "required": true
                        }}
                    ],
                    "responses": [
                        {{
                            "code": 200,
                            "description": "Success response"
                        }}
                    ]
                }}
            ]
        }},
        "examples": [
            {{
                "title": "Example title",
                "description": "Example description",
                "code": "Example code",
                "explanation": "Code explanation"
            }}
        ]
    }}
    """,

    "complexity_analysis_template": """
    Analyze the complexity of this {language} code:

    CODE:
    ```
    {code}
    ```

    Provide detailed complexity analysis:
    1. Time complexity (Big O notation)
    2. Space complexity
    3. Cyclomatic complexity
    4. Cognitive complexity
    5. Maintainability index
    
    Provide analysis in JSON format:
    {{
        "time_complexity_analysis": {{
            "worst_case": "O(n^2)",
            "average_case": "O(n log n)",
            "best_case": "O(1)",
            "explanation": "Complexity explanation"
        }},
        "space_complexity_analysis": {{
            "auxiliary_space": "O(n)",
            "total_space": "O(n)",
            "explanation": "Space usage explanation"
        }},
        "cyclomatic_complexity": 15,
        "cognitive_complexity": 25,
        "maintainability_index": 85,
        "complexity_issues": [
            {{
                "type": "nested_loop",
                "location": "lines 10-20",
                "complexity": "high",
                "suggestion": "Simplify or refactor"
            }}
        ],
        "recommendations": [
            "Reduce nested loops",
            "Break down complex functions",
            "Use more efficient algorithms"
        ]
    }}
    """,

    "language_specific_review": {
        "python": """
        Additional Python-specific analysis:
        1. PEP 8 compliance
        2. Pythonic constructs usage
        3. Type hinting
        4. Exception handling patterns
        5. Import organization
        6. Virtual environment and dependency management
        """,
        
        "javascript": """
        Additional JavaScript-specific analysis:
        1. ES6+ features usage
        2. Async/await patterns
        3. Error handling
        4. Module organization (ES modules vs CommonJS)
        5. Browser compatibility
        6. Package.json dependencies
        """,
        
        "java": """
        Additional Java-specific analysis:
        1. Java coding conventions
        2. Exception handling
        3. Design patterns usage
        4. Memory management
        5. Spring framework best practices (if applicable)
        6. Maven/Gradle configuration
        """,
        
        "typescript": """
        Additional TypeScript-specific analysis:
        1. Type definitions and interfaces
        2. Strict mode compliance
        3. Generic usage
        4. Module organization
        5. tsconfig.json configuration
        """
    }
}

# Helper functions for prompt management
def get_code_review_prompt(language: str, code: str) -> str:
    """Get formatted code review prompt"""
    return CODE_REVIEW_PROMPTS["code_review_template"].format(
        language=language,
        code=code
    )

def get_security_analysis_prompt(language: str, code: str) -> str:
    """Get formatted security analysis prompt"""
    return CODE_REVIEW_PROMPTS["security_analysis_template"].format(
        language=language,
        code=code
    )

def get_performance_analysis_prompt(language: str, code: str) -> str:
    """Get formatted performance analysis prompt"""
    return CODE_REVIEW_PROMPTS["performance_analysis_template"].format(
        language=language,
        code=code
    )

def get_explanation_prompt(language: str, code: str) -> str:
    """Get formatted code explanation prompt"""
    return CODE_REVIEW_PROMPTS["explain_code_template"].format(
        language=language,
        code=code
    )

def get_test_generation_prompt(language: str, code: str) -> str:
    """Get formatted test generation prompt"""
    return CODE_REVIEW_PROMPTS["generate_test_template"].format(
        language=language,
        code=code
    )

def get_language_specific_guidelines(language: str) -> str:
    """Get language-specific review guidelines"""
    language = language.lower()
    if language in CODE_REVIEW_PROMPTS["language_specific_review"]:
        return CODE_REVIEW_PROMPTS["language_specific_review"][language]
    return ""

# Prompt validation and sanitization
def validate_prompt_parameters(language: str, code: str) -> tuple[bool, str]:
    """Validate prompt parameters"""
    if not language or not language.strip():
        return False, "Language is required"
    
    if not code or not code.strip():
        return False, "Code is required"
    
    # Limit code size to prevent token limit issues
    if len(code) > 10000:  # Adjust based on model context window
        return False, "Code is too large for analysis. Please limit to 10,000 characters."
    
    return True, ""

def sanitize_code_for_prompt(code: str) -> str:
    """Sanitize code for prompt inclusion"""
    # Remove extra whitespace
    code = code.strip()
    
    # Escape triple backticks if present
    code = code.replace('```', '\\`\\`\\`')
    
    # Limit length while preserving structure
    if len(code) > 8000:
        # Try to keep important parts
        lines = code.split('\n')
        if len(lines) > 200:
            # Keep first 100 and last 100 lines
            code = '\n'.join(lines[:100] + ["\n...\n"] + lines[-100:])
    
    return code

def create_custom_prompt(
    language: str, 
    code: str, 
    focus_areas: list = None,
    specific_questions: list = None
) -> str:
    """Create a custom prompt based on user requirements"""
    
    code = sanitize_code_for_prompt(code)
    
    base_prompt = f"""
    You are an expert code reviewer analyzing {language} code.
    
    CODE TO REVIEW:
    ```
    {code}
    ```
    
    """
    
    if focus_areas:
        base_prompt += f"\nFOCUS AREAS:\n"
        for area in focus_areas:
            base_prompt += f"- {area}\n"
    
    if specific_questions:
        base_prompt += f"\nSPECIFIC QUESTIONS TO ANSWER:\n"
        for i, question in enumerate(specific_questions, 1):
            base_prompt += f"{i}. {question}\n"
    
    base_prompt += """
    
    Please provide a comprehensive review covering:
    1. Code quality assessment
    2. Specific issues found
    3. Improvement suggestions
    4. Best practices recommendations
    
    Format your response as structured JSON.
    """
    
    return base_prompt