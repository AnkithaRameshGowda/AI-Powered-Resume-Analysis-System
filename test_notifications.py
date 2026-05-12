import requests

try:
    print("Testing notifications API...")
    response = requests.get('http://localhost:5001/api/notifications', timeout=5)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Notifications count: {len(data.get('notifications', []))}")
        if data.get('notifications'):
            print("First notification:", data['notifications'][0] if data['notifications'] else "None")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")
