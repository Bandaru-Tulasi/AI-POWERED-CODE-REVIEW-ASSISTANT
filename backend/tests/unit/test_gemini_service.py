"""
Unit tests for Gemini service
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.gemini_service import GeminiService

@pytest.mark.asyncio
class TestGeminiService:
    """Test GeminiService class"""
    
    @pytest.fixture
    def gemini_service(self):
        # Create service with mock API key
        service = GeminiService()
        service.api_key = "test-api-key"
        return service
    
    @patch('google.generativeai.configure')
    @patch('google.generativeai.GenerativeModel')
    def test_init_with_api_key(self, mock_model, mock_configure):
        """Test initialization with API key"""
        mock_model_instance = Mock()
        mock_model.return_value = mock_model_instance
        
        service = GeminiService()
        service.api_key = "test-api-key"
        service._initialize_client()
        
        mock_configure.assert_called_once_with(api_key="test-api-key")
        mock_model.assert_called_once()
        
    def test_init_without_api_key(self):
        """Test initialization without API key"""
        service = GeminiService()
        service.api_key = ""
        service._initialize_client()
        
        # Should not crash, model should be None
        assert service.model is None
        
    @patch('google.generativeai.GenerativeModel')
    @pytest.mark.asyncio
    async def test_get_code_feedback_success(self, mock_model):
        """Test getting code feedback successfully"""
        # Mock response
        mock_response = Mock()
        mock_response.text = """{
            "quality_score": 85.5,
            "security_score": 90.0,
            "maintainability_score": 80.0,
            "suggestions": ["Add comments", "Improve naming"],
            "issues": [],
            "security_issues": []
        }"""
        
        # Mock model
        mock_model_instance = Mock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_model_instance
        
        service = GeminiService()
        service.api_key = "test-api-key"
        service.model = mock_model_instance
        
        # Test
        code = "def hello(): print('world')"
        language = "python"
        result = await service.get_code_feedback(code, language)
        
        # Assertions
        assert "quality_score" in result
        assert "security_score" in result
        assert "maintainability_score" in result
        assert "suggestions" in result
        assert "analysis_duration" in result
        
        # Model should have been called
        mock_model_instance.generate_content.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_get_code_feedback_no_model(self):
        """Test getting code feedback when model is not available"""
        service = GeminiService()
        service.model = None
        
        code = "def hello(): print('world')"
        language = "python"
        result = await service.get_code_feedback(code, language)
        
        # Should return default feedback
        assert "quality_score" in result
        assert "suggestions" in result
        assert "analysis_duration" in result
        
    @patch('google.generativeai.GenerativeModel')
    @pytest.mark.asyncio
    async def test_get_code_feedback_parse_error(self, mock_model):
        """Test getting code feedback with parse error"""
        # Mock response with invalid JSON
        mock_response = Mock()
        mock_response.text = "Invalid response without JSON"
        
        # Mock model
        mock_model_instance = Mock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_model_instance
        
        service = GeminiService()
        service.api_key = "test-api-key"
        service.model = mock_model_instance
        
        # Test
        code = "def hello(): print('world')"
        language = "python"
        result = await service.get_code_feedback(code, language)
        
        # Should still return parsed result
        assert "quality_score" in result
        assert "suggestions" in result
        
    @patch('google.generativeai.GenerativeModel')
    @pytest.mark.asyncio
    async def test_generate_explanation(self, mock_model):
        """Test generating code explanation"""
        # Mock response
        mock_response = Mock()
        mock_response.text = "This code prints 'hello world'"
        
        # Mock model
        mock_model_instance = Mock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_model_instance
        
        service = GeminiService()
        service.api_key = "test-api-key"
        service.model = mock_model_instance
        
        # Test
        code = "print('hello world')"
        concept = "print function"
        result = await service.generate_explanation(code, concept)
        
        # Assertions
        assert isinstance(result, str)
        assert len(result) > 0
        
    @pytest.mark.asyncio
    async def test_generate_explanation_no_model(self):
        """Test generating explanation when model is not available"""
        service = GeminiService()
        service.model = None
        
        code = "print('hello world')"
        concept = "print function"
        result = await service.generate_explanation(code, concept)
        
        # Should return message about configuring API
        assert "Configure" in result or "Gemini" in result
        
    @patch('google.generativeai.GenerativeModel')
    @pytest.mark.asyncio
    async def test_suggest_improvements(self, mock_model):
        """Test suggesting improvements"""
        # Mock response
        mock_response = Mock()
        mock_response.text = "1. Add error handling\n2. Use better variable names"
        
        # Mock model
        mock_model_instance = Mock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_model_instance
        
        service = GeminiService()
        service.api_key = "test-api-key"
        service.model = mock_model_instance
        
        # Test
        code = "def calc(x): return x * 2"
        language = "python"
        result = await service.suggest_improvements(code, language)
        
        # Assertions
        assert "suggestions" in result
        assert isinstance(result["suggestions"], list)
        
    def test_parse_feedback_text(self):
        """Test parsing feedback text"""
        service = GeminiService()
        
        feedback_text = """The code looks good overall. Quality score: 85/100.
        Suggestions:
        - Add more comments
        - Improve error handling
        - Use constants for magic numbers"""
        
        result = service._parse_feedback_text(feedback_text)
        
        assert "quality_score" in result
        assert "suggestions" in result
        assert "security_score" in result
        assert "maintainability_score" in result
        assert "complexity_rating" in result
        assert "detailed_feedback" in result
        
        # Check scores
        assert 0 <= result["quality_score"] <= 100
        assert 0 <= result["security_score"] <= 100
        assert 0 <= result["maintainability_score"] <= 100
        
        # Check suggestions
        assert isinstance(result["suggestions"], list)
        assert len(result["suggestions"]) > 0
        
    def test_extract_summary(self):
        """Test extracting summary from text"""
        service = GeminiService()
        
        text = "First sentence. Second sentence. Third sentence. Fourth sentence."
        summary = service._extract_summary(text)
        
        # Should extract first 2-3 sentences
        assert "First sentence" in summary
        assert "Second sentence" in summary
        assert "Fourth sentence" not in summary
        
    def test_estimate_complexity(self):
        """Test estimating complexity from text"""
        service = GeminiService()
        
        # Test high complexity
        high_text = "This code is very complex and difficult to understand."
        assert service._estimate_complexity(high_text) == "high"
        
        # Test medium complexity
        medium_text = "The code has some complex parts."
        assert service._estimate_complexity(medium_text) == "medium"
        
        # Test low complexity
        low_text = "Simple and straightforward code."
        assert service._estimate_complexity(low_text) == "low"
        
        # Test default
        default_text = "Code analysis complete."
        assert service._estimate_complexity(default_text) == "medium"