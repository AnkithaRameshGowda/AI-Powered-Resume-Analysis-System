import requests

def test_job_retrieval():
    try:
        # Login as recruiter to get token
        login_data = {
            "email": "recruiter@example.com",
            "password": "password123"
        }
        
        login_response = requests.post('http://localhost:5001/api/login', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            print("Got token, testing job retrieval...")
            
            # Get jobs first
            jobs_response = requests.get('http://localhost:5001/api/jobs', headers={'Authorization': f'Bearer {token}'})
            
            if jobs_response.status_code == 200:
                jobs = jobs_response.json().get('jobs', [])
                if jobs:
                    job_id = jobs[0]['id']
                    print(f"Testing job retrieval for ID: {job_id}")
                    
                    # Test direct job retrieval
                    job_response = requests.get(f'http://localhost:5001/api/jobs/{job_id}', headers={'Authorization': f'Bearer {token}'})
                    print(f"Job retrieval status: {job_response.status_code}")
                    
                    if job_response.status_code == 200:
                        job_data = job_response.json()
                        print(f"Job data: {job_data}")
                        print(f"Job fields: {list(job_data.keys())}")
                        
                        # Test application submission
                        apply_data = {'resumeData': 'test_resume'}
                        apply_response = requests.post(
                            f'http://localhost:5001/api/jobs/{job_id}/apply',
                            json=apply_data,
                            headers={'Authorization': f'Bearer {token}'}
                        )
                        print(f"Apply status: {apply_response.status_code}")
                        print(f"Apply response: {apply_response.text}")
                    else:
                        print(f"Job retrieval failed: {job_response.text}")
                else:
                    print("No jobs available")
            else:
                print(f"Jobs retrieval failed: {jobs_response.text}")
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_job_retrieval()
