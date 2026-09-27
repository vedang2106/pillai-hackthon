import requests

BASE_URL = 'http://localhost:5000/api/social'

def test_social():
    print("=== TESTING SOCIAL & AI MANAGEMENT API ===")
    
    # 1. Test posting a visitor comment
    post_data = {
        "eventId": "66f54c98c70f45a2aade5011",
        "visitorName": "Demo Attendee",
        "comment": "Main gate entry was super smooth, but washrooms near Stage B were crowded.",
        "rating": 4
    }
    res = requests.post(f"{BASE_URL}/comments", json=post_data)
    print("Post Comment Response:", res.status_code, res.json())

    # 2. Get event signals & AI report
    res2 = requests.get(f"{BASE_URL}/event/66f54c98c70f45a2aade5011")
    print("Event Signals Response:", res2.status_code)
    data2 = res2.json()
    print(f"Total Comments: {data2.get('total')}")
    print("AI Report:", data2.get('aiReport'))

if __name__ == '__main__':
    test_social()
