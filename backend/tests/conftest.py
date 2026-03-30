"""
Test configuration and fixtures
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.config import settings
from app.database.session import Base, get_db
from app.main import app
import os

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False}
)

# Create test session factory
TestingSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """
    Create event loop for tests
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function", autouse=True)
async def setup_database() -> AsyncGenerator:
    """
    Setup test database with tables
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session
    """
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession):
    """
    Create a test client with test database session
    """
    # Override get_db dependency
    async def override_get_db():
        try:
            yield db_session
        finally:
            await db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client
    from fastapi.testclient import TestClient
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_data():
    """
    Test user data
    """
    return {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "TestPass123!"
    }

@pytest.fixture
def test_code_python():
    """
    Test Python code
    """
    return '''def calculate_sum(numbers):
    """Calculate sum of numbers"""
    total = 0
    for num in numbers:
        total += num
    return total

def main():
    numbers = [1, 2, 3, 4, 5]
    result = calculate_sum(numbers)
    print(f"Sum: {result}")

if __name__ == "__main__":
    main()'''

@pytest.fixture
def test_code_javascript():
    """
    Test JavaScript code
    """
    return '''function calculateSum(numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total += numbers[i];
    }
    return total;
}

function main() {
    const numbers = [1, 2, 3, 4, 5];
    const result = calculateSum(numbers);
    console.log(`Sum: ${result}`);
}

main();'''

@pytest.fixture
def test_insecure_code():
    """
    Test insecure code with vulnerabilities
    """
    return '''import os
import pickle

def insecure_function(user_input):
    # SQL injection
    query = "SELECT * FROM users WHERE id = " + user_input
    
    # Command injection
    os.system("echo " + user_input)
    
    # Insecure deserialization
    data = pickle.loads(user_input)
    
    return data'''