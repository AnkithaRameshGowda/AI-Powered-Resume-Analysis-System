import requests

# Test with authentication token
def test_notifications_with_auth():
    try:
        # First login to get token
        login_data = {
            "email": "recruiter@example.com",  # Replace with actual recruiter email
            "password": "password123"
        }
        
        login_response = requests.post('http://localhost:5001/api/login', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            print("Got token, testing notifications...")
            
            # Test notifications with token
            headers = {'Authorization': f'Bearer {token}'}
            response = requests.get('http://localhost:5001/api/notifications', headers=headers)
            print(f"Notifications API status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                notifications = data.get('notifications', [])
                print(f"Found {len(notifications)} notifications")
                for i, notif in enumerate(notifications[:3]):
                    print(f"Notification {i}: {notif}")
            else:
                print(f"Error: {response.text}")
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_notifications_with_auth()
