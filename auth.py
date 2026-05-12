from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, current_user
import bcrypt
import os
import datetime
from datetime import timedelta
from bson.objectid import ObjectId
import json

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config["MONGO_URI"] = "mongodb://localhost:27017/jobmatchdb"
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

mongo = PyMongo(app)
jwt = JWTManager(app)

def parse_identity(identity):
    if isinstance(identity, str) and identity.startswith('{'):
        try:
            return json.loads(identity)
        except:
            return {}
    elif isinstance(identity, dict):
        return identity
    return {}

@jwt.user_identity_loader
def user_identity_lookup(user):
    if isinstance(user, dict):
        return json.dumps(user)
    return user

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    try:
        if isinstance(identity, str) and identity.startswith('{'):
            return json.loads(identity)
        return identity
    except:
        return identity

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password") or not data.get("role"):
        return jsonify({"error": "Missing required fields"}), 400
    if mongo.db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already exists"}), 400
    hashed_password = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
    user = {
        "email": data["email"],
        "password": hashed_password,
        "role": data["role"],
        "name": data.get("name", ""),
        "created_at": datetime.datetime.utcnow()
    }
    mongo.db.users.insert_one(user)
    access_token = create_access_token(identity={"email": user["email"], "role": user["role"], "userId": str(user["_id"])})
    return jsonify({"success": True, "token": access_token, "user": {"email": user["email"], "role": user["role"], "name": user["name"], "id": str(user["_id"])}}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400
    user = mongo.db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    if not bcrypt.checkpw(data["password"].encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    access_token = create_access_token(identity={"email": user["email"], "role": user["role"], "userId": str(user["_id"])})
    return jsonify({"success": True, "token": access_token, "user": {"email": user["email"], "role": user["role"], "name": user.get("name", "")}}), 200

@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        if not email:
            return jsonify({"error": "Invalid user identity"}), 400
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"email": user["email"], "role": user["role"], "name": user.get("name", "")}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        if not email:
            return jsonify({"error": "Invalid user identity"}), 400
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        profile = mongo.db.profiles.find_one({"userId": str(user["_id"])})
        if not profile:
            return jsonify({"userId": str(user["_id"]), "id": str(user["_id"]), "name": user.get("name", ""), "email": user["email"], "location": "", "bio": "", "profileImage": "", "experiences": [], "education": []}), 200
        profile["_id"] = str(profile["_id"])
        return jsonify(profile), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile", methods=["POST"])
@jwt_required()
def update_profile():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        if not email:
            return jsonify({"error": "Invalid user identity"}), 400
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "No profile data received"}), 400
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        if data.get("name"):
            mongo.db.users.update_one({"_id": user["_id"]}, {"$set": {"name": data["name"]}})
        profile = {
            "userId": str(user["_id"]),
            "name": data.get("name", user.get("name", "")),
            "email": user["email"],
            "location": data.get("location", ""),
            "bio": data.get("bio", ""),
            "profileImage": data.get("profileImage", ""),
            "experiences": data.get("experiences", []) if isinstance(data.get("experiences"), list) else [],
            "education": data.get("education", []) if isinstance(data.get("education"), list) else [],
            "updated_at": datetime.datetime.utcnow()
        }
        mongo.db.profiles.update_one({"userId": str(user["_id"])}, {"$set": profile}, upsert=True)
        return jsonify({"success": True, "message": "Profile updated successfully", "profile": profile}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.errorhandler(422)
def handle_unprocessable_entity(err):
    return jsonify({"error": "Invalid or expired token. Please login again."}), 422

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({'error': 'Invalid token', 'message': error_string}), 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify({'error': 'Authorization required', 'message': error_string}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired', 'message': 'Please login again'}), 401

@app.route("/api/jobs", methods=["POST"])
@jwt_required()
def create_job():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        role = identity.get("role")
        if role != "recruiter":
            return jsonify({"error": "Only recruiters can post jobs"}), 403
        data = request.get_json()
        if not data:
            return jsonify({"error": "No job data provided"}), 400
        for field in ["title", "company", "location", "description"]:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        job = {
            "title": data["title"],
            "company": data["company"],
            "location": data["location"],
            "description": data["description"],
            "skills": data.get("skills", []),
            "recruiterId": str(user["_id"]),
            "recruiterEmail": email,
            "active": True,
            "applications": [],
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        result = mongo.db.jobs.insert_one(job)
        job["_id"] = str(result.inserted_id)
        return jsonify({"success": True, "message": "Job posted successfully", "job": job}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jobs", methods=["GET"])
@jwt_required()
def get_jobs():
    try:
        active_only = request.args.get('active', 'true').lower() == 'true'
        query = {"active": True} if active_only else {}
        jobs = list(mongo.db.jobs.find(query).sort("created_at", -1))
        for job in jobs:
            job["_id"] = str(job["_id"])
            if "created_at" in job:
                job["createdAt"] = job.pop("created_at").isoformat()
            if "updated_at" in job:
                job["updatedAt"] = job.pop("updated_at").isoformat()
        return jsonify({"jobs": jobs}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/recruiter/jobs", methods=["GET"])
@jwt_required()
def get_recruiter_jobs():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        role = identity.get("role")
        if role != "recruiter":
            return jsonify({"error": "Only recruiters can access their posted jobs"}), 403
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        jobs = list(mongo.db.jobs.find({"recruiterId": str(user["_id"])}).sort("created_at", -1))
        for job in jobs:
            job["_id"] = str(job["_id"])
            if "created_at" in job:
                job["createdAt"] = job.pop("created_at").isoformat()
            if "updated_at" in job:
                job["updatedAt"] = job.pop("updated_at").isoformat()
        return jsonify({"jobs": jobs}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jobs/<job_id>", methods=["GET"])
@jwt_required()
def get_job(job_id):
    try:
        identity = parse_identity(get_jwt_identity())
        is_management = request.args.get('management', 'false').lower() == 'true'
        if is_management:
            role = identity.get("role")
            if role != "recruiter":
                return jsonify({"error": "Only recruiters can manage jobs"}), 403
        job = mongo.db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return jsonify({"error": "Job not found"}), 404
        if is_management:
            email = identity.get("email")
            user = mongo.db.users.find_one({"email": email})
            if not user or str(user["_id"]) != job.get("recruiterId"):
                return jsonify({"error": "You do not have permission to manage this job"}), 403
        job["_id"] = str(job["_id"])
        if "created_at" in job:
            job["createdAt"] = job.pop("created_at").isoformat()
        if "updated_at" in job:
            job["updatedAt"] = job.pop("updated_at").isoformat()
        return jsonify({"job": job}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jobs/<job_id>/apply", methods=["POST"])
@jwt_required()
def apply_for_job(job_id):
    try:
        print(f"DEBUG: Applying to job with ID: {job_id}")
        print(f"DEBUG: Job ID type: {type(job_id)}")
        
        # Validate job_id
        if not job_id:
            return jsonify({"error": "Job ID is required"}), 400
            
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        role = identity.get("role")
        if role != "applicant":
            return jsonify({"error": "Only applicants can apply for jobs"}), 403
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Try to convert job_id to ObjectId safely
        try:
            job_object_id = ObjectId(job_id)
            print(f"DEBUG: Converted job_id to ObjectId: {job_object_id}")
        except Exception as e:
            print(f"DEBUG: ObjectId conversion failed: {e}")
            return jsonify({"error": f"Invalid job ID: {job_id}"}), 400
            
        job = mongo.db.jobs.find_one({"_id": job_object_id})
        if not job:
            return jsonify({"error": "Job not found"}), 404
        print(f"DEBUG: Retrieved job: {job}")
        print(f"DEBUG: Job object type: {type(job)}")
        print(f"DEBUG: Job object methods: {dir(job)}")
        if not job.get("active", True):
            return jsonify({"error": "This job is no longer accepting applications"}), 400
        existing_application = mongo.db.applications.find_one({"jobId": job_id, "applicantId": str(user["_id"])})
        if existing_application:
            return jsonify({"error": "You have already applied for this job"}), 400
        data = request.get_json()
        if not data:
            return jsonify({"error": "No application data provided"}), 400
        if not data.get("resumeData"):
            return jsonify({"error": "Resume is required"}), 400
        
        print(f"DEBUG: Job object before access: {job}")
        print(f"DEBUG: Job object type: {type(job)}")
        print(f"DEBUG: Job object methods: {dir(job)}")
        
        application = {
            "jobId": job_id,
            "jobTitle": job.get("title", "Unknown Title"),
            "companyName": job.get("company", "Unknown Company"),
            "applicantId": str(user["_id"]),
            "applicantName": user.get("name", ""),
            "applicantEmail": email,
            "resumeData": data.get("resumeData"),
            "matchScore": data.get("matchScore", 0),
            "status": "pending",
            "notes": "",
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        print(f"DEBUG: Application object created: {application}")
        result = mongo.db.applications.insert_one(application)
        application_id = result.inserted_id
        mongo.db.jobs.update_one({"_id": ObjectId(job_id)}, {"$push": {"applications": str(application_id)}})
        application["_id"] = str(application_id)
        
        # Safe job title access
        job_title = job.get('title') if job else 'Unknown Job'
        print(f"Application submitted successfully for job: {job_title}")

        # Create notification for recruiter
        try:
            print(f"DEBUG: Creating notification for application")
            print(f"DEBUG: Job ID: {job_id}")
            print(f"DEBUG: Job data keys: {list(job.keys())}")
            print(f"DEBUG: Applicant: {user}")
            
            # Validate job has recruiterId
            recruiter_id = job.get("recruiterId")
            if not recruiter_id:
                print(f"ERROR: Job {job_id} has no recruiterId")
                print(f"ERROR: Job fields: {list(job.keys())}")
                # Try to find recruiter from job creation
                if "createdBy" in job:
                    recruiter_id = job.get("createdBy")
                    print(f"DEBUG: Found recruiter from createdBy: {recruiter_id}")
                else:
                    print(f"ERROR: Cannot determine recruiter for job {job_id}")
                    return jsonify({"success": True, "message": "Application submitted"}), 200
            
            print(f"DEBUG: Recruiter ID: {recruiter_id}")
            
            if "notifications" not in mongo.db.list_collection_names():
                mongo.db.create_collection("notifications")
            
            # Check if notification already exists
            existing_notification = mongo.db.notifications.find_one({
                "userId": recruiter_id,
                "type": "application",
                "jobId": job_id
            })
            
            print(f"DEBUG: Existing notification: {existing_notification}")
            
            if not existing_notification:
                notification_data = {
                    "userId": recruiter_id,
                    "type": "application",
                    "jobId": job_id,
                    "jobTitle": job.get("title", "Unknown Job"),
                    "company": job.get("company", "Unknown Company"),
                    "applicantName": user.get("name", "Unknown Applicant"),
                    "read": False,
                    "timestamp": datetime.datetime.utcnow()
                }
                
                print(f"DEBUG: Creating notification: {notification_data}")
                
                result = mongo.db.notifications.insert_one(notification_data)
                print(f"DEBUG: Notification inserted with ID: {result.inserted_id}")
                print("SUCCESS: Recruiter notification created")
            else:
                print("DEBUG: Duplicate recruiter notification prevented")
                
        except Exception as e:
            import traceback
            print(f"ERROR: Exception creating recruiter notification: {str(e)}")
            print(f"ERROR: Traceback: {traceback.format_exc()}")

        # Trigger AI analysis in background
        try:
            import requests
            import threading
            def trigger_analysis():
                try:
                    import time
                    time.sleep(1)
                    response = requests.post("http://localhost:5002/api/analyze-application", json={"application_id": str(application_id), "job_id": job_id})
                    print(f"AI analysis status: {response.status_code}")
                except Exception as e:
                    print(f"Error triggering AI analysis: {str(e)}")
            threading.Thread(target=trigger_analysis, daemon=True).start()
        except Exception as e:
            print(f"Failed to trigger AI analysis: {str(e)}")

        # Send welcome message from recruiter
        try:
            def send_welcome_msg():
                try:
                    import time
                    import requests
                    time.sleep(2)  # Wait a bit for application to be processed
                    welcome_data = {
                        "applicantId": str(user["_id"]),
                        "recruiterId": job.get("recruiterId"),
                        "jobTitle": job.get("title", "")
                    }
                    response = requests.post("http://localhost:5001/api/messages/send-welcome", json=welcome_data, headers={"Authorization": f"Bearer {request.headers.get('Authorization').split(' ')[1]}"})
                    print(f"Welcome message status: {response.status_code}")
                except Exception as e:
                    print(f"Error sending welcome message: {str(e)}")
            threading.Thread(target=send_welcome_msg, daemon=True).start()
        except Exception as e:
            print(f"Failed to trigger welcome message: {str(e)}")

        return jsonify({
            "success": True,
            "message": "Application submitted successfully",
            "application": {
                "id": application["_id"],
                "jobTitle": application["jobTitle"],
                "companyName": application["companyName"],
                "status": application["status"],
                "appliedAt": application["created_at"].isoformat()
            }
        }), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/jobs/<job_id>/applicants", methods=["GET"])
@jwt_required()
def get_job_applicants(job_id):
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        role = identity.get("role")
        if role != "recruiter":
            return jsonify({"error": "Only recruiters can access job applicants"}), 403
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        job = mongo.db.jobs.find_one({"_id": ObjectId(job_id), "recruiterId": str(user["_id"])})
        if not job:
            return jsonify({"error": "Job not found or you don't have permission"}), 404
        applications = list(mongo.db.applications.find({"jobId": job_id}))
        processed = []
        for app in applications:
            app_id = str(app["_id"])
            del app["_id"]
            app["id"] = app_id
            if "created_at" in app:
                app["appliedAt"] = app.pop("created_at").isoformat()
            if "updated_at" in app:
                app["updatedAt"] = app.pop("updated_at").isoformat()
            if "resumeData" in app:
                del app["resumeData"]
            processed.append(app)
        return jsonify({"success": True, "applications": processed}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/applications/<application_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(application_id):
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        role = identity.get("role")
        if role != "recruiter":
            return jsonify({"error": "Only recruiters can update application status"}), 403
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        data = request.get_json()
        if not data or "status" not in data:
            return jsonify({"error": "Status is required"}), 400
        recruiter_notes = data.get("notes", "")
        new_status = data["status"]
        valid_statuses = ["pending", "reviewed", "shortlisted", "rejected"]
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status"}), 400
        application = mongo.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            return jsonify({"error": "Application not found"}), 404
        job = mongo.db.jobs.find_one({"_id": ObjectId(application["jobId"]), "recruiterId": str(user["_id"])})
        if not job:
            return jsonify({"error": "You don't have permission to update this application"}), 403
        result = mongo.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {"status": new_status, "notes": recruiter_notes, "updated_at": datetime.datetime.utcnow()}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update application status"}), 500

        feedback = ""
        if new_status in ["shortlisted", "rejected"]:
            try:
                import requests
                response = requests.post("http://localhost:5002/api/update-application-status", json={"application_id": str(application_id), "status": new_status, "notes": recruiter_notes})
                if response.status_code == 200:
                    feedback = response.json().get("feedback", "")
            except Exception as e:
                print(f"Error generating AI feedback: {str(e)}")

            # Notify applicant
            try:
                notification_status = "accepted" if new_status == "shortlisted" else new_status
                if "notifications" not in mongo.db.list_collection_names():
                    mongo.db.create_collection("notifications")
                applicant_id = application.get("applicantId")
                if not applicant_id:
                    applicant_email = application.get("applicantEmail")
                    if applicant_email:
                        applicant = mongo.db.users.find_one({"email": applicant_email})
                        if applicant:
                            applicant_id = str(applicant["_id"])
                if applicant_id:
                    # Check if notification already exists
                    existing_notification = mongo.db.notifications.find_one({
                        "userId": applicant_id,
                        "type": "status",
                        "jobId": str(application["jobId"]),
                        "status": notification_status
                    })
                    
                    job_title = application.get("jobTitle", job.get("title", "Job"))
                    print(f"Creating notification for status {notification_status}, jobTitle: {job_title}, existing: {existing_notification is not None}")
                    
                    if not existing_notification:
                        mongo.db.notifications.insert_one({
                            "userId": applicant_id,
                            "type": "status",
                            "jobId": str(application["jobId"]),
                            "jobTitle": job_title,
                            "company": application.get("companyName", job.get("company", "Company")),
                            "status": notification_status,
                            "read": False,
                            "timestamp": datetime.datetime.utcnow()
                        })
                        print(f"Status notification created for {notification_status}")
                    else:
                        print(f"Duplicate notification prevented for {notification_status}")
            except Exception as e:
                print(f"Error creating notification: {str(e)}")

        return jsonify({"success": True, "message": f"Application status updated to {new_status}", "feedback": feedback}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/test/create-notification", methods=["POST"])
@jwt_required()
def test_create_notification():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        data = request.get_json() or {}
        if "notifications" not in mongo.db.list_collection_names():
            mongo.db.create_collection("notifications")
        result = mongo.db.notifications.insert_one({
            "userId": str(user["_id"]),
            "type": data.get("type", "status"),
            "jobId": data.get("jobId", "test-job-id"),
            "jobTitle": data.get("jobTitle", "Test Job"),
            "company": data.get("company", "Test Company"),
            "status": data.get("status", "accepted"),
            "read": False,
            "timestamp": datetime.datetime.utcnow()
        })
        return jsonify({"success": True, "message": "Test notification created", "notification_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        user_id = str(user["_id"])
        print(f"DEBUG: Fetching notifications for user {user_id} ({email})")
        
        if "notifications" not in mongo.db.list_collection_names():
            mongo.db.create_collection("notifications")
        notifications = list(mongo.db.notifications.find({"userId": user_id}).sort("timestamp", -1))
        print(f"DEBUG: Found {len(notifications)} notifications for user {user_id}")
        for i, notif in enumerate(notifications[:5]):  # Log first 5
            print(f"DEBUG: Notification {i}: {notif}")
        formatted = []
        for n in notifications:
            n["id"] = str(n["_id"])
            del n["_id"]
            if "timestamp" in n:
                try:
                    timestamp = n["timestamp"]
                    n["timestamp"] = timestamp.isoformat()
                    now = datetime.datetime.utcnow()
                    diff = now - timestamp
                    days = diff.days
                    hours = diff.seconds // 3600
                    minutes = (diff.seconds % 3600) // 60
                    if days > 0:
                        n["timestamp_readable"] = f"{days} days ago"
                    elif hours > 0:
                        n["timestamp_readable"] = f"{hours} hours ago"
                    elif minutes > 0:
                        n["timestamp_readable"] = f"{minutes} minutes ago"
                    else:
                        n["timestamp_readable"] = "just now"
                except:
                    n["timestamp_readable"] = "recently"
            formatted.append(n)
        return jsonify({"notifications": formatted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/applications/status", methods=["GET"])
@jwt_required()
def get_application_status():
    try:
        identity = parse_identity(get_jwt_identity())
        email = identity.get("email")
        role = identity.get("role")
        if role != "applicant":
            return jsonify({"error": "This endpoint is for applicants only"}), 403
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        application_id = request.args.get('application_id')
        if application_id:
            application = mongo.db.applications.find_one({"_id": ObjectId(application_id), "applicantId": str(user["_id"])})
            if not application:
                return jsonify({"error": "Application not found"}), 404
            return jsonify({
                "application": {
                    "id": str(application["_id"]),
                    "jobTitle": application.get("jobTitle", ""),
                    "companyName": application.get("companyName", ""),
                    "status": application.get("status", "pending"),
                    "appliedAt": application.get("created_at").isoformat() if application.get("created_at") else "",
                    "updatedAt": application.get("updated_at").isoformat() if application.get("updated_at") else "",
                    "matchScore": application.get("matchScore", 0)
                }
            }), 200
        else:
            applications = list(mongo.db.applications.find({"applicantId": str(user["_id"])}))
            return jsonify({"applications": [{
                "id": str(app["_id"]),
                "jobId": app.get("jobId", ""),
                "jobTitle": app.get("jobTitle", ""),
                "companyName": app.get("companyName", ""),
                "status": app.get("status", "pending"),
                "appliedAt": app.get("created_at").isoformat() if app.get("created_at") else "",
                "updatedAt": app.get("updated_at").isoformat() if app.get("updated_at") else "",
                "matchScore": app.get("matchScore", 0)
            } for app in applications]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/applications/<application_id>/resume", methods=["GET"])
@jwt_required()
def get_application_resume(application_id):
    try:
        identity = parse_identity(get_jwt_identity())
        role = identity.get("role")
        if role != "recruiter":
            return jsonify({"error": "Only recruiters can view resumes"}), 403
        application = mongo.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            return jsonify({"error": "Application not found"}), 404
        return jsonify({"success": True, "resumeData": application.get("resumeData", ""), "applicantName": application.get("applicantName", "")}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Messaging API Routes
@app.route("/api/messages/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    """Get all conversations for the current user"""
    try:
        identity = parse_identity(get_jwt_identity())
        current_user_id = identity.get("userId")
        user_role = identity.get("role")
        
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401
        
        # Find conversations where the current user is either sender or receiver
        conversations = list(mongo.db.messages.aggregate([
            {
                "$match": {
                    "$or": [
                        {"senderId": current_user_id},
                        {"receiverId": current_user_id}
                    ]
                }
            },
            {
                "$group": {
                    "_id": {
                        "$cond": {
                            "if": {"$eq": ["$senderId", current_user_id]},
                            "then": "$receiverId",
                            "else": "$senderId"
                        }
                    },
                    "lastMessage": {"$last": "$message"},
                    "lastTimestamp": {"$last": "$timestamp"},
                    "unreadCount": {
                        "$sum": {
                            "$cond": [
                                {"$and": [
                                    {"$ne": ["$senderId", current_user_id]},
                                    {"$eq": ["$read", False]}
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {"$sort": {"lastTimestamp": -1}}
        ]))
        
        # Get user details for each conversation
        conversation_list = []
        for conv in conversations:
            other_user_id = conv["_id"]
            other_user = mongo.db.users.find_one({"_id": ObjectId(other_user_id)})
            
            if other_user:
                conversation_list.append({
                    "id": other_user_id,
                    "userName": other_user.get("name", "Unknown"),
                    "userEmail": other_user.get("email", ""),
                    "userRole": other_user.get("role", ""),
                    "lastMessage": conv["lastMessage"],
                    "timestamp": conv["lastTimestamp"].isoformat() if conv["lastTimestamp"] else "",
                    "unreadCount": conv["unreadCount"]
                })
        
        return jsonify({"conversations": conversation_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/messages/<user_id>", methods=["GET"])
@jwt_required()
def get_messages(user_id):
    """Get messages between current user and specified user"""
    try:
        identity = parse_identity(get_jwt_identity())
        current_user_id = identity.get("userId")
        
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401
        
        # Find messages between the two users
        messages = list(mongo.db.messages.find({
            "$or": [
                {"senderId": current_user_id, "receiverId": user_id},
                {"senderId": user_id, "receiverId": current_user_id}
            ]
        }).sort("timestamp", 1))
        
        # Mark messages as read if they were sent to current user
        mongo.db.messages.update_many(
            {
                "senderId": user_id,
                "receiverId": current_user_id,
                "read": False
            },
            {"$set": {"read": True}}
        )
        
        message_list = []
        for msg in messages:
            message_list.append({
                "id": str(msg["_id"]),
                "senderId": msg["senderId"],
                "receiverId": msg["receiverId"],
                "message": msg["message"],
                "timestamp": msg["timestamp"].isoformat() if msg["timestamp"] else "",
                "read": msg.get("read", False)
            })
        
        return jsonify({"messages": message_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/messages/send", methods=["POST"])
@jwt_required()
def send_message():
    """Send a message to another user"""
    try:
        identity = parse_identity(get_jwt_identity())
        sender_id = identity.get("userId")
        
        if not sender_id:
            return jsonify({"error": "User not authenticated"}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        receiver_id = data.get("receiverId")
        message = data.get("message")
        
        if not receiver_id or not message:
            return jsonify({"error": "receiverId and message are required"}), 400
        
        # Verify receiver exists
        receiver = mongo.db.users.find_one({"_id": ObjectId(receiver_id)})
        if not receiver:
            return jsonify({"error": "Receiver not found"}), 404
        
        # Create message
        new_message = {
            "senderId": str(sender_id),
            "receiverId": str(receiver_id),
            "message": message.strip(),
            "timestamp": datetime.datetime.utcnow(),
            "read": False
        }
        
        # Insert message
        result = mongo.db.messages.insert_one(new_message)
        
        # Create notification for receiver
        sender = mongo.db.users.find_one({"_id": ObjectId(sender_id)})
        sender_name = sender.get("name", "Unknown") if sender else "Unknown"
        
        notification = {
            "userId": receiver_id,
            "type": "message",
            "title": "New Message",
            "message": f"You received a new message from {sender_name}",
            "senderId": sender_id,
            "senderName": sender_name,
            "timestamp": datetime.datetime.utcnow(),
            "read": False
        }
        
        mongo.db.notifications.insert_one(notification)
        
        return jsonify({
            "success": True,
            "message": {
                "id": str(result.inserted_id),
                "senderId": sender_id,
                "receiverId": receiver_id,
                "message": message.strip(),
                "timestamp": new_message["timestamp"].isoformat(),
                "read": False
            }
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/messages/send-welcome", methods=["POST"])
@jwt_required()
def send_welcome_message():
    """Send welcome message when applicant applies (internal use)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        applicant_id = data.get("applicantId")
        recruiter_id = data.get("recruiterId")
        job_title = data.get("jobTitle")
        
        if not all([applicant_id, recruiter_id, job_title]):
            return jsonify({"error": "applicantId, recruiterId, and jobTitle are required"}), 400
        
        # Get recruiter details
        recruiter = mongo.db.users.find_one({"_id": ObjectId(recruiter_id)})
        recruiter_name = recruiter.get("name", "Recruiter") if recruiter else "Recruiter"
        
        # Create welcome message
        welcome_message = f"Thank you for applying to the {job_title} position! I've received your application and will review it shortly. Feel free to reach out if you have any questions."
        
        new_message = {
            "senderId": recruiter_id,
            "receiverId": applicant_id,
            "message": welcome_message,
            "timestamp": datetime.datetime.utcnow(),
            "read": False
        }
        
        # Insert message
        mongo.db.messages.insert_one(new_message)
        
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)