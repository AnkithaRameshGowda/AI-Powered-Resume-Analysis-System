# AI-Powered Job Matching System - Setup Guide

## Overview

This is a full-stack AI-powered job matching and resume screening web application built with Next.js 14, Flask, and MongoDB. The system provides intelligent resume analysis, job matching, and application management features.

## Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: JWT-based

### Backend (Flask)
- **Auth Service** (Port 5001): User authentication, profile management, job postings, applications
- **ATS Service** (Port 5000): AI resume analysis using Google Gemini API
- **Job Matching AI** (Port 5002): AI-powered job matching with weighted scoring

### Database
- **MongoDB**: User data, job postings, applications, profiles, notifications

## Prerequisites

1. **Node.js 18+** (for Next.js frontend)
2. **Python 3.10+** (for Flask backend)
3. **MongoDB Community Server** (for database)
4. **Google Gemini API Key** (for AI features)

## Installation Steps

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and choose "Complete" installation
3. Install MongoDB Compass (optional GUI tool)
4. Start MongoDB service:
   - Search for "MongoDB" in Start Menu
   - Click "MongoDB Compass" or run `mongod` in command prompt

#### Verify MongoDB Installation:
```bash
mongod --version
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
MONGODB_URI=mongodb://localhost:27017/jobmatchdb
```

**Getting API Keys:**
- **Google Gemini API**: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **JWT Secret**: Generate a random secret string or use: `your-secret-key-here`

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Node.js Dependencies

```bash
npm install
```

### 5. Start MongoDB Service

Make sure MongoDB is running before starting the application:

```bash
# On Windows (as Administrator)
net start MongoDB

# Or start mongod directly
mongod
```

### 6. Run the Application

Use the provided `run.py` script to start all services:

```bash
python run.py
```

This will start:
- **ATS Service**: http://localhost:5000
- **Auth Service**: http://localhost:5001  
- **Job Matching AI**: http://localhost:5002
- **Next.js Frontend**: http://localhost:3000

## Features

### For Job Seekers:
- **AI Resume Analysis**: Upload resume for ATS compatibility scoring
- **Job Matching**: Get matched with relevant jobs with AI-powered scoring
- **Skill Recommendations**: Personalized skill development suggestions
- **Application Tracking**: Track application status in real-time
- **Profile Management**: Create detailed profile with experience and education

### For Recruiters:
- **Job Posting**: Create and manage job listings with skill requirements
- **Applicant Management**: Review and manage job applications
- **AI-Powered Screening**: Automatic resume analysis and matching
- **Status Updates**: Update application status with automated feedback
- **Notifications**: Real-time notifications for new applications

## Default Users

The system includes sample users for testing:

**Job Seekers:**
- Email: `john.doe@example.com` | Password: `password123`
- Email: `jane.smith@example.com` | Password: `password123`

**Recruiters:**
- Email: `recruiter@techcorp.com` | Password: `password123`
- Email: `hr@innovatelabs.com` | Password: `password123`

## Troubleshooting

### MongoDB Issues

**Problem**: `ImportError: cannot import name 'SON' from 'bson'`
**Solution**: 
```bash
pip uninstall bson -y
pip install pymongo --upgrade
```

**Problem**: MongoDB connection failed
**Solution**: 
1. Ensure MongoDB service is running
2. Check if MongoDB is installed: `mongod --version`
3. Verify connection string in `.env` file

### Port Conflicts

**Problem**: Port already in use
**Solution**: 
- Kill processes using the ports:
  ```bash
  taskkill /F /IM python.exe /IM node.exe
  ```
- Or change ports in the respective server files

### API Key Issues

**Problem**: Gemini API quota exceeded
**Solution**: 
- The system includes fallback rule-based matching
- Check your API key and quota at [Google AI Studio](https://makersuite.google.com/app/apikey)

## Project Structure

```
AI Powered Resume Screening System/
├── app/                    # Next.js frontend pages
│   ├── ai-resume/         # AI resume analyzer
│   ├── home/              # Dashboard pages
│   ├── job/               # Job detail and management
│   ├── login/             # Authentication
│   ├── profile/           # User profiles
│   └── ...
├── components/             # React components
├── lib/                   # Utilities (axios config)
├── auth.py                # Flask auth server (5001)
├── ats.py                 # Flask ATS server (5000)
├── job_matching_ai.py     # Flask job matching (5002)
├── run.py                 # Application launcher
├── init_db.py            # Database initialization
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Development Notes

- The ATS server uses Google Gemini API for resume analysis
- Fallback rule-based matching is available when API quota is exceeded
- All Flask servers include CORS support for frontend integration
- JWT tokens are stored in localStorage for session management
- Resume files are stored as base64 in MongoDB

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure environment variables are correctly set
4. Make sure MongoDB is running before starting the application

---

**Note**: This application is for demonstration purposes. In production, ensure proper security measures, database indexing, and error handling.
