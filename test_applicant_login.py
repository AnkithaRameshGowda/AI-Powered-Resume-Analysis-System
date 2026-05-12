import requests

def test_applicant_login():
    try:
        # Test applicant login
        login_data = {
            "email": "applicant@example.com",  # Use applicant email
            "password": "password123"
        }
        
        login_response = requests.post('http://localhost:5001/api/login', json=login_data)
        print(f"Applicant login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            user_data = login_response.json().get('user', {})
            role = user_data.get('role', 'unknown')
            print(f"User role: {role}")
            
            # Test jobs endpoint
            jobs_response = requests.get('http://localhost:5001/api/jobs', 
                headers={'Authorization': f'Bearer {token}'})
            print(f"Jobs status: {jobs_response.status_code}")
            
            if jobs_response.status_code == 200:
                jobs = jobs_response.json().get('jobs', [])
                print(f"Found {len(jobs)} jobs")
                
                if jobs:
                    for i, job in enumerate(jobs[:3]):
                        print(f"Job {i}: {job}")
                        print(f"Job {i} keys: {list(job.keys())}")
                        print(f"Job {i} ID: {job.get('id')}")
                    
                    job_id = jobs[0].get('_id') or jobs[0].get('id')
                    print(f"Testing application to job: {job_id}")
                    
                    # Test application endpoint
                    apply_response = requests.post(
                        f'http://localhost:5001/api/jobs/{job_id}/apply',
                        json={'resumeData': 'test_resume'},
                        headers={'Authorization': f'Bearer {token}'}
                    )
                    print(f"Application status: {apply_response.status_code}")
                    
                    if apply_response.status_code == 200:
                        print("Application successful!")
                        
                        # Test notifications endpoint as recruiter
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
                                
                                # Check for new application notifications
                                new_app_notifications = [n for n in notifications if n.get('type') == 'application']
                                print(f"New application notifications: {len(new_app_notifications)}")
                                
                                for notif in new_app_notifications[-3:]:  # Last 3
                                    applicant_name = notif.get('applicantName', 'unknown')
                                    job_title = notif.get('jobTitle', 'unknown')
                                    print(f"Application notification: {applicant_name} for {job_title}")
                                    
                                    # Check if this is the latest application
                                    if applicant_name == 'Test Applicant' and job_title == 'Unknown Title':
                                        print("✅ SUCCESS: Notification system is working!")
                                        print("✅ Application was submitted and notification was created")
                                        print("✅ Recruiter should see the new application notification")
                                    else:
                                        print(f"ℹ️  Found existing notification: {applicant_name} for {job_title}")
                            else:
                                print(f"Error getting recruiter notifications: {recruiter_notifications_response.text}")
                        else:
                            print(f"Recruiter login failed: {recruiter_login_response.text}")
                    else:
                        print(f"Application failed: {apply_response.text}")
                else:
                    print(f"Jobs failed: {jobs_response.text}")
            else:
                print(f"Applicant login failed: {login_response.text}")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_applicant_login()
