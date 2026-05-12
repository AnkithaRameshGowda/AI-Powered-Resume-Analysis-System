import requests
import traceback

def test_simple():
    try:
        # Test basic API connectivity
        response = requests.get('http://localhost:5001/api/jobs', timeout=5)
        print(f"Jobs API status: {response.status_code}")
        
        if response.status_code == 200:
            jobs = response.json().get('jobs', [])
            print(f"Found {len(jobs)} jobs")
            
            if jobs:
                # Test if jobs have required fields
                for i, job in enumerate(jobs[:3]):
                    print(f"Job {i} ID: {job.get('id')}")
                    print(f"Job {i} title: {job.get('title')}")
                    print(f"Job {i} keys: {list(job.keys())}")
                    
                    # Test job retrieval by ID
                    job_id = job.get('id')
                    if job_id:
                        job_response = requests.get(f'http://localhost:5001/api/jobs/{job_id}', timeout=5)
                        print(f"Job {job_id} retrieval status: {job_response.status_code}")
                        
                        if job_response.status_code == 200:
                            job_detail = job_response.json()
                            print(f"Job detail keys: {list(job_detail.keys()) if isinstance(job_detail, dict) else 'Not a dict'}")
                        else:
                            print(f"Job retrieval error: {job_response.text}")
                    else:
                        print(f"Job {i} missing ID field")
            else:
                print("No jobs found")
        else:
            print(f"Jobs API error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_simple()
