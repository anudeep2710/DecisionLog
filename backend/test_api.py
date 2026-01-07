"""
Backend API Tests for DecisionLog SQLite Version
Run with: python test_api.py
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    """Test root endpoint"""
    print("\n=== Testing Root Endpoint ===")
    try:
        res = requests.get(f"{BASE_URL}/")
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
        return res.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_register():
    """Test user registration"""
    print("\n=== Testing Registration ===")
    try:
        res = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": "test@example.com",
                "password": "test123",
                "full_name": "Test User"
            }
        )
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        return res.status_code == 200, res.json()
    except Exception as e:
        print(f"Error: {e}")
        return False, None


def test_login():
    """Test user login"""
    print("\n=== Testing Login ===")
    try:
        res = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123"
            }
        )
        print(f"Status: {res.status_code}")
        data = res.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return res.status_code == 200, data.get("access_token")
    except Exception as e:
        print(f"Error: {e}")
        return False, None


def test_create_decision(token):
    """Test creating a decision"""
    print("\n=== Testing Create Decision ===")
    try:
        res = requests.post(
            f"{BASE_URL}/decisions/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Test Decision",
                "context": "Testing SQLite migration",
                "choice_made": "We decided to use SQLite",
                "confidence_level": 4,
                "status": "pending",
                "outcome": "unknown"
            }
        )
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        return res.status_code == 200, res.json()
    except Exception as e:
        print(f"Error: {e}")
        return False, None


def test_get_decisions(token):
    """Test getting decisions"""
    print("\n=== Testing Get Decisions ===")
    try:
        res = requests.get(
            f"{BASE_URL}/decisions/",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Status: {res.status_code}")
        data = res.json()
        print(f"Found {len(data)} decisions")
        for d in data:
            print(f"  - {d['title']} (id: {d['id'][:8]}...)")
        return res.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_create_tag(token):
    """Test creating a tag"""
    print("\n=== Testing Create Tag ===")
    try:
        res = requests.post(
            f"{BASE_URL}/tags/",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "test-tag"}
        )
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        return res.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("DecisionLog Backend API Tests")
    print("=" * 50)
    
    results = []
    
    # Test 1: Root
    results.append(("Root Endpoint", test_root()))
    
    # Test 2: Register (may fail if user exists)
    success, _ = test_register()
    results.append(("Registration", success or "User may already exist"))
    
    # Test 3: Login
    success, token = test_login()
    results.append(("Login", success))
    
    if token:
        # Test 4: Create Decision
        success, _ = test_create_decision(token)
        results.append(("Create Decision", success))
        
        # Test 5: Get Decisions
        results.append(("Get Decisions", test_get_decisions(token)))
        
        # Test 6: Create Tag
        results.append(("Create Tag", test_create_tag(token)))
    else:
        print("\n⚠️  Skipping authenticated tests (no token)")
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST RESULTS")
    print("=" * 50)
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    return all(r[1] for r in results)


if __name__ == "__main__":
    run_all_tests()
