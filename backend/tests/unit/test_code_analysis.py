"""
Unit tests for code analysis
"""
import pytest
from app.ai.code_analysis.analyzer import CodeAnalyzer
from app.ai.code_analysis.quality_metrics import QualityMetricsCalculator
from app.ai.code_analysis.complexity_analysis import ComplexityAnalyzer

@pytest.mark.asyncio
class TestCodeAnalyzer:
    """Test CodeAnalyzer class"""
    
    @pytest.fixture
    def analyzer(self):
        return CodeAnalyzer()
    
    def test_analyze_python_code(self, analyzer, test_code_python):
        """Test analyzing Python code"""
        result = analyzer.analyze(test_code_python, "python")
        
        assert "quality_score" in result
        assert "maintainability_score" in result
        assert "complexity_score" in result
        assert "lines_of_code" in result
        assert "issues" in result
        assert "metrics" in result
        
        # Basic assertions
        assert 0 <= result["quality_score"] <= 100
        assert 0 <= result["maintainability_score"] <= 100
        assert result["lines_of_code"] > 0
        
    def test_analyze_javascript_code(self, analyzer, test_code_javascript):
        """Test analyzing JavaScript code"""
        result = analyzer.analyze(test_code_javascript, "javascript")
        
        assert "quality_score" in result
        assert "maintainability_score" in result
        assert "complexity_score" in result
        assert "lines_of_code" in result
        
        # Basic assertions
        assert 0 <= result["quality_score"] <= 100
        assert 0 <= result["maintainability_score"] <= 100
        
    def test_analyze_invalid_language(self, analyzer, test_code_python):
        """Test analyzing with invalid language"""
        result = analyzer.analyze(test_code_python, "invalid")
        
        # Should still return basic structure
        assert "quality_score" in result
        assert "lines_of_code" in result
        
    def test_calculate_metrics(self, analyzer, test_code_python):
        """Test calculating code metrics"""
        result = analyzer.analyze(test_code_python, "python")
        metrics = result["metrics"]
        
        assert "total_lines" in metrics
        assert "code_lines" in metrics
        assert "comment_lines" in metrics
        assert "blank_lines" in metrics
        assert "function_count" in metrics
        assert "class_count" in metrics
        
        assert metrics["total_lines"] > 0
        assert metrics["function_count"] >= 2  # At least 2 functions in test code

@pytest.mark.asyncio
class TestQualityMetricsCalculator:
    """Test QualityMetricsCalculator class"""
    
    @pytest.fixture
    def calculator(self):
        return QualityMetricsCalculator
    
    def test_calculate_code_smells_python(self, calculator, test_code_python):
        """Test detecting code smells in Python code"""
        smells = calculator.calculate_code_smells(test_code_python, "python")
        
        # Should be a list
        assert isinstance(smells, list)
        
    def test_calculate_code_smells_javascript(self, calculator, test_code_javascript):
        """Test detecting code smells in JavaScript code"""
        smells = calculator.calculate_code_smells(test_code_javascript, "javascript")
        
        # Should be a list
        assert isinstance(smells, list)
        
    def test_calculate_halstead_metrics(self, calculator, test_code_python):
        """Test calculating Halstead metrics"""
        metrics = calculator.calculate_halstead_metrics(test_code_python, "python")
        
        assert "vocabulary" in metrics
        assert "length" in metrics
        assert "volume" in metrics
        assert "difficulty" in metrics
        assert "effort" in metrics
        
        # Basic assertions
        assert metrics["volume"] >= 0
        assert metrics["effort"] >= 0

@pytest.mark.asyncio
class TestComplexityAnalyzer:
    """Test ComplexityAnalyzer class"""
    
    @pytest.fixture
    def analyzer(self):
        return ComplexityAnalyzer
    
    def test_calculate_cyclomatic_complexity(self, analyzer, test_code_python):
        """Test calculating cyclomatic complexity"""
        result = analyzer.calculate_cyclomatic_complexity(test_code_python, "python")
        
        assert "cyclomatic_complexity" in result
        assert "weighted_complexity" in result
        assert "decision_points" in result
        assert "function_count" in result
        assert "nesting_depth" in result
        assert "rating" in result
        assert "risk_level" in result
        
        # Basic assertions
        assert result["cyclomatic_complexity"] > 0
        assert result["rating"] in ["simple", "moderate", "complex", "very complex"]
        
    def test_analyze_cognitive_complexity(self, analyzer, test_code_python):
        """Test analyzing cognitive complexity"""
        result = analyzer.analyze_cognitive_complexity(test_code_python, "python")
        
        assert "cognitive_score" in result
        assert "rating" in result
        assert "issues" in result
        assert "max_nesting" in result
        
        # Basic assertions
        assert result["cognitive_score"] >= 0
        assert result["rating"] in ["easy", "moderate", "difficult", "very difficult"]
        
    def test_calculate_time_complexity(self, analyzer, test_code_python):
        """Test estimating time complexity"""
        result = analyzer.calculate_time_complexity(test_code_python, "python")
        
        assert "overall_complexity" in result
        assert "detected_patterns" in result
        assert "complexity_level" in result
        assert "performance_implications" in result
        
        # Should have a complexity rating
        assert result["overall_complexity"] in ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)", "O(n!)"]
        
    def test_calculate_memory_complexity(self, analyzer, test_code_python):
        """Test estimating memory complexity"""
        result = analyzer.calculate_memory_complexity(test_code_python, "python")
        
        assert "overall_complexity" in result
        assert "memory_usage_score" in result
        assert "rating" in result
        assert "detected_patterns" in result
        assert "recommendations" in result
        
        # Should have a complexity rating
        assert result["overall_complexity"] in ["O(1)", "O(log n)", "O(n)", "O(n²)"]