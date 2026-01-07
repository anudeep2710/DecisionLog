"""
Backend Tests for Chat and Bot Features
"""
import requests
import random
import string

BASE_URL = "http://localhost:8000"

# Global state for testing
test_user = None
test_token = None
test_team_id = None

def random_string(k=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

def print_result(test_name: str, passed: bool, details: str = ""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details and not passed:
        print(f"       Details: {details}")
    return passed

def setup():
    """Create user and team for testing"""
    global test_user, test_token, test_team_id
    
    # Register User
    email = f"chat_test_{random_string()}@example.com"
    password = "password123"
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email, "password": password, "full_name": "Chat Useer"
    }, timeout=5)
    if res.status_code != 200:
        print("Setup failed: Could not register user")
        return False
        
    data = res.json()
    test_token = data["access_token"]
    test_user = data["user"]
    
    # Create Team
    res = requests.post(f"{BASE_URL}/teams/", json={
        "name": f"Chat Team {random_string()}", "description": "Testing chat"
    }, headers={"Authorization": f"Bearer {test_token}"}, timeout=5)
    
    if res.status_code != 200:
        print("Setup failed: Could not create team")
        return False
        
    test_team_id = res.json()["id"]
    return True

def test_send_message():
    """Test sending a message to a team"""
    try:
        msg = {
            "team_id": test_team_id,
            "content": "Hello Team!"
        }
        res = requests.post(f"{BASE_URL}/chat/", json=msg, headers={"Authorization": f"Bearer {test_token}"}, timeout=5)
        passed = res.status_code == 200 and res.json()["content"] == "Hello Team!"
        return print_result("Send Message", passed, res.text)
    except Exception as e:
        return print_result("Send Message", False, str(e))

def test_get_messages():
    """Test retrieving messages for a team"""
    try:
        res = requests.get(f"{BASE_URL}/chat/{test_team_id}", headers={"Authorization": f"Bearer {test_token}"}, timeout=5)
        passed = res.status_code == 200 and len(res.json()) > 0 and res.json()[0]["content"] == "Hello Team!"
        return print_result("Get Messages", passed, res.text)
    except Exception as e:
        return print_result("Get Messages", False, str(e))

def test_bot_query_count():
    """Test bot query: How many decisions"""
    try:
        # Create a decision first
        requests.post(f"{BASE_URL}/decisions/", json={
            "title": "Test Decision", "context": "ctx", "choice_made": "choice"
        }, headers={"Authorization": f"Bearer {test_token}"}, timeout=5)
        
        res = requests.post(f"{BASE_URL}/bot/query", json={"query": "How many decisions"}, headers={"Authorization": f"Bearer {test_token}"}, timeout=5)
        data = res.json()
        passed = res.status_code == 200 and "total of 1 decisions" in data["answer"]
        return print_result("Bot Query: Count", passed, res.text)
    except Exception as e:
        return print_result("Bot Query: Count", False, str(e))

def test_bot_query_status():
    """Test bot query: Review status"""
    try:
        res = requests.post(f"{BASE_URL}/bot/query", json={"query": "pending decisions"}, headers={"Authorization": f"Bearer {test_token}"}, timeout=5)
        data = res.json()
        passed = res.status_code == 200 and "pending decisions" in data["answer"]
        return print_result("Bot Query: Status", passed, res.text)
    except Exception as e:
        return print_result("Bot Query: Status", False, str(e))

def run_tests():
    print("\n🧪 Testing Chat & Bot Features...")
    if not setup():
        return
        
    test_send_message()
    test_get_messages()
    test_bot_query_count()
    test_bot_query_status()
    print("\nDone.")

if __name__ == "__main__":
    run_tests()
