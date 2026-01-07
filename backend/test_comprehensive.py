"""
Comprehensive Backend API Tests for DecisionLog
Tests all endpoints: auth, decisions, tags, comments, votes, teams
"""

import requests
import time
import random
import string

BASE_URL = "http://localhost:8000"

# Test state
test_user = None
test_token = None
test_decision_id = None
test_tag_id = None
test_comment_id = None
test_team_id = None

def random_email():
    """Generate a random email for testing"""
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{suffix}@example.com"

def print_result(test_name: str, passed: bool, details: str = ""):
    """Pretty print test results"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details and not passed:
        print(f"       Details: {details}")

def test_root():
    """Test root endpoint"""
    try:
        res = requests.get(f"{BASE_URL}/")
        passed = res.status_code == 200 and "Welcome" in res.json().get("message", "")
        print_result("Root endpoint", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Root endpoint", False, str(e))
        return False

def test_register():
    """Test user registration"""
    global test_user, test_token
    test_user = {
        "email": random_email(),
        "password": "testpass123",
        "full_name": "Test User"
    }
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        passed = res.status_code == 200 and "access_token" in res.json()
        if passed:
            data = res.json()
            test_token = data["access_token"]
            test_user["id"] = data["user"]["id"]
        print_result("User registration", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("User registration", False, str(e))
        return False

def test_login():
    """Test user login"""
    global test_token
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        passed = res.status_code == 200 and "access_token" in res.json()
        if passed:
            test_token = res.json()["access_token"]
        print_result("User login", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("User login", False, str(e))
        return False

def test_login_wrong_password():
    """Test login with wrong password"""
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_user["email"],
            "password": "wrongpassword"
        })
        passed = res.status_code == 401
        print_result("Login wrong password (should fail)", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Login wrong password", False, str(e))
        return False

def auth_header():
    """Get authorization header"""
    return {"Authorization": f"Bearer {test_token}"}

def test_create_decision():
    """Test creating a decision"""
    global test_decision_id
    try:
        decision = {
            "title": "Test Decision",
            "context": "Testing context",
            "choice_made": "Test choice",
            "confidence_level": 4,
            "status": "pending",
            "outcome": "unknown",
            "notes": "Test notes"
        }
        res = requests.post(f"{BASE_URL}/decisions/", json=decision, headers=auth_header())
        passed = res.status_code == 200 and "id" in res.json()
        if passed:
            test_decision_id = res.json()["id"]
        print_result("Create decision", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Create decision", False, str(e))
        return False

def test_get_decisions():
    """Test getting all decisions"""
    try:
        res = requests.get(f"{BASE_URL}/decisions/", headers=auth_header())
        passed = res.status_code == 200 and isinstance(res.json(), list)
        print_result("Get decisions", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Get decisions", False, str(e))
        return False

def test_update_decision():
    """Test updating a decision"""
    try:
        update = {
            "title": "Updated Decision Title",
            "context": "Updated context",
            "choice_made": "Updated choice",
            "confidence_level": 5,
            "status": "reviewed",
            "outcome": "success",
            "notes": "Updated notes"
        }
        res = requests.put(f"{BASE_URL}/decisions/{test_decision_id}", json=update, headers=auth_header())
        passed = res.status_code == 200 and res.json().get("title") == "Updated Decision Title"
        print_result("Update decision", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Update decision", False, str(e))
        return False

def test_create_tag():
    """Test creating a tag"""
    global test_tag_id
    try:
        tag = {"name": f"TestTag{random.randint(1000,9999)}"}
        res = requests.post(f"{BASE_URL}/tags/", json=tag, headers=auth_header())
        passed = res.status_code == 200 and "id" in res.json()
        if passed:
            test_tag_id = res.json()["id"]
        print_result("Create tag", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Create tag", False, str(e))
        return False

def test_get_tags():
    """Test getting all tags"""
    try:
        res = requests.get(f"{BASE_URL}/tags/", headers=auth_header())
        passed = res.status_code == 200 and isinstance(res.json(), list)
        print_result("Get tags", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Get tags", False, str(e))
        return False

def test_create_comment():
    """Test creating a comment"""
    global test_comment_id
    try:
        comment = {
            "decision_id": test_decision_id,
            "content": "This is a test comment"
        }
        res = requests.post(f"{BASE_URL}/comments/", json=comment, headers=auth_header())
        passed = res.status_code == 200 and "id" in res.json()
        if passed:
            test_comment_id = res.json()["id"]
        print_result("Create comment", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Create comment", False, str(e))
        return False

def test_get_comments():
    """Test getting comments for a decision"""
    try:
        res = requests.get(f"{BASE_URL}/comments/decision/{test_decision_id}", headers=auth_header())
        passed = res.status_code == 200 and isinstance(res.json(), list)
        print_result("Get comments", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Get comments", False, str(e))
        return False

def test_update_comment():
    """Test updating a comment"""
    try:
        update = {"content": "Updated comment content"}
        res = requests.put(f"{BASE_URL}/comments/{test_comment_id}", json=update, headers=auth_header())
        passed = res.status_code == 200 and "Updated" in res.json().get("content", "")
        print_result("Update comment", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Update comment", False, str(e))
        return False

def test_create_team():
    """Test creating a team"""
    global test_team_id
    try:
        team = {
            "name": f"TestTeam{random.randint(1000,9999)}",
            "description": "A test team"
        }
        res = requests.post(f"{BASE_URL}/teams/", json=team, headers=auth_header())
        passed = res.status_code == 200 and "id" in res.json()
        if passed:
            test_team_id = res.json()["id"]
        print_result("Create team", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Create team", False, str(e))
        return False

def test_get_teams():
    """Test getting user's teams"""
    try:
        res = requests.get(f"{BASE_URL}/teams/", headers=auth_header())
        passed = res.status_code == 200 and isinstance(res.json(), list)
        print_result("Get teams", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Get teams", False, str(e))
        return False

def test_create_vote():
    """Test casting a vote"""
    try:
        vote = {
            "decision_id": test_decision_id,
            "vote": "approve"
        }
        res = requests.post(f"{BASE_URL}/votes/", json=vote, headers=auth_header())
        passed = res.status_code == 200
        print_result("Cast vote", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Cast vote", False, str(e))
        return False

def test_get_votes():
    """Test getting votes for a decision"""
    try:
        res = requests.get(f"{BASE_URL}/votes/decision/{test_decision_id}", headers=auth_header())
        passed = res.status_code == 200
        print_result("Get votes", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Get votes", False, str(e))
        return False

def test_delete_comment():
    """Test deleting a comment"""
    try:
        res = requests.delete(f"{BASE_URL}/comments/{test_comment_id}", headers=auth_header())
        passed = res.status_code == 200
        print_result("Delete comment", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Delete comment", False, str(e))
        return False

def test_delete_tag():
    """Test deleting a tag"""
    try:
        res = requests.delete(f"{BASE_URL}/tags/{test_tag_id}", headers=auth_header())
        passed = res.status_code == 200
        print_result("Delete tag", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Delete tag", False, str(e))
        return False

def test_delete_decision():
    """Test deleting a decision"""
    try:
        res = requests.delete(f"{BASE_URL}/decisions/{test_decision_id}", headers=auth_header())
        passed = res.status_code == 200
        print_result("Delete decision", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Delete decision", False, str(e))
        return False

def test_unauthorized_access():
    """Test accessing protected endpoint without auth"""
    try:
        res = requests.get(f"{BASE_URL}/decisions/")
        passed = res.status_code == 401 or res.status_code == 403
        print_result("Unauthorized access (should fail)", passed, res.text if not passed else "")
        return passed
    except Exception as e:
        print_result("Unauthorized access", False, str(e))
        return False


def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "="*60)
    print("🧪 DecisionLog Backend API Tests")
    print("="*60 + "\n")
    
    tests = [
        ("Root Endpoint", test_root),
        ("User Registration", test_register),
        ("User Login", test_login),
        ("Login Wrong Password", test_login_wrong_password),
        ("Create Decision", test_create_decision),
        ("Get Decisions", test_get_decisions),
        ("Update Decision", test_update_decision),
        ("Create Tag", test_create_tag),
        ("Get Tags", test_get_tags),
        ("Create Comment", test_create_comment),
        ("Get Comments", test_get_comments),
        ("Update Comment", test_update_comment),
        ("Create Team", test_create_team),
        ("Get Teams", test_get_teams),
        ("Cast Vote", test_create_vote),
        ("Get Votes", test_get_votes),
        ("Delete Comment", test_delete_comment),
        ("Delete Tag", test_delete_tag),
        ("Delete Decision", test_delete_decision),
        ("Unauthorized Access", test_unauthorized_access),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_result(name, False, str(e))
            failed += 1
    
    print("\n" + "="*60)
    print(f"📊 Test Results: {passed} passed, {failed} failed")
    print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
    print("="*60 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    run_all_tests()
