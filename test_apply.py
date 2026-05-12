import requests

def test_application_submission():
    try:
        # First login as applicant
        login_data = {
            "email": "applicant@example.com",  # Replace with actual applicant email
            "password": "password123"
        }
        
        login_response = requests.post('http://localhost:5001/api/login', json=login_data)
        print(f"Applicant login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            print("Got applicant token, testing job application...")
            
            # Get available jobs first
            jobs_response = requests.get('http://localhost:5001/api/jobs', headers={'Authorization': f'Bearer {token}'})
            if jobs_response.status_code == 200:
                jobs = jobs_response.json().get('jobs', [])
                if jobs:
                    job_id = jobs[0]['id']  # Use first available job
                    print(f"Applying to job: {job_id}")
                    
                    # Apply for job
                    apply_data = {
                        "resumeData": "base64_encoded_resume_data",
                        "matchScore": 85
                    }
                    
                    apply_response = requests.post(
                        f'http://localhost:5001/api/jobs/{job_id}/apply',
                        json=apply_data,
                        headers={'Authorization': f'Bearer {token}'}
                    )
                    print(f"Application status: {apply_response.status_code}")
                    
                    if apply_response.status_code == 200:
                        print("Application submitted successfully!")
                        
                        # Now check if recruiter got notification
                        print("Checking recruiter notifications...")
                        
                        # Login as recruiter to check notifications
                        recruiter_login_data = {
                            "email": "recruiter@example.com",
                            "password": "password123"
                        }
                        
                        recruiter_login_response = requests.post('http://localhost:5001/api/login', json=recruiter_login_data)
                        print(f"Recruiter login status: {recruiter_login_response.status_code}")
                        
                        if recruiter_login_response.status_code == 200:
                            recruiter_token = recruiter_login_response.json().get('token')
                            
                            # Check recruiter notifications
                            recruiter_notifications_response = requests.get(
                                'http://localhost:5001/api/notifications',
                                headers={'Authorization': f'Bearer {recruiter_token}'}
                            )
                            print(f"Recruiter notifications status: {recruiter_notifications_response.status_code}")
                            
                            if recruiter_notifications_response.status_code == 200:
                                notifications = recruiter_notifications_response.json().get('notifications', [])
                                print(f"Recruiter has {len(notifications)} notifications")
                                
                                # Check if new application notification exists
                                new_app_notifications = [n for n in notifications if n.get('type') == 'application']
                                print(f"New application notifications: {len(new_app_notifications)}")
                                
                                for notif in new_app_notifications:
                                    print(f"Application notification: {notif}")
                            else:
                                print(f"Error getting recruiter notifications: {recruiter_notifications_response.text}")
                        else:
                            print(f"Recruiter login failed: {recruiter_login_response.text}")
                    else:
                        print(f"Application failed: {apply_response.text}")
                else:
                    print("No jobs available")
            else:
                print(f"Applicant login failed: {login_response.text}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_application_submission()
