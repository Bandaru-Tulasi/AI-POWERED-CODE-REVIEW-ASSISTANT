"""
Logging configuration for the application
"""
import logging
import sys
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime
import os
from typing import Dict, Any

class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON
        
        Args:
            record: Log record
        
        Returns:
            JSON string
        """
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'extra'):
            log_data.update(record.extra)
        
        return json.dumps(log_data)

class CustomFormatter(logging.Formatter):
    """Custom formatter with colors and detailed output"""
    
    # Color codes
    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    
    # Format strings
    format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"
    
    # Level-specific formats
    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: blue + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record with colors
        
        Args:
            record: Log record
        
        Returns:
            Formatted log string
        """
        log_fmt = self.FORMATS.get(record.levelno, self.format_str)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)

def setup_logging(log_level: str = "INFO", log_file: str = None, 
                  json_format: bool = False) -> None:
    """
    Setup logging configuration
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (optional)
        json_format: Use JSON format for logs
    """
    # Convert string level to logging level
    level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Clear existing handlers
    logging.getLogger().handlers.clear()
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(level)
    
    # Create formatter
    if json_format:
        formatter = JSONFormatter()
    else:
        formatter = CustomFormatter()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        # Create logs directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        # Rotating file handler (10MB per file, keep 5 backups)
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    # Suppress noisy library logs
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)

def get_logger(name: str) -> logging.Logger:
    """
    Get logger with given name
    
    Args:
        name: Logger name
    
    Returns:
        Logger instance
    """
    return logging.getLogger(name)

def log_request(request_id: str, method: str, url: str, 
                status_code: int = None, duration: float = None,
                user_id: str = None, extra: Dict[str, Any] = None) -> None:
    """
    Log HTTP request
    
    Args:
        request_id: Request ID
        method: HTTP method
        url: Request URL
        status_code: HTTP status code
        duration: Request duration in seconds
        user_id: User ID (if authenticated)
        extra: Additional log data
    """
    logger = get_logger("http")
    
    log_data = {
        "request_id": request_id,
        "method": method,
        "url": url,
        "status_code": status_code,
        "duration": duration,
        "user_id": user_id
    }
    
    if extra:
        log_data.update(extra)
    
    if status_code and status_code >= 400:
        logger.error(f"HTTP Request", extra=log_data)
    else:
        logger.info(f"HTTP Request", extra=log_data)

def log_code_analysis(review_id: int, language: str, lines_of_code: int,
                     quality_score: float, security_score: float,
                     duration: float, issues_found: int, extra: Dict[str, Any] = None) -> None:
    """
    Log code analysis
    
    Args:
        review_id: Code review ID
        language: Programming language
        lines_of_code: Number of lines of code
        quality_score: Quality score (0-100)
        security_score: Security score (0-100)
        duration: Analysis duration in seconds
        issues_found: Number of issues found
        extra: Additional log data
    """
    logger = get_logger("analysis")
    
    log_data = {
        "review_id": review_id,
        "language": language,
        "lines_of_code": lines_of_code,
        "quality_score": quality_score,
        "security_score": security_score,
        "duration": duration,
        "issues_found": issues_found
    }
    
    if extra:
        log_data.update(extra)
    
    logger.info(f"Code analysis completed", extra=log_data)

def log_security_scan(review_id: int, language: str, vulnerabilities_found: int,
                     risk_level: str, duration: float, extra: Dict[str, Any] = None) -> None:
    """
    Log security scan
    
    Args:
        review_id: Code review ID
        language: Programming language
        vulnerabilities_found: Number of vulnerabilities found
        risk_level: Risk level (critical, high, medium, low)
        duration: Scan duration in seconds
        extra: Additional log data
    """
    logger = get_logger("security")
    
    log_data = {
        "review_id": review_id,
        "language": language,
        "vulnerabilities_found": vulnerabilities_found,
        "risk_level": risk_level,
        "duration": duration
    }
    
    if extra:
        log_data.update(extra)
    
    if risk_level in ["critical", "high"]:
        logger.warning(f"Security scan completed with {risk_level} risk", extra=log_data)
    else:
        logger.info(f"Security scan completed", extra=log_data)

def log_ai_analysis(review_id: int, model: str, duration: float,
                   success: bool, error: str = None, extra: Dict[str, Any] = None) -> None:
    """
    Log AI analysis
    
    Args:
        review_id: Code review ID
        model: AI model used
        duration: Analysis duration in seconds
        success: Whether analysis was successful
        error: Error message (if failed)
        extra: Additional log data
    """
    logger = get_logger("ai")
    
    log_data = {
        "review_id": review_id,
        "model": model,
        "duration": duration,
        "success": success
    }
    
    if error:
        log_data["error"] = error
    
    if extra:
        log_data.update(extra)
    
    if success:
        logger.info(f"AI analysis completed", extra=log_data)
    else:
        logger.error(f"AI analysis failed", extra=log_data)

def log_webhook_event(source: str, event_type: str, repository: str,
                     success: bool, error: str = None, extra: Dict[str, Any] = None) -> None:
    """
    Log webhook event
    
    Args:
        source: Webhook source (github, gitlab, etc.)
        event_type: Event type (push, pull_request, etc.)
        repository: Repository name
        success: Whether processing was successful
        error: Error message (if failed)
        extra: Additional log data
    """
    logger = get_logger("webhook")
    
    log_data = {
        "source": source,
        "event_type": event_type,
        "repository": repository,
        "success": success
    }
    
    if error:
        log_data["error"] = error
    
    if extra:
        log_data.update(extra)
    
    if success:
        logger.info(f"Webhook processed", extra=log_data)
    else:
        logger.error(f"Webhook processing failed", extra=log_data)

def log_database_operation(operation: str, table: str, duration: float,
                          success: bool, error: str = None, extra: Dict[str, Any] = None) -> None:
    """
    Log database operation
    
    Args:
        operation: Database operation (insert, update, delete, select)
        table: Database table
        duration: Operation duration in seconds
        success: Whether operation was successful
        error: Error message (if failed)
        extra: Additional log data
    """
    logger = get_logger("database")
    
    log_data = {
        "operation": operation,
        "table": table,
        "duration": duration,
        "success": success
    }
    
    if error:
        log_data["error"] = error
    
    if extra:
        log_data.update(extra)
    
    if success:
        logger.debug(f"Database operation completed", extra=log_data)
    else:
        logger.error(f"Database operation failed", extra=log_data)