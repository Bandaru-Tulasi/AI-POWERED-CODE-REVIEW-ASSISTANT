"""
Integration tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
import json

@pytest.mark.asyncio
class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    @pytest.fixture
    def client(self, db_session):
        """Create test client"""
        from app.main import app
        from app.database.session import get_db
        
        # Override get_db dependency
        async def override_get_db():
            yield db_session
        
        app.dependency_overrides[get_db] = override_get_db
        with TestClient(app) as test_client:
            yield test_client
        app.dependency_overrides.clear()
    
    def test_register_user(self, client, test_user_data):
        """Test user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]
        assert "password" not in data  # Password should not be returned
        assert "hashed_password" not in data
    
    def test_register_duplicate_email(self, client, test_user_data):
        """Test registering with duplicate email"""
        # First registration
        client.post("/api/auth/register", json=test_user_data)
        
        # Second registration with same email
        duplicate_data = test_user_data.copy()
        duplicate_data["username"] = "differentuser"
        response = client.post("/api/auth/register", json=duplicate_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_login_success(self, client, test_user_data):
        """Test successful login"""
        # Register user first
        client.post("/api/auth/register", json=test_user_data)
        
        # Login
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
    
    def test_login_invalid_credentials(self, client, test_user_data):
        """Test login with invalid credentials"""
        # Register user
        client.post("/api/auth/register", json=test_user_data)
        
        # Try login with wrong password
        login_data = {
            "username": test_user_data["email"],
            "password": "WrongPassword123!"
        }
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_get_current_user_without_auth(self, client):
        """Test getting current user without authentication"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401
        assert "not authenticated" in response.json()["detail"].lower()
    
    def test_get_current_user_with_auth(self, client, test_user_data):
        """Test getting current user with authentication"""
        # Register and login
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]

@pytest.mark.asyncio
class TestCodeReviewEndpoints:
    """Test code review endpoints"""
    
    @pytest.fixture
    def auth_client(self, client, test_user_data):
        """Create authenticated client"""
        # Register and login
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Set auth headers
        client.headers.update({"Authorization": f"Bearer {token}"})
        return client
    
    def test_analyze_code(self, auth_client, test_code_python):
        """Test code analysis endpoint"""
        analysis_data = {
            "code": test_code_python,
            "language": "python"
        }
        
        response = auth_client.post("/api/code-review/analyze", json=analysis_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "review_id" in data
        assert "quality_score" in data
        assert "security_score" in data
        assert "maintainability_score" in data
        assert "issues" in data
        assert "suggestions" in data
        assert "vulnerabilities" in data
        assert "complexity_score" in data
        assert "lines_of_code" in data
        assert "technical_debt" in data
        assert "analysis_duration" in data
        
        # Check score ranges
        assert 0 <= data["quality_score"] <= 100
        assert 0 <= data["security_score"] <= 100
        assert 0 <= data["maintainability_score"] <= 100
        assert data["lines_of_code"] > 0
    
    def test_analyze_code_invalid_language(self, auth_client, test_code_python):
        """Test code analysis with invalid language"""
        analysis_data = {
            "code": test_code_python,
            "language": "invalid_language"
        }
        
        response = auth_client.post("/api/code-review/analyze", json=analysis_data)
        
        # Should still work (fallback to basic analysis)
        assert response.status_code == 200
    
    def test_create_code_review(self, auth_client, test_code_python):
        """Test creating a code review"""
        review_data = {
            "title": "Test Code Review",
            "description": "Testing code review creation",
            "language": "python",
            "original_code": test_code_python
        }
        
        response = auth_client.post("/api/code-review/", json=review_data)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["title"] == review_data["title"]
        assert data["description"] == review_data["description"]
        assert data["language"] == review_data["language"]
        assert data["original_code"] == review_data["original_code"]
        assert data["status"] == "pending"
    
    def test_get_code_reviews(self, auth_client):
        """Test getting code reviews"""
        response = auth_client.get("/api/code-review/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
    
    def test_get_code_review_by_id(self, auth_client, test_code_python):
        """Test getting a specific code review"""
        # First create a review
        review_data = {
            "title": "Test Review",
            "language": "python",
            "original_code": test_code_python
        }
        create_response = auth_client.post("/api/code-review/", json=review_data)
        review_id = create_response.json()["id"]
        
        # Get the review
        response = auth_client.get(f"/api/code-review/{review_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == review_id
        assert data["title"] == review_data["title"]
        assert data["language"] == review_data["language"]
    
    def test_get_nonexistent_code_review(self, auth_client):
        """Test getting a non-existent code review"""
        response = auth_client.get("/api/code-review/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_update_code_review(self, auth_client, test_code_python):
        """Test updating a code review"""
        # Create a review
        review_data = {
            "title": "Original Title",
            "language": "python",
            "original_code": test_code_python
        }
        create_response = auth_client.post("/api/code-review/", json=review_data)
        review_id = create_response.json()["id"]
        
        # Update the review
        update_data = {
            "title": "Updated Title",
            "description": "Updated description"
        }
        response = auth_client.put(f"/api/code-review/{review_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == review_id
        assert data["title"] == update_data["title"]
        assert data["description"] == update_data["description"]
    
    def test_delete_code_review(self, auth_client, test_code_python):
        """Test deleting a code review"""
        # Create a review
        review_data = {
            "title": "Review to delete",
            "language": "python",
            "original_code": test_code_python
        }
        create_response = auth_client.post("/api/code-review/", json=review_data)
        review_id = create_response.json()["id"]
        
        # Delete the review
        response = auth_client.delete(f"/api/code-review/{review_id}")
        
        assert response.status_code == 204
        
        # Verify it's deleted
        get_response = auth_client.get(f"/api/code-review/{review_id}")
        assert get_response.status_code == 404
    
    def test_analyze_with_ai(self, auth_client, test_code_python):
        """Test triggering AI analysis"""
        # Create a review first
        review_data = {
            "title": "AI Analysis Test",
            "language": "python",
            "original_code": test_code_python
        }
        create_response = auth_client.post("/api/code-review/", json=review_data)
        review_id = create_response.json()["id"]
        
        # Trigger AI analysis
        response = auth_client.post(f"/api/code-review/{review_id}/analyze-with-ai")
        
        # Should return accepted status
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "review_id" in data
        assert data["review_id"] == review_id
        assert data["status"] == "processing"

@pytest.mark.asyncio
class TestRepositoryEndpoints:
    """Test repository endpoints"""
    
    @pytest.fixture
    def auth_client(self, client, test_user_data):
        """Create authenticated client"""
        # Register and login
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Set auth headers
        client.headers.update({"Authorization": f"Bearer {token}"})
        return client
    
    def test_create_repository(self, auth_client):
        """Test creating a repository"""
        repo_data = {
            "name": "test-repo",
            "description": "Test repository",
            "source": "github",
            "private": False,
            "default_branch": "main",
            "language": "python"
        }
        
        response = auth_client.post("/api/repositories/", json=repo_data)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["name"] == repo_data["name"]
        assert data["description"] == repo_data["description"]
        assert data["source"] == repo_data["source"]
        assert data["private"] == repo_data["private"]
        assert data["default_branch"] == repo_data["default_branch"]
        assert data["language"] == repo_data["language"]
    
    def test_get_repositories(self, auth_client):
        """Test getting repositories"""
        response = auth_client.get("/api/repositories/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
    
    def test_get_repository_by_id(self, auth_client):
        """Test getting a specific repository"""
        # First create a repository
        repo_data = {
            "name": "test-repo-get",
            "description": "Test repository for get",
            "source": "github"
        }
        create_response = auth_client.post("/api/repositories/", json=repo_data)
        repo_id = create_response.json()["id"]
        
        # Get the repository
        response = auth_client.get(f"/api/repositories/{repo_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == repo_id
        assert data["name"] == repo_data["name"]
        assert data["description"] == repo_data["description"]
    
    def test_update_repository(self, auth_client):
        """Test updating a repository"""
        # Create a repository
        repo_data = {
            "name": "original-repo",
            "description": "Original description",
            "source": "github"
        }
        create_response = auth_client.post("/api/repositories/", json=repo_data)
        repo_id = create_response.json()["id"]
        
        # Update the repository
        update_data = {
            "name": "updated-repo",
            "description": "Updated description",
            "private": True
        }
        response = auth_client.put(f"/api/repositories/{repo_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == repo_id
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["private"] == update_data["private"]
    
    def test_delete_repository(self, auth_client):
        """Test deleting a repository"""
        # Create a repository
        repo_data = {
            "name": "repo-to-delete",
            "description": "Repository to delete",
            "source": "github"
        }
        create_response = auth_client.post("/api/repositories/", json=repo_data)
        repo_id = create_response.json()["id"]
        
        # Delete the repository
        response = auth_client.delete(f"/api/repositories/{repo_id}")
        
        assert response.status_code == 204
        
        # Verify it's deleted
        get_response = auth_client.get(f"/api/repositories/{repo_id}")
        assert get_response.status_code == 404

@pytest.mark.asyncio
class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    @pytest.fixture
    def auth_client(self, client, test_user_data):
        """Create authenticated client"""
        # Register and login
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Set auth headers
        client.headers.update({"Authorization": f"Bearer {token}"})
        return client
    
    def test_get_code_review_metrics(self, auth_client):
        """Test getting code review metrics"""
        response = auth_client.get("/api/analytics/metrics")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        # If there are metrics, check structure
        if data:
            metric = data[0]
            assert "date" in metric
            assert "total_reviews" in metric
            assert "avg_quality_score" in metric
            assert "avg_security_score" in metric
            assert "total_issues_found" in metric
            assert "avg_complexity_score" in metric
    
    def test_get_analysis_trends(self, auth_client):
        """Test getting analysis trends"""
        response = auth_client.get("/api/analytics/trends")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "last_7_days" in data
        assert "last_30_days" in data
        assert "last_90_days" in data
        
        assert isinstance(data["last_7_days"], list)
        assert isinstance(data["last_30_days"], list)
        assert isinstance(data["last_90_days"], list)
    
    def test_get_analytics_summary(self, auth_client):
        """Test getting analytics summary"""
        response = auth_client.get("/api/analytics/summary")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_reviews" in data
        assert "today_reviews" in data
        assert "avg_quality_score" in data
        assert "avg_security_score" in data
        assert "avg_maintainability_score" in data
        assert "total_repositories" in data
        assert "ai_analysis_percentage" in data
        
        # Check data types
        assert isinstance(data["total_reviews"], int)
        assert isinstance(data["today_reviews"], int)
        assert isinstance(data["avg_quality_score"], (int, float))
        assert isinstance(data["avg_security_score"], (int, float))
        assert isinstance(data["avg_maintainability_score"], (int, float))