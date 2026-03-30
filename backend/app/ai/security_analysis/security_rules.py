"""
Security rules and patterns for vulnerability detection
"""
from typing import Dict, List, Any

class SecurityRules:
    """Collection of security rules for different languages"""
    
    @staticmethod
    def get_all_rules() -> Dict[str, List[Dict[str, Any]]]:
        """
        Get all security rules for all supported languages
        """
        return {
            "python": SecurityRules.get_python_rules(),
            "javascript": SecurityRules.get_javascript_rules(),
            "java": SecurityRules.get_java_rules(),
            "php": SecurityRules.get_php_rules(),
            "csharp": SecurityRules.get_csharp_rules(),
            "go": SecurityRules.get_go_rules(),
            "ruby": SecurityRules.get_ruby_rules(),
            "rust": SecurityRules.get_rust_rules()
        }
    
    @staticmethod
    def get_python_rules() -> List[Dict[str, Any]]:
        """Get Python-specific security rules"""
        return [
            {
                "category": "SQL Injection",
                "rules": [
                    {
                        "id": "PY-SQLI-001",
                        "pattern": r"cursor\.execute\('.*' % .*\)",
                        "description": "String formatting in SQL query",
                        "severity": "critical"
                    },
                    {
                        "id": "PY-SQLI-002",
                        "pattern": r"cursor\.execute\('.*'\.format\(.*\)\)",
                        "description": "String formatting with format() in SQL",
                        "severity": "critical"
                    },
                    {
                        "id": "PY-SQLI-003",
                        "pattern": r"cursor\.execute\('.*' \+ .*\)",
                        "description": "String concatenation in SQL query",
                        "severity": "critical"
                    }
                ]
            },
            {
                "category": "Command Injection",
                "rules": [
                    {
                        "id": "PY-CMDI-001",
                        "pattern": r"os\.system\(",
                        "description": "os.system() with user input",
                        "severity": "high"
                    },
                    {
                        "id": "PY-CMDI-002",
                        "pattern": r"subprocess\.call\(",
                        "description": "subprocess.call() with user input",
                        "severity": "high"
                    },
                    {
                        "id": "PY-CMDI-003",
                        "pattern": r"subprocess\.Popen\(",
                        "description": "subprocess.Popen() with user input",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "File Operations",
                "rules": [
                    {
                        "id": "PY-FILE-001",
                        "pattern": r"open\(.*\.\./",
                        "description": "Potential path traversal",
                        "severity": "high"
                    },
                    {
                        "id": "PY-FILE-002",
                        "pattern": r"open\(.*\.\.\\",
                        "description": "Potential path traversal (Windows)",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "Cryptography",
                "rules": [
                    {
                        "id": "PY-CRYPTO-001",
                        "pattern": r"hashlib\.md5\(",
                        "description": "Weak MD5 hash",
                        "severity": "medium"
                    },
                    {
                        "id": "PY-CRYPTO-002",
                        "pattern": r"hashlib\.sha1\(",
                        "description": "Weak SHA-1 hash",
                        "severity": "medium"
                    },
                    {
                        "id": "PY-CRYPTO-003",
                        "pattern": r"random\.\w+\(",
                        "description": "Insecure random number generation",
                        "severity": "medium"
                    }
                ]
            },
            {
                "category": "Serialization",
                "rules": [
                    {
                        "id": "PY-SERIAL-001",
                        "pattern": r"pickle\.loads\(",
                        "description": "Unsafe deserialization",
                        "severity": "critical"
                    },
                    {
                        "id": "PY-SERIAL-002",
                        "pattern": r"pickle\.load\(",
                        "description": "Unsafe deserialization from file",
                        "severity": "critical"
                    }
                ]
            },
            {
                "category": "Web Security",
                "rules": [
                    {
                        "id": "PY-WEB-001",
                        "pattern": r"debug\s*=\s*True",
                        "description": "Debug mode enabled",
                        "severity": "medium"
                    },
                    {
                        "id": "PY-WEB-002",
                        "pattern": r"SECRET_KEY\s*=\s*['\"].*?['\"]",
                        "description": "Hardcoded secret key",
                        "severity": "critical"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_javascript_rules() -> List[Dict[str, Any]]:
        """Get JavaScript-specific security rules"""
        return [
            {
                "category": "XSS",
                "rules": [
                    {
                        "id": "JS-XSS-001",
                        "pattern": r"innerHTML\s*=",
                        "description": "Direct innerHTML assignment",
                        "severity": "high"
                    },
                    {
                        "id": "JS-XSS-002",
                        "pattern": r"outerHTML\s*=",
                        "description": "Direct outerHTML assignment",
                        "severity": "high"
                    },
                    {
                        "id": "JS-XSS-003",
                        "pattern": r"document\.write\(",
                        "description": "document.write() with user input",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "Code Injection",
                "rules": [
                    {
                        "id": "JS-CI-001",
                        "pattern": r"eval\(",
                        "description": "eval() function usage",
                        "severity": "critical"
                    },
                    {
                        "id": "JS-CI-002",
                        "pattern": r"Function\(",
                        "description": "Function constructor with string",
                        "severity": "critical"
                    },
                    {
                        "id": "JS-CI-003",
                        "pattern": r"setTimeout\(.*\).*\)",
                        "description": "setTimeout with string",
                        "severity": "medium"
                    }
                ]
            },
            {
                "category": "Node.js Specific",
                "rules": [
                    {
                        "id": "JS-NODE-001",
                        "pattern": r"child_process\.exec\(",
                        "description": "child_process.exec() with user input",
                        "severity": "high"
                    },
                    {
                        "id": "JS-NODE-002",
                        "pattern": r"child_process\.spawn\(",
                        "description": "child_process.spawn() with user input",
                        "severity": "high"
                    },
                    {
                        "id": "JS-NODE-003",
                        "pattern": r"fs\.readFile\(.*\.\./",
                        "description": "Potential path traversal",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "Security Misconfiguration",
                "rules": [
                    {
                        "id": "JS-CONFIG-001",
                        "pattern": r"Access-Control-Allow-Origin\s*:\s*['\"]\*['\"]",
                        "description": "Overly permissive CORS",
                        "severity": "medium"
                    },
                    {
                        "id": "JS-CONFIG-002",
                        "pattern": r"localStorage\.setItem\([^)]*(token|jwt)[^)]*\)",
                        "description": "JWT in localStorage",
                        "severity": "medium"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_java_rules() -> List[Dict[str, Any]]:
        """Get Java-specific security rules"""
        return [
            {
                "category": "SQL Injection",
                "rules": [
                    {
                        "id": "JAVA-SQLI-001",
                        "pattern": r"Statement\.executeQuery\(.*\+\s*\w+\)",
                        "description": "String concatenation in SQL",
                        "severity": "critical"
                    },
                    {
                        "id": "JAVA-SQLI-002",
                        "pattern": r"executeUpdate\(.*\+\s*\w+\)",
                        "description": "String concatenation in executeUpdate",
                        "severity": "critical"
                    }
                ]
            },
            {
                "category": "Command Injection",
                "rules": [
                    {
                        "id": "JAVA-CMDI-001",
                        "pattern": r"Runtime\.getRuntime\(\)\.exec\(",
                        "description": "Runtime.exec() with user input",
                        "severity": "high"
                    },
                    {
                        "id": "JAVA-CMDI-002",
                        "pattern": r"ProcessBuilder\(",
                        "description": "ProcessBuilder with user input",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "Path Traversal",
                "rules": [
                    {
                        "id": "JAVA-PATH-001",
                        "pattern": r"new\s+File\(.*\.\./",
                        "description": "File constructor with ..",
                        "severity": "high"
                    },
                    {
                        "id": "JAVA-PATH-002",
                        "pattern": r"new\s+FileInputStream\(.*\.\./",
                        "description": "FileInputStream with ..",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "XXE",
                "rules": [
                    {
                        "id": "JAVA-XXE-001",
                        "pattern": r"DocumentBuilderFactory\.newInstance\(\)",
                        "description": "DocumentBuilderFactory without XXE protection",
                        "severity": "high"
                    },
                    {
                        "id": "JAVA-XXE-002",
                        "pattern": r"SAXParserFactory\.newInstance\(\)",
                        "description": "SAXParserFactory without XXE protection",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "Deserialization",
                "rules": [
                    {
                        "id": "JAVA-DESERIAL-001",
                        "pattern": r"ObjectInputStream\.readObject\(",
                        "description": "ObjectInputStream.readObject()",
                        "severity": "critical"
                    },
                    {
                        "id": "JAVA-DESERIAL-002",
                        "pattern": r"XMLDecoder\.readObject\(",
                        "description": "XMLDecoder.readObject()",
                        "severity": "critical"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_php_rules() -> List[Dict[str, Any]]:
        """Get PHP-specific security rules"""
        return [
            {
                "category": "SQL Injection",
                "rules": [
                    {
                        "id": "PHP-SQLI-001",
                        "pattern": r"mysql_query\(.*\.",
                        "description": "String concatenation in mysql_query",
                        "severity": "critical"
                    },
                    {
                        "id": "PHP-SQLI-002",
                        "pattern": r"mysqli_query\(.*\.",
                        "description": "String concatenation in mysqli_query",
                        "severity": "critical"
                    }
                ]
            },
            {
                "category": "XSS",
                "rules": [
                    {
                        "id": "PHP-XSS-001",
                        "pattern": r"echo\s+\$.*;",
                        "description": "Direct echo of variable",
                        "severity": "high"
                    },
                    {
                        "id": "PHP-XSS-002",
                        "pattern": r"print\s+\$.*;",
                        "description": "Direct print of variable",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "File Inclusion",
                "rules": [
                    {
                        "id": "PHP-FI-001",
                        "pattern": r"include\(.*\$.*\)",
                        "description": "Dynamic include",
                        "severity": "critical"
                    },
                    {
                        "id": "PHP-FI-002",
                        "pattern": r"require\(.*\$.*\)",
                        "description": "Dynamic require",
                        "severity": "critical"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_csharp_rules() -> List[Dict[str, Any]]:
        """Get C#-specific security rules"""
        return [
            {
                "category": "SQL Injection",
                "rules": [
                    {
                        "id": "CS-SQLI-001",
                        "pattern": r"SqlCommand\(.*\+\s*\w+\)",
                        "description": "String concatenation in SqlCommand",
                        "severity": "critical"
                    }
                ]
            },
            {
                "category": "XSS",
                "rules": [
                    {
                        "id": "CS-XSS-001",
                        "pattern": r"Response\.Write\(.*\)",
                        "description": "Direct Response.Write",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "Path Traversal",
                "rules": [
                    {
                        "id": "CS-PATH-001",
                        "pattern": r"File\.Open\(.*\.\.\\",
                        "description": "File.Open with ..",
                        "severity": "high"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_go_rules() -> List[Dict[str, Any]]:
        """Get Go-specific security rules"""
        return [
            {
                "category": "Command Injection",
                "rules": [
                    {
                        "id": "GO-CMDI-001",
                        "pattern": r"exec\.Command\(",
                        "description": "exec.Command with user input",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "SQL Injection",
                "rules": [
                    {
                        "id": "GO-SQLI-001",
                        "pattern": r"db\.Query\(.*\+.*\)",
                        "description": "String concatenation in Query",
                        "severity": "critical"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_ruby_rules() -> List[Dict[str, Any]]:
        """Get Ruby-specific security rules"""
        return [
            {
                "category": "Command Injection",
                "rules": [
                    {
                        "id": "RUBY-CMDI-001",
                        "pattern": r"system\(.*\#\{.*\}",
                        "description": "system() with interpolation",
                        "severity": "high"
                    }
                ]
            },
            {
                "category": "SQL Injection",
                "rules": [
                    {
                        "id": "RUBY-SQLI-001",
                        "pattern": r"execute\(.*\#\{.*\}",
                        "description": "execute() with interpolation",
                        "severity": "critical"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_rust_rules() -> List[Dict[str, Any]]:
        """Get Rust-specific security rules"""
        return [
            {
                "category": "Unsafe Code",
                "rules": [
                    {
                        "id": "RUST-UNSAFE-001",
                        "pattern": r"unsafe\s*\{",
                        "description": "unsafe block",
                        "severity": "medium"
                    }
                ]
            }
        ]
    
    @staticmethod
    def get_rule_by_id(rule_id: str) -> Dict[str, Any]:
        """
        Get a specific rule by ID
        """
        all_rules = SecurityRules.get_all_rules()
        
        for language, categories in all_rules.items():
            for category in categories:
                for rule in category["rules"]:
                    if rule["id"] == rule_id:
                        return {
                            "language": language,
                            "category": category["category"],
                            **rule
                        }
        
        return {}
    
    @staticmethod
    def get_rules_by_severity(severity: str) -> List[Dict[str, Any]]:
        """
        Get all rules with a specific severity
        """
        rules = []
        all_rules = SecurityRules.get_all_rules()
        
        for language, categories in all_rules.items():
            for category in categories:
                for rule in category["rules"]:
                    if rule["severity"] == severity:
                        rules.append({
                            "language": language,
                            "category": category["category"],
                            **rule
                        })
        
        return rules
    
    @staticmethod
    def get_rules_by_language(language: str) -> List[Dict[str, Any]]:
        """
        Get all rules for a specific language
        """
        all_rules = SecurityRules.get_all_rules()
        return all_rules.get(language.lower(), [])